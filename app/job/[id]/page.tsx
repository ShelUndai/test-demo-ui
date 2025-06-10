"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  Copy,
  Database,
  Download,
  Home,
  Play,
  RefreshCw,
  Server,
  Shield,
  StopCircle,
  User,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Progress } from "@/components/ui/progress"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock firewall rules data
const firewallRules = {
  inbound: [
    { id: 1, port: 22, protocol: "TCP", source: "10.0.0.0/8", action: "ALLOW", description: "SSH Access" },
    { id: 2, port: 80, protocol: "TCP", source: "0.0.0.0/0", action: "ALLOW", description: "HTTP" },
    { id: 3, port: 443, protocol: "TCP", source: "0.0.0.0/0", action: "ALLOW", description: "HTTPS" },
    { id: 4, port: 3389, protocol: "TCP", source: "10.0.0.0/8", action: "ALLOW", description: "RDP Access" },
    { id: 5, port: 1433, protocol: "TCP", source: "10.0.0.0/8", action: "ALLOW", description: "SQL Server" },
  ],
  outbound: [
    {
      id: 6,
      port: "Any",
      protocol: "Any",
      destination: "0.0.0.0/0",
      action: "ALLOW",
      description: "All outbound traffic",
    },
    { id: 7, port: 25, protocol: "TCP", destination: "0.0.0.0/0", action: "DENY", description: "Block SMTP" },
    { id: 8, port: 53, protocol: "UDP", destination: "8.8.8.8/32", action: "ALLOW", description: "DNS Google" },
    { id: 9, port: 53, protocol: "UDP", destination: "1.1.1.1/32", action: "ALLOW", description: "DNS Cloudflare" },
  ],
}

// Update the mock data centers to include server groups
const dataCenters = [
  {
    id: "dc-gf1",
    name: "GF1",
    location: "Primary Data Center",
    serverGroups: [
      {
        id: "group-gf1-web",
        name: "Web Servers",
        description: "Frontend web servers",
        template: "Default Firewall Template",
        status: "drifting",
        driftPercentage: 15,
        mnemonic: "WEB",
        servers: [
          { id: "srv-gf1-web-1", name: "web-01", status: "aligned" },
          { id: "srv-gf1-web-2", name: "web-02", status: "drifting", driftingRules: [2, 5] },
          { id: "srv-gf1-web-3", name: "web-03", status: "aligned" },
        ],
      },
      {
        id: "group-gf1-db",
        name: "Database Servers",
        description: "Backend database servers",
        template: "PCI Compliance",
        status: "drifting",
        driftPercentage: 8,
        mnemonic: "DB",
        servers: [
          { id: "srv-gf1-db-1", name: "db-01", status: "drifting", driftingRules: [3] },
          { id: "srv-gf1-db-2", name: "db-02", status: "aligned" },
        ],
      },
      {
        id: "group-gf1-app",
        name: "Application Servers",
        description: "Middleware application servers",
        template: "Default Firewall Template",
        status: "aligned",
        driftPercentage: 0,
        mnemonic: "AUTH",
        servers: [
          { id: "srv-gf1-app-1", name: "app-01", status: "aligned" },
          { id: "srv-gf1-app-2", name: "app-02", status: "aligned" },
          { id: "srv-gf1-app-3", name: "app-03", status: "aligned" },
        ],
      },
    ],
    status: "drifting",
    driftPercentage: 12,
  },
  {
    id: "dc-gf2",
    name: "GF2",
    location: "Secondary Data Center",
    serverGroups: [
      {
        id: "group-gf2-web",
        name: "Web Servers",
        description: "Frontend web servers",
        template: "Default Firewall Template",
        status: "aligned",
        driftPercentage: 0,
        mnemonic: "WEB",
        servers: [
          { id: "srv-gf2-web-1", name: "web-01", status: "aligned" },
          { id: "srv-gf2-web-2", name: "web-02", status: "aligned" },
        ],
      },
      {
        id: "group-gf2-db",
        name: "Database Servers",
        description: "Backend database servers",
        template: "PCI Compliance",
        status: "drifting",
        driftPercentage: 20,
        mnemonic: "DB",
        servers: [
          { id: "srv-gf2-db-1", name: "db-01", status: "drifting", driftingRules: [7, 9] },
          { id: "srv-gf2-db-2", name: "db-02", status: "aligned" },
        ],
      },
      {
        id: "group-gf2-app",
        name: "Application Servers",
        description: "Middleware application servers",
        template: "Default Firewall Template",
        status: "drifting",
        driftPercentage: 5,
        mnemonic: "AUTH",
        servers: [
          { id: "srv-gf2-app-1", name: "app-01", status: "aligned" },
          { id: "srv-gf2-app-2", name: "app-02", status: "drifting", driftingRules: [4] },
        ],
      },
    ],
    status: "drifting",
    driftPercentage: 8,
  },
]

// Update the getJobDetails function to use the new naming conventions and include mnemonics
const getJobDetails = (id) => {
  // Base job data that matches our list
  const baseJobs = [
    {
      id: 1,
      name: "WEB, DB - Default Firewall Template",
      template: "Default Firewall Template",
      status: "successful",
      started: "2025-04-21T14:30:00",
      finished: "2025-04-21T14:35:22",
      duration: "5m 22s",
      user: "admin",
      inventory: "All Data Centers",
      dataCenters: ["dc-gf1", "dc-gf2"],
      mnemonics: ["WEB", "DB"],
      reportType: "consistency",
      driftSummary: {
        totalGroups: 2,
        driftingGroups: 2,
        totalServers: 8,
        driftingServers: 3,
        totalRules: 64,
        driftingRules: 5,
        complianceScore: 92,
      },
    },
    {
      id: 2,
      name: "AUTH - Default Firewall Template",
      template: "Default Firewall Template",
      status: "running",
      started: "2025-04-22T09:15:00",
      finished: null,
      duration: "Running",
      user: "system",
      inventory: "All Data Centers",
      dataCenters: ["dc-gf1", "dc-gf2"],
      mnemonics: ["AUTH"],
      reportType: "consistency",
      driftSummary: {
        totalGroups: 3,
        driftingGroups: 2,
        totalServers: 9,
        driftingServers: 3,
        totalRules: 81,
        driftingRules: 9,
        complianceScore: 89,
      },
    },
    {
      id: 3,
      name: "WEB - PCI Compliance - GF1",
      template: "PCI Compliance",
      status: "successful",
      started: "2025-04-21T18:45:00",
      finished: "2025-04-21T18:46:12",
      duration: "1m 12s",
      user: "admin",
      inventory: "GF1 Data Center",
      dataCenters: ["dc-gf1"],
      mnemonics: ["WEB"],
      reportType: "drift",
      driftSummary: {
        totalGroups: 3,
        driftingGroups: 2,
        totalServers: 8,
        driftingServers: 2,
        totalRules: 27,
        driftingRules: 3,
        complianceScore: 88,
      },
    },
    {
      id: 4,
      name: "DB - Default Firewall Template - GF2",
      template: "Default Firewall Template",
      status: "successful",
      started: "2025-04-21T11:20:00",
      finished: "2025-04-21T11:22:45",
      duration: "2m 45s",
      user: "devops",
      inventory: "GF2 Data Center",
      dataCenters: ["dc-gf2"],
      mnemonics: ["DB"],
      reportType: "drift",
      driftSummary: {
        totalGroups: 3,
        driftingGroups: 2,
        totalServers: 6,
        driftingServers: 2,
        totalRules: 27,
        driftingRules: 3,
        complianceScore: 90,
      },
    },
    {
      id: 5,
      name: "AUTH - DMZ Configuration - GF2",
      template: "DMZ Configuration",
      status: "canceled",
      started: "2025-04-21T16:10:00",
      finished: "2025-04-21T16:11:30",
      duration: "1m 30s",
      user: "jenkins",
      inventory: "GF2 Data Center",
      dataCenters: ["dc-gf2"],
      mnemonics: ["AUTH"],
      reportType: "drift",
      driftSummary: {
        totalServers: 5,
        driftingServers: 2,
        totalRules: 18,
        driftingRules: 3,
        complianceScore: 78,
      },
    },
    {
      id: 6,
      name: "WEB - Default Firewall Template - GF2",
      template: "Default Firewall Template",
      status: "pending",
      started: null,
      finished: null,
      duration: "Pending",
      user: "system",
      inventory: "GF2 Data Center",
      dataCenters: ["dc-gf2"],
      mnemonics: ["WEB"],
      reportType: "drift",
      driftSummary: null,
    },
    {
      id: 7,
      name: "WEB, DB - Default Firewall Template",
      template: "Default Firewall Template",
      status: "successful",
      started: "2025-04-21T00:01:00",
      finished: "2025-04-21T00:03:45",
      duration: "2m 45s",
      user: "system",
      inventory: "All Data Centers",
      dataCenters: ["dc-gf1", "dc-gf2"],
      mnemonics: ["WEB", "DB"],
      reportType: "consistency",
      driftSummary: {
        totalGroups: 2,
        driftingGroups: 1,
        totalServers: 6,
        driftingServers: 1,
        totalRules: 54,
        driftingRules: 2,
        complianceScore: 93,
      },
    },
    {
      id: 8,
      name: "AUTH, WEB - PCI Compliance",
      template: "PCI Compliance",
      status: "failed",
      started: "2025-04-20T22:15:00",
      finished: "2025-04-20T22:15:48",
      duration: "48s",
      user: "admin",
      inventory: "All Data Centers",
      dataCenters: ["dc-gf1", "dc-gf2"],
      mnemonics: ["AUTH", "WEB"],
      reportType: "consistency",
      driftSummary: {
        totalGroups: 4,
        driftingGroups: 3,
        totalServers: 11,
        driftingServers: 5,
        totalRules: 99,
        driftingRules: 12,
        complianceScore: 88,
      },
    },
  ]

  // Find the base job
  const baseJob = baseJobs.find((job) => job.id === Number.parseInt(id))
  if (!baseJob) return null

  // Get the data centers for this job
  const jobDataCenters = dataCenters.filter((dc) => baseJob.dataCenters.includes(dc.id))

  // Extended job details
  const extendedDetails = {
    description:
      baseJob.reportType === "consistency"
        ? `Firewall rules comparison for ${baseJob.mnemonics.join(", ")} across ${baseJob.dataCenters.length} data centers.`
        : `Server drift analysis for ${baseJob.mnemonics.join(", ")} within ${jobDataCenters[0]?.name || ""} data center.`,
    project: "Network Security Compliance",
    environment: "Production",
    credentials: ["SSH Key", "API Token"],
    verbosity: 1,
    forks: 5,
    limit: "",
    jobType: "Run",
    launchType: "Manual",
    jobTags: ["firewall", "compliance", "security"],
    skipTags: ["backup"],
    extraVars: {
      check_type: baseJob.reportType === "consistency" ? "consistency_check" : "drift_check",
      include_inactive: false,
      detailed_report: true,
    },
    dataCenters: jobDataCenters,
    firewallRules: firewallRules,
    driftSummary: baseJob.driftSummary,
    output: generateMockOutput(baseJob),
    mnemonics: baseJob.mnemonics,
  }

  return { ...baseJob, ...extendedDetails }
}

// Generate mock output based on job status and type
function generateMockOutput(job) {
  const lines = []

  // Common header
  if (job.reportType === "consistency") {
    lines.push(`PLAY [Firewall Rules Consistency Check] *********************************************`)
  } else {
    lines.push(`PLAY [Firewall Rules Drift Check] *********************************************`)
  }

  lines.push(`TASK [Gathering Facts] **********************************************`)

  // Add lines for each data center
  job.dataCenters.forEach((dc) => {
    lines.push(`ok: [${dc}]`)
  })
  lines.push(``)

  if (job.status === "successful" || job.status === "failed") {
    lines.push(`TASK [Collect Firewall Rules] *****************************************`)
    job.dataCenters.forEach((dc) => {
      lines.push(`ok: [${dc}]`)
    })
    lines.push(``)

    if (job.reportType === "consistency") {
      lines.push(`TASK [Compare Firewall Rules Across Data Centers] *********************************************`)
      job.dataCenters.forEach((dc) => {
        if (dc === "dc-west") {
          lines.push(`ok: [${dc}] => {"changed": false, "msg": "All firewall rules aligned with baseline"}`)
        } else {
          lines.push(`changed: [${dc}] => {"changed": true, "msg": "Drift detected in firewall rules"}`)
        }
      })
    } else {
      lines.push(`TASK [Check Server Drift Within Data Center] *********************************************`)
      const dc = job.dataCenters[0]
      if (dc === "dc-west") {
        lines.push(`ok: [${dc}] => {"changed": false, "msg": "All servers aligned with baseline"}`)
      } else {
        lines.push(
          `changed: [${dc}] => {"changed": true, "msg": "Drift detected in ${job.driftSummary.driftingServers} servers"}`,
        )
      }
    }
    lines.push(``)

    if (job.status === "failed") {
      lines.push(`TASK [Apply Corrections] ********************************************`)
      if (job.reportType === "consistency") {
        job.dataCenters.forEach((dc, index) => {
          if (index === 2) {
            lines.push(
              `fatal: [${dc}]: FAILED! => {"changed": false, "msg": "Permission denied when attempting to update firewall rules"}`,
            )
          } else {
            lines.push(`ok: [${dc}]`)
          }
        })
      } else {
        const dc = job.dataCenters[0]
        lines.push(
          `fatal: [${dc}]: FAILED! => {"changed": false, "msg": "Permission denied when attempting to update server configurations"}`,
        )
      }
      lines.push(``)
    } else {
      lines.push(`TASK [Generate Report] ********************************************`)
      job.dataCenters.forEach((dc) => {
        lines.push(`ok: [${dc}]`)
      })
      lines.push(``)
    }

    lines.push(`PLAY RECAP **********************************************************`)
    job.dataCenters.forEach((dc) => {
      if (job.status === "failed" && (job.reportType === "consistency" ? dc === job.dataCenters[2] : true)) {
        lines.push(`${dc} : ok=3    changed=1    unreachable=0    failed=1    skipped=0`)
      } else {
        lines.push(`${dc} : ok=4    changed=${dc === "dc-west" ? "0" : "1"}    unreachable=0    failed=0    skipped=0`)
      }
    })
  } else if (job.status === "running") {
    lines.push(`TASK [Collect Firewall Rules] *****************************************`)
    job.dataCenters.forEach((dc) => {
      lines.push(`ok: [${dc}]`)
    })
    lines.push(``)

    if (job.reportType === "consistency") {
      lines.push(`TASK [Compare Firewall Rules Across Data Centers] *********************************************`)
      lines.push(`ok: [dc-west] => {"changed": false, "msg": "All firewall rules aligned with baseline"}`)
      lines.push(`changed: [dc-east] => {"changed": true, "msg": "Drift detected in firewall rules"}`)
      lines.push(`RUNNING: [dc-central]: Comparing firewall rules...`)
    } else {
      lines.push(`TASK [Check Server Drift Within Data Center] *********************************************`)
      lines.push(`RUNNING: [${job.dataCenters[0]}]: Analyzing server configurations...`)
    }
  } else if (job.status === "canceled") {
    lines.push(`TASK [Collect Firewall Rules] *****************************************`)
    job.dataCenters.forEach((dc) => {
      lines.push(`ok: [${dc}]`)
    })
    lines.push(``)

    if (job.reportType === "consistency") {
      lines.push(`TASK [Compare Firewall Rules Across Data Centers] *********************************************`)
    } else {
      lines.push(`TASK [Check Server Drift Within Data Center] *********************************************`)
    }
    lines.push(`CANCELED: Job was canceled by user`)
  } else if (job.status === "pending") {
    lines.push(`Job is pending execution...`)
  }

  return lines.join("\n")
}

// Get status badge based on job status
const getStatusBadge = (status) => {
  switch (status) {
    case "successful":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <Check className="w-3 h-3 mr-1" /> Successful
        </Badge>
      )
    case "failed":
      return (
        <Badge className="bg-red-500 hover:bg-red-600">
          <X className="w-3 h-3 mr-1" /> Failed
        </Badge>
      )
    case "running":
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">
          <RefreshCw className="w-3 h-3 mr-1 animate-spin" /> Running
        </Badge>
      )
    case "pending":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </Badge>
      )
    case "canceled":
      return (
        <Badge variant="outline">
          <AlertCircle className="w-3 h-3 mr-1" /> Canceled
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// Get drift status badge
const getDriftStatusBadge = (status) => {
  switch (status) {
    case "aligned":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <Check className="w-3 h-3 mr-1" /> Aligned
        </Badge>
      )
    case "drifting":
      return (
        <Badge className="bg-amber-500 hover:bg-amber-600">
          <AlertTriangle className="w-3 h-3 mr-1" /> Drifting
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

// Get report type badge
const getReportTypeBadge = (reportType) => {
  switch (reportType) {
    case "consistency":
      return (
        <Badge
          variant="outline"
          className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400"
        >
          <Database className="w-3 h-3 mr-1" /> Consistency
        </Badge>
      )
    case "drift":
      return (
        <Badge
          variant="outline"
          className="bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-400"
        >
          <Server className="w-3 h-3 mr-1" /> Drift
        </Badge>
      )
    default:
      return <Badge variant="outline">{reportType}</Badge>
  }
}

export default function JobDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showOnlyDrift, setShowOnlyDrift] = useState(false)
  const [selectedDataCenter, setSelectedDataCenter] = useState("dc-gf1") // Default to GF1

  useEffect(() => {
    // Fetch job details
    const jobDetails = getJobDetails(params.id)
    if (!jobDetails) {
      // Job not found, redirect to jobs list
      router.push("/")
      return
    }

    setJob(jobDetails)

    // If this is a drift report for a single data center, set that as selected
    if (jobDetails.reportType === "drift" && jobDetails.dataCenters.length === 1) {
      setSelectedDataCenter(jobDetails.dataCenters[0].id)
    }

    setLoading(false)
  }, [params.id, router])

  if (loading) {
    return (
      <div className="flex min-h-screen w-full flex-col bg-muted/40 items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading job details...</span>
        </div>
      </div>
    )
  }

  // Get the selected data center object
  const selectedDC = job.dataCenters.find((dc) => dc.id === selectedDataCenter) || job.dataCenters[0]

  // Filter server groups based on showOnlyDrift setting
  const filteredServerGroups =
    selectedDC && selectedDC.serverGroups
      ? showOnlyDrift
        ? selectedDC.serverGroups.filter((group) => group.status === "drifting")
        : selectedDC.serverGroups
      : []

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <h1 className="text-lg font-semibold">Firewall Drift Dashboard</h1>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Jobs
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        {/* Breadcrumbs */}
        <nav className="flex items-center text-sm text-muted-foreground">
          <Link href="/" className="flex items-center hover:text-foreground">
            <Home className="mr-2 h-4 w-4" />
            Dashboard
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <Link href="/" className="hover:text-foreground">
            Jobs
          </Link>
          <ChevronRight className="mx-2 h-4 w-4" />
          <span className="text-foreground font-medium">{job.name}</span>
        </nav>

        {/* Job Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight">{job.name}</h2>
              {getStatusBadge(job.status)}
              {getReportTypeBadge(job.reportType)}
            </div>
            <p className="text-muted-foreground">
              Job #{job.id} • {job.template} • Started{" "}
              {job.started ? new Date(job.started).toLocaleString() : "Pending"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {job.status === "running" && (
              <Button variant="destructive">
                <StopCircle className="mr-2 h-4 w-4" />
                Cancel Job
              </Button>
            )}
            {(job.status === "successful" || job.status === "failed" || job.status === "canceled") && (
              <Button>
                <Play className="mr-2 h-4 w-4" />
                Relaunch
              </Button>
            )}
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          </div>
        </div>

        {/* Compliance Summary Card */}
        {job.driftSummary && (
          <Card className="mb-4">
            <CardHeader className="pb-2">
              <CardTitle>Compliance Summary</CardTitle>
              <CardDescription>
                {job.reportType === "consistency"
                  ? "Overview of firewall rule compliance across data centers"
                  : "Overview of server compliance within data center"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="flex flex-col space-y-1.5">
                    <div className="flex justify-between">
                      <h3 className="text-sm font-medium">Compliance Score</h3>
                      <span className="text-sm font-medium">{job.driftSummary.complianceScore}%</span>
                    </div>
                    <Progress value={job.driftSummary.complianceScore} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-6">
                    <div className="space-y-2">
                      {job.reportType === "consistency" ? (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Data Centers:</span>
                            <span className="font-medium">
                              {job.driftSummary.driftingGroups}/{job.driftSummary.totalGroups}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Servers:</span>
                            <span className="font-medium">
                              {job.driftSummary.driftingServers}/{job.driftSummary.totalServers}
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Server Groups:</span>
                            <span className="font-medium">
                              {job.driftSummary.driftingGroups}/{job.driftSummary.totalGroups}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Servers:</span>
                            <span className="font-medium">
                              {job.driftSummary.driftingServers}/{job.driftSummary.totalServers}
                            </span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Rules:</span>
                        <span className="font-medium">
                          {job.driftSummary.driftingRules}/{job.driftSummary.totalRules}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {job.reportType === "consistency" && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Drifting Centers:</span>
                          <span className="font-medium text-amber-500">{job.driftSummary.driftingGroups}</span>
                        </div>
                      )}
                      {job.reportType === "drift" && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Drifting Groups:</span>
                          <span className="font-medium text-amber-500">{job.driftSummary.driftingGroups}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Drifting Servers:</span>
                        <span className="font-medium text-amber-500">{job.driftSummary.driftingServers}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Drifting Rules:</span>
                        <span className="font-medium text-amber-500">{job.driftSummary.driftingRules}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col justify-center items-center">
                  <div className="relative w-40 h-40">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold">{job.driftSummary.complianceScore}%</div>
                        <div className="text-sm text-muted-foreground">Compliant</div>
                      </div>
                    </div>
                    <svg className="w-full h-full" viewBox="0 0 100 100">
                      {/* Background circle */}
                      <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--muted))" strokeWidth="10" />
                      {/* Foreground circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="45"
                        fill="none"
                        stroke={
                          job.driftSummary.complianceScore > 90
                            ? "hsl(var(--success))"
                            : job.driftSummary.complianceScore > 75
                              ? "hsl(var(--warning))"
                              : "hsl(var(--destructive))"
                        }
                        strokeWidth="10"
                        strokeDasharray={`${(2 * Math.PI * 45 * job.driftSummary.complianceScore) / 100} ${(2 * Math.PI * 45 * (100 - job.driftSummary.complianceScore)) / 100}`}
                        strokeDashoffset={2 * Math.PI * 45 * 0.25}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Job Details Tabs */}
        <Tabs defaultValue={job.reportType === "consistency" ? "comparison" : "drift"} className="w-full">
          <TabsList className="grid w-full grid-cols-4 md:w-auto md:grid-cols-none md:flex">
            {job.reportType === "consistency" ? (
              <TabsTrigger value="comparison">Consistency Analysis</TabsTrigger>
            ) : (
              <TabsTrigger value="drift">Drift Analysis</TabsTrigger>
            )}
            <TabsTrigger value="details">Job Details</TabsTrigger>
          </TabsList>

          {/* Consistency Analysis Tab */}
          {job.reportType === "consistency" && (
            <TabsContent value="comparison" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Firewall Rules Comparison</CardTitle>
                    <CardDescription>Side-by-side comparison of GF1 and GF2 data centers</CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="show-drift" checked={showOnlyDrift} onCheckedChange={setShowOnlyDrift} />
                    <Label htmlFor="show-drift">Show only drifting</Label>
                  </div>
                </CardHeader>
                <CardContent>
                  {job.dataCenters.length !== 2 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      This view requires exactly two data centers
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-4">
                            <Database className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{job.dataCenters[0].name}</div>
                              <div className="text-sm text-muted-foreground">{job.dataCenters[0].location}</div>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                              {getDriftStatusBadge(job.dataCenters[0].status)}
                              <div className="text-sm">
                                <span className="font-medium">{job.dataCenters[0].driftPercentage}%</span> drift
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="border rounded-lg p-4">
                          <div className="flex items-center gap-3 mb-4">
                            <Database className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{job.dataCenters[1].name}</div>
                              <div className="text-sm text-muted-foreground">{job.dataCenters[1].location}</div>
                            </div>
                            <div className="ml-auto flex items-center gap-2">
                              {getDriftStatusBadge(job.dataCenters[1].status)}
                              <div className="text-sm">
                                <span className="font-medium">{job.dataCenters[1].driftPercentage}%</span> drift
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <h3 className="text-lg font-medium mt-6 mb-4">Server Comparison</h3>

                      {job.mnemonics.map((mnemonic) => (
                        <div key={mnemonic} className="space-y-4">
                          <h4 className="text-xl font-semibold">{mnemonic} Server Comparison</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {/* GF1 Column */}
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base">{job.dataCenters[0].name} Servers</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {job.dataCenters[0].serverGroups
                                  .filter((group) => group.mnemonic === mnemonic)
                                  .flatMap((g) => g.servers)
                                  .filter((server) => !showOnlyDrift || server.status === "drifting")
                                  .map((server) => (
                                    <Collapsible key={`gf1-${server.name}`} className="border rounded-lg">
                                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50">
                                        <div className="flex items-center gap-2">
                                          <Server className="h-4 w-4 text-muted-foreground" />
                                          <span className="font-medium">{server.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {getDriftStatusBadge(server.status)}
                                          <ChevronDown className="h-4 w-4" />
                                        </div>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent>
                                        <div className="p-3 pt-0 border-t">
                                          {server.status === "aligned" ? (
                                            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
                                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                <Check className="h-4 w-4" />
                                                <span>All firewall rules are aligned with baseline</span>
                                              </div>
                                            </div>
                                          ) : (
                                            <div>
                                              <h5 className="text-sm font-medium mb-2">Drifting Rules</h5>
                                              <div className="border rounded-md overflow-hidden">
                                                <div className="grid grid-cols-5 gap-2 p-2 bg-muted text-xs font-medium">
                                                  <div>Port</div>
                                                  <div>Protocol</div>
                                                  <div>Source/Dest</div>
                                                  <div>Action</div>
                                                  <div>Description</div>
                                                </div>
                                                <div className="divide-y">
                                                  {server.driftingRules?.map((ruleId) => {
                                                    const inboundRule = job.firewallRules.inbound.find(
                                                      (r) => r.id === ruleId,
                                                    )
                                                    const outboundRule = job.firewallRules.outbound.find(
                                                      (r) => r.id === ruleId,
                                                    )
                                                    const rule = inboundRule || outboundRule
                                                    if (!rule) return null

                                                    return (
                                                      <div
                                                        key={rule.id}
                                                        className="grid grid-cols-5 gap-2 p-2 text-xs bg-amber-50 dark:bg-amber-950/20"
                                                      >
                                                        <div>{rule.port}</div>
                                                        <div>{rule.protocol}</div>
                                                        <div>{rule.source || rule.destination}</div>
                                                        <div>{rule.action}</div>
                                                        <div>{rule.description}</div>
                                                      </div>
                                                    )
                                                  })}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  ))}
                              </CardContent>
                            </Card>

                            {/* GF2 Column */}
                            <Card>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-base">{job.dataCenters[1].name} Servers</CardTitle>
                              </CardHeader>
                              <CardContent className="space-y-3">
                                {job.dataCenters[1].serverGroups
                                  .filter((group) => group.mnemonic === mnemonic)
                                  .flatMap((g) => g.servers)
                                  .filter((server) => !showOnlyDrift || server.status === "drifting")
                                  .map((server) => (
                                    <Collapsible key={`gf2-${server.name}`} className="border rounded-lg">
                                      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50">
                                        <div className="flex items-center gap-2">
                                          <Server className="h-4 w-4 text-muted-foreground" />
                                          <span className="font-medium">{server.name}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          {getDriftStatusBadge(server.status)}
                                          <ChevronDown className="h-4 w-4" />
                                        </div>
                                      </CollapsibleTrigger>
                                      <CollapsibleContent>
                                        <div className="p-3 pt-0 border-t">
                                          {server.status === "aligned" ? (
                                            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
                                              <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                <Check className="h-4 w-4" />
                                                <span>All firewall rules are aligned with baseline</span>
                                              </div>
                                            </div>
                                          ) : (
                                            <div>
                                              <h5 className="text-sm font-medium mb-2">Drifting Rules</h5>
                                              <div className="border rounded-md overflow-hidden">
                                                <div className="grid grid-cols-5 gap-2 p-2 bg-muted text-xs font-medium">
                                                  <div>Port</div>
                                                  <div>Protocol</div>
                                                  <div>Source/Dest</div>
                                                  <div>Action</div>
                                                  <div>Description</div>
                                                </div>
                                                <div className="divide-y">
                                                  {server.driftingRules?.map((ruleId) => {
                                                    const inboundRule = job.firewallRules.inbound.find(
                                                      (r) => r.id === ruleId,
                                                    )
                                                    const outboundRule = job.firewallRules.outbound.find(
                                                      (r) => r.id === ruleId,
                                                    )
                                                    const rule = inboundRule || outboundRule
                                                    if (!rule) return null

                                                    return (
                                                      <div
                                                        key={rule.id}
                                                        className="grid grid-cols-5 gap-2 p-2 text-xs bg-amber-50 dark:bg-amber-950/20"
                                                      >
                                                        <div>{rule.port}</div>
                                                        <div>{rule.protocol}</div>
                                                        <div>{rule.source || rule.destination}</div>
                                                        <div>{rule.action}</div>
                                                        <div>{rule.description}</div>
                                                      </div>
                                                    )
                                                  })}
                                                </div>
                                              </div>
                                            </div>
                                          )}
                                        </div>
                                      </CollapsibleContent>
                                    </Collapsible>
                                  ))}
                              </CardContent>
                            </Card>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Drift Analysis Tab */}
          {job.reportType === "drift" && (

            <TabsContent value="drift" className="space-y-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0">
                  <div>
                    <CardTitle>Server Drift Analysis</CardTitle>
                    <CardDescription>
                      Analyzing server groups for {job.mnemonics.join(", ")} within {selectedDC?.name} data center
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4">
                    <Select value={selectedDataCenter} onValueChange={setSelectedDataCenter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select data center" />
                      </SelectTrigger>
                      <SelectContent>
                        {job.dataCenters.map((dc) => (
                          <SelectItem key={dc.id} value={dc.id}>
                            {dc.name} Data Center
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="flex items-center space-x-2">
                      <Switch id="show-drift" checked={showOnlyDrift} onCheckedChange={setShowOnlyDrift} />
                      <Label htmlFor="show-drift">Show only drifting</Label>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {!selectedDC ? (
                    <div className="text-center py-8 text-muted-foreground">No data center selected</div>
                  ) : (
                    <div className="space-y-6">
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <Database className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">{selectedDC.name}</div>
                              <div className="text-sm text-muted-foreground">{selectedDC.location}</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            {getDriftStatusBadge(selectedDC.status)}
                            <div className="text-sm">
                              <span className="font-medium">{selectedDC.driftPercentage}%</span> drift
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Group server groups by mnemonic */}
                      {job.mnemonics.map(mnemonic => {
                        // Filter server groups for this mnemonic
                        const mnemonicServerGroups = selectedDC && selectedDC.serverGroups
                          ? (showOnlyDrift
                            ? selectedDC.serverGroups.filter(group => group.mnemonic === mnemonic && group.status === "drifting")
                            : selectedDC.serverGroups.filter(group => group.mnemonic === mnemonic))
                          : [];

                        if (mnemonicServerGroups.length === 0) return null;

                        return (
                          <div key={mnemonic} className="space-y-4">
                            <h3 className="text-lg font-medium mt-6 mb-4">{mnemonic} Server Groups</h3>

                            {mnemonicServerGroups.map((group) => (
                              <Collapsible key={group.id} className="border rounded-lg mb-4">
                                <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
                                  <div className="flex items-center gap-3">
                                    <Server className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                      <div className="font-medium">{group.name}</div>
                                      <div className="text-sm text-muted-foreground">{group.description}</div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="text-sm text-muted-foreground">
                                      Template: <span className="font-medium">{group.template}</span>
                                    </div>
                                    {getDriftStatusBadge(group.status)}
                                    <div className="text-sm">
                                      <span className="font-medium">{group.driftPercentage}%</span> drift
                                    </div>
                                    <ChevronDown className="h-4 w-4" />
                                  </div>
                                </CollapsibleTrigger>
                                <CollapsibleContent>
                                  <div className="p-4 pt-0 border-t">
                                    <h4 className="text-sm font-medium mb-3">Servers</h4>
                                    <div className="flex flex-col space-y-4">
                                      {group.servers
                                        .filter((server) => !showOnlyDrift || server.status === "drifting")
                                        .map((server) => (
                                          <Collapsible key={server.id} className="border rounded-md">
                                            <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50">
                                              <div className="flex items-center gap-3">
                                                <Server className="h-4 w-4 text-muted-foreground" />
                                                <div className="font-medium">{server.name}</div>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                {getDriftStatusBadge(server.status)}
                                                <ChevronDown className="h-4 w-4" />
                                              </div>
                                            </CollapsibleTrigger>
                                            <CollapsibleContent>
                                              {server.status === "aligned" ? (
                                                <div className="p-3 pt-0 border-t bg-green-50 dark:bg-green-950/20">
                                                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                                                    <Check className="h-4 w-4" />
                                                    <span>All firewall rules are aligned with template</span>
                                                  </div>
                                                </div>
                                              ) : (
                                                <div className="p-3 pt-0 border-t">
                                                  <h5 className="text-sm font-medium mb-2">Drifting Rules</h5>
                                                  <div className="space-y-2">
                                                    <div className="border rounded-md overflow-x-auto">
                                                      <div className="min-w-[800px]">
                                                        <div className="grid grid-cols-6 gap-4 p-2 bg-muted text-xs font-medium">
                                                          <div>Direction</div>
                                                          <div>Port</div>
                                                          <div>Protocol</div>
                                                          <div className="col-span-1">Source/Dest</div>
                                                          <div>Action</div>
                                                          <div className="col-span-1">Description</div>
                                                        </div>
                                                        <div className="divide-y">
                                                          {server.driftingRules?.map((ruleId) => {
                                                            // Find the rule in either inbound or outbound
                                                            const inboundRule = job.firewallRules.inbound.find(
                                                              (r) => r.id === ruleId,
                                                            )
                                                            const outboundRule = job.firewallRules.outbound.find(
                                                              (r) => r.id === ruleId,
                                                            )
                                                            const rule = inboundRule || outboundRule
                                                            const direction = inboundRule ? "Inbound" : "Outbound"

                                                            if (!rule) return null

                                                            return (
                                                              <div
                                                                key={rule.id}
                                                                className="grid grid-cols-6 gap-4 p-2 text-xs bg-amber-50 dark:bg-amber-950/20"
                                                              >
                                                                <div>{direction}</div>
                                                                <div>{rule.port}</div>
                                                                <div>{rule.protocol}</div>
                                                                <div
                                                                  className="col-span-1 truncate"
                                                                  title={rule.source || rule.destination}
                                                                >
                                                                  {rule.source || rule.destination}
                                                                </div>
                                                                <div>{rule.action}</div>
                                                                <div
                                                                  className="col-span-1 truncate"
                                                                  title={rule.description}
                                                                >
                                                                  {rule.description}
                                                                </div>
                                                              </div>
                                                            )
                                                          })}
                                                        </div>
                                                      </div>
                                                    </div>
                                                  </div>
                                                </div>
                                              )}
                                            </CollapsibleContent>
                                          </Collapsible>
                                        ))}
                                    </div>
                                  </div>
                                </CollapsibleContent>
                              </Collapsible>
                            ))
                          }

                          <h3 className="text-lg font-medium mt-6 mb-4">Baseline Firewall Rules</h3>
                          <div className="space-y-4">
                            <Collapsible className="border rounded-md">
                              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50">
                                <div className="flex items-center gap-3">
                                  <Shield className="h-4 w-4 text-muted-foreground" />
                                  <div className="font-medium">Inbound Rules</div>
                                </div>
                                <ChevronDown className="h-4 w-4" />
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="p-3 pt-0 border-t">
                                  <div className="border rounded-md overflow-x-auto">
                                    <div className="min-w-[700px]">
                                      <div className="grid grid-cols-5 gap-4 p-2 bg-muted text-xs font-medium">
                                        <div>Port</div>
                                        <div>Protocol</div>
                                        <div>Source</div>
                                        <div>Action</div>
                                        <div>Description</div>
                                      </div>
                                      <div className="divide-y">
                                        {job.firewallRules.inbound.map((rule) => (
                                          <div key={rule.id} className="grid grid-cols-5 gap-4 p-2 text-xs">
                                            <div>{rule.port}</div>
                                            <div>{rule.protocol}</div>
                                            <div>{rule.source}</div>
                                            <div>{rule.action}</div>
                                            <div>{rule.description}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>

                            <Collapsible className="border rounded-md">
                              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50">
                                <div className="flex items-center gap-3">
                                  <Shield className="h-4 w-4 text-muted-foreground" />
                                  <div className="font-medium">Outbound Rules</div>
                                </div>
                                <ChevronDown className="h-4 w-4" />
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="p-3 pt-0 border-t">
                                  <div className="border rounded-md overflow-x-auto">
                                    <div className="min-w-[700px]">
                                      <div className="grid grid-cols-5 gap-4 p-2 bg-muted text-xs font-medium">
                                        <div>Port</div>
                                        <div>Protocol</div>
                                        <div>Destination</div>
                                        <div>Action</div>
                                        <div>Description</div>
                                      </div>
                                      <div className="divide-y">
                                        {job.firewallRules.outbound.map((rule) => (
                                          <div key={rule.id} className="grid grid-cols-5 gap-4 p-2 text-xs">
                                            <div>{rule.port}</div>
                                            <div>{rule.protocol}</div>
                                            <div>{rule.destination}</div>
                                            <div>{rule.action}</div>
                                            <div>{rule.description}</div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}


          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Job Information</CardTitle>
                <CardDescription>Detailed information about this job execution</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                      <div>{getStatusBadge(job.status)}</div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Template</h3>
                      <p>{job.template}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Inventory</h3>
                      <p>{job.inventory}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Report Type</h3>
                      <div>{getReportTypeBadge(job.reportType)}</div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Project</h3>
                      <p>{job.project}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Environment</h3>
                      <p>{job.environment}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Credentials</h3>
                      <div className="flex flex-wrap gap-2">
                        {job.credentials.map((cred) => (
                          <Badge key={cred} variant="outline">
                            {cred}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Started</h3>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {job.started ? new Date(job.started).toLocaleString() : "Pending"}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Finished</h3>
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        {job.finished ? new Date(job.finished).toLocaleString() : "Running"}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Duration</h3>
                      <p>{job.duration}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Launched By</h3>
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4 text-muted-foreground" />
                        {job.user}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Job Type</h3>
                      <p>{job.jobType}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Launch Type</h3>
                      <p>{job.launchType}</p>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Job Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.jobTags.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Skip Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skipTags.length > 0 ? (
                      job.skipTags.map((tag) => (
                        <Badge key={tag} variant="outline">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </main>
    </div>
  )
}
