"use client"

import {
  BarChart3,
  BookOpen,
  Users,
  ShieldCheck,
  LayoutDashboard,
  MapPin,
  HeartHandshake,
  PieChart,
  FileBarChart,
  Megaphone,
  Calendar,
  Bell,
  Lightbulb,
  User,
  LifeBuoy,
  IdCard,
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
        { title: "Overview", href: "/stakeholder", icon: LayoutDashboard },
        {
          title: "Student Insights",
          href: "/stakeholder/insights",
          icon: Lightbulb,
        },
        {
          title: "Student Directory",
          href: "/stakeholder/directory",
          icon: Users,
        },
      ],
    },
    {
      label: "Demographics",
      items: [
        { title: "Education", href: "/stakeholder/education", icon: BookOpen },
        {
          title: "Geographical Dist.",
          href: "/stakeholder/geography",
          icon: MapPin,
        },
      ],
    },
    {
      label: "Engagement",
      items: [
        {
          title: "Opportunities & Support",
          href: "/stakeholder/opportunities",
          icon: HeartHandshake,
        },
        {
          title: "Announcements",
          href: "/stakeholder/announcements",
          icon: Megaphone,
        },
        { title: "Events", href: "/stakeholder/events", icon: Calendar },
      ],
    },
    {
      label: "Analytics & Reports",
      items: [
        { title: "Analytics", href: "/stakeholder/analytics", icon: PieChart },
        { title: "Reports", href: "/stakeholder/reports", icon: FileBarChart },
        {
          title: "Membership Analytics",
          href: "/stakeholder/membership",
          icon: BarChart3,
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
        { title: "Profile Registry", href: "/stakeholder/profile", icon: User },
        { title: "Membership Card", href: "/stakeholder/membership-card", icon: IdCard },
        {
          title: "Role & Permissions",
          href: "/stakeholder/permissions",
          icon: ShieldCheck,
        },
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
          email: currentUser?.email || "stakeholder@NUKAFS.org",
          roleLabel: "Stakeholder / Partner",
        }}
        headerTitle="Stakeholder Intelligence Portal"
      >
        {children}
      </DashboardShell>
    </PortalLayout>
  )
}
