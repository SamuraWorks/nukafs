"use client"

import { useState } from "react"
import {
  ShieldCheck,
  Users,
  Activity,
  Plus,
  Search,
  Trash2,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  UserCog,
  LogIn,
  FilePen,
  Loader2,
  Database,
  HardDrive,
  Clock,
  LayoutDashboard
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader, StatCard } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts"
import { registrationTrend, AuditEntry, Role } from "@/lib/mock-data"

const ROLE_BADGE: Record<Role, { label: string; color: string }> = {
  student: { label: "Student", color: "bg-muted text-muted-foreground" },
  executive: { label: "Executive", color: "bg-primary/10 text-primary" },
  stakeholder: { label: "Stakeholder", color: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400" },
  super_admin: { label: "Super Admin", color: "bg-destructive/10 text-destructive" },
}

const ACTION_ICON: Record<AuditEntry["type"], React.ElementType> = {
  create: Plus,
  update: FilePen,
  delete: Trash2,
  approve: CheckCircle,
  login: LogIn,
}

const ACTION_COLOR: Record<AuditEntry["type"], string> = {
  create: "text-success bg-success/10",
  update: "text-primary bg-primary/10",
  delete: "text-destructive bg-destructive/10",
  approve: "text-success bg-success/10",
  login: "text-muted-foreground bg-muted",
}

export default function AdminPage() {
  const { 
    students, 
    pendingRegistrations, 
    teamMembers, 
    auditLog, 
    events, 
    announcements, 
    systemSettings,
    universitiesList
  } = useAppState()

  const [searchLog, setSearchLog] = useState("")
  const [auditTypeFilter, setAuditTypeFilter] = useState<string>("all")

  const totalRegistered = students.length + pendingRegistrations.length
  const activeStudents = students.filter(s => s.status === "active").length
  const pendingRegCount = pendingRegistrations.length
  const totalExecs = teamMembers.filter(m => m.role === "executive" && m.status === "active").length
  const totalStakeholders = teamMembers.filter(m => m.role === "stakeholder").length

  const filteredLog = auditLog.filter((entry) => {
    const matchSearch =
      entry.actor.toLowerCase().includes(searchLog.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchLog.toLowerCase()) ||
      entry.target.toLowerCase().includes(searchLog.toLowerCase())
    const matchType = auditTypeFilter === "all" || entry.type === auditTypeFilter
    return matchSearch && matchType
  })

  // Mock recent logins for visual interest
  const recentLogins = [
    { name: "Alusine Bangura", role: "super_admin", time: "10 mins ago", ip: "197.220.124.9" },
    { name: "Fatmata Koroma", role: "executive", time: "1 hour ago", ip: "197.220.124.12" },
    { name: "Mohamed Sesay", role: "executive", time: "2 hours ago", ip: "197.220.125.88" },
    { name: "Dr. Brima Sankoh", role: "stakeholder", time: "1 day ago", ip: "197.221.10.4" }
  ]

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="Super Admin Control Center"
        description="Global platform telemetry, databases, storage logs, and user access roles."
        action={
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full bg-destructive/10 text-destructive border border-destructive/20 shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              Platform Owner Mode
            </span>
          </div>
        }
      />

      {/* Grid of stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Students Registered" value={totalRegistered} icon={Users} hint="active + pending" />
        <StatCard label="Active Union Members" value={activeStudents} icon={ShieldCheck} trend={`${((activeStudents/totalRegistered)*100 || 0).toFixed(0)}% verified`} trendUp={true} hint="registry rate" />
        <StatCard label="Executive Managers" value={totalExecs} icon={UserCog} hint="administrative write access" />
        <StatCard label="Stakeholder Partners" value={totalStakeholders} icon={Eye} hint="read-only analytics" />
      </div>

      {/* System Resources telemetry */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border shadow-xs">
          <CardContent className="flex items-center gap-4 p-4.5">
            <div className="size-11 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
              <Database className="size-5.5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Database Status</p>
              <h4 className="font-bold text-sm text-foreground">Operational</h4>
              <p className="text-[10px] text-emerald-500 mt-0.5">● Connected to Supabase</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-xs">
          <CardContent className="flex items-center gap-4 p-4.5">
            <div className="size-11 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <HardDrive className="size-5.5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Storage Usage</p>
              <h4 className="font-bold text-sm text-foreground">1.42 GB of 10 GB</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">14.2% quota consumed</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border shadow-xs">
          <CardContent className="flex items-center gap-4 p-4.5">
            <div className="size-11 rounded-full bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
              <Clock className="size-5.5" />
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">System Uptime</p>
              <h4 className="font-bold text-sm text-foreground">99.98%</h4>
              <p className="text-[10px] text-muted-foreground mt-0.5">Last restart 12 days ago</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Registration growth trend */}
        <Card className="md:col-span-8 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base flex items-center justify-between">
              <span>Platform Registry Growth</span>
              <span className="text-[10px] text-muted-foreground uppercase font-semibold">Aggregate Registrations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={registrationTrend} margin={{ top: 5, right: 10, left: -25, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorRegs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.52 0.12 158)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="oklch(0.52 0.12 158)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Area type="monotone" dataKey="members" stroke="oklch(0.52 0.12 158)" strokeWidth={2} fill="url(#colorRegs)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Recent logins panel */}
        <Card className="md:col-span-4 border shadow-sm flex flex-col">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base">Recent Portal Logins</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 divide-y divide-border">
            {recentLogins.map((login, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-3 text-xs hover:bg-muted/10">
                <div>
                  <span className="font-bold text-foreground block">{login.name}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">{login.ip}</span>
                </div>
                <div className="text-right flex flex-col items-end">
                  <Badge variant="outline" className="text-[9px] uppercase tracking-wider font-semibold py-0.5">{login.role.replace("_", " ")}</Badge>
                  <span className="text-[10px] text-muted-foreground mt-1">{login.time}</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Audit Log preview */}
      <Card className="border shadow-sm">
        <CardHeader className="p-5 border-b">
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                System Audit Log
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-0.5">Chronological system transaction logs for auditing platform changes.</p>
            </div>
            <button
              onClick={() => toast.info("Audit log refreshed.")}
              className="w-8 h-8 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Filters */}
          <div className="flex items-center gap-3 px-4 py-3 border-b">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                placeholder="Search log entries..."
                value={searchLog}
                onChange={(e) => setSearchLog(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm bg-muted/50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <select
              value={auditTypeFilter}
              onChange={(e) => setAuditTypeFilter(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-xs font-semibold cursor-pointer"
            >
              <option value="all">All Actions</option>
              <option value="create">Create</option>
              <option value="update">Update</option>
              <option value="delete">Delete</option>
              <option value="approve">Approve</option>
              <option value="login">Login</option>
            </select>
          </div>

          {/* Log entries */}
          <div className="divide-y divide-border">
            {filteredLog.slice(0, 10).map((entry) => {
              const Icon = ACTION_ICON[entry.type] || Activity
              const colorClass = ACTION_COLOR[entry.type] || "text-muted-foreground bg-muted"
              return (
                <div key={entry.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${colorClass}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground">
                      <span className="font-semibold">{entry.actor}</span>{" "}
                      <span className="text-muted-foreground">{entry.action}</span>{" "}
                      <span className="font-medium">{entry.target}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{entry.timestamp}</p>
                  </div>
                  <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full ${colorClass}`}>
                    {entry.type}
                  </span>
                </div>
              )
            })}
            {filteredLog.length === 0 && (
              <div className="py-10 text-center text-sm text-muted-foreground">No audit entries match your search.</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <div className="rounded-2xl border border-success/30 bg-success/5 p-5 flex items-start gap-4 shadow-xs">
        <div className="size-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 text-emerald-600 mt-0.5">
          <ShieldCheck className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Active Platform Configurations</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Database synchronization is fully operational. System configurations indicate registration workflows are **{systemSettings.registrationStatus}** under **{systemSettings.approvalWorkflow}** verification rules. Theme preference is currently set to **{systemSettings.theme}**.
          </p>
        </div>
      </div>
    </div>
  )
}
