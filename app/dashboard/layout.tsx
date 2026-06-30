"use client"

import {
  LayoutDashboard,
  User,
  ClipboardList,
  IdCard,
  Bell,
  Award,
  CalendarDays,
  Settings,
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { PortalLayout } from "@/components/shared/portal-layout"

const STUDENT_ROLES = [
  "student_pending",
  "student_active_wizard",
  "student_active_complete",
  "super_admin",
] as const

export default function StudentDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentRole, currentUser, isHydrated } = useAppState()

  const studentNavSections = [
    {
      label: "Workspace",
      items: [
        { title: "Overview", href: "/dashboard", icon: LayoutDashboard },
        { title: "Profile Registry", href: "/dashboard/profile", icon: User },
        {
          title: "Edit Profile",
          href: "/dashboard/profile/edit",
          icon: ClipboardList,
        },
        {
          title: "Membership Card",
          href: "/dashboard/membership-card",
          icon: IdCard,
        },
      ],
    },
    {
      label: "Resources",
      items: [
        {
          title: "Announcements",
          href: "/dashboard/announcements",
          icon: Bell,
        },
        {
          title: "Opportunities",
          href: "/dashboard/opportunities",
          icon: Award,
        },
        {
          title: "Events & Fairs",
          href: "/dashboard/events",
          icon: CalendarDays,
        },
        { title: "Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ]

  const userDisplayName =
    currentUser?.fullName || currentUser?.name || "Student Member"
  const userDisplayEmail = currentUser?.email || "student@NUKAFS.org"
  const membershipNo = currentUser?.membershipNumber || "Pending Setup"

  return (
    <PortalLayout
      role={currentRole}
      allowedRoles={[...STUDENT_ROLES]}
      isHydrated={isHydrated}
      loadingMessage="Redirecting to login..."
    >
      <DashboardShell
        portalPrefix="/dashboard"
        sections={studentNavSections}
        user={{
          name: userDisplayName,
          email: userDisplayEmail,
          roleLabel: `Student (${membershipNo})`,
        }}
        headerTitle="Student Workspace"
      >
        {children}
      </DashboardShell>
    </PortalLayout>
  )
}
