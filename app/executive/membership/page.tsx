"use client"

import { useState } from "react"
import { ShieldCheck, Ban, CreditCard, Filter, Eye } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader, StatusBadge } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function MembershipManagementPage() {
  const { students } = useAppState()
  const [statusFilter, setStatusFilter] = useState("all")

  const filtered = students.filter(s => statusFilter === "all" || s.status === statusFilter)

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="Membership Management"
        description="Oversee membership statuses, renewals, and virtual membership cards."
      />
      
      <div className="grid gap-4 sm:grid-cols-4 mb-2">
        <Card className="border shadow-xs"><CardContent className="p-4 text-center"><p className="text-2xl font-bold">{students.length}</p><p className="text-[10px] uppercase text-muted-foreground font-bold">Total Members</p></CardContent></Card>
        <Card className="border shadow-xs"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-emerald-600">{students.filter(s => s.status === "active").length}</p><p className="text-[10px] uppercase text-muted-foreground font-bold">Active</p></CardContent></Card>
        <Card className="border shadow-xs"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-amber-600">{students.filter(s => s.status === "pending").length}</p><p className="text-[10px] uppercase text-muted-foreground font-bold">Pending</p></CardContent></Card>
        <Card className="border shadow-xs"><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-destructive">{students.filter(s => s.status === "suspended").length}</p><p className="text-[10px] uppercase text-muted-foreground font-bold">Suspended</p></CardContent></Card>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="p-5 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" /> Member Roster
            </CardTitle>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <Filter className="size-3.5 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Members</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10">
                <TableHead className="font-bold text-xs">Member</TableHead>
                <TableHead className="font-bold text-xs">ID</TableHead>
                <TableHead className="font-bold text-xs">Joined</TableHead>
                <TableHead className="font-bold text-xs">Status</TableHead>
                <TableHead className="font-bold text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id} className="hover:bg-muted/10">
                  <TableCell className="font-semibold text-xs">{s.fullName}</TableCell>
                  <TableCell className="text-xs font-mono">{s.membershipNumber}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.joinedDate}</TableCell>
                  <TableCell><StatusBadge status={s.status} /></TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="gap-1.5"><CreditCard className="size-3.5" /> View Card</Button>
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
