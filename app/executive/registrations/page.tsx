"use client"

import { useState } from "react"
import { Check, X, FileSearch, UserCheck } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"

export default function PendingRegistrationsPage() {
  const { pendingRegistrations } = useAppState()
  const [selectedReg, setSelectedReg] = useState<any>(null)

  const handleApprove = (id: string) => {
    toast.success("Registration approved successfully!")
    setSelectedReg(null)
  }

  const handleReject = (id: string) => {
    toast.error("Registration rejected.")
    setSelectedReg(null)
  }

  return (
    <div className="flex flex-col gap-6 font-sans pb-10 max-w-6xl mx-auto">
      <PageHeader
        title="Pending Registrations"
        description="Review and approve newly registered user accounts."
      />

      <Card className="border shadow-sm">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/10">
                <TableHead className="font-bold text-xs">Name</TableHead>
                <TableHead className="font-bold text-xs">Email</TableHead>
                <TableHead className="font-bold text-xs">Institution</TableHead>
                <TableHead className="font-bold text-xs">Submitted Date</TableHead>
                <TableHead className="font-bold text-xs text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingRegistrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-muted-foreground">
                    No pending registrations.
                  </TableCell>
                </TableRow>
              ) : (
                pendingRegistrations.map((reg) => (
                  <TableRow key={reg.id} className="hover:bg-muted/10">
                    <TableCell className="font-semibold text-xs">{reg.fullName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{reg.email}</TableCell>
                    <TableCell className="text-xs">{reg.university}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{reg.submittedDate}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" onClick={() => setSelectedReg(reg)}>
                        <FileSearch className="size-4" /> Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedReg} onOpenChange={open => !open && setSelectedReg(null)}>
        {selectedReg && (
          <DialogContent className="max-w-md font-sans">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="size-5 text-primary" /> Review Registration
              </DialogTitle>
              <DialogDescription>
                Verify student credentials before granting access to the portal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2 text-sm">
              <div className="grid grid-cols-2 gap-4 bg-muted/20 p-4 rounded-xl border">
                <div><span className="text-[10px] text-muted-foreground uppercase">Full Name</span><p className="font-bold">{selectedReg.fullName}</p></div>
                <div><span className="text-[10px] text-muted-foreground uppercase">Email</span><p className="font-bold">{selectedReg.email}</p></div>
                <div><span className="text-[10px] text-muted-foreground uppercase">Institution</span><p className="font-bold">{selectedReg.university}</p></div>
                <div><span className="text-[10px] text-muted-foreground uppercase">Date</span><p className="font-bold">{selectedReg.submittedDate}</p></div>
              </div>
            </div>
            <DialogFooter className="flex justify-between sm:justify-between w-full">
               <Button variant="destructive" onClick={() => handleReject(selectedReg.id)} className="gap-2">
                 <X className="size-4" /> Reject
               </Button>
               <Button onClick={() => handleApprove(selectedReg.id)} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                 <Check className="size-4" /> Approve
               </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
