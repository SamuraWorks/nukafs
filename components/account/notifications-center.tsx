"use client"

import {
  Bell,
  Calendar,
  FileCheck,
  GraduationCap,
  Megaphone,
  Briefcase,
  Trash2,
  CheckCheck,
} from "lucide-react"
import { toast } from "sonner"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppState, type UserNotification } from "@/lib/context/app-state-context"

const categoryMeta: Record<
  UserNotification["category"],
  { label: string; icon: typeof Bell }
> = {
  registration: { label: "Registration", icon: FileCheck },
  profile: { label: "Profile", icon: FileCheck },
  announcement: { label: "Announcement", icon: Megaphone },
  event: { label: "Event", icon: Calendar },
  scholarship: { label: "Scholarship", icon: GraduationCap },
  opportunity: { label: "Opportunity", icon: Briefcase },
  system: { label: "System", icon: Bell },
}

export function NotificationsCenter({
  title = "Notifications",
  description = "Registration updates, announcements, events, and system alerts.",
}: {
  title?: string
  description?: string
}) {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
  } = useAppState()

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAll = () => {
    markAllNotificationsAsRead()
    toast.success("All notifications marked as read.")
  }

  const handleDelete = (id: string) => {
    deleteNotification(id)
    toast.success("Notification removed.")
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-10 font-sans">
      <PageHeader
        title={title}
        description={description}
        action={
          unreadCount > 0 ? (
            <Button variant="outline" className="gap-2" onClick={handleMarkAll}>
              <CheckCheck className="size-4" />
              Mark All as Read
            </Button>
          ) : undefined
        }
      />

      <Card className="border shadow-sm">
        <CardContent className="divide-y divide-border p-0">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center gap-3 p-12 text-center">
              <Bell className="size-10 text-muted-foreground/40" />
              <p className="text-sm font-medium">No notifications</p>
              <p className="text-xs text-muted-foreground">
                You&apos;re all caught up. New alerts will appear here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const meta = categoryMeta[notification.category ?? "system"]
              const Icon = meta.icon
              return (
                <div
                  key={notification.id}
                  className={`flex items-start gap-4 p-5 ${notification.read ? "opacity-75" : "bg-primary/5"}`}
                >
                  <div
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
                      notification.read
                        ? "bg-muted text-muted-foreground"
                        : "bg-primary/15 text-primary"
                    }`}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        className={`text-sm ${notification.read ? "font-semibold" : "font-bold"}`}
                      >
                        {notification.title}
                      </h3>
                      <Badge variant="secondary" className="text-[9px]">
                        {meta.label}
                      </Badge>
                      {!notification.read && (
                        <span className="size-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="mt-2 text-[10px] text-muted-foreground">
                      {notification.timestamp}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-1">
                    {!notification.read && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => markNotificationAsRead(notification.id)}
                      >
                        Mark Read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={() => handleDelete(notification.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
