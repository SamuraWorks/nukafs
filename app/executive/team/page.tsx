"use client"

import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function ExecutiveTeamPage() {
  const { teamMembers } = useAppState()
  
  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-5xl mx-auto">
      <PageHeader
        title="Executive Team"
        description="Directory of the NUKaFs executive committee."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {teamMembers.map(member => (
          <Card key={member.id} className="border shadow-sm">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="size-16 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xl mb-4">
                 {member.name.split(" ").map(n=>n[0]).join("")}
              </div>
              <h3 className="font-bold text-base">{member.name}</h3>
              <p className="text-xs text-primary font-semibold mt-1">{member.role}</p>
              <Badge variant="outline" className="mt-3 text-[10px] bg-emerald-50 text-emerald-700">{member.status}</Badge>
              <p className="text-xs text-muted-foreground mt-4">{member.email}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
