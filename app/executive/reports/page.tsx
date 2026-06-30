"use client"

import { FileBarChart, Download, Printer, Eye } from "lucide-react"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function ExecutiveReportsPage() {
  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="Reports & Export Center"
        description="Generate and export operational reports for the executive committee."
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          "Active Student Roster",
          "Pending Registrations Report",
          "Membership Expiry Report",
          "University Distribution",
          "Department Distribution",
          "Scholarship Applicants",
          "Employment Readiness"
        ].map(title => (
          <Card key={title} className="border shadow-sm hover:shadow-md transition-all group">
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 text-primary">
                  <FileBarChart className="size-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold leading-tight">{title}</h3>
                  <p className="text-[10px] text-muted-foreground mt-0.5">Operational summary.</p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 pt-1 border-t">
                <Button variant="ghost" size="sm" className="flex-1 text-xs h-8" onClick={() => toast.info("Generating preview...")}>
                  <Eye className="size-3.5 mr-1.5" /> Preview
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => toast.success("Exporting PDF...")}>
                  <Download className="size-3.5" /> PDF
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => toast.success("Exporting Excel...")}>
                  <Download className="size-3.5" /> XLS
                </Button>
                <Button variant="ghost" size="sm" className="text-xs h-8 px-2" onClick={() => toast.success("Printing...")}>
                  <Printer className="size-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
