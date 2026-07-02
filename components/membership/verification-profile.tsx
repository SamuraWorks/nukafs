import Image from "next/image"
import { BadgeCheck, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  formatMembershipDate,
  type VerifiedMemberProfile,
} from "@/lib/membership"
import { cn } from "@/lib/utils"

interface VerificationProfileProps {
  member: VerifiedMemberProfile
}

function DetailRow({
  label,
  value,
  highlight,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex flex-col gap-0.5 border-b border-[#0a1628]/8 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <dt className="text-xs font-semibold uppercase tracking-[0.1em] text-[#0a1628]/50">
        {label}
      </dt>
      <dd
        className={cn(
          "text-sm font-medium text-[#0a1628]",
          highlight && "font-mono text-[#9a7b1a]",
        )}
      >
        {value}
      </dd>
    </div>
  )
}

function MemberAvatar({ member }: { member: VerifiedMemberProfile }) {
  const initials = (member.fullName || "NUKaFs")
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")

  return (
    <div className="relative shrink-0">
      <div
        className="flex size-28 items-center justify-center rounded-xl text-3xl font-bold text-white shadow-lg ring-4 ring-white"
        style={{ backgroundColor: member.avatarColor }}
      >
        {initials}
      </div>
      <div className="absolute -bottom-2 -right-2 flex size-9 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md ring-2 ring-white">
        <BadgeCheck className="size-5" />
      </div>
    </div>
  )
}

export function VerificationProfile({ member }: VerificationProfileProps) {
  const isActive = member.membershipStatus === "active"
  const safeMembershipStatus = member.membershipStatus ?? "active"
  const safeMembershipStatusLabel = safeMembershipStatus.charAt(0).toUpperCase() + safeMembershipStatus.slice(1)

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border-[#0a1628]/10 shadow-lg">
        <div className="h-2 bg-gradient-to-r from-[#0a1628] via-[#c9a227] to-[#0a1628]" />
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <MemberAvatar member={member} />

            <div className="min-w-0 flex-1 text-center sm:text-left">
              <div className="mb-3 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <Badge className="border-0 bg-emerald-600 text-white hover:bg-emerald-600">
                  <CheckCircle2 className="mr-1 size-3.5" />
                  Verified
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "border-[#0a1628]/15 font-semibold uppercase",
                    isActive
                      ? "border-emerald-500/40 bg-emerald-50 text-emerald-700"
                      : "border-amber-500/40 bg-amber-50 text-amber-700",
                  )}
                >
                  {safeMembershipStatusLabel}
                </Badge>
              </div>

              <h1 className="font-heading text-2xl font-bold text-[#0a1628] sm:text-3xl">
                {member.fullName}
              </h1>
              <p className="mt-1 font-mono text-sm text-[#9a7b1a]">
                {member.membershipId}
              </p>
            </div>

            <div className="hidden shrink-0 sm:block">
              <Image
                src="/nukafs-logo.png"
                alt="NUKaFs-SL"
                width={56}
                height={56}
                className="rounded-full bg-white p-1 shadow-sm ring-1 ring-[#c9a227]/30"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-[#0a1628]/10 shadow-md">
        <div className="border-b border-[#0a1628]/8 bg-[#0a1628] px-6 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-white">
            Membership Verification Record
          </h2>
        </div>
        <CardContent className="px-6 py-2">
          <dl>
            <DetailRow label="Full Name" value={member.fullName} />
            <DetailRow label="Membership ID" value={member.membershipId} highlight />
            <DetailRow label="Verification Method" value="Public QR verification" />
            <DetailRow label="Membership Status" value={safeMembershipStatusLabel} />
            <DetailRow label="Current Role" value={member.currentRole} />
            <DetailRow
              label="Student / Graduate Status"
              value={member.membershipType}
            />
            <DetailRow label="University" value={member.university} />
            <DetailRow label="Faculty" value={member.faculty} />
            <DetailRow label="Department" value={member.department} />
            <DetailRow label="Course of Study" value={member.course} />
            <DetailRow label="Academic Level" value={member.academicLevel} />
            <DetailRow label="District" value={member.district} />
            <DetailRow
              label="Date Registered"
              value={formatMembershipDate(member.dateRegistered)}
            />
            <DetailRow
              label="Date Approved"
              value={formatMembershipDate(member.dateApproved)}
            />
            <DetailRow label="Date Issued" value={formatMembershipDate(member.dateIssued)} />
            <DetailRow
              label="Union Legacy"
              value={`Union Established: 1990s • Digital Registry Launch: 2026`}
            />
            <DetailRow
              label="Migration Record"
              value={member.isMigratedToDigitalRegistry ? "Migrated to Digital Registry" : "Registered in the digital registry"}
            />
            <DetailRow label="Legacy History" value={member.legacyMembershipHistory} />
          </dl>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-[#0a1628]/50">
        <p>
          Verification generated on{" "}
          {new Date().toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="mt-1">
          &copy; {new Date().getFullYear()} National Union of Koinadugu and
          Falaba Students (NUKaFs-SL). All rights reserved.
        </p>
        <p className="mt-1 font-semibold text-[#0a1628]/70">
          Union Established: 1990s • Digital Registry Launch: 2026
        </p>
      </div>
    </div>
  )
}
