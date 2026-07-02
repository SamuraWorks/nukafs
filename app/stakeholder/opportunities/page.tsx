"use client"

import { useMemo } from "react"
import { BriefcaseBusiness, GraduationCap, Eye, CalendarDays, Users, Plus } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader, StatCard } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function StakeholderOpportunitiesPage() {
  const { opportunities } = useAppState()

  const summary = useMemo(() => {
    const totalApplications = opportunities.reduce((sum, opportunity) => sum + (opportunity.applications ?? 0), 0)
    const totalViews = opportunities.reduce((sum, opportunity) => sum + (opportunity.views ?? 0), 0)
    const eligibleMembers = opportunities.reduce((sum, opportunity) => sum + (opportunity.eligibleMembers ?? 0), 0)
    const openOpportunities = opportunities.filter((opportunity) => (opportunity.status ?? "Open") === "Open").length

    return { totalApplications, totalViews, eligibleMembers, openOpportunities }
  }, [opportunities])

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-10 font-sans">
      <PageHeader
        title="Opportunities"
        description="Publish, monitor, and close stakeholder opportunities with live view and application tracking."
        action={
          <Button variant="outline" className="gap-2">
            <Plus className="size-4" /> Create Opportunity
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Applications" value={summary.totalApplications.toLocaleString()} icon={BriefcaseBusiness} trend="Tracked" />
        <StatCard label="Views" value={summary.totalViews.toLocaleString()} icon={Eye} trend="Engagement" />
        <StatCard label="Eligible Members" value={summary.eligibleMembers.toLocaleString()} icon={Users} trend="Qualified" />
        <StatCard label="Open Opportunities" value={summary.openOpportunities.toString()} icon={GraduationCap} trend="Active" />
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="border-b p-5">
          <CardTitle className="text-base flex items-center gap-2"><BriefcaseBusiness className="size-4 text-primary" /> Published opportunities</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-xs font-bold">Opportunity</TableHead>
                <TableHead className="text-xs font-bold">Type</TableHead>
                <TableHead className="text-xs font-bold">Applications</TableHead>
                <TableHead className="text-xs font-bold">Views</TableHead>
                <TableHead className="text-xs font-bold">Eligible</TableHead>
                <TableHead className="text-xs font-bold">Deadline</TableHead>
                <TableHead className="text-xs font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {opportunities.map((opportunity) => (
                <TableRow key={opportunity.id}>
                  <TableCell>
                    <p className="text-xs font-semibold">{opportunity.title}</p>
                    <p className="text-[10px] text-muted-foreground">{opportunity.organization}</p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{opportunity.type}</TableCell>
                  <TableCell className="text-xs font-semibold">{opportunity.applications ?? 0}</TableCell>
                  <TableCell className="text-xs font-semibold">{opportunity.views ?? 0}</TableCell>
                  <TableCell className="text-xs font-semibold">{opportunity.eligibleMembers ?? 0}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className="size-3.5" /> {opportunity.deadline}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={((opportunity.status ?? "Open") === "Archived" ? "bg-slate-100 text-slate-700" : (opportunity.status ?? "Open") === "Closed" ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700")}>{opportunity.status ?? "Open"}</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
