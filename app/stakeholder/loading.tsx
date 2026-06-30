import { PageLoadingSkeleton } from "@/components/shared/page-states"

export default function StakeholderLoading() {
  return (
    <div className="p-6">
      <PageLoadingSkeleton rows={4} />
    </div>
  )
}
