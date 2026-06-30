export const PUBLIC_ROUTES = ["/", "/login", "/register", "/setup"] as const

export const STUDENT_ROUTES = ["/dashboard"] as const
export const EXECUTIVE_ROUTES = ["/executive"] as const
export const STAKEHOLDER_ROUTES = ["/stakeholder"] as const
export const ADMIN_ROUTES = ["/admin"] as const

export const ROUTE_PREFIX = {
  dashboard: "/dashboard",
  executive: "/executive",
  stakeholder: "/stakeholder",
  admin: "/admin",
  verify: "/verify",
  login: "/login",
  register: "/register",
} as const

export function isPublicPath(pathname: string): boolean {
  if (pathname.startsWith("/verify/")) return true
  return PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  )
}
