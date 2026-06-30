"use client"

import { useState } from "react"
import { 
  Key, Save, ShieldCheck, CheckCircle2, XCircle, ChevronDown, ChevronUp, AlertCircle
} from "lucide-react"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { readStorage, writeStorage } from "@/lib/storage/persistence"
import { STORAGE_KEYS } from "@/lib/constants/storage-keys"

type Role = "student" | "executive" | "administrator" | "stakeholder" | "super_admin"

const ROLES: { id: Role; label: string; color: string; bg: string; summary: string }[] = [
  { id: "student", label: "Student", color: "text-muted-foreground", bg: "bg-muted/10", summary: "Can manage only their own profile and access student services." },
  { id: "executive", label: "Executive", color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-950/20", summary: "Can manage students, announcements, opportunities, events, memberships, reports, and analytics." },
  { id: "administrator", label: "Administrator", color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-950/20", summary: "Has all Executive permissions with additional management capabilities delegated by the Super Admin." },
  { id: "stakeholder", label: "Stakeholder", color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-950/20", summary: "Read-only access to dashboards, reports, analytics, and student information." },
  { id: "super_admin", label: "Super Admin", color: "text-destructive", bg: "bg-destructive/10", summary: "Full unrestricted access to every module, every page, every setting, and all role management features." },
]

const PERM_CATEGORIES = [
  {
    id: "student_mgt", title: "Student Management",
    perms: [
      { id: "view_students", label: "View Students" },
      { id: "view_profiles", label: "View Student Profiles" },
      { id: "approve_regs", label: "Approve Registrations" },
      { id: "approve_updates", label: "Approve Profile Update Requests" },
      { id: "suspend_students", label: "Suspend Students" },
      { id: "reactivate_students", label: "Reactivate Students" }
    ]
  },
  {
    id: "membership_mgt", title: "Membership Management",
    perms: [
      { id: "view_memberships", label: "View Memberships" },
      { id: "approve_memberships", label: "Approve Memberships" },
      { id: "suspend_memberships", label: "Suspend Memberships" },
      { id: "generate_cards", label: "Generate Membership Cards" }
    ]
  },
  {
    id: "content_mgt", title: "Content Management",
    perms: [
      { id: "manage_announcements", label: "Manage Announcements" },
      { id: "manage_opportunities", label: "Manage Opportunities" },
      { id: "manage_events", label: "Manage Events" }
    ]
  },
  {
    id: "reports_analytics", title: "Reports & Analytics",
    perms: [
      { id: "view_reports", label: "View Reports" },
      { id: "export_reports", label: "Export Reports" },
      { id: "view_analytics", label: "View Analytics Dashboard" }
    ]
  },
  {
    id: "exec_mgt", title: "Executive Management",
    perms: [
      { id: "view_exec_team", label: "View Executive Team" },
      { id: "manage_exec_accounts", label: "Manage Executive Accounts" }
    ]
  },
  {
    id: "stakeholder_mgt", title: "Stakeholder Management",
    perms: [
      { id: "view_stakeholders", label: "View Stakeholders" },
      { id: "manage_stakeholders", label: "Manage Stakeholder Accounts" }
    ]
  },
  {
    id: "platform_admin", title: "Platform Administration",
    perms: [
      { id: "manage_roles", label: "Manage User Roles" },
      { id: "manage_perms", label: "Manage Permissions" },
      { id: "manage_univs", label: "Manage Universities" },
      { id: "manage_faculties", label: "Manage Faculties" },
      { id: "manage_depts", label: "Manage Departments" },
      { id: "manage_courses", label: "Manage Courses" },
      { id: "manage_settings", label: "Manage System Settings" },
      { id: "access_audit", label: "Access Audit Logs" },
      { id: "access_security", label: "Access Security Center" },
      { id: "access_backup", label: "Access Backup & Recovery" },
      { id: "access_health", label: "Access System Health" }
    ]
  }
]

type PermState = Record<Role, Record<string, boolean>>

function buildDefaultPerms(): PermState {
  const state = {} as PermState
  for (const role of ROLES) {
    state[role.id] = {}
    for (const cat of PERM_CATEGORIES) {
      for (const p of cat.perms) {
        state[role.id][p.id] = role.id === "super_admin"
      }
    }
  }

  // Pre-fill some sensible defaults based on requirements
  const setPerm = (role: Role, perms: string[]) => perms.forEach(p => state[role][p] = true)

  setPerm("executive", [
    "view_students", "view_profiles", "approve_regs", "approve_updates", "suspend_students", "reactivate_students",
    "view_memberships", "approve_memberships", "suspend_memberships", "generate_cards",
    "manage_announcements", "manage_opportunities", "manage_events",
    "view_reports", "export_reports", "view_analytics",
    "view_exec_team"
  ])

  setPerm("administrator", [
    "view_students", "view_profiles", "approve_regs", "approve_updates", "suspend_students", "reactivate_students",
    "view_memberships", "approve_memberships", "suspend_memberships", "generate_cards",
    "manage_announcements", "manage_opportunities", "manage_events",
    "view_reports", "export_reports", "view_analytics",
    "view_exec_team", "manage_exec_accounts",
    "view_stakeholders", "manage_stakeholders",
    "manage_univs", "manage_faculties", "manage_depts", "manage_courses"
  ])

  setPerm("stakeholder", [
    "view_students", "view_profiles", "view_memberships", "view_reports", "export_reports", "view_analytics"
  ])

  return state
}

export default function PermissionsPage() {
  const [selectedRole, setSelectedRole] = useState<Role>("executive")
  const [perms, setPerms] = useState<PermState>(() =>
    readStorage(STORAGE_KEYS.permissionMatrix, buildDefaultPerms()),
  )
  const [savedPerms, setSavedPerms] = useState<PermState>(() =>
    readStorage(STORAGE_KEYS.permissionMatrix, buildDefaultPerms()),
  )
  const [expandedCats, setExpandedCats] = useState<string[]>(PERM_CATEGORIES.map(c => c.id))
  const [confirmOpen, setConfirmOpen] = useState(false)

  const activeRoleData = ROLES.find(r => r.id === selectedRole)!
  const isSuperAdmin = selectedRole === "super_admin"

  const toggleCategory = (id: string) => {
    setExpandedCats(prev => prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id])
  }

  const togglePerm = (permId: string) => {
    if (isSuperAdmin) return
    setPerms(prev => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        [permId]: !prev[selectedRole][permId]
      }
    }))
  }

  const changes = []
  for (const role of ROLES) {
    for (const cat of PERM_CATEGORIES) {
      for (const p of cat.perms) {
        if (perms[role.id][p.id] !== savedPerms[role.id][p.id]) {
          changes.push({ role: role.label, perm: p.label, granted: perms[role.id][p.id] })
        }
      }
    }
  }

  const handleSave = () => {
    const next = JSON.parse(JSON.stringify(perms)) as PermState
    setSavedPerms(next)
    writeStorage(STORAGE_KEYS.permissionMatrix, next)
    setConfirmOpen(false)
    toast.success("Permissions saved successfully.")
  }

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-5xl mx-auto">
      <PageHeader
        title="Permission Matrix"
        description="Select a role to configure its access privileges across the registry."
        action={
          <Button onClick={() => setConfirmOpen(true)} disabled={changes.length === 0} className="gap-2">
            <Save className="size-4" /> Save Permissions
          </Button>
        }
      />

      {/* Role Selection */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {ROLES.map(role => (
          <button
            key={role.id}
            onClick={() => setSelectedRole(role.id)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center transition-all ${
              selectedRole === role.id ? `border-${role.color.replace('text-', '')} ring-2 ring-${role.color.replace('text-', '')}/20 ${role.bg}` : "hover:bg-muted/50"
            }`}
          >
            <ShieldCheck className={`size-6 mb-2 ${selectedRole === role.id ? role.color : "text-muted-foreground"}`} />
            <span className={`text-sm font-bold ${selectedRole === role.id ? role.color : ""}`}>{role.label}</span>
          </button>
        ))}
      </div>

      {/* Active Role Summary & Permissions */}
      <div className="flex flex-col md:flex-row gap-6">
        <div className="md:w-1/3">
           <Card className={`border shadow-sm sticky top-6 ${activeRoleData.bg}`}>
             <CardContent className="p-6">
               <h3 className={`text-lg font-bold mb-2 ${activeRoleData.color}`}>{activeRoleData.label}</h3>
               <p className="text-sm text-muted-foreground leading-relaxed">
                 {activeRoleData.summary}
               </p>
               {isSuperAdmin && (
                 <div className="mt-4 p-3 bg-destructive/10 text-destructive text-xs rounded-lg flex items-start gap-2 font-semibold">
                    <AlertCircle className="size-4 shrink-0 mt-0.5" />
                    Super Admin permissions are hardcoded and cannot be modified.
                 </div>
               )}
             </CardContent>
           </Card>
        </div>
        
        <div className="md:w-2/3 flex flex-col gap-4">
          {PERM_CATEGORIES.map(cat => {
            const isExpanded = expandedCats.includes(cat.id)
            return (
              <Card key={cat.id} className="border shadow-sm overflow-hidden">
                <button 
                  className="w-full flex items-center justify-between p-4 bg-muted/5 hover:bg-muted/10 transition-colors border-b"
                  onClick={() => toggleCategory(cat.id)}
                >
                  <h4 className="font-bold text-sm">{cat.title}</h4>
                  {isExpanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
                </button>
                {isExpanded && (
                  <CardContent className="p-0 divide-y divide-border/50">
                    {cat.perms.map(p => {
                      const isGranted = perms[selectedRole][p.id]
                      return (
                        <div key={p.id} className="flex items-center justify-between p-4 bg-background">
                          <span className="text-sm">{p.label}</span>
                          <button 
                            disabled={isSuperAdmin}
                            onClick={() => togglePerm(p.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                              isGranted 
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-400" 
                                : "bg-destructive/10 text-destructive"
                            } ${isSuperAdmin ? "opacity-70 cursor-not-allowed" : "hover:opacity-80"}`}
                          >
                            {isGranted ? (
                              <><CheckCircle2 className="size-3.5" /> Allowed</>
                            ) : (
                              <><XCircle className="size-3.5" /> Denied</>
                            )}
                          </button>
                        </div>
                      )
                    })}
                  </CardContent>
                )}
              </Card>
            )
          })}
        </div>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md font-sans">
          <DialogHeader>
            <DialogTitle>Confirm Permission Changes</DialogTitle>
            <DialogDescription>Review the modifications before applying them globally.</DialogDescription>
          </DialogHeader>
          <div className="h-[250px] w-full rounded-md border p-4 bg-muted/10 overflow-y-auto">
            {changes.map((c, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b last:border-0">
                <div>
                  <span className="text-xs font-bold text-muted-foreground uppercase">{c.role}</span>
                  <p className="text-sm font-semibold">{c.perm}</p>
                </div>
                {c.granted ? (
                  <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-400">Granted</Badge>
                ) : (
                  <Badge variant="destructive">Revoked</Badge>
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-end gap-2 mt-4">
             <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancel</Button>
             <Button onClick={handleSave}>Confirm & Save</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
