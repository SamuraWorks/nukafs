"use client"

import { useState } from "react"
import { UserCheck, CheckCircle2, XCircle, AlertCircle, Eye, Calendar, Mail, Phone, Loader2, ShieldCheck, MapPin, User } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { toast } from "sonner"
import { PendingRegistration } from "@/lib/mock-data"

export default function RegistrationApprovalsPage() {
  const { pendingRegistrations, approveRegistration, rejectRegistration } = useAppState()

  const getDisplayName = (reg: PendingRegistration | null | undefined) => {
    return reg?.fullName || reg?.name || "Unknown Applicant"
  }
  
  // Dialog state
  const [selectedReg, setSelectedReg] = useState<PendingRegistration | null>(null)
  const [dialogAction, setDialogAction] = useState<"approve" | "reject" | "view" | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [rejectReason, setRejectReason] = useState("")

  const handleTriggerAction = (reg: PendingRegistration, action: "approve" | "reject" | "view") => {
    setSelectedReg(reg)
    setDialogAction(action)
    setRejectReason("")
  }

  const handleConfirmAction = () => {
    if (!selectedReg || !dialogAction) return

    setIsProcessing(true)
    setTimeout(() => {
      if (dialogAction === "approve") {
        approveRegistration(selectedReg.id)
        toast.success(`Approved account for ${getDisplayName(selectedReg)}`)
      } else if (dialogAction === "reject") {
        rejectRegistration(selectedReg.id, rejectReason || "Does not meet membership eligibility criteria.")
        toast.warning(`Rejected registration request for ${getDisplayName(selectedReg)}`)
      }
      setIsProcessing(false)
      setSelectedReg(null)
      setDialogAction(null)
    }, 1200)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto font-sans">
      <PageHeader 
        title="Pending Registrations"
        description="Verify student identities and approve access requests for NUKaFs Registry."
      />

      <Card className="border shadow-sm overflow-hidden">
        {pendingRegistrations.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="font-heading font-bold text-base">Approval Queue is Clear</h3>
            <p className="text-xs text-muted-foreground">All registration requests have been reviewed and resolved.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="text-xs font-bold">Student Applicant</TableHead>
                  <TableHead className="text-xs font-bold">Contact Info</TableHead>
                  <TableHead className="text-xs font-bold">Date Registered</TableHead>
                  <TableHead className="text-xs font-bold text-right">Decisions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingRegistrations.map((reg) => {
                  const displayName = getDisplayName(reg)

                  return (
                  <TableRow key={reg.id} className="hover:bg-muted/30">
                    <TableCell className="font-semibold text-xs py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="size-9 bg-primary/10 text-primary flex items-center justify-center rounded-lg font-bold text-xs">
                          {displayName.split(" ").map(n => n[0]).slice(0, 2).join("")}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground leading-tight">{displayName}</span>
                          <span className="text-[10px] text-muted-foreground">District branch: {reg.district}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <div className="flex flex-col gap-0.5 text-[10px] text-muted-foreground">
                        <span className="flex items-center gap-1"><Mail className="size-3" /> {reg.email}</span>
                        <span className="flex items-center gap-1"><Phone className="size-3" /> {reg.phone}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="size-3.5 text-muted-foreground" /> {reg.submittedDate}</span>
                    </TableCell>
                    <TableCell className="text-xs text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="h-8 text-[11px] font-bold cursor-pointer"
                          onClick={() => handleTriggerAction(reg, "view")}
                        >
                          <Eye className="size-3.5 mr-1" /> View Details
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="text-destructive hover:bg-destructive/10 h-8 text-[11px] font-bold cursor-pointer"
                          onClick={() => handleTriggerAction(reg, "reject")}
                        >
                          Reject
                        </Button>
                        <Button 
                          size="sm" 
                          className="h-8 text-[11px] font-bold cursor-pointer"
                          onClick={() => handleTriggerAction(reg, "approve")}
                        >
                          Approve
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* VIEW DETAILS DIALOG */}
      <Dialog open={!!selectedReg && dialogAction === "view"} onOpenChange={(open) => !open && setSelectedReg(null)}>
        {selectedReg && (
          <DialogContent className="max-w-md font-sans">
            <DialogHeader className="border-b pb-3">
              <DialogTitle className="font-heading text-base font-bold flex items-center gap-1.5 text-foreground">
                <User className="size-5 text-primary" />
                Applicant Details File
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Review complete initial submissions.
              </DialogDescription>
            </DialogHeader>

            <div className="flex flex-col gap-4 py-3">
              <div className="flex items-center gap-3 bg-muted/30 p-3 rounded-xl border border-border">
                <div className="size-12 bg-primary/20 text-primary flex items-center justify-center rounded-xl font-bold text-sm">
                  {getDisplayName(selectedReg).split(" ").map(n => n[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <h4 className="font-bold text-sm text-foreground">{getDisplayName(selectedReg)}</h4>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">ID Ref: {selectedReg.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">District Origin</span>
                  <span className="font-semibold text-foreground flex items-center gap-1"><MapPin className="size-3.5 text-primary" /> {selectedReg.district}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">Submission Date</span>
                  <span className="font-semibold text-foreground flex items-center gap-1"><Calendar className="size-3.5 text-primary" /> {selectedReg.submittedDate}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">Primary Email</span>
                  <span className="font-semibold text-foreground truncate flex items-center gap-1"><Mail className="size-3.5 text-primary" /> {selectedReg.email}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] text-muted-foreground font-medium uppercase">Phone Contact</span>
                  <span className="font-semibold text-foreground flex items-center gap-1"><Phone className="size-3.5 text-primary" /> {selectedReg.phone}</span>
                </div>
              </div>

              <div className="border-t pt-3 flex flex-col gap-2">
                <h5 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pre-Verification Checklist</h5>
                <ul className="text-[11px] space-y-1.5 text-muted-foreground bg-muted/20 p-2.5 rounded-lg border border-dashed">
                  <li className="flex items-center gap-2 text-foreground font-medium">✓ Hails from Koinadugu or Falaba</li>
                  <li className="flex items-center gap-2 text-foreground font-medium">✓ Provided valid contact details</li>
                  <li className="flex items-center gap-2 text-foreground font-medium">✓ No duplicate record in active list</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t pt-4 mt-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setSelectedReg(null)}>
                Close
              </Button>
              <Button 
                variant="destructive"
                size="sm" 
                onClick={() => setDialogAction("reject")}
              >
                Reject
              </Button>
              <Button 
                variant="default"
                size="sm" 
                onClick={() => setDialogAction("approve")}
              >
                Approve Account
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* CONFIRMATION DIALOG MODAL */}
      <Dialog open={!!selectedReg && (dialogAction === "approve" || dialogAction === "reject")} onOpenChange={(open) => !open && setSelectedReg(null)}>
        {selectedReg && dialogAction && (
          <DialogContent className="max-w-md font-sans">
            <DialogHeader className="gap-2.5">
              <DialogTitle className="font-heading text-base font-bold flex items-center gap-1.5 text-foreground">
                <AlertCircle className={`size-5 ${dialogAction === "approve" ? "text-primary" : "text-destructive"}`} />
                Confirm Registration {dialogAction === "approve" ? "Approval" : "Rejection"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                You are about to <span className="font-bold text-foreground">{dialogAction}</span> the registration request for <span className="font-bold text-foreground">{getDisplayName(selectedReg)}</span>.
              </DialogDescription>
            </DialogHeader>

            {dialogAction === "reject" && (
              <div className="flex flex-col gap-2 my-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground" htmlFor="reject-reason">
                  Rejection Reason (Sent to Student)
                </label>
                <Textarea
                  id="reject-reason"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="e.g. Applicant does not hail from Koinadugu or Falaba districts."
                  className="text-xs"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t pt-4 mt-4">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => {
                  setSelectedReg(null)
                  setDialogAction(null)
                }}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button 
                variant={dialogAction === "reject" ? "destructive" : "default"}
                size="sm" 
                onClick={handleConfirmAction}
                disabled={isProcessing}
                className="cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin mr-1.5" />
                    Processing...
                  </>
                ) : (
                  `Confirm ${dialogAction === "approve" ? "Approval" : "Rejection"}`
                )}
              </Button>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
