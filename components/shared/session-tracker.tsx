"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useAppState } from "@/lib/context/app-state-context"
import { STORAGE_KEYS } from "@/lib/constants/storage-keys"
import {
  getPortalPrefixFromPath,
  type PortalPrefix,
} from "@/lib/constants/portal-routes"
import { writeString } from "@/lib/storage/persistence"
import { isPublicPath } from "@/lib/constants/routes"

export function SessionTracker() {
  const pathname = usePathname()
  const { currentRole, isHydrated } = useAppState()

  useEffect(() => {
    if (!isHydrated || currentRole === "guest") return
    if (isPublicPath(pathname)) return

    writeString(STORAGE_KEYS.lastPath, pathname)

    const portal = getPortalPrefixFromPath(pathname)
    if (portal) {
      writeString(STORAGE_KEYS.selectedPortal, portal)
    }
  }, [pathname, currentRole, isHydrated])

  return null
}

export function getStoredPortal(): PortalPrefix | null {
  if (typeof window === "undefined") return null
  const stored = localStorage.getItem(STORAGE_KEYS.selectedPortal)
  if (
    stored === "/dashboard" ||
    stored === "/executive" ||
    stored === "/stakeholder" ||
    stored === "/admin"
  ) {
    return stored
  }
  return null
}
