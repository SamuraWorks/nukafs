"use client"

import Link from "next/link"
import {
  Lock,
  Edit2,
  CheckCircle2,
  ShieldCheck,
  User,
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export function UserProfileView({
  locked = true,
  profileUpdateHref,
}: {
  locked?: boolean
  profileUpdateHref?: string
}) {
  const { currentUser, currentRole } = useAppState()

  const isStudent = currentRole.startsWith("student")
  const fullName = currentUser?.fullName || currentUser?.name || "Registry Member"
  const membershipId =
    currentUser?.membershipNumber || currentUser?.staffId || "NUKaFs-STAFF-001"
  const roleLabel =
    currentUser?.roleLabel ||
    currentUser?.title ||
    (isStudent ? "Student Member" : currentRole.replace("_", " "))
  const profileCompletion = currentUser?.profileCompletion ?? 100
  const membershipStatus = currentUser?.status
    ? String(currentUser.status).charAt(0).toUpperCase() +
      String(currentUser.status).slice(1)
    : "Active"
  const isVerified = profileCompletion >= 100 && membershipStatus === "Active"

  const fields = isStudent
    ? [
        { label: "Email", value: currentUser?.email },
        { label: "Phone Number", value: currentUser?.phone },
        { label: "District", value: currentUser?.district },
        { label: "University", value: currentUser?.university },
        { label: "Department", value: currentUser?.department },
        { label: "Course of Study", value: currentUser?.course },
        { label: "Academic Level", value: currentUser?.level },
      ]
    : [
        { label: "Email", value: currentUser?.email },
        { label: "Phone Number", value: currentUser?.phone || "+232 76 000 000" },
        { label: "Organization", value: currentUser?.organization || "NUKaFs Secretariat" },
        { label: "Title", value: currentUser?.title || roleLabel },
        { label: "District", value: currentUser?.district || "Koinadugu & Falaba" },
        { label: "Department", value: currentUser?.department || "Executive Affairs" },
      ]

  const updateHref =
    profileUpdateHref ||
    (isStudent ? "/dashboard/profile/edit" : undefined)

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 font-sans">
      <PageHeader
        title="My Profile"
        description="Your official registry profile and membership record."
        action={
          locked && updateHref ? (
            <Button
              size="sm"
              className="gap-1.5"
              render={<Link href={updateHref} />}
            >
              <Edit2 className="size-3.5" />
              Edit Profile
            </Button>
          ) : !locked ? (
            <Button size="sm" variant="outline" className="gap-1.5">
              <Edit2 className="size-3.5" />
              Edit Profile
            </Button>
          ) : undefined
        }
      />

      {locked && (
        <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4">
          <Lock className="size-5 shrink-0 text-primary" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">
              Profile Locked
            </h4>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Direct edits are applied immediately, while permanent membership identity details remain locked.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border shadow-md md:col-span-1">
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div
              className="mb-4 flex size-20 items-center justify-center rounded-full text-2xl font-extrabold text-white"
              style={{
                backgroundColor:
                  currentUser?.avatarColor || "oklch(0.52 0.12 158)",
              }}
            >
              {fullName
                .split(" ")
                .map((n: string) => n[0])
                .slice(0, 2)
                .join("")}
            </div>
            <h3 className="font-heading text-lg font-bold">{fullName}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{membershipId}</p>
            <Badge variant="outline" className="mt-3 border-primary/30 bg-primary/5 text-primary">
              {roleLabel}
            </Badge>

            <div className="mt-5 w-full space-y-3 border-t pt-4 text-left text-xs">
              <div>
                <span className="text-muted-foreground">Membership Status</span>
                <p className="mt-0.5 font-semibold">{membershipStatus}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Profile Completion</span>
                <div className="mt-1.5 flex items-center gap-2">
                  <Progress value={profileCompletion} className="h-2 flex-1" />
                  <span className="font-semibold">{profileCompletion}%</span>
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Verification Status</span>
                <p className="mt-0.5 flex items-center gap-1 font-semibold">
                  {isVerified ? (
                    <>
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      Verified
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="size-3.5 text-amber-500" />
                      Pending Verification
                    </>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-md md:col-span-2">
          <CardContent className="p-6">
            <h4 className="mb-4 flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-wider text-primary">
              <User className="size-4" />
              Profile Details
            </h4>
            <div className="grid gap-3 sm:grid-cols-2">
              {fields.map((field) => (
                <div key={field.label} className="rounded-lg border p-3 text-xs">
                  <span className="text-muted-foreground">{field.label}</span>
                  <p className="mt-1 font-semibold">{field.value || "—"}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
