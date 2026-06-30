"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import type { AppRole } from "@/lib/context/app-state-context"
import {
  canAccessRoute,
  getRedirectForUnauthorized,
  isProtectedPath,
} from "@/lib/auth/route-access"
import { PageLoading } from "@/components/shared/page-states"

interface RouteGuardProps {
  children: ReactNode
  role: AppRole
  pathname: string
  allowedRoles?: AppRole[]
  isHydrated?: boolean
  loadingMessage?: string
}

export function RouteGuard({
  children,
  role,
  pathname,
  allowedRoles,
  isHydrated = true,
  loadingMessage = "Checking access...",
}: RouteGuardProps) {
  const router = useRouter()

  const isAllowed = allowedRoles
    ? allowedRoles.includes(role)
    : canAccessRoute(role, pathname)

  useEffect(() => {
    if (!isHydrated) return

    if (role === "guest" && isProtectedPath(pathname)) {
      router.replace(getRedirectForUnauthorized(role, pathname))
      return
    }

    if (!isAllowed) {
      router.replace(getRedirectForUnauthorized(role, pathname))
    }
  }, [isAllowed, isHydrated, role, pathname, router])

  if (!isHydrated) {
    return <PageLoading message="Restoring session..." />
  }

  if (role === "guest" && isProtectedPath(pathname)) {
    return <PageLoading message="Redirecting to login..." />
  }

  if (!isAllowed) {
    return <PageLoading message={loadingMessage} />
  }

  return <>{children}</>
}
