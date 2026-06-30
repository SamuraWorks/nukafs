"use client"

import { useMemo } from "react"
import { useAppState } from "@/lib/context/app-state-context"

export function useRegistryData() {
  const {
    students,
    pendingRegistrations,
    editRequests,
    events,
    announcements,
    opportunities,
    teamMembers,
    auditLog,
    universitiesList,
    registeredEvents,
  } = useAppState()

  return useMemo(
    () => ({
      students,
      pendingRegistrations,
      editRequests,
      events,
      announcements,
      opportunities,
      teamMembers,
      auditLog,
      universitiesList,
      registeredEvents,
    }),
    [
      students,
      pendingRegistrations,
      editRequests,
      events,
      announcements,
      opportunities,
      teamMembers,
      auditLog,
      universitiesList,
      registeredEvents,
    ],
  )
}
