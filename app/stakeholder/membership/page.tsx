"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StakeholderMembershipPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/stakeholder/insights")
  }, [router])

  return null
}
