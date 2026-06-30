"use client"

import { MapPin, Download, Home, Target, TrendingUp } from "lucide-react"
import { PageHeader, StatCard } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { membersByDistrict } from "@/lib/mock-data"

const COLORS = [
  "oklch(0.52 0.12 158)",
  "oklch(0.62 0.1 200)",
  "oklch(0.72 0.13 85)",
  "oklch(0.55 0.13 25)",
  "oklch(0.45 0.06 280)",
  "oklch(0.65 0.1 340)",
  "oklch(0.60 0.12 70)",
]

const chiefdoms = [
  { name: "Wara Wara Yagala", value: 310 },
  { name: "Sengbe", value: 245 },
  { name: "Kasunko", value: 180 },
  { name: "Folosaba", value: 155 },
  { name: "Neini", value: 120 },
  { name: "Niawa", value: 95 },
  { name: "Other", value: 135 },
]

export default function StakeholderGeographyPage() {
  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="Geographical Distribution"
        description="Analyze the distribution of NUKAFS members by district, chiefdom, and home town."
        action={
          <Button variant="outline" className="gap-2">
            <Download className="size-4" /> Export Map Data
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Districts Represented" value="16" icon={MapPin} hint="Across Sierra Leone" />
        <StatCard label="Top District" value="Koinadugu" icon={Target} trend="845 members" trendUp={true} hint="" />
        <StatCard label="Chiefdoms Represented" value="34" icon={Home} hint="Highest: Wara Wara Yagala" />
        <StatCard label="Regional Growth" value="+15%" icon={TrendingUp} trend="Northern Province" trendUp={true} hint="" />
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* District Distribution */}
        <Card className="md:col-span-8 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base">Students by District</CardTitle>
            <CardDescription>Number of registered members originating from each district</CardDescription>
          </CardHeader>
          <CardContent className="p-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={membersByDistrict} margin={{ left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} angle={-45} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="value" name="Students" radius={[4, 4, 0, 0]}>
                  {membersByDistrict.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Chiefdom Distribution */}
        <Card className="md:col-span-4 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base">Top Chiefdoms</CardTitle>
            <CardDescription>Breakdown for Koinadugu District</CardDescription>
          </CardHeader>
          <CardContent className="p-4 h-80 flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={chiefdoms} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
                  {chiefdoms.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* District density summary */}
      <Card className="border shadow-sm">
        <CardHeader className="border-b p-5">
          <CardTitle className="text-base">District Density Summary</CardTitle>
          <CardDescription>
            Member concentration by district and chiefdom (registry snapshot)
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/10 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left">District</th>
                  <th className="px-5 py-3 text-right">Members</th>
                  <th className="px-5 py-3 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {membersByDistrict.map((row) => {
                  const total = membersByDistrict.reduce((sum, r) => sum + r.value, 0)
                  const share = Math.round((row.value / total) * 100)
                  return (
                    <tr key={row.name} className="hover:bg-muted/5">
                      <td className="px-5 py-3 text-xs font-semibold">{row.name}</td>
                      <td className="px-5 py-3 text-right text-xs">{row.value}</td>
                      <td className="px-5 py-3 text-right text-xs text-muted-foreground">
                        {share}%
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
