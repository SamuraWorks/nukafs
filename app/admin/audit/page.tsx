"use client"

import { useState } from "react"
import {
  Activity,
  Search,
  Download,
  Plus,
  FilePen,
  Trash2,
  CheckCircle,
  LogIn,
  FileText,
  Eye,
  Filter,
  X,
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { toast } from "sonner"
// Minimal audit entry type used by the UI (sourced from backend audit log)
type AuditEntry = {
  id: string
  actor: string
  action: string
  target: string
  timestamp: string
  type: "create" | "update" | "delete" | "approve" | "login"
}

// Extended mock log entries for richer audit demonstration
const EXTENDED_LOGS: (AuditEntry & { role: string; module: string; ip: string; status: "success" | "failed" })[] = [
  { id: "log_ext_1", actor: "Fatmata Koroma", role: "Executive", action: "Approved student registration", target: "Sahr Mansaray", timestamp: "2024-09-03 14:22", type: "approve", module: "Registrations", ip: "197.220.124.12", status: "success" },
  { id: "log_ext_2", actor: "Mohamed Sesay", role: "Executive", action: "Updated profile field (Phone)", target: "NUKaFs-2024-0412", timestamp: "2024-09-03 11:05", type: "update", module: "Student Management", ip: "197.220.125.88", status: "success" },
  { id: "log_ext_3", actor: "Alusine Bangura", role: "Super Admin", action: "Added executive team member", target: "Isatu Bah", timestamp: "2024-09-02 16:40", type: "create", module: "Team Members", ip: "197.220.124.9", status: "success" },
  { id: "log_ext_4", actor: "Fatmata Koroma", role: "Executive", action: "Rejected edit request", target: "REQ-3091", timestamp: "2024-09-02 09:18", type: "delete", module: "Approvals", ip: "197.220.124.12", status: "success" },
  { id: "log_ext_5", actor: "Isatu Bah", role: "Executive", action: "Signed in to portal", target: "Executive Dashboard", timestamp: "2024-09-02 08:55", type: "login", module: "Authentication", ip: "197.220.124.55", status: "success" },
  { id: "log_ext_6", actor: "Mohamed Sesay", role: "Executive", action: "Published announcement", target: "Membership Renewal", timestamp: "2024-09-01 19:30", type: "create", module: "Announcements", ip: "197.220.125.88", status: "success" },
  { id: "log_ext_7", actor: "Alusine Bangura", role: "Super Admin", action: "Updated system settings", target: "System Preferences", timestamp: "2024-09-01 14:10", type: "update", module: "Settings", ip: "197.220.124.9", status: "success" },
  { id: "log_ext_8", actor: "Alusine Bangura", role: "Super Admin", action: "Assigned permission role", target: "Mohamed Sesay", timestamp: "2024-09-01 12:00", type: "update", module: "Permissions", ip: "197.220.124.9", status: "success" },
  { id: "log_ext_9", actor: "Fatmata Koroma", role: "Executive", action: "Created event", target: "Career Fair 2024", timestamp: "2024-08-30 15:45", type: "create", module: "Events", ip: "197.220.124.12", status: "success" },
  { id: "log_ext_10", actor: "Isatu Bah", role: "Executive", action: "Deleted expired opportunity", target: "Scholarship Deadline Passed", timestamp: "2024-08-29 09:00", type: "delete", module: "Opportunities", ip: "197.220.124.55", status: "success" },
  { id: "log_ext_11", actor: "Unknown", role: "—", action: "Failed login attempt", target: "Executive Portal", timestamp: "2024-08-28 03:21", type: "login", module: "Authentication", ip: "41.206.10.44", status: "failed" },
  { id: "log_ext_12", actor: "Alusine Bangura", role: "Super Admin", action: "Updated university list", target: "Universities Manager", timestamp: "2024-08-27 11:15", type: "update", module: "Universities", ip: "197.220.124.9", status: "success" },
]

const TYPE_CONFIG: Record<AuditEntry["type"], { label: string; className: string; Icon: React.ElementType }> = {
  create: { label: "Create", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800", Icon: Plus },
  update: { label: "Update", className: "bg-primary/10 text-primary border-primary/20", Icon: FilePen },
  delete: { label: "Delete", className: "bg-destructive/10 text-destructive border-destructive/20", Icon: Trash2 },
  approve: { label: "Approve", className: "bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950 dark:text-teal-400 dark:border-teal-800", Icon: CheckCircle },
  login: { label: "Login", className: "bg-muted text-muted-foreground border-muted-foreground/20", Icon: LogIn },
}

const MODULES = ["All Modules", "Authentication", "Registrations", "Student Management", "Approvals", "Announcements", "Events", "Opportunities", "Team Members", "Settings", "Permissions", "Universities"]
const ROLES = ["All Roles", "Super Admin", "Executive", "Stakeholder", "Student"]
const STATUSES = ["All Statuses", "success", "failed"]

export default function AuditPage() {
  const { auditLog } = useAppState()
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [moduleFilter, setModuleFilter] = useState<string>("All Modules")
  const [roleFilter, setRoleFilter] = useState<string>("All Roles")
  const [statusFilter, setStatusFilter] = useState<string>("All Statuses")
  const [selectedEntry, setSelectedEntry] = useState<typeof EXTENDED_LOGS[0] | null>(null)

  // Merge real audit log with extended mock data
  const realLogsFormatted = auditLog.map(e => ({
    ...e,
    role: "Executive",
    module: "General",
    ip: "197.220.124.x",
    status: "success" as const,
  }))
  const allLogs = [...EXTENDED_LOGS, ...realLogsFormatted.filter(r => !EXTENDED_LOGS.find(e => e.id === r.id))]

  const filtered = allLogs.filter((entry) => {
    const q = search.toLowerCase()
    const matchSearch =
      entry.actor.toLowerCase().includes(q) ||
      entry.action.toLowerCase().includes(q) ||
      entry.target.toLowerCase().includes(q) ||
      entry.ip.includes(q)
    const matchType = typeFilter === "all" || entry.type === typeFilter
    const matchModule = moduleFilter === "All Modules" || entry.module === moduleFilter
    const matchRole = roleFilter === "All Roles" || entry.role === roleFilter
    const matchStatus = statusFilter === "All Statuses" || entry.status === statusFilter
    return matchSearch && matchType && matchModule && matchRole && matchStatus
  })

  const hasFilters = typeFilter !== "all" || moduleFilter !== "All Modules" || roleFilter !== "All Roles" || statusFilter !== "All Statuses" || search !== ""

  function clearFilters() {
    setSearch("")
    setTypeFilter("all")
    setModuleFilter("All Modules")
    setRoleFilter("All Roles")
    setStatusFilter("All Statuses")
  }

  function handleExport() {
    toast.success("Audit log exported successfully.", { description: "A CSV file has been prepared for download." })
  }

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-6xl mx-auto font-sans">
      <PageHeader
        title="System Audit Log"
        description="A complete chronological record of all platform actions performed by team members and the system."
        action={
          <Button variant="outline" onClick={handleExport} className="gap-2">
            <Download className="size-4" />
            Export CSV
          </Button>
        }
      />

      {/* Summary Stats */}
      <div className="grid gap-3 sm:grid-cols-5">
        {(["create", "update", "delete", "approve", "login"] as const).map(type => {
          const config = TYPE_CONFIG[type]
          const count = allLogs.filter(e => e.type === type).length
          const Icon = config.Icon
          return (
            <button
              key={type}
              onClick={() => setTypeFilter(typeFilter === type ? "all" : type)}
              className={`rounded-xl border p-3 text-left transition-all hover:shadow-sm cursor-pointer ${
                typeFilter === type ? `${config.className} ring-2 ring-offset-1` : "bg-card border-border hover:border-primary/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className="size-3.5" />
                <span className="text-xs font-bold uppercase tracking-wider">{config.label}</span>
              </div>
              <span className="text-2xl font-heading font-bold">{count}</span>
            </button>
          )
        })}
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="p-5 border-b">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <Activity className="size-4 text-primary" />
                  Audit Entries
                </CardTitle>
                <CardDescription className="mt-0.5">{filtered.length} of {allLogs.length} entries</CardDescription>
              </div>
              {hasFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1.5 text-xs text-muted-foreground self-start sm:self-center">
                  <X className="size-3" /> Clear Filters
                </Button>
              )}
            </div>

            {/* Filter Row */}
            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input placeholder="Search by user, action, IP..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-8 text-xs" />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Action Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                </SelectContent>
              </Select>
              <Select value={moduleFilter} onValueChange={setModuleFilter}>
                <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MODULES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
              <FileText className="size-10 opacity-30" />
              <p className="text-sm font-medium">No audit entries found</p>
              <p className="text-xs">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-bold">Timestamp</TableHead>
                    <TableHead className="text-xs font-bold">User</TableHead>
                    <TableHead className="text-xs font-bold">Role</TableHead>
                    <TableHead className="text-xs font-bold">Action</TableHead>
                    <TableHead className="text-xs font-bold">Module</TableHead>
                    <TableHead className="text-xs font-bold">IP Address</TableHead>
                    <TableHead className="text-xs font-bold">Type</TableHead>
                    <TableHead className="text-xs font-bold">Status</TableHead>
                    <TableHead className="text-xs font-bold text-right">View</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((entry) => {
                    const config = TYPE_CONFIG[entry.type]
                    const Icon = config.Icon
                    return (
                      <TableRow key={entry.id} className="hover:bg-muted/20">
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap font-mono">{entry.timestamp}</TableCell>
                        <TableCell className="font-semibold text-xs">{entry.actor}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{entry.role}</TableCell>
                        <TableCell className="text-xs text-muted-foreground max-w-48 truncate">{entry.action}</TableCell>
                        <TableCell className="text-xs">
                          <Badge variant="secondary" className="text-[9px] font-semibold">{entry.module}</Badge>
                        </TableCell>
                        <TableCell className="text-xs font-mono text-muted-foreground">{entry.ip}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`gap-1 text-[10px] ${config.className}`}>
                            <Icon className="size-3" />{config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            entry.status === "success"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 text-[10px]"
                              : "bg-destructive/10 text-destructive border-destructive/20 text-[10px]"
                          }>
                            {entry.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" className="size-7" onClick={() => setSelectedEntry(entry)}>
                            <Eye className="size-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          <div className="flex items-center justify-between px-5 py-3 border-t bg-muted/20 text-xs text-muted-foreground">
            <span>Total entries: <strong className="text-foreground">{allLogs.length}</strong></span>
            <span>Showing <strong className="text-foreground">{filtered.length}</strong> of {allLogs.length}</span>
          </div>
        </CardContent>
      </Card>

      {/* Detail Modal */}
      <Dialog open={!!selectedEntry} onOpenChange={(open) => !open && setSelectedEntry(null)}>
        {selectedEntry && (
          <DialogContent className="max-w-md font-sans">
            <DialogHeader>
              <DialogTitle className="font-heading text-base">Audit Entry Detail</DialogTitle>
              <DialogDescription className="text-xs">Full log record for selected entry</DialogDescription>
            </DialogHeader>
            <div className="flex flex-col gap-3 py-2 text-sm">
              {[
                ["Entry ID", selectedEntry.id],
                ["Timestamp", selectedEntry.timestamp],
                ["Actor", selectedEntry.actor],
                ["Role", selectedEntry.role],
                ["Action", selectedEntry.action],
                ["Target", selectedEntry.target],
                ["Module", selectedEntry.module],
                ["IP Address", selectedEntry.ip],
                ["Action Type", selectedEntry.type],
                ["Status", selectedEntry.status],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-xs font-semibold text-muted-foreground w-24 shrink-0">{label}</span>
                  <span className="text-xs text-foreground font-mono">{value}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="outline" size="sm" onClick={() => setSelectedEntry(null)}>Close</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
