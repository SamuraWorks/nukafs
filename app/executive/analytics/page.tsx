"use client"

import { useMemo } from "react"
import { PieChart, Download, BarChart3, Users, Building2 } from "lucide-react"
import { PageHeader, StatCard } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend
} from "recharts"
import { useAppState } from "@/lib/context/app-state-context"

const COLORS = [
  "oklch(0.52 0.12 158)",
  "oklch(0.62 0.1 200)",
  "oklch(0.72 0.13 85)",
  "oklch(0.55 0.13 25)",
  "oklch(0.45 0.06 280)",
  "oklch(0.65 0.1 340)",
  "oklch(0.60 0.12 70)",
]

export default function ExecutiveAnalyticsPage() {
  const { students } = useAppState()

  // ── Live chart data from the real students array ──────────────────────────
  const membersByDistrict = useMemo(() => {
    const counts: Record<string, number> = {}
    students.forEach(s => { if (s.district) counts[s.district] = (counts[s.district] ?? 0) + 1 })
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [students])

  const membersByLevel = useMemo(() => {
    const counts: Record<string, number> = {}
    students.forEach(s => { if (s.level) counts[s.level] = (counts[s.level] ?? 0) + 1 })
    const order = ["Year 1", "Year 2", "Year 3", "Year 4", "Postgraduate"]
    return order
      .filter(l => counts[l] !== undefined)
      .map(name => ({ name, value: counts[name] }))
      .concat(Object.entries(counts).filter(([n]) => !order.includes(n)).map(([name, value]) => ({ name, value })))
  }, [students])

  const membersByDepartment = useMemo(() => {
    const counts: Record<string, number> = {}
    students.forEach(s => { if (s.department) counts[s.department] = (counts[s.department] ?? 0) + 1 })
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
  }, [students])

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="Executive Analytics"
        description="Operational metrics and charts to guide committee decisions."
        action={
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-32 h-9 text-xs"><SelectValue placeholder="University" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Univs</SelectItem>
                <SelectItem value="fbc">FBC</SelectItem>
                <SelectItem value="njala">Njala</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="gap-2 h-9">
              <Download className="size-4" /> Export
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-12">
        {/* District Pie */}
        <Card className="md:col-span-4 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base flex items-center gap-2"><MapPinIcon className="size-4 text-primary"/> Home District</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPie>
                <Pie data={membersByDistrict} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={false}>
                  {membersByDistrict.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </RechartsPie>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Level Bar */}
        <Card className="md:col-span-8 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base flex items-center gap-2"><Users className="size-4 text-primary"/> Academic Level</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={membersByLevel} margin={{ left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="value" name="Students" fill="oklch(0.52 0.12 158)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Dept Bar */}
        <Card className="md:col-span-12 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base flex items-center gap-2"><Building2 className="size-4 text-primary"/> Department Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={membersByDepartment} layout="vertical" margin={{ left: 30, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} tickLine={false} width={100} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="value" name="Students" fill="oklch(0.62 0.1 200)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MapPinIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
  )
}
