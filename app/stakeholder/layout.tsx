"use client"

import {
  LayoutDashboard,
  FileBarChart,
  Megaphone,
  Calendar,
  Bell,
  Lightbulb,
  UserRound,
  LifeBuoy,
  BriefcaseBusiness,
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { PortalLayout } from "@/components/shared/portal-layout"

const STAKEHOLDER_ROLES = ["stakeholder", "super_admin"] as const

export default function StakeholderLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentRole, currentUser, isHydrated } = useAppState()

  const navSections = [
    {
      label: "Intelligence",
      items: [
        { title: "Dashboard", href: "/stakeholder", icon: LayoutDashboard },
        {
          title: "Member Insights",
          href: "/stakeholder/insights",
          icon: Lightbulb,
        },
        {
          title: "Opportunities",
          href: "/stakeholder/opportunities",
          icon: BriefcaseBusiness,
        },
      ],
    },
    {
      label: "Reporting",
      items: [
        {
          title: "Reports & Exports",
          href: "/stakeholder/reports",
          icon: FileBarChart,
        },
        {
          title: "Announcements & Events",
          href: "/stakeholder/announcements",
          icon: Megaphone,
        },
      ],
    },
    {
      label: "Personal",
      items: [
        {
          title: "Notifications",
          href: "/stakeholder/notifications",
          icon: Bell,
        },
        { title: "My Profile", href: "/stakeholder/profile", icon: UserRound },
        {
          title: "Help & Support",
          href: "/stakeholder/support",
          icon: LifeBuoy,
        },
      ],
    },
  ]

  return (
    <PortalLayout
      role={currentRole}
      allowedRoles={[...STAKEHOLDER_ROLES]}
      isHydrated={isHydrated}
      loadingMessage="Redirecting to login..."
    >
      <DashboardShell
        portalPrefix="/stakeholder"
        sections={navSections}
        user={{
          name: currentUser?.name || "Stakeholder",
          email: currentUser?.email || "stakeholder@NUKaFs.org",
          roleLabel: "Stakeholder / Partner",
          profilePhotoUrl: currentUser?.profilePhotoUrl || currentUser?.profilePhoto,
        }}
        headerTitle="Stakeholder Intelligence Portal"
      >
        {children}
      </DashboardShell>
    </PortalLayout>
  )
}
