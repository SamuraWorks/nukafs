"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StakeholderGeographyPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/stakeholder/insights")
  }, [router])

  return null
}
