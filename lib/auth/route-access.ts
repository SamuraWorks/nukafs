import type { AppRole } from "@/lib/context/app-state-context"
import { ROUTE_PREFIX } from "@/lib/constants/routes"

export function getDefaultRouteForRole(role: AppRole): string {
  switch (role) {
    case "executive":
    case "super_admin":
      return role === "super_admin" ? ROUTE_PREFIX.admin : ROUTE_PREFIX.executive
    case "stakeholder":
      return ROUTE_PREFIX.stakeholder
    case "student_pending":
    case "student_active_wizard":
    case "student_active_complete":
      return ROUTE_PREFIX.dashboard
    default:
      return ROUTE_PREFIX.login
  }
}

export function canAccessRoute(role: AppRole, pathname: string): boolean {
  if (pathname.startsWith(ROUTE_PREFIX.verify)) return true
  if (pathname === "/" || pathname.startsWith(ROUTE_PREFIX.login)) return true
  if (pathname.startsWith(ROUTE_PREFIX.register)) return true
  if (pathname.startsWith("/setup")) return true
  if (pathname.startsWith("/help") || pathname.startsWith("/privacy-policy") || pathname.startsWith("/terms")) return true
  if (pathname.startsWith("/access-denied")) return true

  if (pathname.startsWith(ROUTE_PREFIX.admin)) {
    return role === "super_admin"
  }

  if (pathname.startsWith(ROUTE_PREFIX.executive)) {
    return role === "executive" || role === "super_admin"
  }

  if (pathname.startsWith(ROUTE_PREFIX.stakeholder)) {
    return role === "stakeholder" || role === "super_admin"
  }

  if (pathname.startsWith(ROUTE_PREFIX.dashboard)) {
    return role === "student_active_complete" || role === "super_admin"
  }

  return true
}

export function getRedirectForUnauthorized(
  role: AppRole,
  pathname: string,
): string {
  if (role === "guest") return ROUTE_PREFIX.login
  if (!canAccessRoute(role, pathname)) {
    return `/access-denied?from=${encodeURIComponent(pathname)}`
  }
  return getDefaultRouteForRole(role)
}

export function isProtectedPath(pathname: string): boolean {
  return (
    pathname.startsWith(ROUTE_PREFIX.dashboard) ||
    pathname.startsWith(ROUTE_PREFIX.executive) ||
    pathname.startsWith(ROUTE_PREFIX.stakeholder) ||
    pathname.startsWith(ROUTE_PREFIX.admin) ||
    pathname.startsWith("/setup")
  )
}
