"use client"

import { usePathname } from "next/navigation"
import type { AppRole } from "@/lib/context/app-state-context"
import { RouteGuard } from "@/components/shared/route-guard"

interface PortalLayoutProps {
  children: React.ReactNode
  role: AppRole
  allowedRoles: AppRole[]
  isHydrated?: boolean
  loadingMessage?: string
}

export function PortalLayout({
  children,
  role,
  allowedRoles,
  isHydrated = true,
  loadingMessage,
}: PortalLayoutProps) {
  const pathname = usePathname()

  return (
    <RouteGuard
      role={role}
      pathname={pathname}
      allowedRoles={allowedRoles}
      isHydrated={isHydrated}
      loadingMessage={loadingMessage}
    >
      {children}
    </RouteGuard>
  )
}
