"use client"

import { useState } from "react"
import {
  GraduationCap,
  Search,
  Plus,
  Eye,
  Pencil,
  Trash2,
  Ban,
  CheckCircle2,
  MapPin,
  Users,
  BookOpen,
  Building2,
  Calendar,
  TrendingUp,
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader, StatCard } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import { membersByUniversity } from "@/lib/mock-data"

interface University {
  id: string
  name: string
  shortName: string
  campus: string
  region: string
  totalStudents: number
  status: "active" | "inactive"
  dateAdded: string
  faculties: string[]
  departments: string[]
  courses: string[]
  description: string
}

const UNIVERSITIES_DATA: University[] = [
  {
    id: "uni_1", name: "Fourah Bay College (USL)", shortName: "FBC", campus: "Mount Aureol", region: "Western Area",
    totalStudents: 620, status: "active", dateAdded: "2024-01-10",
    faculties: ["Arts", "Science & Technology", "Social Sciences & Law", "Engineering & Architecture"],
    departments: ["Computer Science", "Physics", "Economics", "Law", "Civil Engineering"],
    courses: ["Computer Science", "Physics", "Economics", "Law", "Civil Engineering", "English", "History"],
    description: "The oldest university in West Africa, established in 1827. FBC is affiliated with the University of Sierra Leone and is known for excellence in the arts and sciences."
  },
  {
    id: "uni_2", name: "Njala University", shortName: "Njala", campus: "Njala", region: "Southern Province",
    totalStudents: 540, status: "active", dateAdded: "2024-01-12",
    faculties: ["Agriculture", "Environmental Sciences", "Education", "Health Sciences"],
    departments: ["Agriculture", "Forestry", "Nursing", "Education"],
    courses: ["Agriculture", "Forestry & Wildlife", "Nursing", "Biology", "Education"],
    description: "A leading institution for agricultural and environmental sciences in Sierra Leone. Njala University plays a key role in food security research."
  },
  {
    id: "uni_3", name: "Institute of Public Administration (IPAM)", shortName: "IPAM", campus: "Tower Hill", region: "Western Area",
    totalStudents: 410, status: "active", dateAdded: "2024-01-15",
    faculties: ["Public Administration", "Business Studies", "Social Sciences"],
    departments: ["Public Administration", "Accounting", "Human Resource Management"],
    courses: ["Public Administration", "Accounting & Finance", "HRM", "Business Management"],
    description: "Specialised in public administration and governance. IPAM prepares students for roles in government, NGOs, and public institutions."
  },
  {
    id: "uni_4", name: "Ernest Bai Koroma University", shortName: "EBK", campus: "Makeni", region: "Northern Province",
    totalStudents: 320, status: "active", dateAdded: "2024-02-01",
    faculties: ["Science & Technology", "Business", "Humanities"],
    departments: ["IT", "Business Studies", "Mass Communication"],
    courses: ["Information Technology", "Business Administration", "Mass Communication"],
    description: "A modern university in the Northern Province focused on technology and business education to serve northern communities."
  },
  {
    id: "uni_5", name: "Eastern Technical University", shortName: "ETU", campus: "Kenema", region: "Eastern Province",
    totalStudents: 240, status: "active", dateAdded: "2024-02-14",
    faculties: ["Engineering", "Technology", "Applied Sciences"],
    departments: ["Electrical Engineering", "Civil Engineering", "Computer Engineering"],
    courses: ["Electrical Engineering", "Civil Engineering", "Computer Engineering", "Architecture"],
    description: "A technical university providing hands-on engineering and applied science education to students from the Eastern Province."
  },
  {
    id: "uni_6", name: "Milton Margai Technical University", shortName: "MMTU", campus: "Goderich", region: "Western Area",
    totalStudents: 210, status: "active", dateAdded: "2024-03-01",
    faculties: ["Technical Studies", "Applied Sciences", "Vocational Education"],
    departments: ["Mechanical Engineering", "Electronics", "Building & Construction"],
    courses: ["Mechanical Engineering", "Electronics Technology", "Building Construction", "Plumbing"],
    description: "Focuses on vocational and technical training, helping students develop practical skills for the labour market."
  },
  {
    id: "uni_7", name: "Limkokwing University", shortName: "LKW", campus: "Aberdeen", region: "Western Area",
    totalStudents: 140, status: "active", dateAdded: "2024-03-15",
    faculties: ["Creative Multimedia", "Design", "IT & Computing"],
    departments: ["Graphic Design", "Fashion", "Digital Media", "Software Development"],
    courses: ["Graphic Design", "Fashion Design", "Digital Media Production", "Software Engineering"],
    description: "A private university specialised in creative arts, design, and digital technology. Partnered with institutions in Malaysia and Africa."
  },
]

export default function UniversitiesManagerPage() {
  const { students } = useAppState()
  const [search, setSearch] = useState("")
  const [selectedUni, setSelectedUni] = useState<University | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [confirmDeactivate, setConfirmDeactivate] = useState<University | null>(null)
  const [unis, setUnis] = useState(UNIVERSITIES_DATA)
  const [newName, setNewName] = useState("")
  const [newCampus, setNewCampus] = useState("")
  const [newRegion, setNewRegion] = useState("")

  const filtered = unis.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.campus.toLowerCase().includes(search.toLowerCase()) ||
    u.region.toLowerCase().includes(search.toLowerCase())
  )

  const activeCount = unis.filter(u => u.status === "active").length
  const totalStudentsAll = unis.reduce((sum, u) => sum + u.totalStudents, 0)
  const newThisMonth = 1

  function handleAdd() {
    if (!newName.trim() || !newCampus.trim() || !newRegion.trim()) {
      toast.error("Please fill in all required fields.")
      return
    }
    const newUni: University = {
      id: `uni_${Date.now()}`,
      name: newName,
      shortName: newName.split(" ").map(w => w[0]).join("").slice(0, 4).toUpperCase(),
      campus: newCampus,
      region: newRegion,
      totalStudents: 0,
      status: "active",
      dateAdded: new Date().toISOString().split("T")[0],
      faculties: [],
      departments: [],
      courses: [],
      description: "New institution added to the NUKaFs Registry.",
    }
    setUnis(prev => [newUni, ...prev])
    setNewName("")
    setNewCampus("")
    setNewRegion("")
    setAddOpen(false)
    toast.success(`${newName} has been added to the registry.`)
  }

  function handleToggleStatus(uni: University) {
    setUnis(prev => prev.map(u => u.id === uni.id ? { ...u, status: u.status === "active" ? "inactive" : "active" } : u))
    setConfirmDeactivate(null)
    toast.success(`${uni.name} has been ${uni.status === "active" ? "deactivated" : "reactivated"}.`)
  }

  const maxStudents = Math.max(...unis.map(u => u.totalStudents))

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="Universities Manager"
        description="Manage all institutions represented in the NUKaFs student registry."
        action={
          <Button onClick={() => setAddOpen(true)} className="gap-2">
            <Plus className="size-4" /> Add University
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="Total Universities" value={unis.length} icon={GraduationCap} hint="on registry" />
        <StatCard label="Active Universities" value={activeCount} icon={CheckCircle2} trend={`${activeCount} active`} trendUp={true} hint="" />
        <StatCard label="Total Students" value={totalStudentsAll.toLocaleString()} icon={Users} trend="Across all institutions" trendUp={true} hint="" />
        <StatCard label="New Institutions" value={newThisMonth} icon={Building2} hint="added this month" />
      </div>

      {/* Student Distribution */}
      <Card className="border shadow-sm">
        <CardHeader className="p-5 border-b">
          <CardTitle className="text-sm flex items-center gap-2">
            <TrendingUp className="size-4 text-primary" /> Student Distribution by University
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 flex flex-col gap-3">
          {unis.filter(u => u.status === "active").map(uni => (
            <div key={uni.id} className="flex items-center gap-3">
              <span className="text-xs font-semibold w-16 shrink-0 text-right text-muted-foreground">{uni.shortName}</span>
              <div className="flex-1">
                <Progress value={(uni.totalStudents / maxStudents) * 100} className="h-2.5" />
              </div>
              <span className="text-xs font-bold w-10 shrink-0 text-right">{uni.totalStudents}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Main Table */}
      <Card className="border shadow-sm">
        <CardHeader className="p-5 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">All Institutions</CardTitle>
              <CardDescription className="mt-0.5">{filtered.length} universities listed</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input placeholder="Search universities..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-bold">University Name</TableHead>
                  <TableHead className="text-xs font-bold">Campus</TableHead>
                  <TableHead className="text-xs font-bold">Region</TableHead>
                  <TableHead className="text-xs font-bold">Students</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold">Date Added</TableHead>
                  <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12 text-muted-foreground text-sm">
                      No universities match your search.
                    </TableCell>
                  </TableRow>
                ) : filtered.map(uni => (
                  <TableRow key={uni.id} className="hover:bg-muted/20">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="size-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold text-primary">{uni.shortName.slice(0, 3)}</span>
                        </div>
                        <div>
                          <p className="text-xs font-bold text-foreground">{uni.name}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="size-3" />{uni.campus}</span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{uni.region}</TableCell>
                    <TableCell>
                      <span className="text-xs font-bold text-foreground flex items-center gap-1">
                        <Users className="size-3 text-primary" />{uni.totalStudents.toLocaleString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={
                        uni.status === "active"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 text-[10px]"
                          : "bg-muted text-muted-foreground text-[10px]"
                      }>
                        {uni.status === "active" ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{uni.dateAdded}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => setSelectedUni(uni)} title="View Profile">
                          <Eye className="size-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="size-7" onClick={() => toast.info("Edit university — coming in full backend integration.")} title="Edit">
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className={`size-7 ${uni.status === "active" ? "text-amber-500" : "text-emerald-500"}`}
                          onClick={() => setConfirmDeactivate(uni)}
                          title={uni.status === "active" ? "Deactivate" : "Activate"}
                        >
                          {uni.status === "active" ? <Ban className="size-3.5" /> : <CheckCircle2 className="size-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7 text-destructive"
                          onClick={() => toast.error("Delete is disabled for universities with active student records.")}
                          title="Delete"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* University Profile Modal */}
      <Dialog open={!!selectedUni} onOpenChange={open => !open && setSelectedUni(null)}>
        {selectedUni && (
          <DialogContent className="max-w-2xl font-sans">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="font-heading text-lg flex items-center gap-2">
                <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-primary">{selectedUni.shortName.slice(0, 3)}</span>
                </div>
                {selectedUni.name}
              </DialogTitle>
              <DialogDescription className="text-xs flex items-center gap-3">
                <span className="flex items-center gap-1"><MapPin className="size-3" />{selectedUni.campus}</span>
                <span>•</span>
                <span>{selectedUni.region}</span>
                <span>•</span>
                <Badge variant="outline" className={selectedUni.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 text-[9px]" : "text-[9px]"}>
                  {selectedUni.status}
                </Badge>
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-5 py-3 text-xs max-h-[480px] overflow-y-auto pr-1">
              {/* About */}
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-primary mb-1.5">About</h4>
                <p className="text-muted-foreground leading-relaxed">{selectedUni.description}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Students", value: selectedUni.totalStudents.toLocaleString(), icon: Users },
                  { label: "Faculties", value: selectedUni.faculties.length, icon: Building2 },
                  { label: "Date Added", value: selectedUni.dateAdded, icon: Calendar },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="border rounded-xl p-3 bg-muted/10 flex flex-col gap-1">
                    <Icon className="size-4 text-primary mb-0.5" />
                    <span className="text-[9px] text-muted-foreground uppercase tracking-wider">{label}</span>
                    <span className="font-bold text-foreground text-sm">{value}</span>
                  </div>
                ))}
              </div>

              {/* Faculties */}
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
                  <Building2 className="size-3.5" /> Faculties
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUni.faculties.length > 0
                    ? selectedUni.faculties.map(f => <Badge key={f} variant="secondary" className="text-[9px]">{f}</Badge>)
                    : <span className="text-muted-foreground italic">No faculties listed</span>}
                </div>
              </div>

              {/* Departments */}
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
                  <BookOpen className="size-3.5" /> Departments
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUni.departments.map(d => <Badge key={d} variant="outline" className="text-[9px]">{d}</Badge>)}
                </div>
              </div>

              {/* Courses */}
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-primary mb-2">Courses Offered</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedUni.courses.map(c => <span key={c} className="text-[9px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground">{c}</span>)}
                </div>
              </div>

              {/* Recent Registrations */}
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-primary mb-2">Recent Student Registrations</h4>
                <div className="border rounded-xl overflow-hidden">
                  {students.filter(s => s.university === selectedUni.name).slice(0, 5).map(s => (
                    <div key={s.id} className="flex items-center gap-2.5 px-4 py-2.5 border-b last:border-0 hover:bg-muted/10">
                      <div className="size-6 rounded-full flex items-center justify-center font-bold text-[8px] text-white shrink-0" style={{ backgroundColor: s.avatarColor }}>
                        {s.fullName.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">{s.fullName}</p>
                        <p className="text-[9px] text-muted-foreground">{s.course} • {s.level}</p>
                      </div>
                      <Badge variant="outline" className={
                        s.status === "active" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 text-[9px]" :
                        s.status === "pending" ? "bg-amber-50 text-amber-700 border-amber-200 text-[9px]" : "text-[9px]"
                      }>{s.status}</Badge>
                    </div>
                  ))}
                  {students.filter(s => s.university === selectedUni.name).length === 0 && (
                    <div className="py-6 text-center text-muted-foreground">No student records from this institution yet.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button size="sm" variant="outline" onClick={() => setSelectedUni(null)}>Close</Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Add University Modal */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="max-w-sm font-sans">
          <DialogHeader>
            <DialogTitle className="font-heading text-base">Add New University</DialogTitle>
            <DialogDescription className="text-xs">Register a new institution in the NUKaFs Registry.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">University Name <span className="text-destructive">*</span></label>
              <Input placeholder="e.g. University of Makeni" value={newName} onChange={e => setNewName(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Campus Location <span className="text-destructive">*</span></label>
              <Input placeholder="e.g. Makeni" value={newCampus} onChange={e => setNewCampus(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Region <span className="text-destructive">*</span></label>
              <Input placeholder="e.g. Northern Province" value={newRegion} onChange={e => setNewRegion(e.target.value)} />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setAddOpen(false)}>Cancel</Button>
              <Button onClick={handleAdd}>Add University</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm Deactivate */}
      <Dialog open={!!confirmDeactivate} onOpenChange={open => !open && setConfirmDeactivate(null)}>
        {confirmDeactivate && (
          <DialogContent className="max-w-sm font-sans">
            <DialogHeader>
              <DialogTitle className="font-heading text-base">
                {confirmDeactivate.status === "active" ? "Deactivate" : "Reactivate"} University
              </DialogTitle>
              <DialogDescription className="text-xs">
                Are you sure you want to {confirmDeactivate.status === "active" ? "deactivate" : "reactivate"} <strong>{confirmDeactivate.name}</strong>?
                {confirmDeactivate.status === "active" && " This will hide it from student registration dropdowns."}
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={() => setConfirmDeactivate(null)}>Cancel</Button>
              <Button
                variant={confirmDeactivate.status === "active" ? "destructive" : "default"}
                size="sm"
                onClick={() => handleToggleStatus(confirmDeactivate)}
              >
                {confirmDeactivate.status === "active" ? "Deactivate" : "Reactivate"}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
