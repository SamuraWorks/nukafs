"use client"

import { Plus, Edit, Trash2, Users, Calendar, MapPin, Clock } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function EventsManagerPage() {
  const { events } = useAppState()

  const handleDelete = () => toast.success("Event deleted")

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="Events Manager"
        description="Schedule and manage registry events, workshops, and general meetings."
        action={
          <Button className="gap-2 bg-primary">
            <Plus className="size-4" /> Create Event
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <Card key={e.id} className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-3">
                <Badge variant="outline" className={
                  e.status === "upcoming" ? "bg-primary/10 text-primary border-primary/20 text-[10px]" : "bg-muted text-muted-foreground text-[10px]"
                }>{e.status}</Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><Edit className="size-3 text-muted-foreground"/></Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive hover:bg-destructive/10" onClick={handleDelete}><Trash2 className="size-3"/></Button>
                </div>
              </div>
              <h3 className="text-sm font-bold text-foreground mb-3">{e.title}</h3>
              <div className="grid gap-2 text-xs text-muted-foreground mb-4">
                <div className="flex items-center gap-2"><Calendar className="size-3.5" /> {e.date}</div>
                <div className="flex items-center gap-2"><Clock className="size-3.5" /> {e.time}</div>
                <div className="flex items-center gap-2"><MapPin className="size-3.5" /> {e.location}</div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2 mb-4">{e.description}</p>
              <div className="pt-3 border-t">
                <Button variant="secondary" size="sm" className="w-full gap-2 text-xs h-8">
                  <Users className="size-3.5" /> View Participants
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {events.length === 0 && (
          <div className="col-span-full text-center p-10 border border-dashed rounded-xl text-muted-foreground">
            No events scheduled yet.
          </div>
        )}
      </div>
    </div>
  )
}
