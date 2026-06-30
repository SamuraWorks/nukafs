"use client"

import { useMemo } from "react"
import { ShieldCheck, CreditCard, Users } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader, StatCard, StatusBadge } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { analyticsService } from "@/lib/services/registry-service"
import { EmptyState } from "@/components/shared/page-states"
import { paginate, Pagination } from "@/components/shared/pagination"
import { useState } from "react"
import { API_CONFIG } from "@/lib/api/config"

export default function StakeholderMembershipPage() {
  const { students } = useAppState()
  const [page, setPage] = useState(1)
  const pageSize = API_CONFIG.defaultPageSize

  const breakdown = useMemo(
    () => analyticsService.getMembershipBreakdown(students),
    [students],
  )

  const activeStudents = useMemo(
    () => students.filter((s) => s.status === "active"),
    [students],
  )

  const pageItems = paginate(activeStudents, page, pageSize)

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 pb-10 font-sans">
      <PageHeader
        title="Membership Analytics"
        description="Read-only overview of NUKAFS membership status and verified digital ID adoption."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Members" value={breakdown.total} icon={Users} />
        <StatCard
          label="Active"
          value={breakdown.active}
          icon={ShieldCheck}
          trend={`${Math.round((breakdown.active / Math.max(breakdown.total, 1)) * 100)}%`}
          trendUp
        />
        <StatCard label="Pending" value={breakdown.pending} icon={Users} />
        <StatCard
          label="Digital Cards"
          value={breakdown.active}
          icon={CreditCard}
          hint="Verified active members"
        />
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="border-b p-5">
          <CardTitle className="text-base">Active Member Registry</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {activeStudents.length === 0 ? (
            <EmptyState
              title="No active members"
              description="Active membership records will appear here."
            />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/10">
                    <TableHead className="text-xs font-bold">Member</TableHead>
                    <TableHead className="text-xs font-bold">ID</TableHead>
                    <TableHead className="text-xs font-bold">University</TableHead>
                    <TableHead className="text-xs font-bold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageItems.map((student) => (
                    <TableRow key={student.id} className="hover:bg-muted/10">
                      <TableCell className="text-xs font-semibold">
                        {student.fullName}
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {student.membershipNumber}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {student.university}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={student.status} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="border-t p-4">
                <Pagination
                  page={page}
                  pageSize={pageSize}
                  total={activeStudents.length}
                  onPageChange={setPage}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
