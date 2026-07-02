"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function StakeholderEventsPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/stakeholder/announcements")
  }, [router])

  return null
}
