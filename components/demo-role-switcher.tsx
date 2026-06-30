"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { ShieldAlert, Users, Shield, GraduationCap, Eye, UserCheck, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAppState, AppRole } from "@/lib/context/app-state-context"
import { cn } from "@/lib/utils"

export function DemoRoleSwitcher() {
  const { currentRole, switchRole } = useAppState()
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const roles: { role: AppRole; label: string; icon: any; color: string; path: string }[] = [
    {
      role: "student_pending",
      label: "Student (Pending Approval)",
      icon: UserCheck,
      color: "text-amber-500 bg-amber-500/10 border-amber-500/20",
      path: "/login"
    },
    {
      role: "student_active_wizard",
      label: "Student (Needs Profile)",
      icon: GraduationCap,
      color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
      path: "/dashboard/profile"
    },
    {
      role: "student_active_complete",
      label: "Student (Approved & Done)",
      icon: GraduationCap,
      color: "text-primary bg-primary/10 border-primary/20",
      path: "/dashboard"
    },
    {
      role: "executive",
      label: "Executive (Manage)",
      icon: Users,
      color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
      path: "/executive"
    },
    {
      role: "stakeholder",
      label: "Stakeholder (Read-Only)",
      icon: Eye,
      color: "text-indigo-500 bg-indigo-500/10 border-indigo-500/20",
      path: "/stakeholder"
    },
    {
      role: "super_admin",
      label: "Super Admin",
      icon: ShieldAlert,
      color: "text-rose-500 bg-rose-500/10 border-rose-500/20",
      path: "/admin"
    }
  ]

  const handleRoleChange = (role: AppRole, path: string) => {
    switchRole(role)
    setIsOpen(false)
    router.push(path)
  }

  // Find the active role definition
  const activeRoleDef = roles.find((r) => r.role === currentRole)

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 font-sans">
      {isOpen && (
        <div className="flex flex-col gap-2 rounded-xl border bg-card/95 p-3.5 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 w-72">
          <div className="flex items-center justify-between border-b pb-2 mb-1.5">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Demo Role Switcher</span>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <RefreshCw className="size-2.5 animate-spin" /> Interactive
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {roles.map((r) => {
              const Icon = r.icon
              const isSelected = r.role === currentRole
              return (
                <button
                  key={r.role}
                  onClick={() => handleRoleChange(r.role, r.path)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg border p-2 text-left text-xs font-medium transition-all hover:bg-muted/70",
                    isSelected ? "border-primary bg-primary/5 text-primary" : "border-transparent text-foreground"
                  )}
                >
                  <div className={cn("flex size-7 shrink-0 items-center justify-center rounded-md border", r.color)}>
                    <Icon className="size-4" />
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="truncate">{r.label}</span>
                    <span className="text-[10px] text-muted-foreground truncate">{r.path}</span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "size-12 rounded-full shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-all cursor-pointer p-0",
          isOpen ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : "bg-primary text-primary-foreground"
        )}
        aria-label="Toggle Demo Role Switcher"
      >
        {isOpen ? (
          <span className="font-bold text-lg leading-none">&times;</span>
        ) : (
          <Shield className="size-5 animate-pulse" />
        )}
      </Button>
    </div>
  )
}
