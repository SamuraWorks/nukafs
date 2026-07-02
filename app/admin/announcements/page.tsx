"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  Bell,
  Calendar,
  Edit,
  ExternalLink,
  MoreHorizontal,
  Plus,
  Pin,
  Search,
  Trash2,
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"

// Use announcements from app state (Supabase-backed in production)

export default function AnnouncementsPage() {
  const { currentRole, announcements, editAnnouncement, deleteAnnouncement } = useAppState()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")

  // Only admins can manage announcements
  if (currentRole !== "super_admin") {
    return (
      <div className="mx-auto max-w-2xl">
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="p-6 text-center">
            <p className="text-amber-900 dark:text-amber-100">
              You do not have permission to manage announcements. Only administrators can manage announcements.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredAnnouncements = useMemo(() => {
    return (announcements ?? []).filter((ann) => {
      const title = String(ann.title ?? "")
      const content = String(ann.content ?? ann.body ?? "")
      const status = String(ann.status ?? ann.state ?? "published")
      const isPinned = Boolean(ann.isPinned ?? ann.pinned)

      const matchesSearch = title.toLowerCase().includes(searchQuery.toLowerCase()) || content.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = selectedStatus === "all" || status === selectedStatus

      return matchesSearch && matchesStatus
    })
  }, [announcements, searchQuery, selectedStatus])

  const handleDelete = (id: string) => {
    try {
      deleteAnnouncement(id)
      toast.success("Announcement deleted")
    } catch (e) {
      toast.error("Failed to delete announcement")
    }
  }

  const handlePin = (id: string, isPinned: boolean) => {
    try {
      editAnnouncement(id, { pinned: !isPinned })
      toast.success(isPinned ? "Announcement unpinned" : "Announcement pinned")
    } catch (e) {
      toast.error("Failed to update pin status")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Announcements</h1>
          <p className="text-muted-foreground mt-1">
            Official communications from NUKaFs Administration
          </p>
        </div>

        <Button asChild size="lg" className="gap-2">
          <Link href="/admin/announcements/create">
            <Plus className="size-4" />
            Publish Announcement
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
          <Input
            placeholder="Search announcements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="px-3 py-2 rounded-md border border-input bg-background"
        >
          <option value="all">All Status</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Announcements List */}
      {filteredAnnouncements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Bell className="mx-auto size-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">
              No announcements found matching your search
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredAnnouncements.map((ann) => (
            <Card key={ann.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      {ann.isPinned && (
                        <Pin className="size-4 text-primary flex-shrink-0" />
                      )}
                      <h3 className="font-semibold line-clamp-1">
                        {ann.title}
                      </h3>
                      <Badge
                        variant={
                          ann.status === "published" ? "default" : "outline"
                        }
                        className="shrink-0"
                      >
                        {ann.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {ann.content}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {new Date(ann.publishedAt).toLocaleDateString()}
                      </div>
                      {ann.eventDate && (
                        <div className="flex items-center gap-1">
                          <Bell className="size-3" />
                          Event: {new Date(ann.eventDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 shrink-0"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      <DropdownMenuItem asChild>
                        <Link href={`/admin/announcements/${ann.id}/edit`}>
                          <Edit className="size-3 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => handlePin(ann.id, !ann.isPinned)}
                      >
                        <Pin className="size-3 mr-2" />
                        {ann.isPinned ? "Unpin" : "Pin"}
                      </DropdownMenuItem>

                      <DropdownMenuItem asChild>
                        <a href={`/announcements/${ann.id}`}>
                          <ExternalLink className="size-3 mr-2" />
                          View
                        </a>
                      </DropdownMenuItem>

                      <DropdownMenuSeparator />

                      <DropdownMenuItem
                        onClick={() => handleDelete(ann.id)}
                        className="text-destructive focus:text-destructive"
                      >
                        <Trash2 className="size-3 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
