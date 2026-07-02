"use client"

import { useState } from "react"
import {
  Users,
  UserPlus,
  UserCog,
  Mail,
  Shield,
  Pencil,
  Trash2,
  Ban,
  CheckCircle,
  Search,
  Clock,
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader, StatCard } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
// Local minimal types for team members (backend-provided shapes)
type Role = "student" | "executive" | "stakeholder" | "super_admin"

type TeamMember = {
  id: string
  name: string
  email: string
  role: Role
  title: string
  status: "active" | "invited" | "disabled"
  lastActive?: string
}

const ROLE_BADGE: Record<Role, { label: string; className: string }> = {
  student: { label: "Student", className: "bg-muted text-muted-foreground border-muted-foreground/20" },
  executive: { label: "Executive", className: "bg-primary/10 text-primary border-primary/20" },
  stakeholder: { label: "Stakeholder", className: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800" },
  super_admin: { label: "Super Admin", className: "bg-destructive/10 text-destructive border-destructive/20" },
}

const STATUS_BADGE: Record<TeamMember["status"], { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800" },
  invited: { label: "Invited", className: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800" },
  disabled: { label: "Disabled", className: "bg-muted text-muted-foreground border-muted-foreground/20" },
}

const EMPTY_FORM = { name: "", email: "", role: "executive" as Role, title: "", status: "invited" as TeamMember["status"] }

export default function TeamPage() {
  const { teamMembers, addTeamMember, editTeamMember, deleteTeamMember, addAuditLogEntry } = useAppState()

  const [search, setSearch] = useState("")
  const [inviteOpen, setInviteOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [toggleOpen, setToggleOpen] = useState(false)
  const [form, setForm] = useState(EMPTY_FORM)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [creatingAccount, setCreatingAccount] = useState(false)
  const [createForm, setCreateForm] = useState({ fullName: "", email: "", role: "executive" as Role, title: "" })
  const [createdMessage, setCreatedMessage] = useState("")

  const filtered = teamMembers.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.title.toLowerCase().includes(search.toLowerCase())
  )

  const totalExecs = teamMembers.filter((m) => m.role === "executive").length
  const activeStakeholders = teamMembers.filter((m) => m.role === "stakeholder" && m.status === "active").length
  const pendingInvites = teamMembers.filter((m) => m.status === "invited").length

  async function handleInvite() {
    if (!form.name.trim() || !form.email.trim() || !form.title.trim()) {
      toast.error("Please fill in all required fields.")
      return
    }

    try {
      const response = await fetch("/api/admin/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.name,
          email: form.email,
          role: form.role,
          title: form.title,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Unable to issue invitation")
      }

      addTeamMember({
        name: form.name,
        email: form.email,
        role: form.role,
        title: form.title,
        status: "active",
        lastActive: "Just now",
      })

      toast.success(`Portal access created for ${form.email}`)
      setForm(EMPTY_FORM)
      setInviteOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to issue invitation")
    }
  }

  async function handleCreateAccount() {
    if (!createForm.fullName.trim() || !createForm.email.trim()) {
      toast.error("Please provide a full name and email address.")
      return
    }

    setCreatingAccount(true)
    setCreatedMessage("")

    try {
      const response = await fetch("/api/admin/create-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: createForm.fullName,
          email: createForm.email,
          role: createForm.role,
          title: createForm.title,
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create account")
      }

      setCreatedMessage(result.message || "")
      addTeamMember({
        name: createForm.fullName,
        email: createForm.email,
        role: createForm.role,
        title: createForm.title,
        status: "active",
        lastActive: "Just now",
      })
      toast.success(`Admin account created for ${createForm.email}`)
      setCreateForm({ fullName: "", email: "", role: "executive", title: "" })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create account")
    } finally {
      setCreatingAccount(false)
    }
  }

  function openEdit(member: TeamMember) {
    setSelectedMember(member)
    setForm({ name: member.name, email: member.email, role: member.role, title: member.title, status: member.status })
    setEditOpen(true)
  }

  function handleEdit() {
    if (!selectedMember) return
    if (!form.name.trim() || !form.email.trim() || !form.title.trim()) {
      toast.error("Please fill in all required fields.")
      return
    }
    editTeamMember(selectedMember.id, { name: form.name, email: form.email, role: form.role, title: form.title })
    toast.success(`${form.name} has been updated.`)
    setEditOpen(false)
    setSelectedMember(null)
  }

  function openDelete(member: TeamMember) {
    setSelectedMember(member)
    setDeleteOpen(true)
  }

  function handleDelete() {
    if (!selectedMember) return
    deleteTeamMember(selectedMember.id)
    toast.success(`${selectedMember.name} has been removed.`)
    setDeleteOpen(false)
    setSelectedMember(null)
  }

  function openToggle(member: TeamMember) {
    setSelectedMember(member)
    setToggleOpen(true)
  }

  function handleToggle() {
    if (!selectedMember) return
    const newStatus: TeamMember["status"] = selectedMember.status === "disabled" ? "active" : "disabled"
    editTeamMember(selectedMember.id, { status: newStatus })
    addAuditLogEntry(
      "Super Admin",
      newStatus === "disabled" ? "disabled team member" : "re-enabled team member",
      selectedMember.name,
      "update"
    )
    toast.success(`${selectedMember.name} has been ${newStatus === "disabled" ? "disabled" : "re-enabled"}.`)
    setToggleOpen(false)
    setSelectedMember(null)
  }

  return (
    <div className="flex flex-col gap-6 pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="Team Access Manager"
        description="Manage executive and stakeholder access to the NUKaFs Registry admin portal."
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => { setCreateForm({ fullName: "", email: "", role: "executive", title: "" }); setCreatedMessage(""); setCreateOpen(true) }} className="gap-2">
              <Shield className="size-4" />
              Create Admin
            </Button>
            <Button onClick={() => { setForm(EMPTY_FORM); setInviteOpen(true) }} className="gap-2">
              <UserPlus className="size-4" />
              Invite Member
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total Executives" value={totalExecs} icon={UserCog} hint="admin write access" />
        <StatCard label="Active Stakeholders" value={activeStakeholders} icon={Shield} hint="analytics read access" />
        <StatCard label="Pending Invites" value={pendingInvites} icon={Mail} hint="awaiting acceptance" />
      </div>

      {/* Table */}
      <Card className="border shadow-sm">
        <CardHeader className="p-5 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base">Team Members</CardTitle>
              <CardDescription className="mt-0.5">{teamMembers.length} total members with portal access</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search members..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10 text-muted-foreground text-sm">
                    No team members found.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((member) => {
                const roleBadge = ROLE_BADGE[member.role]
                const statusBadge = STATUS_BADGE[member.status]
                const isDisabled = member.status === "disabled"
                return (
                  <TableRow key={member.id} className={isDisabled ? "opacity-60" : ""}>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{member.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={roleBadge.className}>
                        {roleBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{member.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusBadge.className}>
                        {statusBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {member.lastActive}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(member)} title="Edit">
                          <Pencil className="size-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openToggle(member)}
                          title={isDisabled ? "Enable" : "Disable"}
                          className={isDisabled ? "text-emerald-600 hover:text-emerald-700" : "text-amber-600 hover:text-amber-700"}
                        >
                          {isDisabled ? <CheckCircle className="size-3.5" /> : <Ban className="size-3.5" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDelete(member)}
                          title="Delete"
                          className="text-destructive hover:text-destructive"
                          disabled={member.role === "super_admin"}
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Admin Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create Admin Account</DialogTitle>
            <DialogDescription>Create a portal admin account with a temporary password and a ready-to-send login message.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Full Name <span className="text-destructive">*</span></label>
              <Input placeholder="e.g. Aminata Bangura" value={createForm.fullName} onChange={(e) => setCreateForm({ ...createForm, fullName: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Email Address <span className="text-destructive">*</span></label>
              <Input type="email" placeholder="e.g. aminata@NUKaFs.org" value={createForm.email} onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Role</label>
              <Select value={createForm.role} onValueChange={(v) => setCreateForm({ ...createForm, role: v as Role })}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="stakeholder">Stakeholder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Title / Position</label>
              <Input placeholder="e.g. Operations Lead" value={createForm.title} onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })} />
            </div>
            {createdMessage ? (
              <div className="rounded-lg border bg-muted/40 p-3">
                <p className="text-sm font-medium mb-2">Ready-to-send message</p>
                <Textarea readOnly value={createdMessage} className="min-h-32 bg-background" />
              </div>
            ) : null}
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Close</Button>
              <Button onClick={handleCreateAccount} disabled={creatingAccount}>
                {creatingAccount ? "Creating..." : "Create Account"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite New Team Member</DialogTitle>
            <DialogDescription>Send a portal access invitation to a new executive or stakeholder.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Full Name <span className="text-destructive">*</span></label>
              <Input placeholder="e.g. Aminata Bangura" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Email Address <span className="text-destructive">*</span></label>
              <Input type="email" placeholder="e.g. aminata@NUKaFs.org" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Role <span className="text-destructive">*</span></label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="stakeholder">Stakeholder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Title / Position <span className="text-destructive">*</span></label>
              <Input placeholder="e.g. General Secretary" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setInviteOpen(false)}>Cancel</Button>
              <Button onClick={handleInvite}>Send Invitation</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>Update the details for {selectedMember?.name}.</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 pt-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Full Name</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Email Address</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Role</label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v as Role })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="executive">Executive</SelectItem>
                  <SelectItem value="stakeholder">Stakeholder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium">Title / Position</label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={handleEdit}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Toggle Disable Confirmation Dialog */}
      <Dialog open={toggleOpen} onOpenChange={setToggleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedMember?.status === "disabled" ? "Re-enable" : "Disable"} Access</DialogTitle>
            <DialogDescription>
              {selectedMember?.status === "disabled"
                ? `This will restore portal access for ${selectedMember?.name}. They will be able to log in again.`
                : `This will immediately revoke portal access for ${selectedMember?.name}. They will not be able to log in until re-enabled.`}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setToggleOpen(false)}>Cancel</Button>
            <Button
              variant={selectedMember?.status === "disabled" ? "default" : "destructive"}
              onClick={handleToggle}
            >
              {selectedMember?.status === "disabled" ? "Re-enable Access" : "Disable Access"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Team Member</DialogTitle>
            <DialogDescription>
              Are you sure you want to permanently remove <strong>{selectedMember?.name}</strong> from the team?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="size-4 mr-1.5" />
              Remove Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
