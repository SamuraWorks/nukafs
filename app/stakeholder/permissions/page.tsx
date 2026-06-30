"use client"

import { ShieldCheck, Check, X } from "lucide-react"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const permissions = [
  { module: "Student Directory", view: true, create: false, edit: false, delete: false },
  { module: "Analytics & Reports", view: true, create: false, edit: false, delete: false },
  { module: "Opportunities", view: true, create: false, edit: false, delete: false },
  { module: "Announcements & Events", view: true, create: false, edit: false, delete: false },
  { module: "System Settings", view: false, create: false, edit: false, delete: false },
]

export default function StakeholderPermissionsPage() {
  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-4xl mx-auto">
      <PageHeader
        title="Role & Permissions"
        description="Review your access rights within the NUKAFS Registry Platform."
      />
      
      <Card className="border shadow-sm">
        <CardHeader className="p-5 border-b bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/10 rounded-full flex items-center justify-center text-primary">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <CardTitle className="text-base">Current Role: Stakeholder</CardTitle>
              <CardDescription>Read-only access for intelligence gathering and support identification.</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/10 border-b text-xs uppercase text-muted-foreground font-semibold">
                <tr>
                  <th className="text-left py-3 px-5">Module</th>
                  <th className="text-center py-3 px-5">View</th>
                  <th className="text-center py-3 px-5">Create</th>
                  <th className="text-center py-3 px-5">Edit</th>
                  <th className="text-center py-3 px-5">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {permissions.map(p => (
                  <tr key={p.module} className="hover:bg-muted/5">
                    <td className="py-3 px-5 font-semibold text-xs">{p.module}</td>
                    <td className="py-3 px-5 text-center">
                      {p.view ? <Check className="size-4 text-emerald-500 mx-auto" /> : <X className="size-4 text-destructive mx-auto opacity-50" />}
                    </td>
                    <td className="py-3 px-5 text-center">
                      {p.create ? <Check className="size-4 text-emerald-500 mx-auto" /> : <X className="size-4 text-destructive mx-auto opacity-50" />}
                    </td>
                    <td className="py-3 px-5 text-center">
                      {p.edit ? <Check className="size-4 text-emerald-500 mx-auto" /> : <X className="size-4 text-destructive mx-auto opacity-50" />}
                    </td>
                    <td className="py-3 px-5 text-center">
                      {p.delete ? <Check className="size-4 text-emerald-500 mx-auto" /> : <X className="size-4 text-destructive mx-auto opacity-50" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
