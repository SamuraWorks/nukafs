"use client"

import { MapPin, Users } from "lucide-react"
import { PageHeader, StatCard } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts"
import { analyticsService } from "@/lib/services/registry-service"
import { useAppState } from "@/lib/context/app-state-context"
import { useMemo } from "react"

const COLORS = [
  "oklch(0.52 0.12 158)",
  "oklch(0.62 0.1 200)",
  "oklch(0.72 0.13 85)",
  "oklch(0.55 0.13 25)",
]

export default function StakeholderDistrictsPage() {
  const { students } = useAppState()

  const districtCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const student of students) {
      counts[student.district] = (counts[student.district] ?? 0) + 1
    }
    return Object.entries(counts).map(([name, value]) => ({ name, value }))
  }, [students])

  const chiefdomData = analyticsService.getMembersByChiefdom()

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-10 font-sans">
      <PageHeader
        title="District Distribution"
        description="Member distribution across Koinadugu and Falaba districts."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          label="Districts Covered"
          value={districtCounts.length}
          icon={MapPin}
        />
        <StatCard
          label="Top District"
          value={districtCounts[0]?.name ?? "—"}
          icon={Users}
          trend={`${districtCounts[0]?.value ?? 0} members`}
          trendUp
        />
        <StatCard
          label="Registry Total"
          value={students.length}
          icon={Users}
          hint="Live registry snapshot"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader className="border-b p-5">
            <CardTitle className="text-base">Members by District</CardTitle>
            <CardDescription>Current registry distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtCounts}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {districtCounts.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="border-b p-5">
            <CardTitle className="text-base">Chiefdom Breakdown</CardTitle>
            <CardDescription>Aggregated registry analytics</CardDescription>
          </CardHeader>
          <CardContent className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chiefdomData} layout="vertical" margin={{ left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fontSize: 9 }}
                />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="value" fill="oklch(0.52 0.12 158)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
