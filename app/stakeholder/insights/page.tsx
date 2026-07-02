"use client"

import { useMemo, useState } from "react"
import {
  Building2,
  BookOpen,
  Users,
  BriefcaseBusiness,
  TrendingUp,
  GraduationCap,
  MapPin,
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts"

const COLORS = ["oklch(0.52 0.12 158)", "oklch(0.62 0.1 200)", "oklch(0.72 0.13 85)", "oklch(0.55 0.13 25)"]

export default function StakeholderInsightsPage() {
  const { students } = useAppState()
  const [districtFilter, setDistrictFilter] = useState("all")
  const [universityFilter, setUniversityFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const districtMatch = districtFilter === "all" || student.district === districtFilter
      const universityMatch = universityFilter === "all" || student.university === universityFilter
      const levelMatch = levelFilter === "all" || student.level === levelFilter
      return districtMatch && universityMatch && levelMatch
    })
  }, [students, districtFilter, universityFilter, levelFilter])

  const districtData = useMemo(() => {
    const grouped = filteredStudents.reduce<Record<string, number>>((acc, student) => {
      acc[student.district] = (acc[student.district] ?? 0) + 1
      return acc
    }, {})
    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  }, [filteredStudents])

  const universityData = useMemo(() => {
    const grouped = filteredStudents.reduce<Record<string, number>>((acc, student) => {
      acc[student.university] = (acc[student.university] ?? 0) + 1
      return acc
    }, {})
    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  }, [filteredStudents])

  const genderData = useMemo(() => {
    const grouped = filteredStudents.reduce<Record<string, number>>((acc, student) => {
      acc[student.gender] = (acc[student.gender] ?? 0) + 1
      return acc
    }, {})
    return Object.entries(grouped).map(([name, value]) => ({ name, value }))
  }, [filteredStudents])

  const totalMembers = filteredStudents.length
  const currentStudents = filteredStudents.filter((student) => student.employmentStatus === "Student").length
  const graduates = filteredStudents.filter((student) => student.employmentStatus === "Employed" || student.employmentStatus === "Self-employed").length
  const topDistrict = districtData[0]?.name ?? "N/A"

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-10 font-sans">
      <PageHeader
        title="Member Insights"
        description="Explore verified member data through filters, including geography, academics, and opportunities."
      />

      <div className="flex flex-wrap items-center gap-2">
        <Select value={districtFilter} onValueChange={(value) => setDistrictFilter(value ?? "all")}>
          <SelectTrigger className="w-40 text-xs"><SelectValue placeholder="District" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Districts</SelectItem>
            {Array.from(new Set(students.map((student) => student.district))).map((district) => (
              <SelectItem key={district} value={district}>{district}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={universityFilter} onValueChange={(value) => setUniversityFilter(value ?? "all")}>
          <SelectTrigger className="w-48 text-xs"><SelectValue placeholder="University" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Universities</SelectItem>
            {Array.from(new Set(students.map((student) => student.university))).map((university) => (
              <SelectItem key={university} value={university}>{university}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={levelFilter} onValueChange={(value) => setLevelFilter(value ?? "all")}>
          <SelectTrigger className="w-36 text-xs"><SelectValue placeholder="Academic Level" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            {Array.from(new Set(students.map((student) => student.level))).map((level) => (
              <SelectItem key={level} value={level}>{level}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Total Members", value: totalMembers.toLocaleString(), icon: Users },
          { title: "Current Students", value: currentStudents.toLocaleString(), icon: GraduationCap },
          { title: "Graduates", value: graduates.toLocaleString(), icon: BriefcaseBusiness },
          { title: "Top District", value: topDistrict, icon: MapPin },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.title} className="border shadow-sm">
              <CardContent className="p-5">
                <div className="mb-3 flex items-center gap-2">
                  <Icon className="size-4 text-primary" />
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{item.title}</span>
                </div>
                <h3 className="text-2xl font-bold text-foreground">{item.value}</h3>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base flex items-center gap-2"><MapPin className="size-4 text-primary" /> Regional Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={districtData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="oklch(0.52 0.12 158)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base flex items-center gap-2"><Building2 className="size-4 text-primary" /> Academic Institutions</CardTitle>
          </CardHeader>
          <CardContent className="h-72 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={universityData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="oklch(0.62 0.1 200)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base flex items-center gap-2"><BookOpen className="size-4 text-primary" /> Drill-down view</CardTitle>
          </CardHeader>
          <CardContent className="p-5">
            <div className="space-y-3">
              {[
                { label: "District", value: districtFilter === "all" ? "All" : districtFilter },
                { label: "University", value: universityFilter === "all" ? "All" : universityFilter },
                { label: "Academic Level", value: levelFilter === "all" ? "All" : levelFilter },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between rounded-lg border bg-muted/20 px-3 py-2">
                  <span className="text-xs font-semibold text-muted-foreground">{item.label}</span>
                  <Badge variant="secondary" className="text-[9px]">{item.value}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base flex items-center gap-2"><TrendingUp className="size-4 text-primary" /> Gender Mix</CardTitle>
          </CardHeader>
          <CardContent className="h-52 p-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={genderData} dataKey="value" nameKey="name" outerRadius={72} innerRadius={42}>
                  {genderData.map((entry, index) => (
                    <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
