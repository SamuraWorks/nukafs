"use client"

import { useMemo } from "react"
import { Megaphone, Calendar, MapPin, Users } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function StakeholderAnnouncementsPage() {
  const { announcements, events } = useAppState()

  const latestItems = useMemo(() => {
    return [...announcements, ...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [announcements, events])

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-10 font-sans">
      <PageHeader
        title="Announcements & Events"
        description="View stakeholder-facing notices, partner events, and public updates from the production registry."
      />

      <div className="flex flex-col gap-4">
        {latestItems.map((item) => {
          const isEvent = "location" in item
          return (
            <Card key={item.id} className="border shadow-sm">
              <CardContent className="p-5">
                <div className="mb-2 flex items-start justify-between gap-3">
                  <Badge variant="secondary" className="text-[10px]">
                    {isEvent ? "Event" : item.category}
                  </Badge>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="size-3" /> {item.date}
                  </span>
                </div>
                <h3 className="mb-2 text-sm font-bold text-foreground">{item.title}</h3>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {isEvent ? item.description : item.body}
                </p>
                {isEvent && (
                  <div className="mt-3 flex flex-wrap gap-3 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><MapPin className="size-3" /> {item.location}</span>
                    <span className="flex items-center gap-1"><Users className="size-3" /> {item.attendees} attendees</span>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
