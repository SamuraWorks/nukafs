"use client"

import { useMemo, useState } from "react"
import { FileBarChart, Download, Eye, CalendarRange, Filter, Users } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from "recharts"

const COLORS = ["oklch(0.52 0.12 158)", "oklch(0.62 0.1 200)", "oklch(0.72 0.13 85)", "oklch(0.55 0.13 25)"]

export default function StakeholderReportsPage() {
  const { students, currentUser, opportunities } = useAppState()
  const [previewType, setPreviewType] = useState<"geography" | "academy" | "opportunities" | null>(null)
  const [timeFilter, setTimeFilter] = useState("all")

  const downloadBlob = (content: string, fileName: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const csvEscape = (value: string | number) => {
    const stringValue = String(value ?? "")
    return /[",\n]/.test(stringValue) ? `"${stringValue.replace(/"/g, '""')}"` : stringValue
  }

  const exportReport = (
    reportId: "geography" | "academy" | "opportunities",
    reportName: string,
    format: "PDF" | "Excel" | "CSV",
  ) => {
    const reportDataMap = {
      geography: reportData.geography,
      academy: reportData.academy,
      opportunities: reportData.opportunityDemand,
    }

    const rows = reportDataMap[reportId] ?? []
    const title = `${reportName} (${new Date().toISOString().slice(0, 10)})`

    if (format === "PDF") {
      window.print()
      toast.success(`${reportName} opened for PDF export.`)
      return
    }

    const headers = ["name", "value"]
    const csv = [headers.join(","), ...rows.map((row) => [csvEscape(row.name), csvEscape(row.value)].join(","))].join("\n")

    if (format === "CSV") {
      downloadBlob(csv, `${title}.csv`, "text/csv;charset=utf-8")
    } else {
      downloadBlob(csv, `${title}.xlsx`, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    }

    toast.success(`${reportName} exported as ${format}.`, {
      description: `${currentUser?.fullName || currentUser?.name || "Stakeholder"} downloaded a live report from the production registry.`,
    })
  }

  const reportData = useMemo(() => {
    const geography = Object.entries(
      students.reduce<Record<string, number>>((acc, student) => {
        acc[student.district] = (acc[student.district] ?? 0) + 1
        return acc
      }, {}),
    ).map(([name, value]) => ({ name, value }))

    const academy = Object.entries(
      students.reduce<Record<string, number>>((acc, student) => {
        acc[student.university] = (acc[student.university] ?? 0) + 1
        return acc
      }, {}),
    ).map(([name, value]) => ({ name, value }))

    const opportunityDemand = opportunities.map((item) => ({ name: item.type, value: item.applications ?? 0 }))

    const growth = Array.from(new Set(students.map((student) => student.joinedDate.slice(0, 7)))).sort().map((month) => ({
      month,
      members: students.filter((student) => student.joinedDate.startsWith(month)).length,
    }))

    return { geography, academy, opportunityDemand, growth }
  }, [students, opportunities])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-10 font-sans">
      <PageHeader
        title="Reports & Exports"
        description="Preview and export live stakeholder reports with filters, summaries, tables, and charts from the production database."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Filter className="size-3.5 text-muted-foreground" />
        <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value ?? "all")}>
          <SelectTrigger className="w-32 text-xs"><SelectValue placeholder="Period" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="2024">2024</SelectItem>
            <SelectItem value="2025">2025</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Reports", value: "4", icon: FileBarChart },
          { label: "Members Included", value: students.length.toLocaleString(), icon: Users },
          { label: "Current Filters", value: timeFilter === "all" ? "All time" : timeFilter, icon: Filter },
          { label: "Generated", value: new Date().toLocaleDateString(), icon: CalendarRange },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label} className="border shadow-xs">
              <CardContent className="flex flex-col items-center justify-center p-4 text-center">
                <Icon className="mb-2 size-5 text-primary opacity-80" />
                <p className="text-lg font-bold text-foreground">{item.value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.label}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {[
          {
            id: "geography" as const,
            title: "Geographic Summary",
            description: "Members by district and chiefdom from the live registry.",
          },
          {
            id: "academy" as const,
            title: "Academic Overview",
            description: "Institutional distribution of verified members.",
          },
          {
            id: "opportunities" as const,
            title: "Opportunity Demand",
            description: "Applications tracked across published opportunities.",
          },
        ].map((report) => (
          <Card key={report.id} className="border shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5">
              <div>
                <h3 className="text-sm font-bold">{report.title}</h3>
                <p className="text-[10px] text-muted-foreground">{report.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setPreviewType(report.id)}>
                  <Eye className="mr-1.5 size-3.5" /> Preview
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => exportReport(report.id, report.title, "PDF")}>
                  <Download className="mr-1.5 size-3.5" /> PDF
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => exportReport(report.id, report.title, "Excel")}>
                  <Download className="mr-1.5 size-3.5" /> XLSX
                </Button>
                <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => exportReport(report.id, report.title, "CSV")}>
                  <Download className="mr-1.5 size-3.5" /> CSV
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={previewType !== null} onOpenChange={(open) => !open && setPreviewType(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {previewType === "geography" ? "Geographic Summary" : previewType === "academy" ? "Academic Overview" : "Opportunity Demand"}
            </DialogTitle>
            <DialogDescription>
              {previewType === "geography"
                ? "District-level members distribution from the live registry."
                : previewType === "academy"
                  ? "Institutional summary of verified members."
                  : "Applications tracked across opportunities by opportunity type."}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 grid gap-4">
            {previewType === "geography" ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.geography}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="oklch(0.52 0.12 158)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : previewType === "academy" ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={reportData.academy} dataKey="value" nameKey="name" outerRadius={84}>
                      {reportData.academy.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={reportData.opportunityDemand}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="value" fill="oklch(0.62 0.1 200)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t pt-3">
            <div className="text-xs text-muted-foreground">
              Generated on {new Date().toLocaleDateString()} by {currentUser?.fullName || currentUser?.name || "Stakeholder"}
            </div>
            <Button variant="outline" size="sm" onClick={() => setPreviewType(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
