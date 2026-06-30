"use client"

import { PieChart, Download, BarChart3, TrendingUp } from "lucide-react"
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
  AreaChart,
  Area,
} from "recharts"
import { registrationTrend, membersByDepartment } from "@/lib/mock-data"

export default function StakeholderAnalyticsPage() {
  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="Advanced Analytics"
        description="Comprehensive analytical views of the registry data with trend analysis."
        action={
          <Button variant="outline" className="gap-2">
            <Download className="size-4" /> Export Analytics Report
          </Button>
        }
      />

      {/* Registration Trend */}
      <Card className="border shadow-sm">
        <CardHeader className="p-5 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" /> Registration Growth
          </CardTitle>
          <CardDescription>Month-over-month student registration trends</CardDescription>
        </CardHeader>
        <CardContent className="p-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={registrationTrend} margin={{ left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="oklch(0.52 0.12 158)" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="oklch(0.52 0.12 158)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Area type="monotone" dataKey="members" stroke="oklch(0.52 0.12 158)" strokeWidth={2} fill="url(#colorMembers)" name="New Registrations" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      {/* Example second chart */}
      <Card className="border shadow-sm">
        <CardHeader className="p-5 border-b">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 className="size-4 text-primary" /> Growth by Department
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={membersByDepartment} margin={{ left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} angle={-45} textAnchor="end" />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="value" name="Students" fill="oklch(0.62 0.1 200)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
