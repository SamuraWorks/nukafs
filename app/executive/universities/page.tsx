"use client"

import { Building2, Search } from "lucide-react"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

const universitiesMock = [
  { id: 1, name: "Fourah Bay College (USL)", campuses: 1, faculties: 6, departments: 24, students: 620 },
  { id: 2, name: "Njala University", campuses: 2, faculties: 7, departments: 28, students: 480 },
  { id: 3, name: "Institute of Public Administration (IPAM)", campuses: 1, faculties: 4, departments: 12, students: 350 },
  { id: 4, name: "College of Medicine and Allied Health Sciences", campuses: 1, faculties: 4, departments: 10, students: 210 },
  { id: 5, name: "Ernest Bai Koroma University", campuses: 3, faculties: 5, departments: 18, students: 190 },
]

export default function UniversitiesManagerPage() {
  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-5xl mx-auto">
      <PageHeader
        title="Universities Directory"
        description="Read-only view of affiliated institutions and student distribution."
      />
      
      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <div className="p-4 border-b bg-muted/10 flex items-center gap-4">
             <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Search institutions..." className="pl-9 h-9" />
             </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10">
                <TableHead className="font-bold text-xs">Institution Name</TableHead>
                <TableHead className="font-bold text-xs">Campuses</TableHead>
                <TableHead className="font-bold text-xs">Faculties</TableHead>
                <TableHead className="font-bold text-xs">Departments</TableHead>
                <TableHead className="font-bold text-xs text-right">NUKAFS Members</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {universitiesMock.map((u) => (
                <TableRow key={u.id} className="hover:bg-muted/10">
                  <TableCell className="font-semibold text-xs flex items-center gap-2"><Building2 className="size-4 text-primary" /> {u.name}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.campuses}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.faculties}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{u.departments}</TableCell>
                  <TableCell className="text-xs font-bold text-right">{u.students}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
