"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Copy,
  Download,
  Edit,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  Trash2,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

// Initial template data
const initialTemplates = [
  {
    id: "template-1",
    name: "Default Firewall Template",
    description: "Standard firewall configuration for all data centers",
    lastUpdated: "2025-04-15T10:30:00",
    updatedBy: "admin",
    isDefault: true,
    segments: [
      {
        id: "segment-1",
        name: "Basic Security",
        description: "Essential security rules for all environments",
        rules: [
          {
            id: "rule-1",
            direction: "inbound",
            port: 22,
            protocol: "TCP",
            source: "10.0.0.0/8",
            action: "ALLOW",
            description: "SSH Access",
          },
          {
            id: "rule-2",
            direction: "inbound",
            port: 443,
            protocol: "TCP",
            source: "0.0.0.0/0",
            action: "ALLOW",
            description: "HTTPS",
          },
          {
            id: "rule-3",
            direction: "outbound",
            port: "Any",
            protocol: "Any",
            destination: "0.0.0.0/0",
            action: "ALLOW",
            description: "All outbound traffic",
          },
        ],
      },
      {
        id: "segment-2",
        name: "Production Services",
        description: "Rules for production services",
        rules: [
          {
            id: "rule-4",
            direction: "inbound",
            port: 80,
            protocol: "TCP",
            source: "0.0.0.0/0",
            action: "ALLOW",
            description: "HTTP",
          },
          {
            id: "rule-5",
            direction: "inbound",
            port: 3389,
            protocol: "TCP",
            source: "10.0.0.0/8",
            action: "ALLOW",
            description: "RDP Access",
          },
        ],
      },
    ],
  },
  {
    id: "template-2",
    name: "PCI Compliance",
    description: "Firewall rules for PCI DSS compliance",
    lastUpdated: "2025-04-10T16:45:00",
    updatedBy: "security",
    isDefault: false,
    segments: [
      {
        id: "segment-3",
        name: "PCI Basic Security",
        description: "Basic security for PCI compliance",
        rules: [
          {
            id: "rule-6",
            direction: "inbound",
            port: 22,
            protocol: "TCP",
            source: "10.0.0.0/8",
            action: "ALLOW",
            description: "SSH Access - Limited",
          },
          {
            id: "rule-7",
            direction: "inbound",
            port: 443,
            protocol: "TCP",
            source: "0.0.0.0/0",
            action: "ALLOW",
            description: "HTTPS",
          },
        ],
      },
      {
        id: "segment-4",
        name: "PCI Restrictions",
        description: "Required restrictions for PCI compliance",
        rules: [
          {
            id: "rule-8",
            direction: "outbound",
            port: 25,
            protocol: "TCP",
            destination: "0.0.0.0/0",
            action: "DENY",
            description: "Block SMTP",
          },
          {
            id: "rule-9",
            direction: "inbound",
            port: 1433,
            protocol: "TCP",
            source: "10.0.0.0/8",
            action: "ALLOW",
            description: "SQL Server",
          },
        ],
      },
    ],
  },
  {
    id: "template-3",
    name: "DMZ Configuration",
    description: "Firewall rules for DMZ networks",
    lastUpdated: "2025-04-05T09:15:00",
    updatedBy: "network",
    isDefault: false,
    segments: [
      {
        id: "segment-5",
        name: "DMZ Access",
        description: "Rules for DMZ access",
        rules: [
          {
            id: "rule-10",
            direction: "inbound",
            port: 80,
            protocol: "TCP",
            source: "0.0.0.0/0",
            action: "ALLOW",
            description: "HTTP",
          },
          {
            id: "rule-11",
            direction: "inbound",
            port: 443,
            protocol: "TCP",
            source: "0.0.0.0/0",
            action: "ALLOW",
            description: "HTTPS",
          },
        ],
      },
      {
        id: "segment-6",
        name: "DMZ Restrictions",
        description: "Security restrictions for DMZ",
        rules: [
          {
            id: "rule-12",
            direction: "outbound",
            port: 3389,
            protocol: "TCP",
            destination: "10.0.0.0/8",
            action: "DENY",
            description: "Block RDP to internal",
          },
          {
            id: "rule-13",
            direction: "outbound",
            port: 22,
            protocol: "TCP",
            destination: "10.0.0.0/8",
            action: "DENY",
            description: "Block SSH to internal",
          },
        ],
      },
    ],
  },
]

// Protocol options
const protocolOptions = ["TCP", "UDP", "ICMP", "Any"]

// Action options
const actionOptions = ["ALLOW", "DENY", "REJECT"]

export default function TemplatesPage() {
  const [templates, setTemplates] = useState(initialTemplates)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false)
  const [isSegmentDialogOpen, setIsSegmentDialogOpen] = useState(false)
  const [isRuleDialogOpen, setIsRuleDialogOpen] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    description: "",
    isDefault: false,
  })
  const [newSegment, setNewSegment] = useState({
    templateId: "",
    name: "",
    description: "",
  })
  const [newRule, setNewRule] = useState({
    templateId: "",
    segmentId: "",
    direction: "inbound",
    port: "",
    protocol: "TCP",
    source: "",
    destination: "",
    action: "ALLOW",
    description: "",
  })

  // Filter templates based on search term
  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Handle create new template
  const handleCreateTemplate = () => {
    if (!newTemplate.name) return

    const template = {
      id: `template-${Date.now()}`,
      name: newTemplate.name,
      description: newTemplate.description,
      lastUpdated: new Date().toISOString(),
      updatedBy: "admin",
      isDefault: newTemplate.isDefault,
      segments: [],
    }

    // If this is set as default, remove default from other templates
    let updatedTemplates = [...templates]
    if (newTemplate.isDefault) {
      updatedTemplates = updatedTemplates.map((t) => ({
        ...t,
        isDefault: false,
      }))
    }

    setTemplates([template, ...updatedTemplates])
    setNewTemplate({
      name: "",
      description: "",
      isDefault: false,
    })
    setIsTemplateDialogOpen(false)
  }

  // Handle edit template
  const handleEditTemplate = () => {
    if (!selectedTemplate || !newTemplate.name) return

    const updatedTemplates = templates.map((template) => {
      if (template.id === selectedTemplate.id) {
        return {
          ...template,
          name: newTemplate.name,
          description: newTemplate.description,
          lastUpdated: new Date().toISOString(),
          updatedBy: "admin",
          isDefault: newTemplate.isDefault,
        }
      }

      // If the edited template is now default, remove default from others
      if (newTemplate.isDefault && template.id !== selectedTemplate.id) {
        return {
          ...template,
          isDefault: false,
        }
      }

      return template
    })

    setTemplates(updatedTemplates)
    setSelectedTemplate(null)
    setNewTemplate({
      name: "",
      description: "",
      isDefault: false,
    })
    setIsTemplateDialogOpen(false)
  }

  // Handle duplicate template
  const handleDuplicateTemplate = (template) => {
    const duplicatedTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      name: `${template.name} (Copy)`,
      lastUpdated: new Date().toISOString(),
      updatedBy: "admin",
      isDefault: false,
    }

    setTemplates([duplicatedTemplate, ...templates])
  }

  // Handle delete template
  const handleDeleteTemplate = (templateId) => {
    setTemplates(templates.filter((template) => template.id !== templateId))
  }

  // Handle create segment
  const handleCreateSegment = () => {
    if (!newSegment.templateId || !newSegment.name) return

    const segment = {
      id: `segment-${Date.now()}`,
      name: newSegment.name,
      description: newSegment.description,
      rules: [],
    }

    const updatedTemplates = templates.map((template) => {
      if (template.id === newSegment.templateId) {
        return {
          ...template,
          segments: [...template.segments, segment],
          lastUpdated: new Date().toISOString(),
          updatedBy: "admin",
        }
      }
      return template
    })

    setTemplates(updatedTemplates)
    setNewSegment({
      templateId: "",
      name: "",
      description: "",
    })
    setIsSegmentDialogOpen(false)
  }

  // Handle create rule
  const handleCreateRule = () => {
    if (!newRule.templateId || !newRule.segmentId) return

    const rule = {
      id: `rule-${Date.now()}`,
      direction: newRule.direction,
      port: newRule.port,
      protocol: newRule.protocol,
      source: newRule.direction === "inbound" ? newRule.source : "",
      destination: newRule.direction === "outbound" ? newRule.destination : "",
      action: newRule.action,
      description: newRule.description,
    }

    const updatedTemplates = templates.map((template) => {
      if (template.id === newRule.templateId) {
        return {
          ...template,
          segments: template.segments.map((segment) => {
            if (segment.id === newRule.segmentId) {
              return {
                ...segment,
                rules: [...segment.rules, rule],
              }
            }
            return segment
          }),
          lastUpdated: new Date().toISOString(),
          updatedBy: "admin",
        }
      }
      return template
    })

    setTemplates(updatedTemplates)
    setNewRule({
      templateId: "",
      segmentId: "",
      direction: "inbound",
      port: "",
      protocol: "TCP",
      source: "",
      destination: "",
      action: "ALLOW",
      description: "",
    })
    setIsRuleDialogOpen(false)
  }

  // Open edit template dialog
  const openEditTemplateDialog = (template) => {
    setSelectedTemplate(template)
    setNewTemplate({
      name: template.name,
      description: template.description,
      isDefault: template.isDefault,
    })
    setEditMode(true)
    setIsTemplateDialogOpen(true)
  }

  // Open new template dialog
  const openNewTemplateDialog = () => {
    setSelectedTemplate(null)
    setNewTemplate({
      name: "",
      description: "",
      isDefault: false,
    })
    setEditMode(false)
    setIsTemplateDialogOpen(true)
  }

  // Open new segment dialog for specific template
  const openNewSegmentDialog = (templateId) => {
    setNewSegment({
      templateId,
      name: "",
      description: "",
    })
    setIsSegmentDialogOpen(true)
  }

  // Open new rule dialog for specific template and segment
  const openNewRuleDialog = (templateId, segmentId) => {
    setNewRule({
      templateId,
      segmentId,
      direction: "inbound",
      port: "",
      protocol: "TCP",
      source: "",
      destination: "",
      action: "ALLOW",
      description: "",
    })
    setIsRuleDialogOpen(true)
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <h1 className="text-lg font-semibold">Firewall Drift Dashboard</h1>
      </header>

      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Firewall Rule Templates</h2>
            <p className="text-muted-foreground">Create and manage baseline firewall rule templates</p>
          </div>
          <Button onClick={openNewTemplateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>

        {/* Template Management UI */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <div className="relative w-full md:w-80">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search templates..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select defaultValue="updated">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="updated">Last Updated</SelectItem>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="segments">Number of Segments</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon">
                <Download className="h-4 w-4" />
                <span className="sr-only">Export</span>
              </Button>
            </div>
          </div>

          {/* Templates List */}
          {filteredTemplates.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="text-center">
                  <Shield className="mx-auto h-10 w-10 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-medium">No Templates Found</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Create a new template to get started.</p>
                  <Button onClick={openNewTemplateDialog} className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    New Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <Collapsible key={template.id} className="border rounded-lg">
                  <CollapsibleTrigger className="flex items-center justify-between w-full p-4 hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{template.name}</span>
                          {template.isDefault && (
                            <Badge variant="outline" className="text-xs">
                              Default
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">{template.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-sm text-muted-foreground">
                        {template.segments.length} segments,{" "}
                        {template.segments.reduce((acc, segment) => acc + segment.rules.length, 0)} rules
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.stopPropagation()
                            openEditTemplateDialog(template)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">More</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleDuplicateTemplate(template)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Duplicate
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openNewSegmentDialog(template.id)}>
                              <Plus className="mr-2 h-4 w-4" />
                              Add Segment
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <ChevronDown className="h-4 w-4" />
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="p-4 pt-1 border-t">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-sm font-medium">Segments</h3>
                        <Button variant="outline" size="sm" onClick={() => openNewSegmentDialog(template.id)}>
                          <Plus className="mr-2 h-3 w-3" />
                          Add Segment
                        </Button>
                      </div>

                      {template.segments.length === 0 ? (
                        <div className="text-center p-8 border rounded-md bg-muted/30">
                          <p className="text-muted-foreground">No segments defined yet.</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => openNewSegmentDialog(template.id)}
                          >
                            Add First Segment
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {template.segments.map((segment) => (
                            <Collapsible key={segment.id} className="border rounded-md">
                              <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/30">
                                <div className="font-medium text-sm">{segment.name}</div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">{segment.rules.length} rules</span>
                                  <ChevronDown className="h-4 w-4" />
                                </div>
                              </CollapsibleTrigger>
                              <CollapsibleContent>
                                <div className="p-3 pt-0 border-t">
                                  <div className="flex justify-between items-center mb-3">
                                    <div className="text-xs text-muted-foreground">{segment.description}</div>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => openNewRuleDialog(template.id, segment.id)}
                                    >
                                      <Plus className="mr-1 h-3 w-3" />
                                      Add Rule
                                    </Button>
                                  </div>

                                  {segment.rules.length === 0 ? (
                                    <div className="text-center py-4 text-sm text-muted-foreground">
                                      No rules defined yet.
                                    </div>
                                  ) : (
                                    <div className="border rounded-md overflow-hidden">
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead className="w-[100px]">Direction</TableHead>
                                            <TableHead className="w-[100px]">Port</TableHead>
                                            <TableHead className="w-[100px]">Protocol</TableHead>
                                            <TableHead>Source/Destination</TableHead>
                                            <TableHead className="w-[100px]">Action</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead className="w-[50px]"></TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {segment.rules.map((rule) => (
                                            <TableRow key={rule.id}>
                                              <TableCell className="capitalize">{rule.direction}</TableCell>
                                              <TableCell>{rule.port}</TableCell>
                                              <TableCell>{rule.protocol}</TableCell>
                                              <TableCell>
                                                {rule.direction === "inbound" ? rule.source : rule.destination}
                                              </TableCell>
                                              <TableCell>
                                                <Badge variant={rule.action === "ALLOW" ? "default" : "destructive"}>
                                                  {rule.action}
                                                </Badge>
                                              </TableCell>
                                              <TableCell>{rule.description}</TableCell>
                                              <TableCell>
                                                <DropdownMenu>
                                                  <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                                      <MoreHorizontal className="h-3 w-3" />
                                                    </Button>
                                                  </DropdownMenuTrigger>
                                                  <DropdownMenuContent align="end">
                                                    <DropdownMenuItem>
                                                      <Edit className="mr-2 h-4 w-4" />
                                                      Edit Rule
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                      <ArrowUp className="mr-2 h-4 w-4" />
                                                      Move Up
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem>
                                                      <ArrowDown className="mr-2 h-4 w-4" />
                                                      Move Down
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                                                      <Trash2 className="mr-2 h-4 w-4" />
                                                      Delete
                                                    </DropdownMenuItem>
                                                  </DropdownMenuContent>
                                                </DropdownMenu>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  )}
                                </div>
                              </CollapsibleContent>
                            </Collapsible>
                          ))}
                        </div>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Template Dialog */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{editMode ? "Edit Template" : "Create Template"}</DialogTitle>
            <DialogDescription>
              {editMode ? "Update the template details." : "Create a new template with baseline firewall rules."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-name" className="text-right">
                Name
              </Label>
              <Input
                id="template-name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className="col-span-3"
                placeholder="Enter template name"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="template-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="template-description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                className="col-span-3"
                placeholder="Enter template description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Default</Label>
              <div className="flex items-center space-x-2 col-span-3">
                <Switch
                  id="template-default"
                  checked={newTemplate.isDefault}
                  onCheckedChange={(checked) => setNewTemplate({ ...newTemplate, isDefault: checked })}
                />
                <Label htmlFor="template-default">Make this the default template</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTemplateDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={editMode ? handleEditTemplate : handleCreateTemplate}>
              {editMode ? "Save Changes" : "Create Template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Segment Dialog */}
      <Dialog open={isSegmentDialogOpen} onOpenChange={setIsSegmentDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Rule Segment</DialogTitle>
            <DialogDescription>Create a new segment to group related firewall rules.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="segment-name" className="text-right">
                Name
              </Label>
              <Input
                id="segment-name"
                value={newSegment.name}
                onChange={(e) => setNewSegment({ ...newSegment, name: e.target.value })}
                className="col-span-3"
                placeholder="Enter segment name"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="segment-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="segment-description"
                value={newSegment.description}
                onChange={(e) => setNewSegment({ ...newSegment, description: e.target.value })}
                className="col-span-3"
                placeholder="Enter segment description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSegmentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateSegment} disabled={!newSegment.name}>
              Add Segment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rule Dialog */}
      <Dialog open={isRuleDialogOpen} onOpenChange={setIsRuleDialogOpen}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Add Firewall Rule</DialogTitle>
            <DialogDescription>Add a new firewall rule to the selected segment.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rule-direction" className="text-right">
                Direction
              </Label>
              <Select value={newRule.direction} onValueChange={(value) => setNewRule({ ...newRule, direction: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select direction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="inbound">Inbound</SelectItem>
                  <SelectItem value="outbound">Outbound</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rule-port" className="text-right">
                Port
              </Label>
              <Input
                id="rule-port"
                value={newRule.port}
                onChange={(e) => setNewRule({ ...newRule, port: e.target.value })}
                className="col-span-3"
                placeholder="Enter port number or 'Any'"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rule-protocol" className="text-right">
                Protocol
              </Label>
              <Select value={newRule.protocol} onValueChange={(value) => setNewRule({ ...newRule, protocol: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select protocol" />
                </SelectTrigger>
                <SelectContent>
                  {protocolOptions.map((protocol) => (
                    <SelectItem key={protocol} value={protocol}>
                      {protocol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newRule.direction === "inbound" ? (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rule-source" className="text-right">
                  Source
                </Label>
                <Input
                  id="rule-source"
                  value={newRule.source}
                  onChange={(e) => setNewRule({ ...newRule, source: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter source IP/CIDR"
                  required
                />
              </div>
            ) : (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rule-destination" className="text-right">
                  Destination
                </Label>
                <Input
                  id="rule-destination"
                  value={newRule.destination}
                  onChange={(e) => setNewRule({ ...newRule, destination: e.target.value })}
                  className="col-span-3"
                  placeholder="Enter destination IP/CIDR"
                  required
                />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rule-action" className="text-right">
                Action
              </Label>
              <Select value={newRule.action} onValueChange={(value) => setNewRule({ ...newRule, action: value })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select action" />
                </SelectTrigger>
                <SelectContent>
                  {actionOptions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rule-description" className="text-right">
                Description
              </Label>
              <Input
                id="rule-description"
                value={newRule.description}
                onChange={(e) => setNewRule({ ...newRule, description: e.target.value })}
                className="col-span-3"
                placeholder="Enter rule description"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRuleDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateRule}
              disabled={
                !newRule.port ||
                (newRule.direction === "inbound" && !newRule.source) ||
                (newRule.direction === "outbound" && !newRule.destination)
              }
            >
              Add Rule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
