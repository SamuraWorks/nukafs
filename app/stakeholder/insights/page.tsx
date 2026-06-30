"use client"

import { Lightbulb, TrendingUp, Building2, BookOpen, Users, Briefcase } from "lucide-react"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function StakeholderInsightsPage() {
  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="Student Insights"
        description="Key takeaways and intelligent summaries derived from the registry data."
      />
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { title: "Dominant Institution", value: "Fourah Bay College", icon: Building2, desc: "Accounts for 25% of all NUKAFS members." },
          { title: "Most Popular Course", value: "Computer Science", icon: BookOpen, desc: "High interest in STEM and IT." },
          { title: "Highest Origin District", value: "Koinadugu", icon: Users, desc: "Followed closely by Bombali District." },
          { title: "Scholarship Dependency", value: "16%", icon: TrendingUp, desc: "Of members have requested financial aid." },
          { title: "Graduating Workforce", value: "340 Students", icon: Briefcase, desc: "Entering the job market this year." },
          { title: "Student Entrepreneurs", value: "125 Students", icon: Lightbulb, desc: "Running side businesses while studying." },
        ].map((insight, idx) => (
          <Card key={idx} className="border shadow-sm border-l-4 border-l-primary hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-3">
                <insight.icon className="size-4 text-primary" />
                <Badge variant="secondary" className="text-[9px]">{insight.title}</Badge>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-1">{insight.value}</h3>
              <p className="text-xs text-muted-foreground">{insight.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
