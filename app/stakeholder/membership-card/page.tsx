"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StakeholderMembershipCardPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/stakeholder/profile")
  }, [router])

  return null
}
