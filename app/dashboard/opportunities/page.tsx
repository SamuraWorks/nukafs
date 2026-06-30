"use client"

import { useState } from "react"
import { Award, Briefcase, Calendar, GraduationCap, Users, BookOpen, Send, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import type { Opportunity } from "@/lib/mock-data"

export default function OpportunitiesPage() {
  const [activeTab, setActiveTab] = useState<string>("Scholarship")
  const [selectedOpp, setSelectedOpp] = useState<Opportunity | null>(null)
  
  // App form states
  const [isApplying, setIsApplying] = useState(false)
  const [coverLetter, setCoverLetter] = useState("")
  const [gpa, setGpa] = useState("")
  const [appliedIds, setAppliedIds] = useState<string[]>([])

  const tabs = [
    { key: "Scholarship", label: "Scholarships", icon: GraduationCap },
    { key: "Internship", label: "Internships", icon: Briefcase },
    { key: "Job", label: "Jobs", icon: Users },
    { key: "Leadership", label: "Leadership", icon: Award },
    { key: "Training", label: "Training", icon: BookOpen }
  ]

  // Production: start with empty opportunities list; UI will render empty state
  const additionalOpps: Opportunity[] = []

  const getOppType = (tab: string): string => {
    return tab
  }

  const filteredOpps = additionalOpps.filter((opp) => {
    // Map Training to suitable fields if needed
    if (activeTab === "Training") {
      return opp.id.includes("training") || opp.tags.includes("Free") || opp.tags.includes("Tech") && opp.description.includes("Learn")
    }
    return opp.type === activeTab
  })

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedOpp) return
    
    setIsApplying(true)

    setTimeout(() => {
      setIsApplying(false)
      setAppliedIds([...appliedIds, selectedOpp.id])
      setSelectedOpp(null)
      setCoverLetter("")
      setGpa("")
      toast.success(`Application submitted successfully for: ${selectedOpp.title}!`)
    }, 1500)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto font-sans">
      <PageHeader 
        title="Opportunities Board"
        description="Browse and apply for exclusive scholarships, corporate internships, and leadership placements curated for union students."
      />

      {/* Tabs list */}
      <div className="flex items-center gap-1 bg-muted p-1 rounded-xl overflow-x-auto scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-lg transition-all shrink-0 cursor-pointer ${
                isActive 
                  ? "bg-card text-foreground shadow-sm" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Grid list */}
      {filteredOpps.length === 0 ? (
        <Card className="border p-12 text-center flex flex-col items-center justify-center gap-3 bg-muted/20">
          <AlertCircle className="size-8 text-primary/30" />
          <h3 className="font-heading font-bold text-base">No opportunities listed</h3>
          <p className="text-xs text-muted-foreground max-w-sm">There are currently no active listings in this category. Check back later!</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredOpps.map((opp) => {
            const hasApplied = appliedIds.includes(opp.id)
            return (
              <Card key={opp.id} className="border shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <CardContent className="p-5 flex flex-col gap-3 justify-between h-full">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[10px] text-primary tracking-wider uppercase">{opp.organization}</span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Calendar className="size-3" /> Dead: {opp.deadline}</span>
                    </div>

                    <h3 className="font-heading text-sm font-bold text-foreground leading-snug line-clamp-1">{opp.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mt-1">{opp.description}</p>
                    
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {opp.amount && (
                        <Badge variant="outline" className="text-[9px] border-emerald-500/30 bg-emerald-500/5 text-emerald-600 font-bold px-1.5">
                          {opp.amount}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[9px] px-1.5">
                        {opp.location}
                      </Badge>
                      {opp.tags.map(tag => (
                        <Badge key={tag} variant="outline" className="text-[9px] px-1.5">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t pt-3 mt-4">
                    <span className="text-[10px] text-muted-foreground font-medium">Eligibility: Registry Verified</span>
                    <Button 
                      size="sm" 
                      variant={hasApplied ? "outline" : "default"}
                      disabled={hasApplied}
                      onClick={() => setSelectedOpp(opp)}
                      className="h-8 font-bold"
                    >
                      {hasApplied ? "Applied" : "Apply Now"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Application Drawer / Dialog Modal */}
      <Dialog open={!!selectedOpp} onOpenChange={(open) => !open && setSelectedOpp(null)}>
        {selectedOpp && (
          <DialogContent className="max-w-md font-sans">
            <DialogHeader className="gap-1.5 border-b pb-3">
              <DialogTitle className="font-heading text-base font-bold flex items-center gap-2">
                <Sparkles className="size-4.5 text-primary" /> Apply for Opportunity
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Confirm your registry information and complete submission details for <span className="font-semibold text-foreground">{selectedOpp.title}</span> at <span className="font-semibold text-foreground">{selectedOpp.organization}</span>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleApplySubmit} className="flex flex-col gap-4 py-3">
              {/* Registry Details verification */}
              <div className="rounded-lg bg-muted/60 border p-3.5 text-xs text-muted-foreground flex flex-col gap-2">
                <span className="font-semibold text-foreground text-[11px] block uppercase tracking-wider">Verified Registry Attachments</span>
                <p>The following record logs will be shared automatically with the sponsor:</p>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-foreground font-semibold mt-1">
                  <span>• Name: Verified</span>
                  <span>• University Record: Attached</span>
                  <span>• District Registry: Attached</span>
                  <span>• Digital ID: Attached</span>
                </div>
              </div>

              <FieldGroup className="gap-3.5">
                {selectedOpp.type === "Scholarship" && (
                  <Field>
                    <FieldLabel htmlFor="gpa">Current CGPA / Academic Standing</FieldLabel>
                    <Input
                      id="gpa"
                      placeholder="e.g. 3.85 / 4.00"
                      value={gpa}
                      onChange={(e) => setGpa(e.target.value)}
                      required
                    />
                  </Field>
                )}

                <Field>
                  <FieldLabel htmlFor="coverLetter">Statement of Purpose / Cover Letter</FieldLabel>
                  <Textarea
                    id="coverLetter"
                    rows={4}
                    placeholder="Briefly state why you are applying and how this support fits your career aspirations..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    required
                  />
                </Field>
              </FieldGroup>

              <div className="flex items-center justify-end gap-3 border-t pt-4 mt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setSelectedOpp(null)}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isApplying}>
                  {isApplying ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="size-3.5 mr-2" />
                      Submit Application
                    </>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
