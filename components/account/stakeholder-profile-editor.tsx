"use client"

import { useState, useRef, useCallback } from "react"
import Link from "next/link"
import {
  Building2,
  Globe,
  Mail,
  Phone,
  Briefcase,
  Upload,
  Save,
  ArrowLeft,
  Loader2,
  User,
  FileText,
  HandshakeIcon,
  ImagePlus,
  CheckCircle2,
  AlertTriangle,
  X,
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"

// ─── Constants ───────────────────────────────────────────────────────────────

const ORG_TYPES = [
  "Government Agency",
  "Non-Governmental Organisation (NGO)",
  "International Organisation",
  "Private Sector / Corporate",
  "University / Academic Institution",
  "Community-Based Organisation (CBO)",
  "Financial Institution",
  "Media / Press",
  "Health Institution",
  "Other",
] as const

const INDUSTRIES = [
  "Education & Training",
  "Health & Medicine",
  "Agriculture & Food Security",
  "Technology & Innovation",
  "Finance & Banking",
  "Energy & Environment",
  "Governance & Public Policy",
  "Media & Communications",
  "Construction & Infrastructure",
  "Legal & Professional Services",
  "International Development",
  "Arts, Culture & Entertainment",
  "Other",
] as const

const PARTNERSHIP_TYPES = [
  "Scholarship Programme",
  "Internship & Placement",
  "Mentorship Programme",
  "Research Collaboration",
  "Events & Conferences",
  "Job Placement",
  "Funding & Grants",
  "In-Kind Support",
  "General Partnership",
] as const

// ─── Field Group UI Components ────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="text-xs font-semibold text-foreground">
      {children}
      {required && <span className="text-destructive ml-0.5">*</span>}
    </label>
  )
}

function FieldGroup({ title, description, icon: Icon, children }: {
  title: string
  description: string
  icon: React.ElementType
  children: React.ReactNode
}) {
  return (
    <Card className="border shadow-sm">
      <CardHeader className="p-5 border-b">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Icon className="size-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-sm font-bold">{title}</CardTitle>
            <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {children}
        </div>
      </CardContent>
    </Card>
  )
}

function Field({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={`flex flex-col gap-1.5 ${className ?? ""}`}>{children}</div>
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface StakeholderProfileEditorProps {
  backHref?: string
}

export default function StakeholderProfileEditor({ backHref = "/stakeholder/profile" }: StakeholderProfileEditorProps) {
  const { currentUser, refreshCurrentUser, updateCurrentUserContext } = useAppState()

  // ── Derive initial values from the users table record ─────────────────────
  const [form, setForm] = useState({
    // Contact
    fullName: currentUser?.fullName ?? currentUser?.full_name ?? "",
    phone: currentUser?.phone ?? "",
    // Organisation
    organizationName: currentUser?.organization ?? "",
    organizationType: "",
    industry: "",
    website: "",
    biography: currentUser?.biography ?? "",
    // Position
    positionTitle: currentUser?.occupation ?? "",
    // Partnership
    partnershipInterest: "",
    partnershipType: "",
    partnershipStartDate: "",
    partnershipNotes: "",
  })

  const [logoPreview, setLogoPreview] = useState<string | null>(
    currentUser?.profilePhoto ?? currentUser?.profilePhotoUrl ?? null
  )
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [savedOnce, setSavedOnce] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)

  // ── Helpers ───────────────────────────────────────────────────────────────

  const update = useCallback((key: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }, [])

  const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPEG, PNG, or WebP).")
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB.")
      return
    }
    setLogoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setLogoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  const handleRemoveLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    if (logoInputRef.current) logoInputRef.current.value = ""
  }

  // ── Save Handler ──────────────────────────────────────────────────────────

  const handleSave = async () => {
    if (!form.fullName.trim()) {
      toast.error("Full name is required.")
      return
    }
    if (!currentUser?.id) {
      toast.error("No authenticated session found. Please sign in again.")
      return
    }

    setIsSaving(true)
    try {
      let photoUrl: string | undefined

      // 1. Upload organisation logo if a new file was selected
      if (logoFile) {
        const photoFormData = new FormData()
        photoFormData.append("file", logoFile)
        photoFormData.append("userId", currentUser.id)

        const photoResponse = await fetch("/api/profile-photo-upload", {
          method: "POST",
          body: photoFormData,
        })

        if (!photoResponse.ok) {
          const errData = await photoResponse.json().catch(() => ({}))
          throw new Error(errData.error ?? "Failed to upload organisation logo")
        }

        const photoData = await photoResponse.json()
        photoUrl = photoData.url ?? photoData.publicUrl ?? photoData.path
      }

      // 2. Build the profile payload — maps form fields to users table column names
      const profilePayload: Record<string, unknown> = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim() || undefined,
        organization: form.organizationName.trim() || undefined,
        biography: form.biography.trim() || undefined,
        occupation: form.positionTitle.trim() || undefined,
      }

      // Store org-specific metadata in the biography / custom fields
      // The users table org fields already cover organization, occupation, biography.
      // We persist extra fields as part of biography or as extended fields if available.
      if (form.organizationType) profilePayload.organizationType = form.organizationType
      if (form.industry) profilePayload.industry = form.industry
      if (form.website) profilePayload.website = form.website
      if (form.partnershipInterest) profilePayload.partnershipInterest = form.partnershipInterest
      if (form.partnershipType) profilePayload.partnershipType = form.partnershipType
      if (form.partnershipStartDate) profilePayload.partnershipStartDate = form.partnershipStartDate
      if (form.partnershipNotes) profilePayload.partnershipNotes = form.partnershipNotes
      if (photoUrl) profilePayload.profilePhotoUrl = photoUrl

      // 3. Persist to Supabase via the existing profile API endpoint
      const updateResponse = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: currentUser.id,
          profile: profilePayload,
        }),
      })

      if (!updateResponse.ok) {
        const errData = await updateResponse.json().catch(() => ({}))
        throw new Error(errData.error ?? "Failed to update profile")
      }

      // 4. Refresh global state so all portals see the update
      const refreshed = await refreshCurrentUser()
      if (refreshed) {
        updateCurrentUserContext(refreshed)
      } else {
        // Optimistic update if refresh fails
        updateCurrentUserContext({
          ...currentUser,
          ...profilePayload,
          profilePhoto: photoUrl ?? currentUser.profilePhoto,
        })
      }

      setSavedOnce(true)
      toast.success("Organisation profile updated successfully!", {
        description: "Your changes are now reflected across the platform.",
      })
    } catch (err: any) {
      console.error("StakeholderProfileEditor save error:", err)
      toast.error(err?.message ?? "An unexpected error occurred. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const email = currentUser?.email ?? ""
  const initials = (form.fullName || "?")
    .split(" ")
    .map(n => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-4xl mx-auto">

      {/* Header */}
      <div className="flex flex-col gap-1">
        <Link
          href={backHref}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors w-fit"
        >
          <ArrowLeft className="size-3.5" />
          Back to Profile
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2">
          <div>
            <h1 className="font-heading text-2xl font-bold tracking-tight">Edit Organisation Profile</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Update your stakeholder identity, organisation details, and partnership preferences.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {savedOnce && (
              <Badge variant="outline" className="gap-1.5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400">
                <CheckCircle2 className="size-3" />
                Saved
              </Badge>
            )}
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 h-9">
              {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              {isSaving ? "Saving…" : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* Logo / Avatar Upload */}
      <Card className="border shadow-sm">
        <CardContent className="p-5">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Preview circle */}
            <div className="relative shrink-0">
              <div className="size-24 rounded-2xl overflow-hidden bg-primary/10 flex items-center justify-center border-2 border-border">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Organisation logo"
                    className="size-full object-cover"
                  />
                ) : (
                  <span className="text-2xl font-bold text-primary">{initials}</span>
                )}
              </div>
              {logoPreview && (
                <button
                  onClick={handleRemoveLogo}
                  className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-destructive text-white flex items-center justify-center hover:bg-destructive/80 transition-colors"
                  title="Remove logo"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            <div className="flex flex-col gap-2 flex-1">
              <div>
                <p className="font-semibold text-sm">{form.fullName || "Organisation Representative"}</p>
                <p className="text-xs text-muted-foreground">{email}</p>
                <Badge variant="secondary" className="text-[10px] mt-1.5">Stakeholder Partner</Badge>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                  onClick={() => logoInputRef.current?.click()}
                >
                  <ImagePlus className="size-3.5" />
                  {logoPreview ? "Change Logo" : "Upload Logo"}
                </Button>
                <p className="text-[10px] text-muted-foreground">JPEG, PNG or WebP · Max 5 MB</p>
              </div>
            </div>
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={handleLogoSelect}
          />
        </CardContent>
      </Card>

      {/* Contact Information */}
      <FieldGroup
        title="Contact Information"
        description="Your personal contact details as a stakeholder representative."
        icon={User}
      >
        <Field>
          <FieldLabel required>Full Name</FieldLabel>
          <Input
            id="sh-full-name"
            placeholder="Dr. Brima Sankoh"
            value={form.fullName}
            onChange={e => update("fullName", e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel>Email Address</FieldLabel>
          <Input
            id="sh-email"
            value={email}
            disabled
            className="opacity-60 cursor-not-allowed"
          />
          <p className="text-[10px] text-muted-foreground">Email cannot be changed here. Contact the administrator.</p>
        </Field>
        <Field>
          <FieldLabel>Phone Number</FieldLabel>
          <Input
            id="sh-phone"
            placeholder="+23279630777"
            value={form.phone}
            onChange={e => update("phone", e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel>Position / Title</FieldLabel>
          <Input
            id="sh-position"
            placeholder="e.g. Executive Director, University Patron"
            value={form.positionTitle}
            onChange={e => update("positionTitle", e.target.value)}
          />
        </Field>
      </FieldGroup>

      {/* Organisation Details */}
      <FieldGroup
        title="Organisation Details"
        description="Provide information about the organisation you represent."
        icon={Building2}
      >
        <Field className="sm:col-span-2">
          <FieldLabel required>Organisation Name</FieldLabel>
          <Input
            id="sh-org-name"
            placeholder="e.g. Ministry of Education, Njala University, Orange SL"
            value={form.organizationName}
            onChange={e => update("organizationName", e.target.value)}
          />
        </Field>
        <Field>
          <FieldLabel>Organisation Type</FieldLabel>
          <Select value={form.organizationType} onValueChange={v => update("organizationType", v)}>
            <SelectTrigger id="sh-org-type">
              <SelectValue placeholder="Select type…" />
            </SelectTrigger>
            <SelectContent>
              {ORG_TYPES.map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Industry / Sector</FieldLabel>
          <Select value={form.industry} onValueChange={v => update("industry", v)}>
            <SelectTrigger id="sh-industry">
              <SelectValue placeholder="Select industry…" />
            </SelectTrigger>
            <SelectContent>
              {INDUSTRIES.map(i => (
                <SelectItem key={i} value={i}>{i}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel>Website / LinkedIn</FieldLabel>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <Input
              id="sh-website"
              placeholder="https://www.yourorganisation.org"
              value={form.website}
              onChange={e => update("website", e.target.value)}
              className="pl-9"
            />
          </div>
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel>Organisation Description</FieldLabel>
          <Textarea
            id="sh-biography"
            rows={4}
            placeholder="Briefly describe your organisation's mission, focus areas, and how it connects with NUKaFs members…"
            value={form.biography}
            onChange={e => update("biography", e.target.value)}
          />
          <p className="text-[10px] text-muted-foreground text-right">{form.biography.length}/800 characters</p>
        </Field>
      </FieldGroup>

      {/* Partnership Details */}
      <FieldGroup
        title="Partnership & Collaboration"
        description="Define how your organisation would like to partner with the NUKaFs student registry."
        icon={HandshakeIcon}
      >
        <Field>
          <FieldLabel>Partnership Interest</FieldLabel>
          <Select value={form.partnershipInterest} onValueChange={v => update("partnershipInterest", v)}>
            <SelectTrigger id="sh-partnership-interest">
              <SelectValue placeholder="Select interest level…" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Active">Active — ready to start immediately</SelectItem>
              <SelectItem value="Exploring">Exploring — in early discussions</SelectItem>
              <SelectItem value="Observing">Observing — monitoring the registry</SelectItem>
              <SelectItem value="Alumni Sponsor">Alumni Sponsor</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Primary Partnership Type</FieldLabel>
          <Select value={form.partnershipType} onValueChange={v => update("partnershipType", v)}>
            <SelectTrigger id="sh-partnership-type">
              <SelectValue placeholder="Select type…" />
            </SelectTrigger>
            <SelectContent>
              {PARTNERSHIP_TYPES.map(pt => (
                <SelectItem key={pt} value={pt}>{pt}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field>
          <FieldLabel>Partnership Start Date</FieldLabel>
          <Input
            id="sh-partnership-date"
            type="date"
            value={form.partnershipStartDate}
            onChange={e => update("partnershipStartDate", e.target.value)}
          />
        </Field>
        <Field className="sm:col-span-2">
          <FieldLabel>Additional Notes</FieldLabel>
          <Textarea
            id="sh-partnership-notes"
            rows={3}
            placeholder="Any specific requirements, conditions, or objectives for the partnership…"
            value={form.partnershipNotes}
            onChange={e => update("partnershipNotes", e.target.value)}
          />
        </Field>
      </FieldGroup>

      {/* Info banner */}
      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 flex items-start gap-3">
        <AlertTriangle className="size-4 text-primary shrink-0 mt-0.5" />
        <div className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">Stakeholder Profile Note: </span>
          Your profile is used by the NUKaFs Executive team to verify your organisation and facilitate partnerships.
          Please ensure your information is accurate and up to date. Changes are saved directly — no approval step is required for Stakeholders.
        </div>
      </div>

      {/* Bottom Save */}
      <div className="flex justify-end gap-3 pt-2 border-t">
        <Button variant="outline" asChild className="h-9">
          <Link href={backHref}>Cancel</Link>
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2 h-9">
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
          {isSaving ? "Saving…" : "Save Changes"}
        </Button>
      </div>
    </div>
  )
}
