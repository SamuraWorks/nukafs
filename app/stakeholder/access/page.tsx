"use client"

import { ShieldCheck, Check, X, Lock } from "lucide-react"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePermissions } from "@/lib/hooks/use-permissions"
import type { Permission } from "@/lib/auth/rbac"

const ACCESS_MODULES: {
  module: string
  permissions: Permission[]
}[] = [
  { module: "Student Directory", permissions: ["students:read"] },
  { module: "Analytics & Reports", permissions: ["analytics:read", "reports:read"] },
  { module: "Opportunities", permissions: ["opportunities:read"] },
  { module: "Announcements & Events", permissions: ["announcements:read", "events:read"] },
  { module: "System Settings", permissions: ["settings:read", "settings:write"] },
]

export default function StakeholderAccessPage() {
  const { role, permissions, canAny } = usePermissions()

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-10 font-sans">
      <PageHeader
        title="Access Level"
        description="Your current access scope within the NUKAFS Registry platform."
      />

      <Card className="border shadow-sm">
        <CardHeader className="border-b bg-muted/20 p-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShieldCheck className="size-5" aria-hidden />
            </div>
            <div>
              <CardTitle className="text-base capitalize">
                Current Role: {role.replace(/_/g, " ")}
              </CardTitle>
              <CardDescription>
                {permissions.length} permissions granted · read-only stakeholder access
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-5">
          <div className="flex flex-wrap gap-2">
            {permissions.map((permission) => (
              <Badge key={permission} variant="secondary" className="font-mono text-[10px]">
                {permission}
              </Badge>
            ))}
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/10 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 text-left">Module</th>
                  <th className="px-5 py-3 text-center">Access</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ACCESS_MODULES.map(({ module, permissions: required }) => {
                  const allowed = canAny(required)
                  return (
                    <tr key={module} className="hover:bg-muted/5">
                      <td className="px-5 py-3 text-xs font-semibold">{module}</td>
                      <td className="px-5 py-3 text-center">
                        {allowed ? (
                          <Check className="mx-auto size-4 text-emerald-500" aria-label="Allowed" />
                        ) : (
                          <X className="mx-auto size-4 text-destructive opacity-50" aria-label="Denied" />
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-4 text-sm text-muted-foreground">
            <Lock className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
            <p>
              Access is enforced server-side when the backend is connected. JWT claims and RBAC
              policies will mirror this matrix for production security.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
