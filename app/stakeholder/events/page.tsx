"use client"

import { Calendar, MapPin, Users, Clock } from "lucide-react"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const events = [
  { id: 1, title: "Career Fair & Networking 2024", date: "Oct 12, 2024", time: "10:00 AM - 4:00 PM", location: "FBC Amphitheatre", participants: 150, status: "Upcoming" },
  { id: 2, title: "Leadership Training Workshop", date: "Nov 05, 2024", time: "09:00 AM - 2:00 PM", location: "IPAM Hall", participants: 50, status: "Upcoming" },
  { id: 3, title: "Annual Cultural Night", date: "Dec 20, 2024", time: "06:00 PM - Late", location: "National Stadium", participants: 800, status: "Upcoming" },
]

export default function StakeholderEventsPage() {
  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-5xl mx-auto">
      <PageHeader
        title="Events Calendar"
        description="View upcoming student events, workshops, and gatherings."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        {events.map(e => (
          <Card key={e.id} className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-[10px]">{e.status}</Badge>
              </div>
              <h3 className="text-sm font-bold text-foreground mb-3">{e.title}</h3>
              <div className="grid gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-2"><Calendar className="size-3.5" /> {e.date}</div>
                <div className="flex items-center gap-2"><Clock className="size-3.5" /> {e.time}</div>
                <div className="flex items-center gap-2"><MapPin className="size-3.5" /> {e.location}</div>
                <div className="flex items-center gap-2"><Users className="size-3.5" /> {e.participants} Expected Participants</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
