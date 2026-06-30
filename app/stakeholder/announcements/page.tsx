"use client"

import { Megaphone, Calendar } from "lucide-react"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

const announcements = [
  { id: 1, title: "NUKAFS Annual General Meeting 2024", date: "Sep 15, 2024", category: "General", content: "All members and stakeholders are invited to the upcoming AGM..." },
  { id: 2, title: "New Mentorship Program Launched", date: "Sep 10, 2024", category: "Academic", content: "We are partnering with leading NGOs to provide mentorship to 50 students." },
  { id: 3, title: "Scholarship Application Deadline Extended", date: "Sep 05, 2024", category: "Opportunities", content: "The deadline for the 2024 National Scholarship has been extended by two weeks." },
]

export default function StakeholderAnnouncementsPage() {
  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-4xl mx-auto">
      <PageHeader
        title="Official Announcements"
        description="Stay updated with the latest news and announcements from the NUKAFS Executive."
      />
      <div className="flex flex-col gap-4">
        {announcements.map(a => (
          <Card key={a.id} className="border shadow-sm">
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="text-[10px]">{a.category}</Badge>
                <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3" /> {a.date}
                </span>
              </div>
              <h3 className="text-sm font-bold text-foreground mb-1">{a.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{a.content}</p>
              <Button variant="link" className="px-0 h-auto text-xs mt-3 text-primary">Read full announcement &rarr;</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
