"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Check,
  ChevronDown,
  Clock,
  Database,
  Download,
  Filter,
  MoreHorizontal,
  RefreshCw,
  Search,
  Shield,
  Server,
  X,
} from "lucide-react"
import { format, parseISO } from "date-fns"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"

// Initialize state variables outside the component
const initialSearchTerm = ""
const initialStatusFilter = "all"
// Update the initialJobs array to follow the new naming conventions
const initialJobs = [
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
    dataCenters: ["GF1", "GF2"],
    mnemonics: ["WEB", "DB"],
    reportType: "consistency",
    driftSummary: {
      totalGroups: 4,
      driftingGroups: 3,
      complianceScore: 88,
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
    inventory: "US Data Centers",
    dataCenters: ["GF1", "GF2"],
    mnemonics: ["AUTH"],
    reportType: "consistency",
    driftSummary: {
      totalGroups: 3,
      driftingGroups: 2,
      complianceScore: 89,
    },
  },
  {
    id: 3,
    name: "WEB - PCI Compliance - GF1",
    template: "PCI Compliance",
    status: "failed",
    started: "2025-04-21T18:45:00",
    finished: "2025-04-21T18:46:12",
    duration: "1m 12s",
    user: "admin",
    inventory: "GF1 Data Center",
    dataCenters: ["GF1"],
    mnemonics: ["WEB"],
    reportType: "drift",
    driftSummary: {
      totalServers: 8,
      driftingServers: 3,
      complianceScore: 82,
    },
  },
  {
    id: 4,
    name: "DB - Default Firewall Template - GF1",
    template: "Default Firewall Template",
    status: "successful",
    started: "2025-04-21T11:20:00",
    finished: "2025-04-21T11:22:45",
    duration: "2m 45s",
    user: "devops",
    inventory: "GF1 Data Center",
    dataCenters: ["GF1"],
    mnemonics: ["DB"],
    reportType: "drift",
    driftSummary: {
      totalServers: 6,
      driftingServers: 1,
      complianceScore: 95,
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
    dataCenters: ["GF2"],
    mnemonics: ["AUTH"],
    reportType: "drift",
    driftSummary: {
      totalServers: 5,
      driftingServers: 2,
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
    dataCenters: ["GF2"],
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
    dataCenters: ["GF1", "GF2"],
    mnemonics: ["WEB", "DB"],
    reportType: "consistency",
    driftSummary: {
      totalGroups: 2,
      driftingGroups: 1,
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
    dataCenters: ["GF1", "GF2"],
    mnemonics: ["AUTH", "WEB"],
    reportType: "consistency",
    driftSummary: {
      totalGroups: 4,
      driftingGroups: 3,
      complianceScore: 88,
    },
  },
]

// Available data centers for selection
// Update the availableDataCenters array to use GF1 and GF2 names consistently
const availableDataCenters = [
  { id: "dc-gf1", name: "GF1", location: "Primary Data Center" },
  { id: "dc-gf2", name: "GF2", location: "Secondary Data Center" },
]

// Add the following mock data for app mnemonics after the availableDataCenters array
const appMnemonics = [
  {
    id: "app-web",
    name: "WEB",
    description: "Web Application",
    serverGroups: [
      { id: "sg-web-frontend", name: "Frontend Servers", description: "Customer-facing web servers" },
      { id: "sg-web-api", name: "API Servers", description: "Backend API servers" },
      { id: "sg-web-static", name: "Static Content", description: "Static content servers" },
    ],
  },
  {
    id: "app-db",
    name: "DB",
    description: "Database Systems",
    serverGroups: [
      { id: "sg-db-primary", name: "Primary DB", description: "Primary database servers" },
      { id: "sg-db-replica", name: "Replica DB", description: "Database replica servers" },
    ],
  },
  {
    id: "app-auth",
    name: "AUTH",
    description: "Authentication Services",
    serverGroups: [
      { id: "sg-auth-main", name: "Auth Servers", description: "Main authentication servers" },
      { id: "sg-auth-mfa", name: "MFA Services", description: "Multi-factor authentication services" },
    ],
  },
]

// Available templates for dropdown
const availableTemplates = [
  { id: "template-1", name: "Default Firewall Template" },
  { id: "template-2", name: "PCI Compliance" },
  { id: "template-3", name: "DMZ Configuration" },
]

// Update the initialNewJob object to include mnemonics and serverGroups
const initialNewJob = {
  name: "",
  templateId: "template-1",
  description: "",
  dataCenters: [],
  mnemonics: [],
  serverGroups: [],
  reportType: "consistency",
}
const initialIsDialogOpen = false

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
const getDriftStatusBadge = (driftingItems, totalItems) => {
  if (driftingItems === 0) {
    return (
      <Badge className="bg-green-500 hover:bg-green-600">
        <Check className="w-3 h-3 mr-1" /> Aligned
      </Badge>
    )
  } else {
    return (
      <Badge className="bg-amber-500 hover:bg-amber-600">
        <AlertTriangle className="w-3 h-3 mr-1" /> Drifting
      </Badge>
    )
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

export default function Home() {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm)
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter)
  const [reportTypeFilter, setReportTypeFilter] = useState("all")
  const [jobs, setJobs] = useState(initialJobs)
  const [newJob, setNewJob] = useState({
    ...initialNewJob,
    dataCenters: initialNewJob.reportType === "drift" ? ["dc-gf1"] : ["dc-gf1", "dc-gf2"],
  })
  const [isDialogOpen, setIsDialogOpen] = useState(initialIsDialogOpen)

  // Filter jobs based on search term, status filter, and report type filter
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.template.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.inventory?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.dataCenters.some((dc) => dc.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesStatus = statusFilter === "all" || job.status === statusFilter
    const matchesReportType = reportTypeFilter === "all" || job.reportType === reportTypeFilter

    return matchesSearch && matchesStatus && matchesReportType
  })

  // Handle data center selection
  const handleDataCenterChange = (id) => {
    setNewJob((prev) => {
      // For consistency reports, both data centers should always be selected
      if (prev.reportType === "consistency") {
        return prev
      }

      // For drift reports, only allow one data center selection
      const isSelected = prev.dataCenters.includes(id)

      if (isSelected) {
        // Don't allow deselecting the last data center
        if (prev.dataCenters.length <= 1) {
          return prev
        }
        return {
          ...prev,
          dataCenters: prev.dataCenters.filter((dcId) => dcId !== id),
        }
      } else {
        // For drift reports, replace the selection instead of adding
        return {
          ...prev,
          dataCenters: [id],
        }
      }
    })
  }

  // Generate job name based on report type and selected data centers
  const generateJobName = () => {
    // Get selected data centers
    const selectedDCs = availableDataCenters.filter((dc) => newJob.dataCenters.includes(dc.id))
    const dcNames = selectedDCs.map((dc) => dc.name)

    // Get selected mnemonics
    const selectedMnemonics = appMnemonics.filter((m) => newJob.mnemonics.includes(m.id)).map((m) => m.name)

    // Get selected template
    const templateObj = availableTemplates.find((t) => t.id === newJob.templateId) || {
      name: "Default Firewall Template",
    }

    if (selectedMnemonics.length === 0) {
      return ""
    }

    const mnemonicsStr = selectedMnemonics.join(", ")

    if (newJob.reportType === "drift") {
      // For drift reports: "<Mnemonic(s)> - <Rule Template> - <Data Center>"
      if (dcNames.length === 1) {
        return `${mnemonicsStr} - ${templateObj.name} - ${dcNames[0]}`
      }
      return ""
    } else {
      // For consistency reports: "Mnemonic(s) - Rule Template"
      return `${mnemonicsStr} - ${templateObj.name}`
    }
  }

  // Update the handleCreateJob function to include the new fields in validation
  const handleCreateJob = () => {
    // Validate form
    if (!newJob.name || newJob.dataCenters.length === 0 || newJob.mnemonics.length === 0) {
      return
    }

    // For drift reports, only one data center should be selected
    if (newJob.reportType === "drift" && newJob.dataCenters.length > 1) {
      alert("Drift reports can only be run on a single data center.")
      return
    }

    // For consistency reports, at least two data centers should be selected
    if (newJob.reportType === "consistency" && newJob.dataCenters.length < 2) {
      alert("Consistency reports require at least two data centers.")
      return
    }

    // Create inventory name based on selected data centers
    const selectedDCs = availableDataCenters.filter((dc) => newJob.dataCenters.includes(dc.id))
    const dcNames = selectedDCs.map((dc) => dc.name)
    let inventoryName = ""

    if (dcNames.length === 1) {
      inventoryName = `${dcNames[0]} Data Center`
    } else if (dcNames.length === availableDataCenters.length) {
      inventoryName = "All Data Centers"
    } else if (dcNames.length > 1) {
      inventoryName = "Multiple Data Centers"
    }

    // Find the template name
    const templateObj = availableTemplates.find((t) => t.id === newJob.templateId) || {
      name: "Default Firewall Template",
    }

    // Get selected mnemonics
    const selectedMnemonics = appMnemonics.filter((m) => newJob.mnemonics.includes(m.id)).map((m) => m.name)

    // Create new job with current timestamp
    const now = new Date().toISOString()
    const newJobEntry = {
      id: jobs.length + 1,
      name: newJob.name,
      template: templateObj.name,
      status: "running",
      started: now,
      finished: null,
      duration: "Running",
      user: "admin", // Using a default user
      inventory: inventoryName,
      dataCenters: dcNames,
      mnemonics: selectedMnemonics,
      serverGroups: newJob.serverGroups,
      reportType: newJob.reportType,
      driftSummary:
        newJob.reportType === "consistency"
          ? {
              totalGroups: dcNames.length,
              driftingGroups: 0, // Will be updated when job completes
              complianceScore: 0, // Will be updated when job completes
            }
          : {
              totalServers: 0, // Will be updated when job completes
              driftingServers: 0, // Will be updated when job completes
              complianceScore: 0, // Will be updated when job completes
            },
    }

    // Add to jobs list
    setJobs([newJobEntry, ...jobs])

    // Reset form
    setNewJob({
      name: "",
      templateId: "template-1",
      description: "",
      dataCenters: [],
      mnemonics: [],
      serverGroups: [],
      reportType: "consistency",
    })

    // Close dialog
    setIsDialogOpen(false)
  }

  // Add a new function to handle mnemonic selection
  const handleMnemonicChange = (id) => {
    setNewJob((prev) => {
      const isSelected = prev.mnemonics.includes(id)

      if (isSelected) {
        // Remove the mnemonic and any server groups that belong to it
        const mnemonic = appMnemonics.find((m) => m.id === id)
        const mnemonicServerGroupIds = mnemonic ? mnemonic.serverGroups.map((sg) => sg.id) : []

        return {
          ...prev,
          mnemonics: prev.mnemonics.filter((m) => m !== id),
          serverGroups: prev.serverGroups.filter((sg) => !mnemonicServerGroupIds.includes(sg)),
        }
      } else {
        // Add the mnemonic
        return {
          ...prev,
          mnemonics: [...prev.mnemonics, id],
        }
      }
    })
  }

  // Add a new function to handle server group selection
  const handleServerGroupChange = (id) => {
    setNewJob((prev) => {
      const isSelected = prev.serverGroups.includes(id)

      if (isSelected) {
        return {
          ...prev,
          serverGroups: prev.serverGroups.filter((sg) => sg !== id),
        }
      } else {
        return {
          ...prev,
          serverGroups: [...prev.serverGroups, id],
        }
      }
    })
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <h1 className="text-lg font-semibold">Firewall Drift Dashboard</h1>
        <Tabs defaultValue="jobs" className="flex-1">
          <TabsList className="ml-auto">
            <TabsTrigger value="jobs">Jobs</TabsTrigger>
            <TabsTrigger value="templates" asChild>
              <Link href="/templates">Firewall Rule Templates</Link>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Drift Reporting</h2>
            <p className="text-muted-foreground">Compare firewall rules across data centers</p>
          </div>
          <div className="flex items-center gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  onClick={() =>
                    setNewJob({
                      ...initialNewJob,
                      reportType: "drift",
                      dataCenters: ["dc-gf1"],
                      mnemonics: [],
                      serverGroups: [],
                    })
                  }
                >
                  <Server className="mr-2 h-4 w-4" />
                  Generate Drift Report
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  {newJob.reportType === "drift" ? "Generate Drift Report" : "Generate Consistency Report"}
                </DialogHeader>
                <DialogDescription>
                  {newJob.reportType === "drift"
                    ? "Analyze server drift within a single data center."
                    : "Compare firewall rules across multiple data centers."}
                </DialogDescription>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">
                      {newJob.reportType === "drift" ? "Data Center" : "Data Centers"}
                    </Label>
                    <div className="col-span-3 space-y-3">
                      {availableDataCenters.map((dc) => (
                        <div key={dc.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`dc-${dc.id}`}
                            checked={newJob.dataCenters.includes(dc.id)}
                            onCheckedChange={() => handleDataCenterChange(dc.id)}
                            disabled={
                              (newJob.reportType === "drift" &&
                                newJob.dataCenters.length > 0 &&
                                !newJob.dataCenters.includes(dc.id)) ||
                              newJob.reportType === "consistency"
                            }
                          />
                          <Label htmlFor={`dc-${dc.id}`} className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <span>{dc.name}</span>
                            <span className="text-xs text-muted-foreground">({dc.location})</span>
                          </Label>
                        </div>
                      ))}
                      {newJob.dataCenters.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          {newJob.reportType === "drift"
                            ? "Select a data center to check for server drift"
                            : "Select at least two data centers to compare"}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">App Mnemonics</Label>
                    <div className="col-span-3 space-y-3">
                      {appMnemonics.map((mnemonic) => (
                        <div key={mnemonic.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`mnemonic-${mnemonic.id}`}
                            checked={newJob.mnemonics.includes(mnemonic.id)}
                            onCheckedChange={() => handleMnemonicChange(mnemonic.id)}
                          />
                          <Label htmlFor={`mnemonic-${mnemonic.id}`} className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-muted-foreground" />
                            <span>{mnemonic.name}</span>
                            <span className="text-xs text-muted-foreground">({mnemonic.description})</span>
                          </Label>
                        </div>
                      ))}
                      {newJob.mnemonics.length === 0 && (
                        <p className="text-sm text-muted-foreground">Select at least one app mnemonic to analyze</p>
                      )}
                    </div>
                  </div>

                  {newJob.mnemonics.length > 0 && (
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right pt-2">Server Groups</Label>
                      <div className="col-span-3 space-y-4">
                        {newJob.mnemonics.map((mnemonicId) => {
                          const mnemonic = appMnemonics.find((m) => m.id === mnemonicId)
                          if (!mnemonic) return null

                          return (
                            <div key={mnemonic.id} className="space-y-2">
                              <h4 className="text-sm font-medium">{mnemonic.name}</h4>
                              <div className="ml-4 space-y-2">
                                {mnemonic.serverGroups.map((group) => (
                                  <div key={group.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`group-${group.id}`}
                                      checked={newJob.serverGroups.includes(group.id)}
                                      onCheckedChange={() => handleServerGroupChange(group.id)}
                                    />
                                    <Label htmlFor={`group-${group.id}`} className="flex items-center gap-2">
                                      <span>{group.name}</span>
                                      <span className="text-xs text-muted-foreground">({group.description})</span>
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                        {newJob.serverGroups.length === 0 && (
                          <p className="text-sm text-muted-foreground">Select at least one server group to analyze</p>
                        )}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="job-template" className="text-right">
                      Template
                    </Label>
                    <Select
                      value={newJob.templateId}
                      onValueChange={(value) => setNewJob({ ...newJob, templateId: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              {template.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="job-name" className="text-right">
                      Name
                    </Label>
                    <div className="col-span-3 space-y-2">
                      <Input
                        id="job-name"
                        value={newJob.name}
                        onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                        placeholder="Enter job name"
                        required
                      />
                      {newJob.dataCenters.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setNewJob({ ...newJob, name: generateJobName() })}
                        >
                          Generate Name
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="job-description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="job-description"
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      className="col-span-3"
                      placeholder="Optional job description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateJob}
                    disabled={
                      !newJob.name ||
                      newJob.dataCenters.length === 0 ||
                      newJob.mnemonics.length === 0 ||
                      newJob.serverGroups.length === 0 ||
                      (newJob.reportType === "consistency" && newJob.dataCenters.length < 2)
                    }
                  >
                    {newJob.reportType === "drift" ? "Launch Drift Report" : "Launch Consistency Report"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() =>
                    setNewJob({
                      ...initialNewJob,
                      reportType: "consistency",
                      dataCenters: ["dc-gf1", "dc-gf2"],
                      mnemonics: [],
                      serverGroups: [],
                    })
                  }
                >
                  <Database className="mr-2 h-4 w-4" />
                  Generate Consistency Report
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  {newJob.reportType === "drift" ? "Generate Drift Report" : "Generate Consistency Report"}
                </DialogHeader>
                <DialogDescription>
                  {newJob.reportType === "drift"
                    ? "Analyze server drift within a single data center."
                    : "Compare firewall rules across multiple data centers."}
                </DialogDescription>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">
                      {newJob.reportType === "drift" ? "Data Center" : "Data Centers"}
                    </Label>
                    <div className="col-span-3 space-y-3">
                      {availableDataCenters.map((dc) => (
                        <div key={dc.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`dc-${dc.id}`}
                            checked={newJob.dataCenters.includes(dc.id)}
                            onCheckedChange={() => handleDataCenterChange(dc.id)}
                            disabled={
                              (newJob.reportType === "drift" &&
                                newJob.dataCenters.length > 0 &&
                                !newJob.dataCenters.includes(dc.id)) ||
                              newJob.reportType === "consistency"
                            }
                          />
                          <Label htmlFor={`dc-${dc.id}`} className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <span>{dc.name}</span>
                            <span className="text-xs text-muted-foreground">({dc.location})</span>
                          </Label>
                        </div>
                      ))}
                      {newJob.dataCenters.length === 0 && (
                        <p className="text-sm text-muted-foreground">
                          {newJob.reportType === "drift"
                            ? "Select a data center to check for server drift"
                            : "Select at least two data centers to compare"}
                        </p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-4 items-start gap-4">
                    <Label className="text-right pt-2">App Mnemonics</Label>
                    <div className="col-span-3 space-y-3">
                      {appMnemonics.map((mnemonic) => (
                        <div key={mnemonic.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`mnemonic-${mnemonic.id}`}
                            checked={newJob.mnemonics.includes(mnemonic.id)}
                            onCheckedChange={() => handleMnemonicChange(mnemonic.id)}
                          />
                          <Label htmlFor={`mnemonic-${mnemonic.id}`} className="flex items-center gap-2">
                            <Server className="h-4 w-4 text-muted-foreground" />
                            <span>{mnemonic.name}</span>
                            <span className="text-xs text-muted-foreground">({mnemonic.description})</span>
                          </Label>
                        </div>
                      ))}
                      {newJob.mnemonics.length === 0 && (
                        <p className="text-sm text-muted-foreground">Select at least one app mnemonic to analyze</p>
                      )}
                    </div>
                  </div>

                  {newJob.mnemonics.length > 0 && (
                    <div className="grid grid-cols-4 items-start gap-4">
                      <Label className="text-right pt-2">Server Groups</Label>
                      <div className="col-span-3 space-y-4">
                        {newJob.mnemonics.map((mnemonicId) => {
                          const mnemonic = appMnemonics.find((m) => m.id === mnemonicId)
                          if (!mnemonic) return null

                          return (
                            <div key={mnemonic.id} className="space-y-2">
                              <h4 className="text-sm font-medium">{mnemonic.name}</h4>
                              <div className="ml-4 space-y-2">
                                {mnemonic.serverGroups.map((group) => (
                                  <div key={group.id} className="flex items-center space-x-2">
                                    <Checkbox
                                      id={`group-${group.id}`}
                                      checked={newJob.serverGroups.includes(group.id)}
                                      onCheckedChange={() => handleServerGroupChange(group.id)}
                                    />
                                    <Label htmlFor={`group-${group.id}`} className="flex items-center gap-2">
                                      <span>{group.name}</span>
                                      <span className="text-xs text-muted-foreground">({group.description})</span>
                                    </Label>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}
                        {newJob.serverGroups.length === 0 && (
                          <p className="text-sm text-muted-foreground">Select at least one server group to analyze</p>
                        )}
                      </div>
                    </div>
                  )}

                  <Separator />

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="job-template" className="text-right">
                      Template
                    </Label>
                    <Select
                      value={newJob.templateId}
                      onValueChange={(value) => setNewJob({ ...newJob, templateId: value })}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-muted-foreground" />
                              {template.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="job-name" className="text-right">
                      Name
                    </Label>
                    <div className="col-span-3 space-y-2">
                      <Input
                        id="job-name"
                        value={newJob.name}
                        onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
                        placeholder="Enter job name"
                        required
                      />
                      {newJob.dataCenters.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          onClick={() => setNewJob({ ...newJob, name: generateJobName() })}
                        >
                          Generate Name
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="job-description" className="text-right">
                      Description
                    </Label>
                    <Textarea
                      id="job-description"
                      value={newJob.description}
                      onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                      className="col-span-3"
                      placeholder="Optional job description"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateJob}
                    disabled={
                      !newJob.name ||
                      newJob.dataCenters.length === 0 ||
                      newJob.mnemonics.length === 0 ||
                      newJob.serverGroups.length === 0 ||
                      (newJob.reportType === "consistency" && newJob.dataCenters.length < 2)
                    }
                  >
                    {newJob.reportType === "drift" ? "Launch Drift Report" : "Launch Consistency Report"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Report History</CardTitle>
            <CardDescription>Recent firewall rule analysis jobs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1 md:max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search jobs..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="h-10">
                      <Filter className="mr-2 h-4 w-4" />
                      Filter
                      <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="font-semibold">Status</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("all")}>All Statuses</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("successful")}>Successful</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("failed")}>Failed</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("running")}>Running</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("pending")}>Pending</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter("canceled")}>Canceled</DropdownMenuItem>

                    <DropdownMenuItem className="font-semibold mt-2">Report Type</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setReportTypeFilter("all")}>All Types</DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setReportTypeFilter("consistency")}>
                      Consistency Reports
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setReportTypeFilter("drift")}>Drift Reports</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <Select defaultValue="recent">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="compliance">Compliance Score</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                  <span className="sr-only">Refresh</span>
                </Button>
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download</span>
                </Button>
              </div>
            </div>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="hidden md:table-cell">Type</TableHead>
                    <TableHead className="hidden md:table-cell">Template</TableHead>
                    <TableHead className="hidden md:table-cell">Started</TableHead>
                    <TableHead className="hidden lg:table-cell">Compliance</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredJobs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No jobs found matching your criteria
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell className="font-medium">
                          <Link href={`/job/${job.id}`} className="hover:underline">
                            {job.name}
                          </Link>
                        </TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell className="hidden md:table-cell">{getReportTypeBadge(job.reportType)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="flex items-center gap-1">
                            <Shield className="h-4 w-4 text-muted-foreground" />
                            <span>{job.template}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {job.started ? (
                            <div className="flex items-center">
                              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                              {format(parseISO(job.started), "MMM d, h:mm a")}
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {job.driftSummary ? (
                            <div className="flex items-center gap-2">
                              <div className="w-12 bg-muted rounded-full h-2">
                                <div
                                  className={`h-full rounded-full ${
                                    job.driftSummary.complianceScore > 90
                                      ? "bg-green-500"
                                      : job.driftSummary.complianceScore > 75
                                        ? "bg-amber-500"
                                        : "bg-red-500"
                                  }`}
                                  style={{ width: `${job.driftSummary.complianceScore}%` }}
                                />
                              </div>
                              <span>{job.driftSummary.complianceScore}%</span>
                            </div>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/job/${job.id}`}>View Details</Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem>View Output</DropdownMenuItem>
                              <DropdownMenuItem>Relaunch Job</DropdownMenuItem>
                              <DropdownMenuItem>Download Report</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing <strong>{filteredJobs.length}</strong> of <strong>{jobs.length}</strong> jobs
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Jobs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.length}</div>
              <p className="text-xs text-muted-foreground">+2 from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Compliance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  jobs
                    .filter((job) => job.driftSummary)
                    .reduce((sum, job) => sum + job.driftSummary.complianceScore, 0) /
                    jobs.filter((job) => job.driftSummary).length,
                )}
                %
              </div>
              <p className="text-xs text-muted-foreground">-2% from last week</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Consistency Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.filter((job) => job.reportType === "consistency").length}</div>
              <p className="text-xs text-muted-foreground">Group comparisons</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Drift Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{jobs.filter((job) => job.reportType === "drift").length}</div>
              <p className="text-xs text-muted-foreground">Server drift analysis</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
