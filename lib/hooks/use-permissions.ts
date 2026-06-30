"use client"

import { useMemo } from "react"
import { useAppState } from "@/lib/context/app-state-context"
import {
  getPermissionsForRole,
  hasPermission,
  hasAnyPermission,
  type Permission,
} from "@/lib/auth/rbac"

export function usePermissions() {
  const { currentRole } = useAppState()

  return useMemo(
    () => ({
      role: currentRole,
      permissions: getPermissionsForRole(currentRole),
      can: (permission: Permission) => hasPermission(currentRole, permission),
      canAny: (permissions: Permission[]) =>
        hasAnyPermission(currentRole, permissions),
    }),
    [currentRole],
  )
}
