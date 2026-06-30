"use client"

import { useState } from "react"
import { CalendarDays, Clock, MapPin, CheckCircle, Ticket, AlertCircle } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { toast } from "sonner"

export default function EventsPage() {
  const { events, registeredEvents, toggleEventRegistration } = useAppState()
  const [activeSegment, setActiveSegment] = useState<"upcoming" | "past">("upcoming")

  const filteredEvents = events.filter((e) => e.status === activeSegment)

  const handleRsvp = (id: string, title: string, isRegistered: boolean) => {
    toggleEventRegistration(id)
    if (isRegistered) {
      toast.success(`Cancelled RSVP for event: ${title}`)
    } else {
      toast.success(`Successfully RSVP'd for event: ${title}! See you there.`)
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto font-sans">
      <PageHeader 
        title="Union Events &amp; Fairs"
        description="RSVP for upcoming career panels, student AGMs, and digital literacy training courses."
      />

      {/* Segment Selector */}
      <div className="flex items-center gap-1 bg-muted p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveSegment("upcoming")}
          className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeSegment === "upcoming"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Upcoming Events
        </button>
        <button
          onClick={() => setActiveSegment("past")}
          className={`text-xs font-semibold px-4 py-2 rounded-lg transition-all cursor-pointer ${
            activeSegment === "past"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Past Activities
        </button>
      </div>

      {/* Events List */}
      {filteredEvents.length === 0 ? (
        <Card className="border p-12 text-center flex flex-col items-center justify-center gap-3 bg-muted/20">
          <AlertCircle className="size-8 text-primary/30" />
          <h3 className="font-heading font-bold text-base">No events listed</h3>
          <p className="text-xs text-muted-foreground">There are currently no {activeSegment} union schedules listed.</p>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {filteredEvents.map((evt) => {
            const isRegistered = registeredEvents.includes(evt.id)
            const dateObj = new Date(evt.date)
            const day = dateObj.getDate()
            const month = dateObj.toLocaleString("default", { month: "short" })
            const year = dateObj.getFullYear()

            return (
              <Card key={evt.id} className="border shadow-sm hover:shadow-md transition-all">
                <CardContent className="p-5 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center">
                  
                  {/* Banner block for Date */}
                  <div className="flex sm:flex-col items-center justify-center size-16 shrink-0 rounded-xl bg-primary/10 text-primary border border-primary/20 gap-1.5 sm:gap-0">
                    <span className="text-[10px] font-bold uppercase leading-none">{month}</span>
                    <span className="text-2xl font-extrabold leading-none sm:mt-1">{day}</span>
                    <span className="hidden sm:block text-[9px] text-primary/75 mt-0.5">{year}</span>
                  </div>

                  {/* Info details */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading text-base font-bold text-foreground leading-snug">{evt.title}</h3>
                      {isRegistered && (
                        <Badge variant="outline" className="border-primary/40 bg-primary/5 text-primary text-[9px] font-bold px-1.5">
                          ✓ Attending
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="size-3.5" /> {evt.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="size-3.5" /> {evt.location}</span>
                      <span className="text-primary font-medium">{evt.attendees} attending</span>
                    </div>

                    <p className="text-xs text-muted-foreground leading-relaxed mt-1">{evt.description}</p>
                  </div>

                  {/* Action buttons */}
                  <div className="shrink-0 flex items-center gap-2 mt-2 sm:mt-0 border-t pt-3 sm:pt-0 sm:border-t-0 justify-end">
                    {activeSegment === "upcoming" ? (
                      <Button
                        size="sm"
                        variant={isRegistered ? "outline" : "default"}
                        onClick={() => handleRsvp(evt.id, evt.title, isRegistered)}
                        className="font-bold flex items-center gap-1.5 h-9 cursor-pointer"
                      >
                        <Ticket className="size-4" />
                        {isRegistered ? "Cancel RSVP" : "Reserve Ticket"}
                      </Button>
                    ) : (
                      <div className="text-xs text-muted-foreground flex items-center gap-1 bg-muted px-2.5 py-1 rounded-full font-medium">
                        <CheckCircle className="size-3.5 text-muted-foreground" /> Completed
                      </div>
                    )}
                  </div>

                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
