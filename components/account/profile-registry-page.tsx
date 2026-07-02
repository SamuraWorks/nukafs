"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import {
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  CalendarRange,
  Download,
  FileText,
  Globe2,
  Home,
  IdCard,
  Lock,
  Mail,
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
  const profilePhotoUrl = currentUser?.profilePhotoUrl || currentUser?.profilePhoto || null
  const membershipStatus = currentUser?.status
    ? `${String(currentUser.status).charAt(0).toUpperCase()}${String(currentUser.status).slice(1)}`
    : "Active"
  const membershipType = verifiedProfile?.membershipType || currentUser?.membershipType || "Student"
  const roleLabel =
    currentUser?.roleLabel || currentUser?.title || (!isStudent ? currentRole.replace("_", " ") : "Student")

  const personalFields = [
    { label: "Full Name", value: currentUser?.fullName || currentUser?.name },
    { label: "Membership ID", value: verifiedProfile?.membershipId || currentUser?.membershipNumber || "Pending assignment" },
    { label: "Membership Type", value: verifiedProfile?.membershipType || currentUser?.membershipType || "Student" },
    { label: "System Role", value: roleLabel },
    { label: "Email Address", value: currentUser?.email },
    { label: "Phone Number", value: currentUser?.phone },
    { label: "Gender", value: currentUser?.gender },
    { label: "Date of Birth", value: currentUser?.dob || currentUser?.dateOfBirth },
    { label: "Nationality", value: currentUser?.nationality },
    { label: "District", value: currentUser?.district },
    { label: "Chiefdom", value: currentUser?.chiefdom },
    { label: "Town/Village", value: currentUser?.town },
    { label: "Home Address", value: currentUser?.homeAddress },
    { label: "Current Address", value: currentUser?.currentAddress },
  ]

  const academicFields = [
    { label: "College Status", value: currentUser?.employmentStatus === "Student" ? "Current Student" : currentUser?.employmentStatus === "Graduate" ? "Graduate" : currentUser?.employmentStatus || "Current Student" },
    { label: "University", value: currentUser?.university },
    { label: "Campus", value: currentUser?.campus },
    { label: "College", value: currentUser?.college },
    { label: "Faculty", value: currentUser?.faculty },
    { label: "Department", value: currentUser?.department },
    { label: "Course of Study", value: currentUser?.courseName || currentUser?.course },
    { label: "Academic Level", value: currentUser?.academicLevel || currentUser?.level },
    { label: "Student ID Number", value: currentUser?.studentId || currentUser?.membershipNumber },
    { label: "Admission Year", value: currentUser?.admissionYear },
    { label: "Expected Graduation Year", value: currentUser?.expectedGraduationYear },
    { label: "Graduation Year", value: currentUser?.graduationYear },
  ]

  const professionalFields = [
    { label: "Occupation", value: currentUser?.occupation },
    { label: "Organization/Employer", value: currentUser?.organization },
    { label: "Skills", value: (currentUser?.skills || []).join(", ") },
    { label: "Certifications", value: (currentUser?.certifications || []).join(", ") },
    { label: "Biography", value: currentUser?.biography || currentUser?.bio || currentUser?.about },
  ]

  const emergencyFields = [
    { label: "Contact Name", value: currentUser?.emergencyContact?.name },
    { label: "Relationship", value: currentUser?.emergencyContact?.relationship },
    { label: "Phone Number", value: currentUser?.emergencyContact?.phone },
  ]

  const supportingDocuments = [
    { name: "Profile Photo", type: "Image", url: profilePhotoUrl, uploaded: !!profilePhotoUrl },
    { name: "Student ID", type: "Document", url: currentUser?.documents?.find((d: any) => d.type === "studentId")?.url, uploaded: !!currentUser?.documents?.find((d: any) => d.type === "studentId") },
    { name: "National ID", type: "Document", url: currentUser?.documents?.find((d: any) => d.type === "nationalId")?.url, uploaded: !!currentUser?.documents?.find((d: any) => d.type === "nationalId") },
    { name: "CV/Resume", type: "Document", url: currentUser?.documents?.find((d: any) => d.type === "cv")?.url, uploaded: !!currentUser?.documents?.find((d: any) => d.type === "cv") },
    { name: "Certificates", type: "Document", url: currentUser?.documents?.find((d: any) => d.type === "certificates")?.url, uploaded: !!currentUser?.documents?.find((d: any) => d.type === "certificates") },
    { name: "Other Supporting Documents", type: "Document", url: currentUser?.documents?.find((d: any) => d.type === "other")?.url, uploaded: !!currentUser?.documents?.find((d: any) => d.type === "other") },
  ]

  const systemFields = [
    { label: "Membership ID", value: verifiedProfile?.membershipId || currentUser?.membershipNumber || "Pending assignment" },
    { label: "Membership Status", value: membershipStatus },
    { label: "Verification Status", value: currentUser?.verificationStatus || "Verified" },
    { label: "Registration Date", value: currentUser?.joinedDate || currentUser?.createdAt || "—" },
    { label: "Approval Date", value: currentUser?.dateApproved || currentUser?.joinedDate || "—" },
    { label: "Current System Role", value: roleLabel },
    { label: "Digital ID Card", value: verifiedProfile ? "Generated" : "Pending" },
    { label: "QR Verification Status", value: "Active" },
  ]

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
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800/50 dark:bg-amber-950/20">
          <CardContent className="space-y-4 py-6">
            <div className="flex items-start gap-3">
              <ShieldCheck className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-1" />
              <div className="flex-1">
                <h2 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Registration Pending Review</h2>
                <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
                  Your membership application is under review by the NUKaFs Administration. Your QR Membership Verification Code will be generated automatically once your registration is approved.
                </p>
                <ul className="text-sm text-amber-800 dark:text-amber-200 space-y-1 list-disc list-inside">
                  <li>Once approved, your membership ID and QR code will be issued instantly</li>
                  <li>Your Digital ID Card and full registry profile will become available</li>
                  <li>You'll gain access to all member benefits and features</li>
                </ul>
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
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
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

      <div className="mt-6 space-y-4">
        <Card className="border shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-center">
                <div className="flex-shrink-0">
                  {profilePhotoUrl ? (
                    <img
                      src={profilePhotoUrl}
                      alt="Profile photo"
                      className="h-24 w-24 rounded-3xl object-cover shadow-sm sm:h-28 sm:w-28"
                    />
                  ) : (
                    <div
                      className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/10 text-3xl font-semibold text-primary shadow-sm sm:h-28 sm:w-28"
                      style={{ backgroundColor: currentUser.avatarColor || "oklch(0.55 0.12 210)" }}
                    >
                      {String(currentUser.fullName || currentUser.name || "NUKaFs").split(" ")
                        .map((part: string) => part[0])
                        .slice(0, 2)
                        .join("")}
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                      {currentUser.fullName || currentUser.name}
                    </h2>
                    <Badge variant="secondary" className="w-fit">
                      {roleLabel}
                    </Badge>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                    <span className="rounded-full bg-muted px-3 py-1">{verifiedProfile?.membershipId || currentUser?.membershipNumber || "Pending assignment"}</span>
                    <span className="rounded-full bg-muted px-3 py-1">{membershipType}</span>
                    <span className="rounded-full bg-muted px-3 py-1">{membershipStatus}</span>
                    <span className="rounded-full bg-muted px-3 py-1">{currentUser?.verificationStatus || "Verified"}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => setIsFullscreen(true)}
                >
                  <IdCard className="size-4" />
                  Digital ID Card
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  render={<Link href={`/verify/${encodeURIComponent(currentUser?.membershipNumber || "")}`} />}
                >
                  <ShieldCheck className="size-4" />
                  QR Verification
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <User className="size-4 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {personalFields.map((field) => (
                <div key={field.label} className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {field.label}
                  </p>
                  <p className="mt-2 break-words text-sm font-medium text-foreground">
                    {field.value || "—"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BookOpen className="size-4 text-primary" />
              Academic Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {academicFields.map((field) => (
                <div key={field.label} className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {field.label}
                  </p>
                  <p className="mt-2 break-words text-sm font-medium text-foreground">
                    {field.value || "—"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <BriefcaseBusiness className="size-4 text-primary" />
              Professional Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {professionalFields.map((field) => (
                <div key={field.label} className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {field.label}
                  </p>
                  <p className="mt-2 break-words text-sm font-medium text-foreground">
                    {field.value || "—"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Phone className="size-4 text-primary" />
              Emergency Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-3">
              {emergencyFields.map((field) => (
                <div key={field.label} className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {field.label}
                  </p>
                  <p className="mt-2 break-words text-sm font-medium text-foreground">
                    {field.value || "Not provided"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4 text-primary" />
              Supporting Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {supportingDocuments.map((doc: any) => (
                <div key={doc.name} className="flex flex-col gap-3 rounded-2xl border bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">{doc.uploaded ? "Uploaded" : "Not provided"}</p>
                  </div>
                  {doc.uploaded ? (
                    <Button variant="outline" size="sm" className="gap-2" render={<Link href={doc.url || "#"} />}> 
                      <Download className="size-4" />
                      Download
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="gap-2" disabled> 
                      <Download className="size-4" />
                      Download
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <ShieldCheck className="size-4 text-primary" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {systemFields.map((field) => (
                <div key={field.label} className="rounded-2xl border bg-muted/20 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    {field.label}
                  </p>
                  <p className="mt-2 break-words text-sm font-medium text-foreground">
                    {field.value || "—"}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <IdCard className="size-4 text-primary" />
              Digital ID Card
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-3xl border border-muted bg-background p-3">
              {verifiedProfile ? (
                <DigitalMembershipCard
                  member={verifiedProfile}
                  isFlipped={isFlipped}
                  onFlip={() => setIsFlipped((open) => !open)}
                  className="mx-auto w-full max-w-3xl"
                />
              ) : (
                <p className="rounded-2xl bg-muted/40 p-4 text-sm text-muted-foreground">
                  Unable to render the membership card currently.
                </p>
              )}
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
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
          </CardContent>
        </Card>
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
