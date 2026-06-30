"use client"

import { useState } from "react"
import { Search, Filter, Eye, Download, FileText, User } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { Student } from "@/lib/mock-data"

export default function StakeholderDirectoryPage() {
  const { students } = useAppState()
  const [search, setSearch] = useState("")
  const [uniFilter, setUniFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  const filtered = students.filter(s => {
    const q = search.toLowerCase()
    const matchSearch = s.fullName.toLowerCase().includes(q) || s.membershipId.toLowerCase().includes(q)
    const matchUni = uniFilter === "all" || s.university === uniFilter
    const matchStatus = statusFilter === "all" || s.status === statusFilter
    return matchSearch && matchUni && matchStatus
  })

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="Student Directory"
        description="Search and view the complete registry of NUKAFS students."
      />

      <Card className="border shadow-sm">
        <CardHeader className="p-5 border-b">
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <User className="size-4 text-primary" /> Directory Listing
                </CardTitle>
                <CardDescription className="mt-0.5">{filtered.length} students found</CardDescription>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                <Input placeholder="Search name or ID..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 h-8 text-xs" />
              </div>
              <Select value={uniFilter} onValueChange={setUniFilter}>
                <SelectTrigger className="w-40 h-8 text-xs"><SelectValue placeholder="University" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Universities</SelectItem>
                  <SelectItem value="Fourah Bay College (USL)">FBC</SelectItem>
                  <SelectItem value="Njala University">Njala</SelectItem>
                  <SelectItem value="Institute of Public Administration (IPAM)">IPAM</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-bold">Student</TableHead>
                  <TableHead className="text-xs font-bold">Membership ID</TableHead>
                  <TableHead className="text-xs font-bold">Institution</TableHead>
                  <TableHead className="text-xs font-bold">Course / Level</TableHead>
                  <TableHead className="text-xs font-bold">Location</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(s => (
                  <TableRow key={s.id} className="hover:bg-muted/10">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0" style={{ backgroundColor: s.avatarColor }}>
                          {s.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-xs text-foreground">{s.fullName}</p>
                          <p className="text-[10px] text-muted-foreground">{s.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-mono text-muted-foreground">{s.membershipId}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.university}</TableCell>
                    <TableCell>
                      <p className="text-xs font-semibold">{s.course}</p>
                      <p className="text-[10px] text-muted-foreground">{s.level}</p>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{s.district}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        s.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200 text-[9px]" :
                        s.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200 text-[9px]" :
                        "bg-destructive/10 text-destructive border-destructive/20 text-[9px]"
                      }>
                        {s.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedStudent(s)}>
                        <Eye className="size-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Read-Only Profile Modal */}
      <Dialog open={!!selectedStudent} onOpenChange={open => !open && setSelectedStudent(null)}>
        {selectedStudent && (
          <DialogContent className="max-w-2xl font-sans">
            <DialogHeader className="border-b pb-4">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-full flex items-center justify-center font-bold text-lg text-white" style={{ backgroundColor: selectedStudent.avatarColor }}>
                  {selectedStudent.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                </div>
                <div>
                  <DialogTitle className="font-heading text-xl">{selectedStudent.fullName}</DialogTitle>
                  <DialogDescription className="text-sm font-mono mt-1">{selectedStudent.membershipId}</DialogDescription>
                </div>
                <div className="ml-auto flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">Read Only</Badge>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-6 py-2 text-sm max-h-[60vh] overflow-y-auto">
              {/* Sections */}
              {[
                { title: "Academic Information", data: [
                  { label: "Institution", value: selectedStudent.university },
                  { label: "Faculty", value: "Faculty of Arts (Mock)" },
                  { label: "Course of Study", value: selectedStudent.course },
                  { label: "Level", value: selectedStudent.level },
                ]},
                { title: "Personal & Geographical", data: [
                  { label: "Gender", value: "Not Specified" },
                  { label: "District of Origin", value: selectedStudent.district },
                  { label: "Chiefdom", value: "Wara Wara Yagala" },
                  { label: "Town/Village", value: "Kabala" },
                ]},
                { title: "Contact Information", data: [
                  { label: "Email", value: selectedStudent.email },
                  { label: "Phone", value: "+232 76 000 000" },
                ]},
              ].map(section => (
                <div key={section.title}>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">{section.title}</h4>
                  <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border">
                    {section.data.map(item => (
                      <div key={item.label} className="flex flex-col gap-1">
                        <span className="text-[10px] text-muted-foreground uppercase">{item.label}</span>
                        <span className="font-semibold text-foreground text-xs">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <div>
                 <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground mb-3">Support Needs (Mock Data)</h4>
                 <div className="flex gap-2">
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700">Seeking Scholarship</Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">Seeking Mentorship</Badge>
                 </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <Button variant="outline" onClick={() => setSelectedStudent(null)}>Close Profile</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
