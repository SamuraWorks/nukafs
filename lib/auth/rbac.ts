import type { AppRole } from "@/lib/context/app-state-context"

export type Permission =
  | "registry:read"
  | "registry:write"
  | "students:read"
  | "students:write"
  | "students:approve"
  | "announcements:read"
  | "announcements:write"
  | "events:read"
  | "events:write"
  | "opportunities:read"
  | "opportunities:write"
  | "reports:read"
  | "reports:export"
  | "analytics:read"
  | "team:read"
  | "team:write"
  | "settings:read"
  | "settings:write"
  | "audit:read"
  | "security:read"
  | "security:write"

const ROLE_PERMISSIONS: Record<AppRole, Permission[]> = {
  guest: [],
  student_pending: ["registry:read"],
  student_active_wizard: ["registry:read", "registry:write"],
  student_active_complete: [
    "registry:read",
    "registry:write",
    "announcements:read",
    "events:read",
    "opportunities:read",
  ],
  executive: [
    "registry:read",
    "registry:write",
    "students:read",
    "students:write",
    "students:approve",
    "announcements:read",
    "announcements:write",
    "events:read",
    "events:write",
    "opportunities:read",
    "opportunities:write",
    "reports:read",
    "reports:export",
    "analytics:read",
    "team:read",
  ],
  stakeholder: [
    "students:read",
    "announcements:read",
    "events:read",
    "opportunities:read",
    "reports:read",
    "analytics:read",
  ],
  super_admin: [
    "registry:read",
    "registry:write",
    "students:read",
    "students:write",
    "students:approve",
    "announcements:read",
    "announcements:write",
    "events:read",
    "events:write",
    "opportunities:read",
    "opportunities:write",
    "reports:read",
    "reports:export",
    "analytics:read",
    "team:read",
    "team:write",
    "settings:read",
    "settings:write",
    "audit:read",
    "security:read",
    "security:write",
  ],
}

export function getPermissionsForRole(role: AppRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? []
}

export function hasPermission(role: AppRole, permission: Permission): boolean {
  return getPermissionsForRole(role).includes(permission)
}

export function hasAnyPermission(
  role: AppRole,
  permissions: Permission[],
): boolean {
  const granted = getPermissionsForRole(role)
  return permissions.some((p) => granted.includes(p))
}
