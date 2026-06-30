"use client"

import { useState } from "react"
import {
  Activity,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Lock,
  HardDrive,
  Bell,
  Mail,
  Server,
  Zap,
  Clock,
  Cpu,
  MemoryStick,
  Users,
  BarChart3,
  Shield,
  TrendingUp,
  AlertCircle,
  Info,
} from "lucide-react"
import { PageHeader, StatCard } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"

const cpuData = [
  { time: "00:00", usage: 22 }, { time: "04:00", usage: 18 }, { time: "08:00", usage: 45 },
  { time: "10:00", usage: 62 }, { time: "12:00", usage: 58 }, { time: "14:00", usage: 71 },
  { time: "16:00", usage: 55 }, { time: "18:00", usage: 48 }, { time: "20:00", usage: 39 },
  { time: "22:00", usage: 28 }, { time: "Now", usage: 34 },
]

const memoryData = [
  { time: "00:00", usage: 41 }, { time: "04:00", usage: 38 }, { time: "08:00", usage: 52 },
  { time: "10:00", usage: 67 }, { time: "12:00", usage: 71 }, { time: "14:00", usage: 69 },
  { time: "16:00", usage: 64 }, { time: "18:00", usage: 60 }, { time: "20:00", usage: 55 },
  { time: "22:00", usage: 49 }, { time: "Now", usage: 53 },
]

const trafficData = [
  { day: "Mon", requests: 1240, users: 89 }, { day: "Tue", requests: 1890, users: 120 },
  { day: "Wed", requests: 2100, users: 145 }, { day: "Thu", requests: 1760, users: 98 },
  { day: "Fri", requests: 2340, users: 167 }, { day: "Sat", requests: 980, users: 54 },
  { day: "Sun", requests: 720, users: 38 },
]

const responseTimeData = [
  { time: "08:00", ms: 120 }, { time: "09:00", ms: 145 }, { time: "10:00", ms: 189 },
  { time: "11:00", ms: 156 }, { time: "12:00", ms: 210 }, { time: "13:00", ms: 178 },
  { time: "14:00", ms: 134 }, { time: "15:00", ms: 112 }, { time: "16:00", ms: 98 },
  { time: "Now", ms: 108 },
]

const services = [
  { name: "Database (Supabase)", status: "healthy", icon: Database, latency: "12ms", uptime: "99.99%" },
  { name: "Authentication Service", status: "healthy", icon: Lock, latency: "8ms", uptime: "100%" },
  { name: "File Storage", status: "warning", icon: HardDrive, latency: "245ms", uptime: "99.7%" },
  { name: "Notification Service", status: "healthy", icon: Bell, latency: "22ms", uptime: "99.95%" },
  { name: "Email Service", status: "healthy", icon: Mail, latency: "180ms", uptime: "99.8%" },
  { name: "Backup System", status: "healthy", icon: Server, latency: "—", uptime: "100%" },
  { name: "API Gateway", status: "healthy", icon: Zap, latency: "5ms", uptime: "99.98%" },
]

const incidents = [
  { id: 1, title: "File Storage High Latency", severity: "warning", time: "2 hours ago", status: "monitoring", description: "Response times from the file storage service elevated above threshold. No data loss. Under investigation." },
  { id: 2, title: "Database Connection Pool Spike", severity: "resolved", time: "Yesterday, 14:22", status: "resolved", description: "Brief spike in connection pool utilisation during peak hours. Autoscaling resolved within 4 minutes." },
  { id: 3, title: "Email Delivery Delay", severity: "info", time: "3 days ago", status: "resolved", description: "Notification emails delayed by up to 12 minutes due to upstream SMTP provider maintenance." },
]

const recommendations = [
  { type: "warning", text: "File storage response times are elevated. Consider optimising upload pipeline or increasing CDN cache TTL." },
  { type: "info", text: "CPU usage peaks between 10:00–14:00. Consider scheduling heavy reports outside peak hours." },
  { type: "success", text: "All core services are operational. Last backup completed successfully 6 hours ago." },
  { type: "info", text: "System version 1.4.2 is current. No pending security patches." },
]

const STATUS_CONFIG = {
  healthy: { label: "Healthy", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800", dot: "bg-emerald-500", Icon: CheckCircle2 },
  warning: { label: "Warning", className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800", dot: "bg-amber-500", Icon: AlertTriangle },
  critical: { label: "Critical", className: "bg-destructive/10 text-destructive border-destructive/20", dot: "bg-destructive", Icon: XCircle },
}

export default function SystemHealthPage() {
  const [lastRefresh, setLastRefresh] = useState("Just now")
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => {
      setIsRefreshing(false)
      setLastRefresh("Just now")
      toast.success("System status refreshed successfully.")
    }, 1200)
  }

  const overallStatus = services.some(s => s.status === "critical")
    ? "critical"
    : services.some(s => s.status === "warning")
    ? "warning"
    : "healthy"

  const OverallIcon = STATUS_CONFIG[overallStatus].Icon

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="System Health Monitor"
        description="Real-time overview of all platform services, performance metrics, and system recommendations."
        action={
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Last refresh: {lastRefresh}</span>
            <Button variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="gap-2">
              <RefreshCw className={`size-4 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh Status
            </Button>
          </div>
        }
      />

      {/* Overall Status Banner */}
      <div className={`rounded-2xl border p-5 flex items-center gap-4 ${
        overallStatus === "healthy" ? "border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950/40" :
        overallStatus === "warning" ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/40" :
        "border-destructive/30 bg-destructive/5"
      }`}>
        <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${
          overallStatus === "healthy" ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400" :
          overallStatus === "warning" ? "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-400" :
          "bg-destructive/10 text-destructive"
        }`}>
          <OverallIcon className="size-6" />
        </div>
        <div className="flex-1">
          <p className="font-bold text-foreground text-sm">
            Overall System Status: <span className={overallStatus === "healthy" ? "text-emerald-600" : overallStatus === "warning" ? "text-amber-600" : "text-destructive"}>{overallStatus === "healthy" ? "All Systems Operational" : overallStatus === "warning" ? "Degraded Performance" : "Service Disruption"}</span>
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {services.filter(s => s.status === "healthy").length} of {services.length} services healthy • System Uptime: 99.97% • Version 1.4.2
          </p>
        </div>
        <div className="flex gap-6 text-center shrink-0 hidden sm:flex">
          <div>
            <p className="text-xs text-muted-foreground">Last Restart</p>
            <p className="font-bold text-sm">12 days ago</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Uptime</p>
            <p className="font-bold text-sm text-emerald-600">99.97%</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Version</p>
            <p className="font-bold text-sm">v1.4.2</p>
          </div>
        </div>
      </div>

      {/* Top Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="CPU Usage" value="34%" icon={Cpu} trend="Avg 47% today" trendUp={false} hint="" />
        <StatCard label="Memory Usage" value="53%" icon={MemoryStick} trend="3.8 GB of 8 GB" trendUp={true} hint="" />
        <StatCard label="Active Users" value="38" icon={Users} trend="+12% vs yesterday" trendUp={true} hint="" />
        <StatCard label="Requests / min" value="184" icon={BarChart3} trend="Peak: 312 at 12:15" trendUp={true} hint="" />
      </div>

      {/* Services Grid */}
      <Card className="border shadow-sm">
        <CardHeader className="p-5 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <Server className="size-4 text-primary" />
            Service Status
          </CardTitle>
          <CardDescription>Real-time health status for all platform microservices</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {services.map((svc) => {
              const config = STATUS_CONFIG[svc.status as keyof typeof STATUS_CONFIG]
              const Icon = svc.icon
              return (
                <div key={svc.name} className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                  <div className="size-9 rounded-lg bg-muted/50 flex items-center justify-center shrink-0">
                    <Icon className="size-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{svc.name}</p>
                    <p className="text-xs text-muted-foreground">Latency: {svc.latency} • Uptime: {svc.uptime}</p>
                  </div>
                  <Badge variant="outline" className={`gap-1.5 ${config.className}`}>
                    <span className={`size-1.5 rounded-full ${config.dot}`} />
                    {config.label}
                  </Badge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* CPU Chart */}
        <Card className="border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <Cpu className="size-4 text-primary" /> CPU Usage — Last 24h
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cpuData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.52 0.12 158)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="oklch(0.52 0.12 158)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => [`${v}%`, "CPU"]} />
                <Area type="monotone" dataKey="usage" stroke="oklch(0.52 0.12 158)" strokeWidth={2} fill="url(#cpuGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Memory Chart */}
        <Card className="border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <MemoryStick className="size-4 text-primary" /> Memory Usage — Last 24h
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={memoryData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.62 0.1 200)" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="oklch(0.62 0.1 200)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => [`${v}%`, "Memory"]} />
                <Area type="monotone" dataKey="usage" stroke="oklch(0.62 0.1 200)" strokeWidth={2} fill="url(#memGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Traffic + Response Time */}
      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-7 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" /> Weekly Traffic
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="day" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="requests" fill="oklch(0.52 0.12 158)" radius={[4, 4, 0, 0]} name="Requests" />
                <Bar dataKey="users" fill="oklch(0.72 0.13 85)" radius={[4, 4, 0, 0]} name="Active Users" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-5 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <Clock className="size-4 text-primary" /> Response Time (ms)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={responseTimeData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="time" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v: any) => [`${v}ms`, "Response"]} />
                <Line type="monotone" dataKey="ms" stroke="oklch(0.55 0.13 25)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Storage Usage */}
      <Card className="border shadow-sm">
        <CardHeader className="p-5 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <HardDrive className="size-4 text-primary" /> Storage Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "Database Storage", used: 1420, total: 5120, unit: "MB", pct: 28, color: "oklch(0.52 0.12 158)" },
              { label: "File Uploads", used: 2800, total: 10240, unit: "MB", pct: 27, color: "oklch(0.62 0.1 200)" },
              { label: "Backup Storage", used: 4200, total: 20480, unit: "MB", pct: 21, color: "oklch(0.72 0.13 85)" },
              { label: "Log Storage", used: 340, total: 2048, unit: "MB", pct: 17, color: "oklch(0.55 0.13 25)" },
            ].map(s => (
              <div key={s.label} className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="font-medium text-foreground">{s.label}</span>
                  <span className="text-muted-foreground">{(s.used / 1024).toFixed(1)} / {(s.total / 1024).toFixed(0)} GB</span>
                </div>
                <Progress value={s.pct} className="h-2" />
                <span className="text-[10px] text-muted-foreground">{s.pct}% used</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Incidents + Recommendations */}
      <div className="grid gap-6 md:grid-cols-12">
        <Card className="md:col-span-7 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertCircle className="size-4 text-primary" /> Recent Incidents
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {incidents.map(inc => (
              <div key={inc.id} className="px-5 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">{inc.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{inc.description}</p>
                    <p className="text-[10px] text-muted-foreground mt-1.5">{inc.time}</p>
                  </div>
                  <Badge variant="outline" className={
                    inc.severity === "warning" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 shrink-0" :
                    inc.severity === "resolved" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 shrink-0" :
                    "bg-muted text-muted-foreground shrink-0"
                  }>
                    {inc.status === "resolved" ? "Resolved" : inc.severity === "warning" ? "Monitoring" : "Info"}
                  </Badge>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="md:col-span-5 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="size-4 text-primary" /> System Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3.5">
                {rec.type === "warning" ? (
                  <AlertTriangle className="size-4 text-amber-500 shrink-0 mt-0.5" />
                ) : rec.type === "success" ? (
                  <CheckCircle2 className="size-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Info className="size-4 text-primary shrink-0 mt-0.5" />
                )}
                <p className="text-xs text-muted-foreground leading-relaxed">{rec.text}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
