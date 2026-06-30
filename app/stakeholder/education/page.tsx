"use client"

import { BookOpen, GraduationCap, Building2, Layers, Download } from "lucide-react"
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
import { membersByUniversity, membersByDepartment, membersByLevel } from "@/lib/mock-data"

const COLORS = [
  "oklch(0.52 0.12 158)",
  "oklch(0.62 0.1 200)",
  "oklch(0.72 0.13 85)",
  "oklch(0.55 0.13 25)",
  "oklch(0.45 0.06 280)",
  "oklch(0.65 0.1 340)",
  "oklch(0.60 0.12 70)",
]

const faculties = [
  { name: "Science & Technology", value: 480 },
  { name: "Arts & Humanities", value: 310 },
  { name: "Social Sciences", value: 390 },
  { name: "Business & Mgt", value: 420 },
  { name: "Engineering", value: 380 },
  { name: "Health Sciences", value: 290 },
  { name: "Agriculture", value: 210 },
]

export default function StakeholderEducationPage() {
  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="Education Insights"
        description="Explore the academic composition of the NUKAFS student body across institutions, faculties, and levels."
        action={
          <Button variant="outline" className="gap-2">
            <Download className="size-4" /> Export Report
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Universities" value="7" icon={Building2} hint="Affiliated institutions" />
        <StatCard label="Faculties Represented" value="14" icon={Layers} hint="Across all campuses" />
        <StatCard label="Unique Courses" value="30+" icon={BookOpen} hint="Academic disciplines" />
        <StatCard label="Final Year Students" value="340" icon={GraduationCap} trend="Graduating class" trendUp={true} hint="" />
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* University Distribution */}
        <Card className="md:col-span-8 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base">Students by Institution</CardTitle>
            <CardDescription>Total NUKAFS members registered per university</CardDescription>
          </CardHeader>
          <CardContent className="p-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={membersByUniversity} margin={{ left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} tickLine={false} angle={-45} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="value" name="Students" radius={[4, 4, 0, 0]}>
                  {membersByUniversity.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Academic Level */}
        <Card className="md:col-span-4 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base">Academic Levels</CardTitle>
            <CardDescription>Distribution across years of study</CardDescription>
          </CardHeader>
          <CardContent className="p-4 h-80 flex flex-col items-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={membersByLevel} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label={false}>
                  {membersByLevel.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Faculties */}
        <Card className="md:col-span-6 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base">Top Faculties</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={faculties} layout="vertical" margin={{ left: 40, right: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} tickLine={false} width={100} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="value" name="Students" fill="oklch(0.52 0.12 158)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Departments */}
        <Card className="md:col-span-6 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base">Top Departments</CardTitle>
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
