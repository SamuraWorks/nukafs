"use client"

import { useState } from "react"
import { Search, Filter, SlidersHorizontal, Eye, ShieldAlert, ShieldCheck, Mail, Phone, MapPin, Calendar, BookOpen, Briefcase, HeartHandshake, UserPlus, AlertTriangle, Ban, CheckCircle } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { PageHeader, StatusBadge, RequestBadge } from "@/components/dashboard/ui-bits"
import { toast } from "sonner"
import { 
  UNIVERSITIES, 
  DEPARTMENTS, 
  DISTRICTS, 
  CHIEFDOMS,
  LEVELS,
  Student 
} from "@/lib/mock-data"

export default function StudentManagementPage() {
  const { students, editRequests, suspendStudent, reactivateStudent } = useAppState()
  
  // Search & Filter State
  const [search, setSearch] = useState("")
  const [uniFilter, setUniFilter] = useState("All")
  const [deptFilter, setDeptFilter] = useState("All")
  const [levelFilter, setLevelFilter] = useState("All")
  const [districtFilter, setDistrictFilter] = useState("All")
  const [chiefdomFilter, setChiefdomFilter] = useState("All")
  const [statusFilter, setStatusFilter] = useState("All")

  // Selected student for detail modal
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  
  // Tabs in details modal
  const [activeTab, setActiveTab] = useState<"profile" | "history">("profile")
  
  // Confirmation state
  const [confirmAction, setConfirmAction] = useState<{ id: string; action: "suspend" | "reactivate" } | null>(null)

  // Find the selected student from state dynamically so UI updates immediately
  const selectedStudent = students.find(s => s.id === selectedStudentId) || null

  // Reset filters
  const resetFilters = () => {
    setUniFilter("All")
    setDeptFilter("All")
    setLevelFilter("All")
    setDistrictFilter("All")
    setChiefdomFilter("All")
    setStatusFilter("All")
    setSearch("")
  }

  // Filter logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch = 
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.membershipNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.university.toLowerCase().includes(search.toLowerCase()) ||
      s.skills.some(sk => sk.toLowerCase().includes(search.toLowerCase())) ||
      s.phone.includes(search) ||
      s.email.toLowerCase().includes(search.toLowerCase())
    
    const matchesUni = uniFilter === "All" || s.university === uniFilter
    const matchesDept = deptFilter === "All" || s.department === deptFilter
    const matchesLevel = levelFilter === "All" || s.level === levelFilter
    const matchesDistrict = districtFilter === "All" || s.district === districtFilter
    const matchesChiefdom = chiefdomFilter === "All" || s.chiefdom === chiefdomFilter
    const matchesStatus = statusFilter === "All" || s.status === statusFilter

    return matchesSearch && matchesUni && matchesDept && matchesLevel && matchesDistrict && matchesChiefdom && matchesStatus
  })

  // Chiefdom filter listing dynamically
  const availableChiefdoms = districtFilter !== "All" ? CHIEFDOMS[districtFilter] || [] : []

  // Get edit history for current student
  const studentEditRequests = selectedStudent 
    ? editRequests.filter(r => r.membershipNumber === selectedStudent.membershipNumber)
    : []

  const handleActionClick = (id: string, action: "suspend" | "reactivate") => {
    setConfirmAction({ id, action })
  }

  const handleConfirmAction = () => {
    if (!confirmAction) return
    const { id, action } = confirmAction
    const name = students.find(s => s.id === id)?.fullName || "Student"

    if (action === "suspend") {
      suspendStudent(id)
      toast.warning(`Suspended account for ${name}`)
    } else {
      reactivateStudent(id)
      toast.success(`Reactivated account for ${name}`)
    }
    setConfirmAction(null)
  }

  return (
    <div className="flex flex-col gap-6 font-sans pb-10">
      <PageHeader 
        title="Student Registry Directory"
        description="Search, filter, and audit verified student members. Manage registry lock statuses."
      />

      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* SIDEBAR FILTERS */}
        <Card className="lg:col-span-3 border shadow-sm">
          <CardContent className="p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between border-b pb-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
                <SlidersHorizontal className="size-4 text-primary" /> Filter Options
              </span>
              <button 
                onClick={resetFilters} 
                className="text-[10px] font-bold text-primary hover:underline cursor-pointer"
              >
                Clear All
              </button>
            </div>

            <div className="flex flex-col gap-3.5">
              {/* Institution */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Institution</label>
                <Select value={uniFilter} onValueChange={setUniFilter}>
                  <SelectTrigger className="h-8.5 text-xs">
                    <SelectValue placeholder="All Universities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Universities</SelectItem>
                    {UNIVERSITIES.map(u => (
                      <SelectItem key={u} value={u} className="text-xs">{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Department */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Faculty/Dept</label>
                <Select value={deptFilter} onValueChange={setDeptFilter}>
                  <SelectTrigger className="h-8.5 text-xs">
                    <SelectValue placeholder="All Departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Departments</SelectItem>
                    {DEPARTMENTS.map(d => (
                      <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Level */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Level</label>
                <Select value={levelFilter} onValueChange={setLevelFilter}>
                  <SelectTrigger className="h-8.5 text-xs">
                    <SelectValue placeholder="All Levels" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Levels</SelectItem>
                    {LEVELS.map(l => (
                      <SelectItem key={l} value={l} className="text-xs">{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* District */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Home District</label>
                <Select value={districtFilter} onValueChange={(val) => {
                  setDistrictFilter(val)
                  setChiefdomFilter("All")
                }}>
                  <SelectTrigger className="h-8.5 text-xs">
                    <SelectValue placeholder="All Districts" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Districts</SelectItem>
                    {DISTRICTS.map(d => (
                      <SelectItem key={d} value={d} className="text-xs">{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Chiefdom */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Home Chiefdom</label>
                <Select 
                  value={chiefdomFilter} 
                  onValueChange={setChiefdomFilter}
                  disabled={districtFilter === "All"}
                >
                  <SelectTrigger className="h-8.5 text-xs">
                    <SelectValue placeholder="All Chiefdoms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Chiefdoms</SelectItem>
                    {availableChiefdoms.map(c => (
                      <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Status */}
              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-semibold text-muted-foreground uppercase">Registry Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8.5 text-xs">
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Statuses</SelectItem>
                    <SelectItem value="active" className="text-xs">Active</SelectItem>
                    <SelectItem value="pending" className="text-xs">Pending</SelectItem>
                    <SelectItem value="expired" className="text-xs">Expired</SelectItem>
                    <SelectItem value="suspended" className="text-xs">Suspended</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* MAIN DATA TABLE */}
        <div className="lg:col-span-9 flex flex-col gap-4">
          <InputGroup className="w-full">
            <InputGroupAddon>
              <Search className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput 
              placeholder="Search by student name, ID, phone, email, skills..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </InputGroup>

          <Card className="border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-xs font-bold">Student Name</TableHead>
                    <TableHead className="text-xs font-bold">University</TableHead>
                    <TableHead className="text-xs font-bold">Department</TableHead>
                    <TableHead className="text-xs font-bold">Level</TableHead>
                    <TableHead className="text-xs font-bold">Status</TableHead>
                    <TableHead className="text-xs font-bold text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                        No student records match your criteria.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredStudents.map((s) => (
                      <TableRow key={s.id} className="hover:bg-muted/30">
                        <TableCell className="font-semibold text-xs py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div 
                              className="size-8.5 rounded-full flex items-center justify-center font-bold text-[10px] text-white shrink-0 shadow-sm"
                              style={{ backgroundColor: s.avatarColor }}
                            >
                              {s.fullName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-foreground leading-tight">{s.fullName}</span>
                              <span className="text-[10px] text-muted-foreground font-mono">{s.membershipNumber}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{s.university.split(" (")[0]}</TableCell>
                        <TableCell className="text-xs">{s.department}</TableCell>
                        <TableCell className="text-xs">{s.level}</TableCell>
                        <TableCell className="text-xs">
                          <StatusBadge status={s.status} />
                        </TableCell>
                        <TableCell className="text-xs text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="size-8 cursor-pointer"
                              onClick={() => {
                                setSelectedStudentId(s.id)
                                setActiveTab("profile")
                              }}
                              aria-label="View Details"
                            >
                              <Eye className="size-4 text-primary" />
                            </Button>
                            {s.status === "active" ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-destructive hover:bg-destructive/10 cursor-pointer"
                                onClick={() => handleActionClick(s.id, "suspend")}
                                title="Suspend Account"
                              >
                                <Ban className="size-4" />
                              </Button>
                            ) : s.status === "suspended" ? (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-emerald-500 hover:bg-emerald-500/10 cursor-pointer"
                                onClick={() => handleActionClick(s.id, "reactivate")}
                                title="Reactivate Account"
                              >
                                <CheckCircle className="size-4" />
                              </Button>
                            ) : null}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="p-3 border-t bg-muted/20 text-[10px] text-muted-foreground flex justify-between font-semibold">
              <span>Showing {filteredStudents.length} of {students.length} students</span>
              <span>NUKaFs Registry Office</span>
            </div>
          </Card>
        </div>
      </div>

      {/* STUDENT DETAIL DIALOG */}
      <Dialog open={!!selectedStudent} onOpenChange={(open) => !open && setSelectedStudentId(null)}>
        {selectedStudent && (
          <DialogContent className="max-w-2xl font-sans">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="font-heading text-lg font-bold flex items-center gap-2">
                {selectedStudent.fullName} Profile File
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Verified registration details, support requests, and request audit trail.
              </DialogDescription>
            </DialogHeader>

            {/* TAB SELECTOR */}
            <div className="flex border-b text-xs font-semibold mt-1">
              <button
                onClick={() => setActiveTab("profile")}
                className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${activeTab === "profile" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                Profile Details
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`px-4 py-2 border-b-2 transition-colors cursor-pointer ${activeTab === "history" ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
              >
                Audit &amp; Change Log
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="py-4 max-h-[480px] overflow-y-auto pr-1">
              {activeTab === "profile" ? (
                <div className="grid gap-6 md:grid-cols-12 text-xs">
                  {/* Left Column Info Card */}
                  <div className="md:col-span-4 flex flex-col items-center text-center bg-muted/25 border rounded-xl p-4 h-fit">
                    <div 
                      className="size-16 rounded-full flex items-center justify-center font-bold text-xl text-white mb-2 shadow-sm"
                      style={{ backgroundColor: selectedStudent.avatarColor }}
                    >
                      {selectedStudent.fullName.split(" ").map(n => n[0]).slice(0,2).join("")}
                    </div>
                    <span className="font-bold text-foreground text-sm truncate max-w-full">{selectedStudent.fullName}</span>
                    <span className="text-[10px] text-muted-foreground font-mono mt-0.5">{selectedStudent.membershipNumber}</span>
                    <div className="mt-3 flex flex-col gap-1 w-full items-center">
                      <StatusBadge status={selectedStudent.status} />
                      <span className="text-[10px] text-muted-foreground mt-1">Profile: <strong>{selectedStudent.profileCompletion}%</strong> Complete</span>
                    </div>
                    <div className="mt-4 pt-3 border-t w-full text-left flex flex-col gap-2 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1.5"><Mail className="size-3.5 text-primary" /> {selectedStudent.email}</span>
                      <span className="flex items-center gap-1.5"><Phone className="size-3.5 text-primary" /> {selectedStudent.phone}</span>
                    </div>
                  </div>

                  {/* Right Column details */}
                  <div className="md:col-span-8 flex flex-col gap-5">
                    {/* Academic */}
                    <div>
                      <h4 className="font-heading text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <BookOpen className="size-3.5" /> Academic Information
                      </h4>
                      <div className="grid grid-cols-2 gap-3.5 border rounded-xl p-3 bg-card shadow-xs">
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase">University</span>
                          <span className="font-semibold text-foreground">{selectedStudent.university || "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase">Faculty/Dept</span>
                          <span className="font-semibold text-foreground">{selectedStudent.department || "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase">Course of Study</span>
                          <span className="font-semibold text-foreground">{selectedStudent.course || "—"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase">Academic Level</span>
                          <span className="font-semibold text-foreground">{selectedStudent.level || "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Geography */}
                    <div>
                      <h4 className="font-heading text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <MapPin className="size-3.5" /> Regional Affiliation
                      </h4>
                      <div className="grid grid-cols-2 gap-3.5 border rounded-xl p-3 bg-card shadow-xs">
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase">Origin District</span>
                          <span className="font-semibold text-foreground">{selectedStudent.district}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase">Chiefdom</span>
                          <span className="font-semibold text-foreground">{selectedStudent.chiefdom || "—"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Support Needs */}
                    <div>
                      <h4 className="font-heading text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <HeartHandshake className="size-3.5" /> Program &amp; Support Requests
                      </h4>
                      <div className="grid grid-cols-2 gap-3.5 border rounded-xl p-3 bg-card shadow-xs">
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase">Scholarship Need</span>
                          <span className="font-semibold text-foreground">{selectedStudent.scholarshipApplicant ? "Applicant / Required" : "No Request"}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase">Employment Type</span>
                          <span className="font-semibold text-foreground">{selectedStudent.employmentStatus}</span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground block text-[9px] uppercase mb-1">Declared Member Skills</span>
                          <div className="flex flex-wrap gap-1">
                            {selectedStudent.skills.length > 0 ? selectedStudent.skills.map(sk => (
                              <Badge key={sk} variant="secondary" className="text-[9px]">{sk}</Badge>
                            )) : <span className="text-muted-foreground italic">None listed</span>}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Emergency Contact */}
                    <div>
                      <h4 className="font-heading text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-2">
                        <ShieldAlert className="size-3.5" /> Emergency Contacts
                      </h4>
                      <div className="grid grid-cols-2 gap-3.5 border rounded-xl p-3 bg-card shadow-xs">
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase">Contact Name</span>
                          <span className="font-semibold text-foreground">K. Sesay (Parent)</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground block text-[9px] uppercase">Contact Phone</span>
                          <span className="font-semibold text-foreground">+232 76 929 110</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4 text-xs">
                  {/* Registry log */}
                  <div>
                    <h4 className="font-heading text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <UserPlus className="size-3.5" /> Registration Log
                    </h4>
                    <div className="border rounded-xl p-3 bg-muted/20 flex flex-col gap-1.5">
                      <div className="flex justify-between">
                        <span className="font-semibold text-foreground">Verification Approval</span>
                        <span className="text-muted-foreground">Joined: {selectedStudent.joinedDate}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground leading-relaxed">
                        Account created by student. Identity and regional affiliation verification completed by executive committee.
                      </p>
                    </div>
                  </div>

                  {/* Profile corrections request list */}
                  <div>
                    <h4 className="font-heading text-[10px] font-bold text-primary uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <ClipboardEdit className="size-3.5" /> Profile Correction Requests
                    </h4>
                    {studentEditRequests.length === 0 ? (
                      <div className="border border-dashed rounded-xl p-8 text-center text-muted-foreground">
                        No profile corrections or update requests on file for this student.
                      </div>
                    ) : (
                      <div className="border rounded-xl overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="hover:bg-transparent bg-muted/10">
                              <TableHead className="text-[9px] font-bold uppercase py-2">Field</TableHead>
                              <TableHead className="text-[9px] font-bold uppercase py-2">Requested Correction</TableHead>
                              <TableHead className="text-[9px] font-bold uppercase py-2">Submitted</TableHead>
                              <TableHead className="text-[9px] font-bold uppercase py-2 text-right">Status</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {studentEditRequests.map((req) => (
                              <TableRow key={req.id} className="hover:bg-muted/10">
                                <TableCell className="font-semibold text-[10px] py-2">{req.field}</TableCell>
                                <TableCell className="text-[10px] py-2">
                                  <div className="flex items-center gap-1 text-muted-foreground">
                                    <span className="line-through">{req.oldValue}</span>
                                    <span>➔</span>
                                    <span className="text-foreground font-bold">{req.newValue}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-[10px] py-2 text-muted-foreground">{req.submittedDate}</TableCell>
                                <TableCell className="text-[10px] py-2 text-right">
                                  <RequestBadge status={req.status} />
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between border-t pt-3.5 mt-1">
              <div className="flex gap-1.5">
                {selectedStudent.status === "active" ? (
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    onClick={() => handleActionClick(selectedStudent.id, "suspend")}
                    className="cursor-pointer"
                  >
                    <Ban className="size-3.5 mr-1" /> Suspend Registry Account
                  </Button>
                ) : selectedStudent.status === "suspended" ? (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={() => handleActionClick(selectedStudent.id, "reactivate")}
                    className="bg-emerald-600 hover:bg-emerald-500 cursor-pointer"
                  >
                    <CheckCircle className="size-3.5 mr-1" /> Reactivate Account
                  </Button>
                ) : null}
              </div>
              <Button size="sm" onClick={() => setSelectedStudentId(null)}>
                Close Record
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* CONFIRMATION DIALOG MODAL */}
      <Dialog open={!!confirmAction} onOpenChange={(open) => !open && setConfirmAction(null)}>
        {confirmAction && (
          <DialogContent className="max-w-sm font-sans">
            <DialogHeader className="gap-2">
              <DialogTitle className="font-heading text-base font-bold flex items-center gap-2 text-destructive">
                <AlertTriangle className="size-5" />
                Confirm Account Modification
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                Are you sure you want to <span className="font-bold text-foreground">{confirmAction.action}</span> the registry account for <strong>{students.find(s => s.id === confirmAction.id)?.fullName}</strong>?
              </DialogDescription>
            </DialogHeader>

            <div className="flex justify-end gap-3 pt-3 border-t mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmAction(null)}
              >
                Cancel
              </Button>
              <Button
                variant={confirmAction.action === "suspend" ? "destructive" : "default"}
                size="sm"
                onClick={handleConfirmAction}
              >
                Confirm {confirmAction.action === "suspend" ? "Suspension" : "Activation"}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
