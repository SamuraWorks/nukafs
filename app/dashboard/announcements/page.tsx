"use client"

import { useState } from "react"
import { Bell, Search, Pin, Calendar, User, Eye, X } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
// Minimal announcement shape used by the UI
type Announcement = {
  id: string
  title: string
  body: string
  date: string
  pinned?: boolean
  category?: string
  author?: string
}

export default function AnnouncementsPage() {
  const { announcements } = useAppState()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const [activeAnnouncement, setActiveAnnouncement] = useState<Announcement | null>(null)

  const categories = ["All", "General", "Academic", "Event", "Urgent", "Opportunity"]

  // Filter and sort announcements: Pinned first, then date descending
  const filteredAnnouncements = announcements
    .filter((ann) => {
      const matchesSearch = 
        ann.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ann.body.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesCategory = 
        selectedCategory === "All" || ann.category === selectedCategory

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto font-sans">
      <PageHeader 
        title="Announcements"
        description="Stay informed with the latest updates, event postings, and scholarship news from union headquarters."
      />

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all cursor-pointer shrink-0 ${
                selectedCategory === cat
                  ? "bg-primary border-primary text-primary-foreground shadow-sm"
                  : "bg-card border-border hover:bg-muted text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <InputGroup className="w-full sm:w-64 shrink-0">
          <InputGroupAddon>
            <Search className="size-4 text-muted-foreground" />
          </InputGroupAddon>
          <InputGroupInput 
            placeholder="Search posts..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </InputGroup>
      </div>

      {/* Grid List */}
      {filteredAnnouncements.length === 0 ? (
        <Card className="border p-12 text-center flex flex-col items-center justify-center gap-3">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Bell className="size-6" />
          </div>
          <h3 className="font-heading font-bold text-base">No announcements found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">No notifications fit your filter. Try adjusting your query or category select.</p>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredAnnouncements.map((ann) => (
            <Card 
              key={ann.id} 
              className={`border shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative ${
                ann.pinned ? "border-primary/30 bg-gradient-to-br from-card to-primary/5" : ""
              }`}
            >
              <CardContent className="p-5 flex flex-col gap-3 h-full justify-between">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant={ann.category === "Urgent" ? "destructive" : "secondary"} className="text-[9px] uppercase px-1.5 py-0.5 font-bold">
                      {ann.category}
                    </Badge>
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      {ann.pinned && (
                        <span className="flex items-center gap-0.5 text-primary font-bold">
                          <Pin className="size-3 fill-current" /> Pinned
                        </span>
                      )}
                      <span>{ann.date}</span>
                    </div>
                  </div>
                  
                  <h3 className="font-heading text-sm font-bold leading-snug text-foreground line-clamp-2">
                    {ann.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed mt-2 line-clamp-3">
                    {ann.body}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t pt-3 mt-4 text-[10px] text-muted-foreground">
                  <span className="flex items-center gap-1"><User className="size-3" /> {ann.author}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-7 text-[10px] px-2.5 font-bold"
                    onClick={() => setActiveAnnouncement(ann)}
                  >
                    Read More
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Dialog for detailed viewing */}
      <Dialog open={!!activeAnnouncement} onOpenChange={(open) => !open && setActiveAnnouncement(null)}>
        {activeAnnouncement && (
          <DialogContent className="max-w-lg font-sans">
            <DialogHeader className="gap-2.5">
              <div className="flex items-center justify-between border-b pb-2">
                <Badge variant={activeAnnouncement.category === "Urgent" ? "destructive" : "secondary"} className="text-[10px] uppercase font-bold px-1.5 py-0.5">
                  {activeAnnouncement.category}
                </Badge>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3.5" /> {activeAnnouncement.date}
                </span>
              </div>
              <DialogTitle className="font-heading text-lg font-bold leading-snug">
                {activeAnnouncement.title}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground flex items-center gap-1 border-b pb-3 mt-0.5">
                Posted by <span className="font-semibold text-foreground">{activeAnnouncement.author}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 text-xs leading-relaxed text-muted-foreground max-h-72 overflow-y-auto pr-1">
              <p className="whitespace-pre-wrap">{activeAnnouncement.body}</p>
            </div>
            <div className="flex justify-end pt-3 border-t">
              <Button size="sm" onClick={() => setActiveAnnouncement(null)}>
                Close Details
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
