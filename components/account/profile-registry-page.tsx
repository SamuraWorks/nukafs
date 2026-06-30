"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  Download,
  FileText,
  Globe2,
  Home,
  Lock,
  MapPin,
  Maximize2,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { DigitalMembershipCard } from "@/components/membership/digital-membership-card"
import { MembershipQrCode } from "@/components/membership/membership-qr-code"
import { memberToVerifiedProfile, type VerifiedMemberProfile } from "@/lib/membership"

export function ProfileRegistryPageView({
  title = "Profile & Registry",
  description = "Your approved registry identity, membership card, and verified profile information.",
  profileUpdateHref = "/dashboard/profile/edit",
}: {
  title?: string
  description?: string
  profileUpdateHref?: string
}) {
  const { currentUser, currentRole, isHydrated } = useAppState()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  const verifiedProfile = useMemo<VerifiedMemberProfile | null>(() => {
    if (!currentUser) return null
    return memberToVerifiedProfile(currentUser, currentRole)
  }, [currentUser, currentRole])

  const isStudent = currentRole.startsWith("student")
  const completion = currentUser?.profileCompletion ?? 0
  const membershipStatus = currentUser?.status
    ? `${String(currentUser.status).charAt(0).toUpperCase()}${String(currentUser.status).slice(1)}`
    : "Active"
  const roleLabel =
    currentUser?.roleLabel || currentUser?.title || (!isStudent ? currentRole.replace("_", " ") : "Student")

  const personalFields = [
    { label: "Full Name", value: currentUser?.fullName || currentUser?.name },
    { label: "Membership ID", value: verifiedProfile?.membershipId },
    { label: "Membership Number", value: currentUser?.membershipNumber || currentUser?.staffId },
    { label: "Current Role", value: roleLabel },
    { label: "Membership Type", value: verifiedProfile?.membershipType },
    { label: "Email Address", value: currentUser?.email },
    { label: "Phone Number", value: currentUser?.phone },
    { label: "Gender", value: currentUser?.gender },
    { label: "Date of Birth", value: currentUser?.dateOfBirth },
    { label: "Nationality", value: currentUser?.nationality },
    { label: "District", value: currentUser?.district },
    { label: "Chiefdom", value: currentUser?.chiefdom },
    { label: "Town / Village", value: currentUser?.town },
    { label: "Home Address", value: currentUser?.homeAddress },
    { label: "Current Address", value: currentUser?.currentAddress },
  ]

  const academicFields = isStudent
    ? [
        { label: "University", value: currentUser?.university },
        { label: "Faculty", value: verifiedProfile?.faculty },
        { label: "Department", value: currentUser?.department },
        { label: "Course of Study", value: currentUser?.course },
        { label: "Academic Level", value: currentUser?.level },
        { label: "Student ID Number", value: currentUser?.studentId || currentUser?.membershipNumber },
        { label: "Admission Year", value: currentUser?.admissionYear },
        { label: "Graduation Year", value: currentUser?.graduationYear },
        {
          label: "Current Status",
          value:
            currentUser?.employmentStatus === "Student"
              ? "Current Student"
              : currentUser?.employmentStatus === "Employed"
              ? "Graduate / Alumnus"
              : currentUser?.employmentStatus,
        },
      ]
    : [
        { label: "Organization / Employer", value: currentUser?.organization },
        { label: "Position", value: currentUser?.title },
        { label: "Stakeholder Category", value: currentUser?.stakeholderCategory },
        { label: "Partnership Details", value: currentUser?.partnershipDetails },
      ]

  const professionalFields = [
    { label: "Occupation", value: currentUser?.occupation },
    { label: "Skills", value: currentUser?.skills?.join(", ") },
    { label: "Certifications", value: currentUser?.certifications?.join(", ") },
    { label: "Leadership Experience", value: currentUser?.leadershipExperience },
    { label: "Biography", value: currentUser?.bio || currentUser?.about },
  ].filter((item) => item.value)

  const emergencyFields = [
    { label: "Emergency Contact", value: currentUser?.emergencyContact?.name },
    { label: "Relationship", value: currentUser?.emergencyContact?.relationship },
    { label: "Phone Number", value: currentUser?.emergencyContact?.phone },
  ]

  const supportingDocuments = currentUser?.documents || []

  const handleDownload = () => {
    setIsDownloading(true)
    setTimeout(() => {
      setIsDownloading(false)
    }, 1200)
  }

  if (!isHydrated) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">Loading your registry profile...</p>
      </div>
    )
  }

  if (!currentUser) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 text-center">
        <PageHeader
          title={title}
          description="Sign in to access your permanent digital identity and membership card."
        />
        <p className="text-sm text-muted-foreground">
          No authenticated user is available. Please sign in to view your profile registry.
        </p>
      </div>
    )
  }

  if (currentRole === "student_pending") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <PageHeader
          title="Profile & Registry"
          description="Your profile application is pending review. Approved access is required to see your full registry record."
        />
        <Card className="border">
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-5 text-amber-600" />
              <div>
                <h2 className="font-semibold">Registration Pending Review</h2>
                <p className="text-sm text-muted-foreground">
                  Your membership application is under review. Once approved, your Profile & Registry module and Digital ID Card will appear here.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentRole === "student_active_wizard") {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <PageHeader
          title="Profile & Registry"
          description="Complete your profile setup to unlock your permanent digital identity and membership card."
        />
        <Card className="border">
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Lock className="size-5 text-primary" />
              <div>
                <h2 className="font-semibold">Profile Setup In Progress</h2>
                <p className="text-sm text-muted-foreground">
                  Your registry profile is not complete yet. Finish the setup wizard to generate your Membership ID, QR code, and full Registry record.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                className="gap-2"
                render={<Link href="/setup" />}
              >
                Continue Setup
              </Button>
              <Button variant="outline" disabled className="gap-2">
                <Download className="size-4" />
                Download ID
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4">
      <PageHeader
        title={title}
        description={description}
        action={
          <Button
            size="sm"
            variant="secondary"
            className="gap-2"
            render={<Link href={profileUpdateHref} />}
          >
            Edit Profile
          </Button>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[2.2fr_1fr]">
        <div className="space-y-6">
          <Card className="border">
            <CardHeader>
              <CardTitle>Your Registry Identity</CardTitle>
              <CardDescription>
                This profile is the authoritative record for your membership. Information displayed here is synced from your approved profile and registry data.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-5 md:grid-cols-2">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-14 w-14 items-center justify-center rounded-full text-xl font-bold text-white"
                    style={{ backgroundColor: currentUser.avatarColor || "oklch(0.55 0.12 210)" }}
                  >
                    {String(currentUser.fullName || currentUser.name || "NUKAFS").split(" ")
                      .map((part: string) => part[0])
                      .slice(0, 2)
                      .join("")}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Verified Member</p>
                    <h2 className="text-lg font-semibold">{currentUser.fullName || currentUser.name}</h2>
                  </div>
                </div>

                <div className="grid gap-3">
                  {personalFields.slice(0, 6).map((field) => (
                    <div key={field.label}>
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                        {field.label}
                      </p>
                      <p className="mt-1 font-semibold">{field.value || "—"}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-border p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Status</p>
                    <p className="mt-1 text-lg font-semibold">{membershipStatus}</p>
                  </div>
                  <Badge variant="secondary">{roleLabel}</Badge>
                </div>
                <div className="mt-5 space-y-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-[0.14em]">Membership ID</p>
                    <p className="mt-1 font-semibold">{verifiedProfile?.membershipId || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-[0.14em]">QR Code</p>
                    <p className="mt-1 font-semibold">{verifiedProfile?.qrCodeValue || "—"}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase tracking-[0.14em]">Issued</p>
                    <p className="mt-1 font-semibold">{verifiedProfile?.dateIssued || "—"}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader>
              <CardTitle>Digital Membership Card</CardTitle>
              <CardDescription>
                Your permanent ID card is linked to the same membership identity and QR code for life.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-3xl border border-muted p-4 bg-background">
                {verifiedProfile ? (
                  <DigitalMembershipCard
                    member={verifiedProfile}
                    isFlipped={isFlipped}
                    onFlip={() => setIsFlipped((open) => !open)}
                    className="mx-auto max-w-3xl"
                  />
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Unable to render the membership card currently.
                  </p>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <Button onClick={handleDownload} disabled={isDownloading} className="gap-2">
                  <Download className="size-4" />
                  {isDownloading ? "Preparing PDF..." : "Download ID (PDF)"}
                </Button>
                <Button variant="outline" onClick={() => window.print()} className="gap-2">
                  <Download className="size-4" />
                  Print Card
                </Button>
                <Button variant="secondary" onClick={() => setIsFullscreen(true)} className="gap-2">
                  <Maximize2 className="size-4" />
                  Full Screen
                </Button>
              </div>

              <div className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
                <p>
                  QR verification opens the public registry verification page. Your QR code and membership ID are permanent, non-editable identifiers.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader>
              <CardTitle>Academic & Professional Details</CardTitle>
              <CardDescription>
                Approved registry fields are synced automatically from your profile.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {academicFields.map((field) => (
                <div key={field.label} className="rounded-xl border p-4">
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  <p className="mt-1 font-semibold">{field.value || "—"}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {professionalFields.length > 0 && (
            <Card className="border">
              <CardHeader>
                <CardTitle>Professional Information</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4">
                {professionalFields.map((field) => (
                  <div key={field.label} className="rounded-xl border p-4">
                    <p className="text-xs text-muted-foreground">{field.label}</p>
                    <p className="mt-1 font-semibold">{field.value || "—"}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <aside className="space-y-6">
          <Card className="border">
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
              <CardDescription>
                Completion reflects the latest approved profile data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Overall completion</span>
                  <span>{completion}%</span>
                </div>
                <Progress value={completion} />
              </div>

              <div className="grid gap-3 text-sm">
                <div className="rounded-xl border p-4">
                  <p className="text-muted-foreground">Personal Information</p>
                  <p className="mt-1 font-semibold">{completion >= 100 ? "Complete" : "Incomplete"}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-muted-foreground">Academic / Professional</p>
                  <p className="mt-1 font-semibold">{completion >= 100 ? "Complete" : "Pending"}</p>
                </div>
                <div className="rounded-xl border p-4">
                  <p className="text-muted-foreground">Supporting Documents</p>
                  <p className="mt-1 font-semibold">
                    {supportingDocuments.length > 0 ? `${supportingDocuments.length} uploaded` : "No documents"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader>
              <CardTitle>Emergency Contact</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4">
              {emergencyFields.map((field) => (
                <div key={field.label}>
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                  <p className="mt-1 font-semibold">{field.value || "Not provided"}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader>
              <CardTitle>Supporting Documents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {supportingDocuments.length > 0 ? (
                supportingDocuments.map((doc: any) => (
                  <div
                    key={doc.name}
                    className="flex items-center justify-between rounded-xl border p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">{doc.type}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      render={<Link href={doc.url} />}
                    >
                      Download
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  No supporting documents are currently attached to this profile.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border">
            <CardHeader>
              <CardTitle>Verification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-xl border p-4">
                <p className="text-xs text-muted-foreground">Membership status</p>
                <p className="mt-1 font-semibold">{membershipStatus}</p>
              </div>
              <div className="rounded-xl border p-4">
                <p className="text-xs text-muted-foreground">QR Code verification</p>
                <MembershipQrCode
                  membershipNumber={currentUser?.membershipNumber || currentUser?.staffId || ""}
                  qrCodeValue={verifiedProfile?.qrCodeValue}
                />
              </div>
              <Button
                variant="outline"
                className="w-full gap-2"
                render={<Link href={`/verify/${encodeURIComponent(currentUser?.membershipNumber || "")}`} />}
              >
                View Public Verification
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>

      {isFullscreen && verifiedProfile && (
        <div className="fixed inset-0 z-50 overflow-auto bg-background/95 p-4 backdrop-blur">
          <div className="mx-auto max-w-5xl space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Full-Screen ID Card</h2>
                <p className="text-sm text-muted-foreground">
                  Use this view for mobile display or large screen review.
                </p>
              </div>
              <Button variant="ghost" onClick={() => setIsFullscreen(false)}>
                Close
              </Button>
            </div>
            <div className="rounded-3xl border border-muted bg-white p-6 shadow-lg">
              <DigitalMembershipCard
                member={verifiedProfile}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped((value) => !value)}
                className="w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
