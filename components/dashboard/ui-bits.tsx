import type { LucideIcon } from "lucide-react"
import { TrendingDown, TrendingUp } from "lucide-react"
import type { ReactNode } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { MembershipStatus, RequestStatus } from "@/lib/types/registry"

export function PageHeader({
  title,
  description,
  action,
}: {
  title: string
  description?: string
  action?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-1">
        <h2 className="font-heading text-2xl font-bold tracking-tight text-balance">{title}</h2>
        {description && <p className="text-sm text-muted-foreground text-pretty">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export function StatCard({
  label,
  value,
  icon: Icon,
  trend,
  trendUp,
  hint,
}: {
  label: string
  value: string | number
  icon: LucideIcon
  trend?: string
  trendUp?: boolean
  hint?: string
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          <span className="font-heading text-2xl font-bold tracking-tight">{value}</span>
          {trend && (
            <div className="mt-1 flex items-center gap-1 text-xs">
              {trendUp ? (
                <TrendingUp className="size-3.5 text-primary" />
              ) : (
                <TrendingDown className="size-3.5 text-destructive" />
              )}
              <span className={cn(trendUp ? "text-primary" : "text-destructive", "font-medium")}>{trend}</span>
              {hint && <span className="text-muted-foreground">{hint}</span>}
            </div>
          )}
        </div>
        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
      </CardContent>
    </Card>
  )
}

const STATUS_LABEL: Record<MembershipStatus, string> = {
  active: "Active",
  pending: "Pending Verification",
  expired: "Expired",
  suspended: "Suspended",
  inactive: "Inactive",
  revoked: "Revoked",
}

export function StatusBadge({ status }: { status: MembershipStatus }) {
  const styles: Record<MembershipStatus, string> = {
    active: "border-primary/30 bg-primary/10 text-primary",
    pending: "border-chart-3/40 bg-chart-3/10 text-chart-3",
    expired: "border-muted-foreground/30 bg-muted text-muted-foreground",
    suspended: "border-destructive/30 bg-destructive/10 text-destructive",
    inactive: "border-amber-500/30 bg-amber-50 text-amber-700",
    revoked: "border-destructive/40 bg-destructive/10 text-destructive",
  }
  return (
    <Badge variant="outline" className={cn("capitalize", styles[status])}>
      {STATUS_LABEL[status]}
    </Badge>
  )
}

export function RequestBadge({ status }: { status: RequestStatus }) {
  const styles: Record<RequestStatus, string> = {
    pending: "border-chart-3/40 bg-chart-3/10 text-chart-3",
    approved: "border-primary/30 bg-primary/10 text-primary",
    rejected: "border-destructive/30 bg-destructive/10 text-destructive",
  }
  return (
    <Badge variant="outline" className={cn("capitalize", styles[status])}>
      {status}
    </Badge>
  )
}
