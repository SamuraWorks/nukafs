"use client"

import { useState } from "react"
import {
  FileBarChart,
  Download,
  Printer,
  Share2,
  Eye,
  Filter,
  Users,
  GraduationCap,
  BookOpen,
  Building2,
  Briefcase,
  HeartHandshake,
  TrendingUp,
  BarChart3,
  X,
} from "lucide-react"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend,
} from "recharts"
import { analyticsService } from "@/lib/services/registry-service"

const COLORS = [
  "oklch(0.52 0.12 158)",
  "oklch(0.62 0.1 200)",
  "oklch(0.72 0.13 85)",
  "oklch(0.55 0.13 25)",
  "oklch(0.45 0.06 280)",
  "oklch(0.65 0.1 340)",
  "oklch(0.60 0.12 70)",
]

interface ReportCard {
  id: string
  title: string
  description: string
  icon: React.ElementType
  color: string
  stats: { label: string; value: string }[]
  lastGenerated: string
  category: "students" | "institutions" | "programs" | "analytics"
}

const REPORTS: ReportCard[] = [
  {
    id: "rpt_students", title: "Student Registry Report", description: "Complete overview of all registered students including demographics, status distribution, and academic profile.",
    icon: Users, color: "text-primary bg-primary/10", stats: [{ label: "Total Students", value: "2,480" }, { label: "Active", value: "1,986" }, { label: "Pending", value: "47" }],
    lastGenerated: "2024-09-03", category: "students"
  },
  {
    id: "rpt_exec", title: "Executive Report", description: "Summary of all executive and administrative team members, their roles, activity logs, and performance metrics.",
    icon: Briefcase, color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950", stats: [{ label: "Total Executives", value: "5" }, { label: "Active", value: "4" }, { label: "Pending Invites", value: "1" }],
    lastGenerated: "2024-09-01", category: "analytics"
  },
  {
    id: "rpt_uni", title: "University Report", description: "Distribution of NUKaFs members across all affiliated universities, with campus-level statistics and trends.",
    icon: GraduationCap, color: "text-amber-600 bg-amber-50 dark:bg-amber-950", stats: [{ label: "Universities", value: "7" }, { label: "Total Students", value: "2,480" }, { label: "Most Members", value: "FBC (620)" }],
    lastGenerated: "2024-09-03", category: "institutions"
  },
  {
    id: "rpt_faculty", title: "Faculty Report", description: "Analysis of member representation across academic faculties and schools.",
    icon: Building2, color: "text-teal-600 bg-teal-50 dark:bg-teal-950", stats: [{ label: "Faculties", value: "7" }, { label: "Largest Faculty", value: "Sci & Tech" }, { label: "Students", value: "480" }],
    lastGenerated: "2024-08-29", category: "institutions"
  },
  {
    id: "rpt_dept", title: "Department Report", description: "Detailed breakdown of student enrolment across all academic departments.",
    icon: BookOpen, color: "text-rose-600 bg-rose-50 dark:bg-rose-950", stats: [{ label: "Departments", value: "40+" }, { label: "Top Dept", value: "Computer Science" }, { label: "Enrolment", value: "320" }],
    lastGenerated: "2024-09-02", category: "institutions"
  },
  {
    id: "rpt_course", title: "Course Report", description: "Registry members grouped by their declared course of study.",
    icon: BookOpen, color: "text-purple-600 bg-purple-50 dark:bg-purple-950", stats: [{ label: "Courses", value: "30+" }, { label: "Most Popular", value: "CS & Nursing" }, { label: "Members", value: "580" }],
    lastGenerated: "2024-08-30", category: "programs"
  },
  {
    id: "rpt_scholarship", title: "Scholarship Report", description: "Summary of scholarship applications, approvals, and disbursements across the registry.",
    icon: HeartHandshake, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950", stats: [{ label: "Applicants", value: "396" }, { label: "Awarded", value: "64" }, { label: "Approval Rate", value: "16.2%" }],
    lastGenerated: "2024-09-01", category: "programs"
  },
  {
    id: "rpt_employment", title: "Employment Report", description: "Analysis of member employment status, industries represented, and career outcomes.",
    icon: Briefcase, color: "text-blue-600 bg-blue-50 dark:bg-blue-950", stats: [{ label: "Employed", value: "190" }, { label: "Self-Employed", value: "290" }, { label: "Students Only", value: "1,480" }],
    lastGenerated: "2024-09-02", category: "analytics"
  },
  {
    id: "rpt_internship", title: "Internship Report", description: "Track internship placements, partner organisations, and member participation rates.",
    icon: TrendingUp, color: "text-orange-600 bg-orange-50 dark:bg-orange-950", stats: [{ label: "Opportunities", value: "12" }, { label: "Placements", value: "34" }, { label: "Active Partners", value: "5" }],
    lastGenerated: "2024-08-28", category: "programs"
  },
  {
    id: "rpt_registration", title: "Registration Report", description: "Analysis of new member registrations over time, approval rates, and demographic patterns.",
    icon: Users, color: "text-cyan-600 bg-cyan-50 dark:bg-cyan-950", stats: [{ label: "Pending", value: "47" }, { label: "Approved (Month)", value: "142" }, { label: "Rejected", value: "8" }],
    lastGenerated: "2024-09-03", category: "analytics"
  },
  {
    id: "rpt_analytics", title: "Platform Analytics Report", description: "Comprehensive platform usage statistics including active sessions, page views, and engagement metrics.",
    icon: BarChart3, color: "text-violet-600 bg-violet-50 dark:bg-violet-950", stats: [{ label: "Active Users", value: "38" }, { label: "Requests/min", value: "184" }, { label: "Uptime", value: "99.97%" }],
    lastGenerated: "2024-09-03", category: "analytics"
  },
]

const CATEGORY_LABELS = {
  all: "All Reports",
  students: "Student Reports",
  institutions: "Institution Reports",
  programs: "Programme Reports",
  analytics: "Analytics Reports",
}

export default function PlatformReportsPage() {
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [previewReport, setPreviewReport] = useState<ReportCard | null>(null)
  const [yearFilter, setYearFilter] = useState("2024")

  const filtered = REPORTS.filter(r => categoryFilter === "all" || r.category === categoryFilter)

  function handleExport(report: ReportCard, format: "pdf" | "excel") {
    toast.success(`Exporting "${report.title}" as ${format.toUpperCase()}...`, {
      description: "Your download will begin shortly.",
    })
  }

  // Load analytics datasets
  const registrationTrend = analyticsService.getRegistrationTrend()
  const membersByUniversity = analyticsService.getMembersByUniversity()
  const membersByDepartment = analyticsService.getMembersByDepartment()
  const membersByLevel = analyticsService.getMembersByLevel()
  const employmentStats = analyticsService.getEmploymentStats()
  const scholarshipRequests = analyticsService.getScholarshipRequests()

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="Platform Reports"
        description="Generate, preview, and export comprehensive reports on all aspects of the NUKaFs Registry."
      />

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2 items-center">
        {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setCategoryFilter(key)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
              categoryFilter === key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <Filter className="size-3.5 text-muted-foreground" />
          <Select value={yearFilter} onValueChange={setYearFilter}>
            <SelectTrigger className="w-24 h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2023">2023</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Total Reports", value: REPORTS.length, desc: "Available" },
          { label: "Student Reports", value: REPORTS.filter(r => r.category === "students").length, desc: "Ready" },
          { label: "Institution Reports", value: REPORTS.filter(r => r.category === "institutions").length, desc: "Ready" },
          { label: "Analytics Reports", value: REPORTS.filter(r => r.category === "analytics").length, desc: "Ready" },
        ].map(s => (
          <Card key={s.label} className="border shadow-xs">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">{s.label}</p>
              <p className="font-heading text-2xl font-bold">{s.value}</p>
              <p className="text-[10px] text-muted-foreground">{s.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(report => {
          const Icon = report.icon
          return (
            <Card key={report.id} className="border shadow-sm hover:shadow-md transition-all group">
              <CardContent className="p-5 flex flex-col gap-4 h-full">
                <div className="flex items-start gap-3">
                  <div className={`size-10 rounded-xl flex items-center justify-center shrink-0 ${report.color}`}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-bold text-foreground leading-tight">{report.title}</h3>
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed line-clamp-2">{report.description}</p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2">
                  {report.stats.map(stat => (
                    <div key={stat.label} className="text-center bg-muted/30 rounded-lg p-2">
                      <p className="text-xs font-bold text-foreground">{stat.value}</p>
                      <p className="text-[9px] text-muted-foreground">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span>Last generated: {report.lastGenerated}</span>
                  <Badge variant="secondary" className="text-[9px] capitalize">{report.category}</Badge>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 pt-1 border-t">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-1 gap-1.5 text-xs h-8"
                    onClick={() => setPreviewReport(report)}
                  >
                    <Eye className="size-3.5" /> Preview
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs h-8"
                    onClick={() => handleExport(report, "pdf")}
                  >
                    <Download className="size-3.5" /> PDF
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1.5 text-xs h-8"
                    onClick={() => handleExport(report, "excel")}
                  >
                    <Download className="size-3.5" /> XLS
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => toast.info("Share link copied to clipboard.")}
                  >
                    <Share2 className="size-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    onClick={() => toast.success(`Sending "${report.title}" to printer...`)}
                  >
                    <Printer className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Report Preview Modal */}
      <Dialog open={!!previewReport} onOpenChange={open => !open && setPreviewReport(null)}>
        {previewReport && (
          <DialogContent className="max-w-3xl font-sans max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b pb-3">
              <div className="flex items-center gap-3">
                <div className={`size-9 rounded-lg flex items-center justify-center ${previewReport.color}`}>
                  <previewReport.icon className="size-4" />
                </div>
                <div>
                  <DialogTitle className="font-heading text-base">{previewReport.title}</DialogTitle>
                  <DialogDescription className="text-xs">{previewReport.description}</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-4 flex flex-col gap-6">
              {/* Stats summary */}
              <div className="grid grid-cols-3 gap-3">
                {previewReport.stats.map(s => (
                  <div key={s.label} className="border rounded-xl p-3 text-center bg-muted/10">
                    <p className="text-xl font-heading font-bold text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>

              {/* Appropriate chart based on report type */}
              {previewReport.id === "rpt_students" || previewReport.id === "rpt_registration" ? (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Registration Trend ({yearFilter})</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={registrationTrend}>
                        <defs>
                          <linearGradient id="previewGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="oklch(0.52 0.12 158)" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="oklch(0.52 0.12 158)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                        <Area type="monotone" dataKey="members" stroke="oklch(0.52 0.12 158)" strokeWidth={2} fill="url(#previewGrad)" name="Members" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : previewReport.id === "rpt_uni" ? (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Members by University</h4>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={membersByUniversity} margin={{ left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                        <Bar dataKey="value" name="Students" radius={[4, 4, 0, 0]}>
                          {membersByUniversity.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : previewReport.id === "rpt_employment" ? (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Employment Status Distribution</h4>
                  <div className="flex gap-4 items-center">
                    <div className="h-44 w-44">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={employmentStats} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={false}>
                            {employmentStats.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="flex flex-col gap-2">
                      {employmentStats.map((s, i) => (
                        <div key={s.name} className="flex items-center gap-2 text-xs">
                          <span className="size-2.5 rounded-sm shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-muted-foreground">{s.name}</span>
                          <span className="font-bold ml-auto">{s.value.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : previewReport.id === "rpt_scholarship" ? (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Scholarship Requests vs Approvals</h4>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={scholarshipRequests} margin={{ left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} />
                        <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                        <Legend wrapperStyle={{ fontSize: 10 }} />
                        <Bar dataKey="requests" name="Requests" fill="oklch(0.62 0.1 200)" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="approved" name="Approved" fill="oklch(0.52 0.12 158)" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">Department Distribution</h4>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={membersByDepartment} layout="vertical" margin={{ left: 30, right: 10 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                        <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                        <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} tickLine={false} width={90} />
                        <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                        <Bar dataKey="value" name="Members" radius={[0, 4, 4, 0]}>
                          {membersByDepartment.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Data Table Preview */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Data Preview</h4>
                <div className="border rounded-xl overflow-hidden text-xs">
                  <Table>
                    <TableHeader>
                      <TableRow className="hover:bg-transparent bg-muted/20">
                        <TableHead className="text-xs font-bold py-2">Category</TableHead>
                        <TableHead className="text-xs font-bold py-2">Count</TableHead>
                        <TableHead className="text-xs font-bold py-2 text-right">% Share</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(previewReport.id === "rpt_uni" ? membersByUniversity :
                        previewReport.id === "rpt_dept" || previewReport.id === "rpt_faculty" ? membersByDepartment :
                        previewReport.id === "rpt_employment" ? employmentStats : membersByLevel).slice(0, 5).map(row => {
                        const total = (previewReport.id === "rpt_uni" ? membersByUniversity :
                          previewReport.id === "rpt_dept" || previewReport.id === "rpt_faculty" ? membersByDepartment :
                          previewReport.id === "rpt_employment" ? employmentStats : membersByLevel)
                          .reduce((s, r) => s + r.value, 0)
                        return (
                          <TableRow key={row.name} className="hover:bg-muted/10">
                            <TableCell className="py-2">{row.name}</TableCell>
                            <TableCell className="py-2 font-semibold">{row.value.toLocaleString()}</TableCell>
                            <TableCell className="py-2 text-right text-muted-foreground">
                              {((row.value / total) * 100).toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>

            <div className="flex justify-between border-t pt-3">
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleExport(previewReport, "pdf")}>
                  <Download className="size-3.5" /> Export PDF
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => handleExport(previewReport, "excel")}>
                  <Download className="size-3.5" /> Export Excel
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5" onClick={() => toast.success("Sending to printer...")}>
                  <Printer className="size-3.5" /> Print
                </Button>
              </div>
              <Button size="sm" variant="outline" onClick={() => setPreviewReport(null)}>Close</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
