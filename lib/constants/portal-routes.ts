import type { AppRole } from "@/lib/context/app-state-context"

export type PortalPrefix = "/dashboard" | "/executive" | "/stakeholder" | "/admin"

export interface PortalAccountRoutes {
  profile: string
  membershipCard: string
  notifications: string
  settings: string
  changePassword: string
  help: string
}

export function getPortalPrefixFromPath(pathname: string): PortalPrefix | null {
  if (pathname.startsWith("/admin")) return "/admin"
  if (pathname.startsWith("/executive")) return "/executive"
  if (pathname.startsWith("/stakeholder")) return "/stakeholder"
  if (pathname.startsWith("/dashboard")) return "/dashboard"
  return null
}

export function getPortalPrefixFromRole(role: AppRole): PortalPrefix {
  switch (role) {
    case "executive":
      return "/executive"
    case "stakeholder":
      return "/stakeholder"
    case "super_admin":
      return "/admin"
    default:
      return "/dashboard"
  }
}

export function getAccountRoutes(portal: PortalPrefix): PortalAccountRoutes {
  const settingsPath =
    portal === "/admin" ? `${portal}/account-settings` : `${portal}/settings`
  const helpPath =
    portal === "/stakeholder" ? `${portal}/support` : `${portal}/help`

  return {
    profile: `${portal}/profile`,
    membershipCard: `${portal}/membership-card`,
    notifications: `${portal}/notifications`,
    settings: settingsPath,
    changePassword: `${settingsPath}#password`,
    help: helpPath,
  }
}

export function resolvePortalPrefix(
  pathname: string,
  role: AppRole,
): PortalPrefix {
  return getPortalPrefixFromPath(pathname) ?? getPortalPrefixFromRole(role)
}
