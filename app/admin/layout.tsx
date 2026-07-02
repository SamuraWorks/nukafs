"use client"

import {
  ShieldCheck,
  Users,
  User,
  ClipboardList,
  Activity,
  Settings,
  Key,
  Lock,
  Database,
  GraduationCap,
  FileBarChart,
  IdCard,
  MapPin,
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { PortalLayout } from "@/components/shared/portal-layout"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentRole, currentUser, isHydrated } = useAppState()

  const navSections = [
    {
      label: "Platform Control",
      items: [
        { title: "Overview", href: "/admin", icon: ShieldCheck },
        { title: "System Health", href: "/admin/health", icon: Activity },
        { title: "Security Center", href: "/admin/security", icon: Lock },
        { title: "Audit Log", href: "/admin/audit", icon: ClipboardList },
      ],
    },
    {
      label: "User Access",
      items: [
        { title: "Team Members", href: "/admin/team", icon: Users },
        {
          title: "Permissions Matrix",
          href: "/admin/permissions",
          icon: Key,
        },
      ],
    },
    {
      label: "Registry & Core",
      items: [
        {
          title: "Geographic Registry",
          href: "/admin/geography",
          icon: MapPin,
        },
        {
          title: "Universities Manager",
          href: "/admin/universities",
          icon: GraduationCap,
        },
        { title: "System Settings", href: "/admin/settings", icon: Settings },
        {
          title: "Backup & Recovery",
          href: "/admin/backup",
          icon: Database,
        },
        {
          title: "Profile Registry",
          href: "/admin/profile",
          icon: User,
        },
        {
          title: "Membership Card",
          href: "/admin/membership-card",
          icon: IdCard,
        },
        {
          title: "Platform Reports",
          href: "/admin/reports",
          icon: FileBarChart,
        },
      ],
    },
  ]

  return (
    <PortalLayout
      role={currentRole}
      allowedRoles={["super_admin"]}
      isHydrated={isHydrated}
      loadingMessage="Checking permissions..."
    >
      <DashboardShell
        portalPrefix="/admin"
        sections={navSections}
        user={{
          name: currentUser?.name || "Super Admin",
          email: currentUser?.email || "president@NUKaFs.org",
          roleLabel: "Super Administrator",
          profilePhotoUrl: currentUser?.profilePhotoUrl || currentUser?.profilePhoto,
        }}
        headerTitle="Admin Panel"
      >
        {children}
      </DashboardShell>
    </PortalLayout>
  )
}
