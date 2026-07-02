"use client"

import { Building2, Search } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"

// Use real student data to derive university counts when available

export default function UniversitiesManagerPage() {
  const { students } = useAppState()

  const counts = (students ?? []).reduce<Record<string, number>>((acc, s) => {
    const name = s.university || "Unknown"
    acc[name] = (acc[name] || 0) + 1
    return acc
  }, {})

  const unis = Object.entries(counts).map(([name, studentsCount], i) => ({ id: `uni_${i}`, name, campuses: 1, faculties: 0, departments: 0, students: studentsCount }))

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
                <TableHead className="font-bold text-xs text-right">NUKaFs Members</TableHead>
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
