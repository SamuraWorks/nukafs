"use client"

import { useMemo } from "react"
import { useAppState } from "@/lib/context/app-state-context"

export function useAuth() {
  const { currentRole, currentUser, login, logout, switchRole } = useAppState()

  return useMemo(
    () => ({
      currentRole,
      currentUser,
      isAuthenticated: currentRole !== "guest",
      login,
      logout,
      switchRole,
    }),
    [currentRole, currentUser, login, logout, switchRole],
  )
}
