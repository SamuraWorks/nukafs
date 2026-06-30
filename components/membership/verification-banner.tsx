import { ShieldCheck, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { MembershipStatus } from "@/lib/mock-data"

function formatStatusLabel(status: MembershipStatus) {
  switch (status) {
    case "active":
      return "Active"
    case "pending":
      return "Pending Verification"
    case "suspended":
      return "Suspended"
    case "inactive":
      return "Inactive"
    case "expired":
      return "Expired"
    case "revoked":
      return "Revoked"
    default:
      return status
  }
}

interface VerificationBannerProps {
  status: MembershipStatus
  className?: string
}

export function VerificationBanner({ status, className }: VerificationBannerProps) {
  const isActive = status === "active"
  const statusLabel = formatStatusLabel(status)

  return (
    <div
      className={cn(
        "flex w-full items-center justify-center gap-3 px-6 py-4 text-center text-sm font-medium text-white shadow-md",
        isActive ? "bg-emerald-600" : "bg-amber-600",
        className,
      )}
    >
      {isActive ? (
        <>
          <ShieldCheck className="size-5 shrink-0" />
          <span>
            This is a verified member of the National Union of Koinadugu and
            Falaba Students (NUKAFS-SL).
          </span>
        </>
      ) : (
        <>
          <AlertCircle className="size-5 shrink-0" />
          <span>
            This membership account is currently{" "}
            <span className="font-semibold uppercase">{statusLabel}</span>.
          </span>
        </>
      )}
    </div>
  )
}
