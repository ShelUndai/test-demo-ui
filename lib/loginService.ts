import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Types
interface User {
  username: string;
  password: string;
}

interface LoginResponse {
  access: string;
  refresh?: string;
}

interface TokenData {
  exp: number;
  csrf_token?: string;
  first_name?: string;
}

interface LoginResult {
  success: boolean;
  status: number;
  statusText: string;
  error?: string;
  username?: string;
}

// Environment configuration
const ENV_CONFIG = {
  rnd: {
    apiUrl: process.env.NEXT_APP_API_RND,
    authUrl: process.env.NEXT_APP_AUTH_RND,
  },
  uat: {
    apiUrl: process.env.NEXT_APP_API_UAT,
    authUrl: process.env.NEXT_APP_AUTH_UAT,
  },
  qa: {
    apiUrl: process.env.NEXT_APP_API_QA,
    authUrl: process.env.NEXT_APP_AUTH_QA,
  },
  prod: {
    apiUrl: process.env.NEXT_APP_API_PROD,
    authUrl: process.env.NEXT_APP_AUTH_PROD,
  },
} as const;

type Environment = keyof typeof ENV_CONFIG;

export class AuthService {
  private static instance: AuthService;
  
  // Constants
  private readonly STORAGE_KEYS = {
    ACCESS_TOKEN: 'auth_access_token',
    USER_ID: 'auth_user_id', 
    USERNAME: 'auth_username',
  } as const;

  private readonly ENDPOINTS = {
    LOGIN: 'login',
    REFRESH: 'token/refresh',
    VERIFY: 'token/verify',
    DECODE: 'token/decode',
  } as const;

  private readonly TOKEN_BUFFER_SECONDS = 30; // Refresh token 30s before expiry
  
  private axiosInstance: AxiosInstance;
  private isDevMode: boolean;
  
  constructor() {
    this.isDevMode = process.env.NEXT_APP_FAST_LOAD_DEV_MODE === 'true';
    this.axiosInstance = this.createAxiosInstance();
  }

  // Singleton pattern
  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private createAxiosInstance(): AxiosInstance {
    const env = (process.env.NEXT_APP_ENV as Environment) || 'rnd';
    const config = ENV_CONFIG[env];
    
    return axios.create({
      baseURL: config.authUrl,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      withCredentials: true,
    });
  }

  // Public API
  async login(credentials: User): Promise<LoginResult> {
    if (this.isDevMode) {
      return this.handleDevModeLogin();
    }

    try {
      const response = await this.axiosInstance.post<LoginResponse>(
        this.ENDPOINTS.LOGIN,
        {
          ...credentials,
          group_request: ['.*<group>.*', '.*<identifier>.*'],
        }
      );

      const tokenData = await this.decodeToken(response.data.access);
      
      // Store tokens and user data
      this.storeAccessToken(response.data.access);
      this.storeUserId(credentials.username);
      this.storeUsername(tokenData.first_name || credentials.username);
      
      // Handle CSRF token
      this.updateCSRFToken(tokenData.csrf_token);

      return {
        success: true,
        status: response.status,
        statusText: response.statusText,
        username: tokenData.first_name,
      };
    } catch (error: any) {
      return this.handleLoginError(error);
    }
  }

  logout(): void {
    this.clearStorage();
    // Optionally redirect or emit logout event
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  isAuthenticated(): boolean {
    if (this.isDevMode) return true;
    return !!this.getAccessToken();
  }

  async validateSession(): Promise<boolean> {
    if (this.isDevMode) return true;
    
    const token = this.getAccessToken();
    if (!token) return false;

    try {
      // Check if token is about to expire
      if (this.isTokenExpiringSoon(token)) {
        await this.refreshAccessToken();
      }
      
      return true;
    } catch (error) {
      this.clearStorage();
      return false;
    }
  }

  // Axios interceptor for automatic token handling
  createRequestInterceptor() {
    return async (config: AxiosRequestConfig) => {
      if (this.isDevMode) return config;

      const isValid = await this.validateSession();
      if (!isValid) {
        window.dispatchEvent(new CustomEvent('auth:sessionExpired'));
        throw new Error('Session expired');
      }

      const token = this.getAccessToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    };
  }

  // User data getters
  getAccessToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
  }

  getUserId(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.USER_ID);
  }

  getUsername(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.USERNAME);
  }

  // Private methods
  private async decodeToken(token: string): Promise<TokenData> {
    const response = await this.axiosInstance.get<TokenData>(
      this.ENDPOINTS.DECODE,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    return response.data;
  }

  private isTokenExpiringSoon(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationTime = payload.exp * 1000; // Convert to milliseconds
      const currentTime = Date.now();
      const bufferTime = this.TOKEN_BUFFER_SECONDS * 1000;
      
      return expirationTime - currentTime < bufferTime;
    } catch {
      return true; // If we can't decode, consider it expired
    }
  }

  private async refreshAccessToken(): Promise<void> {
    const csrfToken = this.getCSRFTokenFromCookie();
    
    const response = await this.axiosInstance.post<{ access: string }>(
      this.ENDPOINTS.REFRESH,
      {},
      {
        headers: csrfToken ? { 'X-Csrf-Token': csrfToken } : {},
      }
    );

    this.storeAccessToken(response.data.access);
  }

  private getCSRFTokenFromCookie(): string | null {
    const match = document.cookie.match(/(?:^|; )csrf_token=([^;]*)/);
    return match ? match[1] : null;
  }

  private updateCSRFToken(csrfToken?: string): void {
    if (!csrfToken) return;
    
    // Clear existing CSRF token
    document.cookie = 'csrf_token=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; secure; SameSite=None';
    
    // Set new CSRF token
    document.cookie = `csrf_token=${csrfToken}; path=/; secure; SameSite=None`;
  }

  private handleDevModeLogin(): LoginResult {
    this.storeAccessToken('dev_token');
    this.storeUserId('dev_user');
    this.storeUsername('Dev User');
    
    return {
      success: true,
      status: 200,
      statusText: 'OK (Dev Mode)',
      username: 'Dev User',
    };
  }

  private handleLoginError(error: any): LoginResult {
    const status = error.response?.status || 500;
    const statusText = error.response?.statusText || 'Unknown Error';
    const errorMessage = error.response?.data?.error || error.message;

    return {
      success: false,
      status,
      statusText,
      error: errorMessage,
    };
  }

  // Storage methods
  private storeAccessToken(token: string): void {
    localStorage.setItem(this.STORAGE_KEYS.ACCESS_TOKEN, token);
  }

  private storeUserId(id: string): void {
    localStorage.setItem(this.STORAGE_KEYS.USER_ID, id);
  }

  private storeUsername(username: string): void {
    localStorage.setItem(this.STORAGE_KEYS.USERNAME, username);
  }

  private clearStorage(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    
    // Clear CSRF token
    document.cookie = 'csrf_token=; expires=Thu, 01 Jan 1970 00:00:01 GMT; path=/; secure; SameSite=None';
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Export environment config for other services
export const getApiConfig = () => {
  const env = (process.env.NEXT_APP_ENV as Environment) || 'rnd';
  return ENV_CONFIG[env];
};
