"use client"

import {
  LayoutDashboard,
  Users,
  UserCheck,
  ClipboardEdit,
  FileBarChart,
  Megaphone,
  Briefcase,
  CalendarDays,
  IdCard,
  User,
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { PortalLayout } from "@/components/shared/portal-layout"

const EXECUTIVE_ROLES = ["executive", "super_admin"] as const

export default function ExecutiveLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentRole, currentUser, isHydrated } = useAppState()

  const execNavSections = [
    {
      label: "Operations",
      items: [
        { title: "Summary", href: "/executive", icon: LayoutDashboard },
        {
          title: "Student Directory",
          href: "/executive/students",
          icon: Users,
        },
        {
          title: "Pending Registrations",
          href: "/executive/approvals",
          icon: UserCheck,
          badge: "Pending",
        },
        {
          title: "Profile Editor",
          href: "/executive/profile/edit",
          icon: ClipboardEdit,
        },
      ],
    },
    {
      label: "Registry Programs",
      items: [
        {
          title: "Announcements",
          href: "/executive/announcements",
          icon: Megaphone,
        },
        {
          title: "Opportunities",
          href: "/executive/opportunities",
          icon: Briefcase,
        },
        {
          title: "Events Manager",
          href: "/executive/events",
          icon: CalendarDays,
        },
      ],
    },
    {
      label: "Analytics & Reports",
      items: [
        {
          title: "Export Center",
          href: "/executive/reports",
          icon: FileBarChart,
        },
      ],
    },
    {
      label: "Identity",
      items: [
        {
          title: "Profile Registry",
          href: "/executive/profile",
          icon: User,
        },
        {
          title: "Membership Card",
          href: "/executive/membership-card",
          icon: IdCard,
        },
      ],
    },
  ]

  return (
    <PortalLayout
      role={currentRole}
      allowedRoles={[...EXECUTIVE_ROLES]}
      isHydrated={isHydrated}
      loadingMessage="Checking executive access..."
    >
      <DashboardShell
        portalPrefix="/executive"
        sections={execNavSections}
        user={{
          name: currentUser?.name || "Executive Member",
          email: currentUser?.email || "exec@NUKAFS.org",
          roleLabel: `Executive: ${currentUser?.title || "Union Executive"}`,
        }}
        headerTitle="Executive Operations Center"
      >
        {children}
      </DashboardShell>
    </PortalLayout>
  )
}
