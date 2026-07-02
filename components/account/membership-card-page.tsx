"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Download, ExternalLink } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { DigitalMembershipCard } from "@/components/membership/digital-membership-card"
import { studentToVerifiedProfile, type VerifiedMemberProfile } from "@/lib/membership"
import { memberToVerifiedProfile } from "@/lib/membership"
import { toast } from "sonner"

function staffToVerifiedProfile(user: {
  name?: string
  fullName?: string
  email?: string
  role?: string
  title?: string
}): VerifiedMemberProfile {
  const name = user.fullName || user.name || "NUKaFs Member"
  const staffId = `NUKaFs-STAFF-${name.split(" ").map((p) => p[0]).join("")}`
  return {
    fullName: name,
    membershipNumber: staffId,
    membershipId: `NUKaFs-STAFF-ID-${name.split(" ").map((p) => p[0]).join("")}`,
    qrCodeValue: `NUKaFs-QR-STAFF-${name.split(" ").map((p) => p[0]).join("")}`,
    membershipStatus: "active",
    qrCodeStatus: "active",
    membershipType: "Student",
    university: "NUKaFs Secretariat",
    faculty: "Executive Affairs",
    department: user.title || "Registry Operations",
    course: user.role?.replace("_", " ") || "Staff Member",
    academicLevel: "N/A",
    district: "Koinadugu & Falaba",
    dateRegistered: "2024-01-15",
    dateApproved: "2024-01-16",
    dateIssued: "2024-01-16",
    currentRole:
      user.role === "super_admin"
        ? "Super Admin"
        : user.role === "executive"
          ? "Executive"
          : user.role === "stakeholder"
            ? "Stakeholder"
            : "Administrator",
    avatarColor: "oklch(0.45 0.12 158)",
    cardSerialNumber: staffId.replace("NUKaFs-", "NUKaFs"),
    isMigratedToDigitalRegistry: false,
    legacyMembershipHistory: "Staff account"
  }
}

export function MembershipCardPageView({
  title = "Digital Membership Card",
  description = "ISO CR80 standard ID card with QR verification link.",
}: {
  title?: string
  description?: string
}) {
  const { currentUser } = useAppState()
  const [isDownloading, setIsDownloading] = useState(false)
  const [isFlipped, setIsFlipped] = useState(false)

  const member = useMemo<VerifiedMemberProfile | null>(() => {
    if (!currentUser) return null

    return memberToVerifiedProfile(currentUser as any, currentUser?.role)
  }, [currentUser])

  // Use the stored permanent QR code URL from the database if available
  // Falls back to constructing a verify URL from the membership number
  const storedQrCode = (currentUser as any)?.qrCode || (currentUser as any)?.permanentQrCode
  const verifyUrl = storedQrCode && /^https?:\/\//i.test(storedQrCode)
    ? storedQrCode
    : `/verify/${encodeURIComponent(member?.membershipNumber ?? "")}`

  const handleDownload = () => {
    setIsDownloading(true)
    toast.info("Generating printable membership card...")
    setTimeout(() => {
      setIsDownloading(false)
      toast.success("Membership card downloaded to your device!")
    }, 2000)
  }

  if (!member) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col gap-6">
        <PageHeader title={title} description={description} />
        <div className="rounded-xl border border-muted p-8 text-center text-sm text-muted-foreground">
          No valid membership profile is available. Please sign in with a registered student account to view your digital membership card.
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <PageHeader
        title={title}
        description={description}
        action={
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
            className="flex cursor-pointer items-center gap-1.5"
          >
            {isDownloading ? (
              <Download className="size-4 animate-spin" />
            ) : (
              <Download className="size-4" />
            )}
            Download ID (PDF)
          </Button>
        }
      />

      <div className="flex flex-col items-center py-6">
        <DigitalMembershipCard
          member={member}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped((value) => !value)}
        />
      </div>

      <div className="flex justify-center">
        <Button variant="outline" className="gap-2" render={<Link href={verifyUrl} />}>
          <ExternalLink className="size-4" />
          Open Verification Page
        </Button>
      </div>
    </div>
  )
}
