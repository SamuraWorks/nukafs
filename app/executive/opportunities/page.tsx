"use client"

import { Plus, Briefcase, GraduationCap, Users } from "lucide-react"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function OpportunitiesManagerPage() {
  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-5xl mx-auto">
      <PageHeader
        title="Opportunities Manager"
        description="Publish and manage scholarships, internships, and employment programs."
        action={
          <Button className="gap-2 bg-primary">
            <Plus className="size-4" /> Post Opportunity
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border shadow-sm cursor-pointer hover:border-emerald-500/50">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <div className="size-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2"><GraduationCap className="size-5" /></div>
            <h3 className="font-bold">Scholarships</h3>
            <p className="text-xs text-muted-foreground">Manage financial aid</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm cursor-pointer hover:border-amber-500/50">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <div className="size-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-2"><Briefcase className="size-5" /></div>
            <h3 className="font-bold">Internships</h3>
            <p className="text-xs text-muted-foreground">Manage placements</p>
          </CardContent>
        </Card>
        <Card className="border shadow-sm cursor-pointer hover:border-blue-500/50">
          <CardContent className="p-6 flex flex-col items-center text-center gap-2">
            <div className="size-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-2"><Users className="size-5" /></div>
            <h3 className="font-bold">Mentorships</h3>
            <p className="text-xs text-muted-foreground">Manage mentorships</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm mt-4">
        <CardHeader className="p-5 border-b">
           <CardTitle className="text-base">Active Postings</CardTitle>
        </CardHeader>
        <CardContent className="p-10 flex flex-col items-center justify-center text-center border-dashed border m-5 rounded-xl text-muted-foreground">
           <Briefcase className="size-10 mb-4 opacity-20" />
           <p className="font-semibold text-foreground">No active opportunities</p>
           <p className="text-xs">Click "Post Opportunity" to create a new program.</p>
        </CardContent>
      </Card>
    </div>
  )
}
