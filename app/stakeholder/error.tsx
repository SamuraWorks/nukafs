"use client"

import { ErrorState } from "@/components/shared/page-states"

export default function StakeholderError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-6">
      <ErrorState
        title="Stakeholder portal unavailable"
        description={error.message || "We could not load this section."}
        onRetry={reset}
      />
    </div>
  )
}
