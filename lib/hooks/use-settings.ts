"use client"

import { useMemo } from "react"
import { useAppState } from "@/lib/context/app-state-context"

export function useSettings() {
  const { systemSettings, updateSettings } = useAppState()

  return useMemo(
    () => ({
      settings: systemSettings,
      updateSettings,
    }),
    [systemSettings, updateSettings],
  )
}
