import { PageLoading } from "@/components/shared/page-states"

export default function VerifyLoading() {
  return (
    <div className="min-h-screen bg-[#f4f6f9]">
      <PageLoading message="Verifying membership..." />
    </div>
  )
}
