"use client"

import { ErrorState } from "@/components/shared/page-states"

export default function ExecutiveError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="p-6">
      <ErrorState
        title="Executive portal unavailable"
        description={error.message || "We could not load this section."}
        onRetry={reset}
      />
    </div>
  )
}
