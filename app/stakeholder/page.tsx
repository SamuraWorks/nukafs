"use client"

import { useMemo } from "react"
import {
  Users,
  CheckCircle2,
  TrendingUp,
  GraduationCap,
  Building2,
  BookOpen,
  MapPin,
  BriefcaseBusiness,
  HeartHandshake,
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader, StatCard } from "@/components/dashboard/ui-bits"
import { Card, CardContent } from "@/components/ui/card"

export default function StakeholderOverviewPage() {
  const { students, opportunities } = useAppState()

  const summary = useMemo(() => {
    const totalMembers = students.length
    const verifiedMembers = students.filter((student) => student.status === "active").length
    const currentStudents = students.filter((student) => student.employmentStatus === "Student").length
    const graduates = students.filter(
      (student) => student.employmentStatus === "Employed" || student.employmentStatus === "Self-employed" || student.level === "Postgraduate",
    ).length

    const districtCounts = students.reduce<Record<string, number>>((acc, student) => {
      acc[student.district] = (acc[student.district] ?? 0) + 1
      return acc
    }, {})

    const universityCounts = students.reduce<Record<string, number>>((acc, student) => {
      acc[student.university] = (acc[student.university] ?? 0) + 1
      return acc
    }, {})

    const topDistrict = Object.entries(districtCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A"
    const topUniversity = Object.entries(universityCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? "N/A"

    return {
      totalMembers,
      verifiedMembers,
      currentStudents,
      graduates,
      topDistrict,
      topUniversity,
      opportunitiesCount: opportunities.length,
    }
  }, [students, opportunities])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-10 font-sans">
      <PageHeader
        title="Dashboard"
        description="Live executive summary of verified member activity, opportunities, and stakeholder-ready insights."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Members" value={summary.totalMembers.toLocaleString()} icon={Users} trend="Production members" trendUp />
        <StatCard label="Verified Members" value={summary.verifiedMembers.toLocaleString()} icon={CheckCircle2} trend="Active registry" trendUp />
        <StatCard label="Current Students" value={summary.currentStudents.toLocaleString()} icon={GraduationCap} trend="Enrolled" />
        <StatCard label="Graduates" value={summary.graduates.toLocaleString()} icon={BriefcaseBusiness} trend="Career-ready" />
      </div>

      <div className="mt-2 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { label: "Top District", value: summary.topDistrict, icon: MapPin },
          { label: "Top University", value: summary.topUniversity, icon: Building2 },
          { label: "Published Opportunities", value: summary.opportunitiesCount.toString(), icon: BriefcaseBusiness },
          { label: "Verified Active", value: summary.verifiedMembers.toString(), icon: CheckCircle2 },
          { label: "Academic Levels", value: "Multiple", icon: BookOpen },
          { label: "Member Demand", value: "Live", icon: HeartHandshake },
        ].map((s) => (
          <Card key={s.label} className="border shadow-xs">
            <CardContent className="flex flex-col items-center justify-center p-4 text-center">
              <s.icon className="mb-2 size-5 text-primary opacity-80" />
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border shadow-sm">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Live summary</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              This dashboard reflects the production registry in real time, with member totals, status distribution, and opportunity counts sourced directly from the connected database.
            </p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center gap-2">
              <HeartHandshake className="size-4 text-primary" />
              <h3 className="text-sm font-semibold">Opportunity pipeline</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Stakeholders can monitor active opportunities, deadlines, and member demand without any administrative or approval workflow.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
