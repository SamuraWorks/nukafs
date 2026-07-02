"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Pin } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { MediaUpload } from "@/components/publishing/media-upload"
import { type AnnouncementFormData } from "@/lib/constants/opportunities-announcements"
import { toast } from "sonner"

export default function CreateAnnouncementPage() {
  const router = useRouter()
  const { currentUser, currentRole } = useAppState()

  // Only admins can publish announcements
  if (currentRole !== "super_admin") {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="p-6 text-center">
            <p className="text-amber-900 dark:text-amber-100">
              You do not have permission to publish announcements. Only administrators can
              publish official announcements.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: "",
    content: "",
    featuredImageUrl: "",
    flyerUrl: "",
    posterUrl: "",
    pdfAttachmentUrl: "",
    externalLink: "",
    eventDate: "",
    publishedBy: currentUser?.id || "",
    status: "draft",
    isPinned: false,
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMediaUpload = (field: string, file: File | null, preview: string | null) => {
    if (file) {
      const url = preview || `file://${file.name}`
      handleInputChange(field, url)
    } else {
      handleInputChange(field, "")
    }
  }

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault()

    if (!formData.title || !formData.content) {
      toast.error("Please provide a title and content for the announcement")
      return
    }

    setIsSubmitting(true)
    try {
      // TODO: Save to database via API
      // const res = await fetch("/api/announcements", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     ...formData,
      //     status: saveAsDraft ? "draft" : "published",
      //     publishedAt: new Date().toISOString(),
      //   }),
      // })

      toast.success(
        saveAsDraft
          ? "Announcement saved as draft"
          : "Announcement published successfully!"
      )
      router.push("/admin/announcements")
    } catch (error) {
      toast.error("Failed to save announcement")
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="gap-2"
          >
            <ArrowLeft className="size-4" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-semibold">Publish Announcement</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create an official announcement for all members
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle>Announcement Content</CardTitle>
            <CardDescription>
              Write the main content of your announcement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              <Field className="md:col-span-2">
                <FieldLabel>Title *</FieldLabel>
                <Input
                  placeholder="e.g. Registration for Annual NUKaFs Conference"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </Field>

              <Field className="md:col-span-2">
                <FieldLabel>Content *</FieldLabel>
                <Textarea
                  placeholder="Write your announcement content here. Support for markdown formatting will be available."
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  rows={10}
                  required
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Details</CardTitle>
            <CardDescription>Optional event and link information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Event Date (if applicable)</FieldLabel>
                <Input
                  type="date"
                  value={formData.eventDate || ""}
                  onChange={(e) => handleInputChange("eventDate", e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel>External Link</FieldLabel>
                <Input
                  type="url"
                  placeholder="https://example.com/more-info"
                  value={formData.externalLink || ""}
                  onChange={(e) => handleInputChange("externalLink", e.target.value)}
                />
              </Field>

              <Field className="flex items-center gap-2 md:col-span-2">
                <input
                  type="checkbox"
                  id="isPinned"
                  checked={formData.isPinned || false}
                  onChange={(e) => handleInputChange("isPinned", e.target.checked)}
                  className="size-4"
                />
                <FieldLabel htmlFor="isPinned" className="mb-0 cursor-pointer">
                  <span className="flex items-center gap-2">
                    <Pin className="size-4" />
                    Pin this announcement at the top
                  </span>
                </FieldLabel>
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Media Uploads */}
        <Card>
          <CardHeader>
            <CardTitle>Media & Attachments</CardTitle>
            <CardDescription>
              Optional. Images, flyers, posters, and PDF attachments
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <MediaUpload
              label="Featured Image (Optional)"
              description="Main image displayed with the announcement"
              onFileSelected={(file, preview) =>
                handleMediaUpload("featuredImageUrl", file, preview)
              }
              accept=".jpg,.jpeg,.png"
            />

            <MediaUpload
              label="Flyer or Poster (Optional)"
              description="PDF or image of an accompanying flyer"
              onFileSelected={(file, preview) =>
                handleMediaUpload("flyerUrl", file, preview)
              }
            />

            <MediaUpload
              label="PDF Attachment (Optional)"
              description="Additional PDF document to attach"
              onFileSelected={(file, preview) =>
                handleMediaUpload("pdfAttachmentUrl", file, preview)
              }
              accept=".pdf"
            />
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="outline"
            onClick={(e) => handleSubmit(e, true)}
            disabled={isSubmitting}
          >
            Save as Draft
          </Button>
          <Button type="submit" disabled={isSubmitting} className="gap-2">
            <Save className="size-4" />
            {isSubmitting ? "Publishing..." : "Publish Announcement"}
          </Button>
        </div>
      </form>
    </div>
  )
}
