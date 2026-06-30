"use client"

import { useMemo } from "react"
import { useAppState } from "@/lib/context/app-state-context"

export function useNotifications() {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    addNotification,
  } = useAppState()

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications],
  )

  return useMemo(
    () => ({
      notifications,
      unreadCount,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      addNotification,
    }),
    [
      notifications,
      unreadCount,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification,
      addNotification,
    ],
  )
}
