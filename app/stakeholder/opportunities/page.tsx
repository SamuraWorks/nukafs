"use client"

import { useState } from "react"
import { HeartHandshake, Briefcase, GraduationCap, Users, Filter, Download, LineChart } from "lucide-react"
import { PageHeader, StatCard } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const needsMock = [
  { id: 1, type: "Scholarship", course: "Computer Science", level: "Year 3", university: "FBC", district: "Koinadugu", gpa: "3.8" },
  { id: 2, type: "Internship", course: "Civil Engineering", level: "Year 4", university: "FBC", district: "Bombali", gpa: "3.5" },
  { id: 3, type: "Employment", course: "Business Admin", level: "Graduate", university: "IPAM", district: "Western Area", gpa: "3.2" },
  { id: 4, type: "Mentorship", course: "Law", level: "Year 2", university: "FBC", district: "Koinadugu", gpa: "3.9" },
  { id: 5, type: "Scholarship", course: "Nursing", level: "Year 1", university: "Njala", district: "Kenema", gpa: "3.4" },
]

export default function StakeholderOpportunitiesPage() {
  const [typeFilter, setTypeFilter] = useState("all")

  const filtered = needsMock.filter(n => typeFilter === "all" || n.type === typeFilter)

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="Opportunities & Support"
        description="Identify where stakeholders and partners can provide critical support to NUKAFS students."
        action={
          <Button variant="outline" className="gap-2">
            <Download className="size-4" /> Export Requests
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Scholarships Needed" value="396" icon={GraduationCap} hint="65% in STEM" />
        <StatCard label="Internships Requested" value="420" icon={Briefcase} hint="Engineering & Business" />
        <StatCard label="Employment Seeking" value="280" icon={Users} hint="Recent graduates" />
        <StatCard label="Mentorship Requests" value="150" icon={HeartHandshake} hint="Leadership & Career" />
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="p-5 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <LineChart className="size-4 text-primary" /> Support Requests
              </CardTitle>
              <CardDescription>Anonymised list of students seeking support</CardDescription>
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40 h-8 text-xs">
                <Filter className="size-3.5 mr-2" />
                <SelectValue placeholder="Request Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Needs</SelectItem>
                <SelectItem value="Scholarship">Scholarship</SelectItem>
                <SelectItem value="Internship">Internship</SelectItem>
                <SelectItem value="Employment">Employment</SelectItem>
                <SelectItem value="Mentorship">Mentorship</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-xs font-bold">Request Type</TableHead>
                <TableHead className="text-xs font-bold">Course / Level</TableHead>
                <TableHead className="text-xs font-bold">Institution</TableHead>
                <TableHead className="text-xs font-bold">Origin</TableHead>
                <TableHead className="text-xs font-bold">GPA (Self-Reported)</TableHead>
                <TableHead className="text-xs font-bold text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((need, idx) => (
                <TableRow key={idx} className="hover:bg-muted/10">
                  <TableCell>
                    <Badge variant="outline" className={
                      need.type === "Scholarship" ? "bg-emerald-50 text-emerald-700" :
                      need.type === "Internship" ? "bg-amber-50 text-amber-700" :
                      need.type === "Employment" ? "bg-blue-50 text-blue-700" :
                      "bg-purple-50 text-purple-700"
                    }>{need.type}</Badge>
                  </TableCell>
                  <TableCell>
                    <p className="text-xs font-semibold">{need.course}</p>
                    <p className="text-[10px] text-muted-foreground">{need.level}</p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{need.university}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{need.district}</TableCell>
                  <TableCell className="text-xs font-mono font-semibold">{need.gpa}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-xs">Express Interest</Button>
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
