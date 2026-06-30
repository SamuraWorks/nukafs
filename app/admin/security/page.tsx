"use client"

import { useState } from "react"
import {
  ShieldAlert,
  ShieldCheck,
  ShieldX,
  Lock,
  Unlock,
  UserX,
  KeyRound,
  Smartphone,
  Globe,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Filter,
  RefreshCw,
  LogIn,
  Clock,
  MapPin,
  MonitorSmartphone,
} from "lucide-react"
import { PageHeader, StatCard } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

const recentLogins = [
  { name: "Alusine Bangura", role: "Super Admin", time: "10 min ago", ip: "197.220.124.9", device: "Chrome / Windows", location: "Kabala, SL", status: "success", suspicious: false },
  { name: "Fatmata Koroma", role: "Executive", time: "1 hour ago", ip: "197.220.124.12", device: "Firefox / macOS", location: "Freetown, SL", status: "success", suspicious: false },
  { name: "Mohamed Sesay", role: "Executive", time: "2 hours ago", ip: "197.220.125.88", device: "Safari / iOS", location: "Makeni, SL", status: "success", suspicious: false },
  { name: "Unknown User", role: "—", time: "3 hours ago", ip: "41.206.10.44", device: "Bot / Unknown", location: "Lagos, NG", status: "failed", suspicious: true },
  { name: "Dr. Brima Sankoh", role: "Stakeholder", time: "1 day ago", ip: "197.221.10.4", device: "Chrome / Android", location: "Freetown, SL", status: "success", suspicious: false },
  { name: "Unknown User", role: "—", time: "1 day ago", ip: "185.220.101.32", device: "Unknown", location: "Amsterdam, NL", status: "failed", suspicious: true },
  { name: "Isatu Bah", role: "Executive", time: "2 days ago", ip: "197.220.124.55", device: "Edge / Windows", location: "Kabala, SL", status: "success", suspicious: false },
]

const securityAlerts = [
  { id: 1, severity: "high", title: "Multiple Failed Login Attempts", description: "5 failed login attempts detected from IP 41.206.10.44 (Lagos, Nigeria) within 15 minutes. IP temporarily rate-limited.", time: "3 hours ago", status: "active" },
  { id: 2, severity: "high", title: "Login from Unrecognised Location", description: "Successful login attempt from Amsterdam, Netherlands — outside known admin locations. Account: unknown target.", time: "1 day ago", status: "investigating" },
  { id: 3, severity: "medium", title: "Password Reset Spike", description: "3 password reset requests in the last 24 hours, above the daily average of 0.8. Review the request log.", time: "6 hours ago", status: "monitoring" },
  { id: 4, severity: "low", title: "Inactive Session Detected", description: "2 executive accounts have active sessions idle for more than 2 hours. Sessions will auto-expire in 30 minutes.", time: "2 hours ago", status: "auto-resolving" },
  { id: 5, severity: "low", title: "Account Without 2FA", description: "1 team member account does not have two-factor authentication enabled.", time: "Ongoing", status: "pending" },
]

const activeSessions = [
  { user: "Alusine Bangura", role: "Super Admin", device: "Chrome / Windows 11", ip: "197.220.124.9", started: "10 min ago", lastActivity: "Just now" },
  { user: "Fatmata Koroma", role: "Executive", device: "Firefox / macOS", ip: "197.220.124.12", started: "1 hour ago", lastActivity: "8 min ago" },
  { user: "Mohamed Sesay", role: "Executive", device: "Safari / iOS 17", ip: "197.220.125.88", started: "2 hours ago", lastActivity: "45 min ago" },
]

const SEVERITY_CONFIG = {
  high: { label: "High Risk", className: "bg-destructive/10 text-destructive border-destructive/20", badgeClass: "bg-destructive text-white", Icon: ShieldX },
  medium: { label: "Medium Risk", className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800", badgeClass: "bg-amber-500 text-white", Icon: ShieldAlert },
  low: { label: "Low Risk", className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800", badgeClass: "bg-blue-500 text-white", Icon: ShieldCheck },
}

export default function SecurityCenterPage() {
  const [severityFilter, setSeverityFilter] = useState("all")

  const filteredAlerts = securityAlerts.filter(a => severityFilter === "all" || a.severity === severityFilter)

  const highCount = securityAlerts.filter(a => a.severity === "high").length
  const medCount = securityAlerts.filter(a => a.severity === "medium").length
  const lowCount = securityAlerts.filter(a => a.severity === "low").length
  const failedLogins = recentLogins.filter(l => l.status === "failed").length
  const suspicious = recentLogins.filter(l => l.suspicious).length

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="Security Center"
        description="Monitor login activity, security alerts, active sessions, and user account security posture."
        action={
          <Button variant="outline" onClick={() => toast.info("Security status refreshed.")} className="gap-2">
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        }
      />

      {/* Alert Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="High Risk Alerts" value={highCount} icon={ShieldX} hint="requires immediate action" />
        <StatCard label="Medium Risk Alerts" value={medCount} icon={ShieldAlert} hint="under monitoring" />
        <StatCard label="Low Risk Alerts" value={lowCount} icon={ShieldCheck} hint="informational" />
        <StatCard label="Suspicious Activity" value={suspicious} icon={AlertTriangle} hint="flagged in last 48h" />
      </div>

      {/* Login Security + User Security */}
      <div className="grid gap-6 md:grid-cols-12">
        {/* Login Statistics */}
        <Card className="md:col-span-4 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <LogIn className="size-4 text-primary" /> Login Security
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 flex flex-col gap-3">
            {[
              { label: "Successful Logins (24h)", value: "12", color: "text-emerald-600", icon: CheckCircle2 },
              { label: "Failed Attempts (24h)", value: `${failedLogins}`, color: "text-destructive", icon: ShieldX },
              { label: "Unknown Devices", value: "2", color: "text-amber-600", icon: MonitorSmartphone },
              { label: "Suspicious IPs", value: `${suspicious}`, color: "text-destructive", icon: Globe },
              { label: "Locked Accounts", value: "0", color: "text-muted-foreground", icon: Lock },
              { label: "Password Resets (24h)", value: "3", color: "text-amber-600", icon: KeyRound },
            ].map(stat => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`size-3.5 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <span className={`text-xs font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* User Security */}
        <Card className="md:col-span-4 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <UserX className="size-4 text-primary" /> User Security
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 flex flex-col gap-3">
            {[
              { label: "Locked Accounts", value: "0", color: "text-muted-foreground", icon: Lock },
              { label: "Suspended Users", value: "3", color: "text-amber-600", icon: UserX },
              { label: "Password Reset Requests", value: "3", color: "text-amber-600", icon: KeyRound },
              { label: "2FA Enabled", value: "5 / 6", color: "text-emerald-600", icon: Smartphone },
              { label: "Active Sessions", value: `${activeSessions.length}`, color: "text-primary", icon: Globe },
              { label: "Inactive Sessions (2h+)", value: "1", color: "text-amber-600", icon: Clock },
            ].map(stat => {
              const Icon = stat.icon
              return (
                <div key={stat.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={`size-3.5 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <span className={`text-xs font-bold ${stat.color}`}>{stat.value}</span>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Active Sessions */}
        <Card className="md:col-span-4 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <Eye className="size-4 text-primary" /> Active Sessions
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {activeSessions.map((session, i) => (
              <div key={i} className="px-5 py-3.5">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-bold text-foreground">{session.user}</p>
                  <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground">{session.device}</p>
                <p className="text-[10px] text-muted-foreground font-mono">{session.ip}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Last activity: {session.lastActivity}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive text-[10px] h-6 px-2 mt-1"
                  onClick={() => toast.warning(`Session terminated for ${session.user}`)}
                >
                  Terminate Session
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      <Card className="border shadow-sm">
        <CardHeader className="p-5 border-b">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <ShieldAlert className="size-4 text-primary" />
                Security Alerts
              </CardTitle>
              <CardDescription className="mt-0.5">{filteredAlerts.length} alerts shown</CardDescription>
            </div>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-36 h-8 text-xs">
                <Filter className="size-3.5 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severity</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border">
          {filteredAlerts.map(alert => {
            const config = SEVERITY_CONFIG[alert.severity as keyof typeof SEVERITY_CONFIG]
            const Icon = config.Icon
            return (
              <div key={alert.id} className={`flex items-start gap-4 px-5 py-4 border-l-4 ${
                alert.severity === "high" ? "border-l-destructive" :
                alert.severity === "medium" ? "border-l-amber-500" : "border-l-blue-500"
              }`}>
                <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${config.className}`}>
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant="outline" className={config.className}>{config.label}</Badge>
                      <Badge variant="secondary" className="text-[10px] capitalize">{alert.status}</Badge>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{alert.description}</p>
                  <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                    <Clock className="size-3" /> {alert.time}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="shrink-0 text-xs"
                  onClick={() => toast.info(`Alert #${alert.id} marked as reviewed.`)}
                >
                  Dismiss
                </Button>
              </div>
            )
          })}
        </CardContent>
      </Card>

      {/* Recent Login History */}
      <Card className="border shadow-sm">
        <CardHeader className="p-5 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Clock className="size-4 text-primary" /> Login History
          </CardTitle>
          <CardDescription>Recent authentication attempts on the platform</CardDescription>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-border">
          {recentLogins.map((login, i) => (
            <div key={i} className={`flex items-center gap-4 px-5 py-3 ${login.suspicious ? "bg-destructive/3" : ""}`}>
              <div className={`size-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                login.status === "success" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900" : "bg-destructive/10 text-destructive"
              }`}>
                {login.status === "success" ? <CheckCircle2 className="size-4" /> : <ShieldX className="size-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                  {login.name}
                  {login.suspicious && (
                    <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 text-[9px] py-0">Suspicious</Badge>
                  )}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                  <Globe className="size-3" /> {login.ip} •
                  <MapPin className="size-3" /> {login.location} •
                  <MonitorSmartphone className="size-3" /> {login.device}
                </p>
              </div>
              <div className="text-right shrink-0">
                <Badge variant="outline" className={
                  login.status === "success"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 text-[10px]"
                    : "bg-destructive/10 text-destructive border-destructive/20 text-[10px]"
                }>
                  {login.status === "success" ? "Success" : "Failed"}
                </Badge>
                <p className="text-[10px] text-muted-foreground mt-0.5">{login.time}</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Security Timeline */}
      <Card className="border shadow-sm">
        <CardHeader className="p-5 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldCheck className="size-4 text-primary" /> Security Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="relative flex flex-col gap-0">
            {[
              { time: "10:12", event: "Super Admin Alusine Bangura logged in from known IP", type: "success" },
              { time: "07:34", event: "Failed login attempt from 41.206.10.44 (Lagos, NG) — 5th attempt, IP rate-limited", type: "danger" },
              { time: "Yesterday", event: "Suspicious login from Amsterdam detected — alert raised", type: "danger" },
              { time: "2 days ago", event: "Password reset completed for Fatmata Koroma", type: "info" },
              { time: "3 days ago", event: "New team member Isatu Bah account activated", type: "success" },
              { time: "1 week ago", event: "System security scan completed — no vulnerabilities found", type: "success" },
            ].map((item, i) => (
              <div key={i} className="relative pl-8 pb-4 last:pb-0">
                <div className={`absolute left-2 top-1 size-3 rounded-full border-2 border-background ${
                  item.type === "success" ? "bg-emerald-500" :
                  item.type === "danger" ? "bg-destructive" : "bg-primary"
                }`} />
                {i < 5 && <div className="absolute left-[10px] top-4 bottom-0 w-px bg-border" />}
                <div>
                  <p className="text-xs font-semibold text-foreground">{item.event}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
