"use client"

import { useState } from "react"
import { Megaphone, Plus, Edit, Trash2 } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

export default function AnnouncementsManagerPage() {
  const { announcements } = useAppState()

  const handleDelete = () => toast.success("Announcement deleted")

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-5xl mx-auto">
      <PageHeader
        title="Announcements Manager"
        description="Create, edit, and publish official announcements to students and stakeholders."
        action={
          <Button className="gap-2 bg-primary">
            <Plus className="size-4" /> New Announcement
          </Button>
        }
      />

      <div className="flex flex-col gap-4">
        {announcements.map((a) => (
          <Card key={a.id} className="border shadow-sm">
            <CardHeader className="p-5 border-b pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <Badge variant="outline" className="mb-2 text-[10px]">{a.category}</Badge>
                  <CardTitle className="text-base">{a.title}</CardTitle>
                  <CardDescription className="text-xs mt-1">Published: {a.date}</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0"><Edit className="size-4 text-muted-foreground"/></Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0 text-destructive hover:bg-destructive/10" onClick={handleDelete}><Trash2 className="size-4"/></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 text-sm text-muted-foreground">
              {a.content}
            </CardContent>
          </Card>
        ))}
        {announcements.length === 0 && (
          <div className="text-center p-10 border border-dashed rounded-xl text-muted-foreground">
            No announcements published yet.
          </div>
        )}
      </div>
    </div>
  )
}
