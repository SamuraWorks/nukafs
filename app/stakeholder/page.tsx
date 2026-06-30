"use client"

import {
  Users,
  CheckCircle2,
  Building2,
  BookOpen,
  MapPin,
  HeartHandshake,
  Briefcase,
  TrendingUp,
  Award,
  GraduationCap,
  Bell,
  Megaphone,
  FileBarChart,
  Calendar,
} from "lucide-react"
import { PageHeader, StatCard } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function StakeholderOverviewPage() {
  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="Executive Overview"
        description="High-level summary of the NUKAFS student registry, identifying key metrics and support opportunities."
      />

      {/* Primary Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Registered Students" value="2,480" icon={Users} trend="Active members" trendUp={true} hint="" />
        <StatCard label="Verified Students" value="1,986" icon={CheckCircle2} trend="80% verification rate" trendUp={true} hint="" />
        <StatCard label="New This Month" value="142" icon={TrendingUp} hint="Recent registrations" />
        <StatCard label="Final-Year Students" value="340" icon={GraduationCap} hint="Graduating class" />
      </div>

      {/* Secondary Stats */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6 mt-2">
        {[
          { label: "Universities", value: "7", icon: Building2 },
          { label: "Faculties", value: "14", icon: BookOpen },
          { label: "Departments", value: "40+", icon: MapPin },
          { label: "Courses", value: "30+", icon: Award },
          { label: "Entrepreneurs", value: "125", icon: TrendingUp },
          { label: "Scholarship Req.", value: "396", icon: HeartHandshake },
        ].map(s => (
          <Card key={s.label} className="border shadow-xs">
            <CardContent className="p-4 flex flex-col items-center justify-center text-center">
              <s.icon className="size-5 text-primary mb-2 opacity-80" />
              <p className="text-lg font-bold text-foreground">{s.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Insights & Activity */}
      <div className="grid gap-6 md:grid-cols-12 mt-4">
        
        {/* Quick Insights */}
        <Card className="md:col-span-8 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="size-4 text-primary" /> Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {[
              { title: "High Demand for Internships", desc: "420 students have requested internship opportunities, primarily in Engineering and Business sectors.", color: "text-amber-600", bg: "bg-amber-100" },
              { title: "Growing Female Registration", desc: "Female student registration increased by 15% this academic year.", color: "text-emerald-600", bg: "bg-emerald-100" },
              { title: "Northern Province Dominance", desc: "55% of the registry originates from the Northern Province, highlighting a strong regional base.", color: "text-blue-600", bg: "bg-blue-100" },
            ].map((insight, i) => (
              <div key={i} className="px-5 py-4 flex items-start gap-3">
                <div className={`size-8 rounded-lg flex items-center justify-center shrink-0 ${insight.bg} ${insight.color}`}>
                  <Lightbulb className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{insight.desc}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Support Opportunities */}
        <Card className="md:col-span-4 border shadow-sm">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base flex items-center gap-2">
              <HeartHandshake className="size-4 text-primary" /> Support Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent className="p-5 flex flex-col gap-4">
            {[
              { label: "Scholarships Needed", value: "396", percent: 65, color: "bg-emerald-500" },
              { label: "Internships Requested", value: "420", percent: 75, color: "bg-amber-500" },
              { label: "Employment Seeking", value: "280", percent: 40, color: "bg-blue-500" },
            ].map(s => (
              <div key={s.label} className="flex flex-col gap-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">{s.label}</span>
                  <span className="text-muted-foreground font-mono">{s.value} requests</span>
                </div>
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div className={`h-full ${s.color}`} style={{ width: `${s.percent}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

function Lightbulb(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1.3.5 2.6 1.5 3.5.8.8 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  )
}
