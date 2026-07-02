"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Building2,
  Calendar,
  FileText,
  Globe,
  Link as LinkIcon,
  MapPin,
  Save,
} from "lucide-react"
import Link from "next/link"
import { useAppState } from "@/lib/context/app-state-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MediaUpload } from "@/components/publishing/media-upload"
import {
  OPPORTUNITY_TYPES,
  type OpportunityType,
  type OpportunityFormData,
} from "@/lib/constants/opportunities-announcements"
import { toast } from "sonner"

export default function CreateOpportunityPage() {
  const router = useRouter()
  const { currentUser, currentRole } = useAppState()

  // Check authorization - only admins and approved stakeholders can publish
  const canPublish =
    currentRole === "super_admin" ||
    (currentRole === "stakeholder" && currentUser?.status === "active")

  if (!canPublish) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-12">
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20">
          <CardContent className="p-6 text-center">
            <p className="text-amber-900 dark:text-amber-100">
              You do not have permission to publish opportunities. Only administrators and
              approved stakeholders can publish.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [courseInput, setCourseInput] = useState("")
  const [formData, setFormData] = useState<OpportunityFormData>({
    title: "",
    category: "Scholarships",
    organizationName: "",
    description: "",
    eligibility: "",
    deadline: "",
    applicationLink: "",
    contactInformation: "",
    website: "",
    location: "",
    targetUniversity: "",
    targetCourses: [],
    targetAcademicLevel: "",
    flyerUrl: "",
    logoUrl: "",
    coverImageUrl: "",
    supportingDocumentUrl: "",
    publishedBy: currentUser?.id || "",
    status: "draft",
  })

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleMediaUpload = (field: string, file: File | null, preview: string | null) => {
    if (file) {
      // In a real app, upload to storage and get URL
      const url = preview || `file://${file.name}`
      handleInputChange(field, url)
    } else {
      handleInputChange(field, "")
    }
  }

  const handleAddCourse = () => {
    if (courseInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        targetCourses: [...(prev.targetCourses || []), courseInput.trim()],
      }))
      setCourseInput("")
    }
  }

  const handleRemoveCourse = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      targetCourses: prev.targetCourses?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleSubmit = async (e: React.FormEvent, saveAsDraft: boolean = false) => {
    e.preventDefault()

    if (!formData.title || !formData.organizationName || !formData.description || !formData.eligibility) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      // TODO: Save to database via API
      // const res = await fetch("/api/opportunities", {
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
          ? "Opportunity saved as draft"
          : "Opportunity published successfully!"
      )
      router.push("/admin/opportunities")
    } catch (error) {
      toast.error("Failed to save opportunity")
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
            <h1 className="text-3xl font-semibold">Publish Opportunity</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create a new scholarship, job, internship, or other opportunity for members
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={(e) => handleSubmit(e, false)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Essential details about the opportunity
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Opportunity Title *</FieldLabel>
                <Input
                  placeholder="e.g. Google Software Engineering Internship 2025"
                  value={formData.title}
                  onChange={(e) => handleInputChange("title", e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Category *</FieldLabel>
                <Select
                  value={formData.category}
                  onValueChange={(value) =>
                    handleInputChange("category", value as OpportunityType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {OPPORTUNITY_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>

              <Field className="md:col-span-2">
                <FieldLabel>Organization Name *</FieldLabel>
                <Input
                  placeholder="e.g. Google, World Bank, UN"
                  value={formData.organizationName}
                  onChange={(e) => handleInputChange("organizationName", e.target.value)}
                  required
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field className="md:col-span-2">
                <FieldLabel>Opportunity Description *</FieldLabel>
                <Textarea
                  placeholder="Provide a detailed description of the opportunity, responsibilities, and benefits"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  rows={6}
                  required
                />
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Field className="md:col-span-2">
                <FieldLabel>Eligibility Criteria *</FieldLabel>
                <Textarea
                  placeholder="List requirements, qualifications, and eligibility criteria"
                  value={formData.eligibility}
                  onChange={(e) => handleInputChange("eligibility", e.target.value)}
                  rows={4}
                  required
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Application Details */}
        <Card>
          <CardHeader>
            <CardTitle>Application & Contact</CardTitle>
            <CardDescription>How applicants can apply and contact you</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Application Deadline *</FieldLabel>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => handleInputChange("deadline", e.target.value)}
                  required
                />
              </Field>

              <Field>
                <FieldLabel>Application Link</FieldLabel>
                <Input
                  type="url"
                  placeholder="https://example.com/apply"
                  value={formData.applicationLink || ""}
                  onChange={(e) => handleInputChange("applicationLink", e.target.value)}
                />
              </Field>

              <Field className="md:col-span-2">
                <FieldLabel>Contact Information</FieldLabel>
                <Input
                  placeholder="Email or phone number for inquiries"
                  value={formData.contactInformation || ""}
                  onChange={(e) =>
                    handleInputChange("contactInformation", e.target.value)
                  }
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {/* Optional Details */}
        <Card>
          <CardHeader>
            <CardTitle>Optional Information</CardTitle>
            <CardDescription>Additional details to help applicants</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel>Website</FieldLabel>
                <Input
                  type="url"
                  placeholder="https://organization.com"
                  value={formData.website || ""}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel>Location</FieldLabel>
                <Input
                  placeholder="e.g. Remote, Freetown, New York"
                  value={formData.location || ""}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel>Target University</FieldLabel>
                <Input
                  placeholder="e.g. Fourah Bay College (leave empty for all)"
                  value={formData.targetUniversity || ""}
                  onChange={(e) =>
                    handleInputChange("targetUniversity", e.target.value)
                  }
                />
              </Field>

              <Field>
                <FieldLabel>Target Academic Level</FieldLabel>
                <Input
                  placeholder="e.g. Year 3 & above (leave empty for all)"
                  value={formData.targetAcademicLevel || ""}
                  onChange={(e) =>
                    handleInputChange("targetAcademicLevel", e.target.value)
                  }
                />
              </Field>
            </FieldGroup>

            {/* Target Courses */}
            <div>
              <FieldLabel>Target Courses</FieldLabel>
              <div className="flex gap-2">
                <Input
                  placeholder="e.g. Computer Science"
                  value={courseInput}
                  onChange={(e) => setCourseInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      handleAddCourse()
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCourse}
                >
                  Add
                </Button>
              </div>
              {formData.targetCourses && formData.targetCourses.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {formData.targetCourses.map((course, i) => (
                    <Badge key={i} variant="secondary">
                      {course}
                      <button
                        type="button"
                        onClick={() => handleRemoveCourse(i)}
                        className="ml-1 hover:text-destructive"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Media Uploads */}
        <Card>
          <CardHeader>
            <CardTitle>Media & Documents</CardTitle>
            <CardDescription>
              Optional. Flyers, logos, and supporting documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <MediaUpload
              label="Cover Image (Optional)"
              description="Displayed prominently on the opportunity card"
              onFileSelected={(file, preview) =>
                handleMediaUpload("coverImageUrl", file, preview)
              }
              accept=".jpg,.jpeg,.png"
            />

            <MediaUpload
              label="Flyer or Poster (Optional)"
              description="PDF or image of the opportunity flyer"
              onFileSelected={(file, preview) =>
                handleMediaUpload("flyerUrl", file, preview)
              }
            />

            <MediaUpload
              label="Organization Logo (Optional)"
              description="Logo of the organization"
              onFileSelected={(file, preview) =>
                handleMediaUpload("logoUrl", file, preview)
              }
              accept=".jpg,.jpeg,.png"
            />

            <MediaUpload
              label="Supporting Document (Optional)"
              description="Additional PDF document or details"
              onFileSelected={(file, preview) =>
                handleMediaUpload("supportingDocumentUrl", file, preview)
              }
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
            {isSubmitting ? "Publishing..." : "Publish Opportunity"}
          </Button>
        </div>
      </form>
    </div>
  )
}
