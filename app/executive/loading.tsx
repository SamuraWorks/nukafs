import { PageLoadingSkeleton } from "@/components/shared/page-states"

export default function ExecutiveLoading() {
  return (
    <div className="p-6">
      <PageLoadingSkeleton rows={4} />
    </div>
  )
}
