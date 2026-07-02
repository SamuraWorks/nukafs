"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { VerificationBanner } from "@/components/membership/verification-banner"
import { VerificationProfile } from "@/components/membership/verification-profile"
import type { VerifiedMemberProfile } from "@/lib/membership"
import { memberService } from "@/lib/services/registry-service"
import { PageLoading, ErrorState } from "@/components/shared/page-states"

export default function VerifyMembershipPage() {
  const params = useParams()
  // The URL segment could be a 64-char hex token or a legacy membership ID
  const id = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [member, setMember] = useState<VerifiedMemberProfile | null>(null)

  useEffect(() => {
    let cancelled = false

    const loadMember = async () => {
      // memberService.verifyMembership handles both:
      // 1. A 64-char hex token (secure QR codes) → looks up membership_identities table
      // 2. A legacy membership ID → looks up users table directly
      const profile = await memberService.verifyMembership(id)
      if (!cancelled) {
        setMember(profile)
        setIsLoading(false)
      }
    }

    const timer = setTimeout(() => {
      void loadMember()
    }, 600)

    return () => {
      cancelled = true
      clearTimeout(timer)
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f4f6f9]">
        <PageLoading message="Verifying secure credentials..." />
      </div>
    )
  }

  if (!member) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f4f6f9] p-4">
        <div className="w-full max-w-md">
          <ErrorState
            title="Verification Failed"
            description="This membership could not be verified. The QR code or verification link is invalid, expired, revoked, or no longer active."
            onRetry={() => {
              setIsLoading(true)
              setTimeout(() => {
                void (async () => {
                  const profile = await memberService.verifyMembership(id)
                  setMember(profile)
                  setIsLoading(false)
                })()
              }, 500)
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#f4f6f9] pb-12">
      <VerificationBanner status={member.membershipStatus} />

      <div className="mx-auto mt-8 max-w-3xl px-4">
        <VerificationProfile member={member} />
      </div>
    </div>
  )
}
