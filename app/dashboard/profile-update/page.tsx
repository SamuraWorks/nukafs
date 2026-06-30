"use client"

import { useState } from "react"
import Link from "next/link"
import { ClipboardList, AlertCircle, PlusCircle, Check, Loader2, History, ChevronRight } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Checkbox } from "@/components/ui/checkbox"
import { PageHeader, RequestBadge } from "@/components/dashboard/ui-bits"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "sonner"

export default function ProfileUpdateRequestsPage() {
  const { currentUser, editRequests, requestProfileUpdate } = useAppState()
  
  // State for fields
  const [selectedFields, setSelectedFields] = useState<Record<string, boolean>>({})
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({})
  const [reason, setReason] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Only show edit requests matching the current user
  const userRequests = editRequests.filter(
    (req) => req.membershipNumber === currentUser?.membershipNumber
  )

  const availableFields = [
    { key: "phone", label: "Phone Number" },
    { key: "university", label: "University" },
    { key: "course", label: "Course" },
    { key: "level", label: "Level" },
    { key: "chiefdom", label: "Chiefdom" },
    { key: "skills", label: "Skills" }
  ]

  const handleCheckboxChange = (fieldLabel: string, checked: boolean) => {
    setSelectedFields({ ...selectedFields, [fieldLabel]: checked })
    if (!checked) {
      const updatedValues = { ...fieldValues }
      delete updatedValues[fieldLabel]
      setFieldValues(updatedValues)
    }
  }

  const handleValueChange = (fieldLabel: string, val: string) => {
    setFieldValues({ ...fieldValues, [fieldLabel]: val })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const fieldsToSubmit = Object.entries(selectedFields)
      .filter(([_, checked]) => checked)
      .map(([label]) => ({
        field: label,
        newValue: fieldValues[label] || ""
      }))

    if (fieldsToSubmit.length === 0) {
      toast.error("Please select at least one field to update")
      return
    }

    if (fieldsToSubmit.some(f => !f.newValue.trim())) {
      toast.error("Please fill in the new values for all selected fields")
      return
    }

    if (!reason.trim()) {
      toast.error("Please provide a reason for the update request")
      return
    }

    setIsSubmitting(true)

    setTimeout(() => {
      requestProfileUpdate(fieldsToSubmit, reason)
      setIsSubmitting(false)
      // Reset form
      setSelectedFields({})
      setFieldValues({})
      setReason("")
      toast.success("Profile update request submitted!")
    }, 1200)
  }

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto font-sans">
      <PageHeader 
        title="Request Profile Update"
        description="Submit requested changes to your registry record. Executives must approve edits."
      />

      <div className="grid gap-6 md:grid-cols-12">
        {/* Form panel */}
        <Card className="md:col-span-7 border shadow-md">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base flex items-center gap-1.5"><PlusCircle className="size-5 text-primary" /> New Update Request</CardTitle>
            <CardDescription className="text-xs">Select fields and supply their corrected details.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <span className="text-xs font-semibold text-muted-foreground block mb-2">1. Select Information to Correct</span>
                <div className="grid gap-3 sm:grid-cols-2">
                  {availableFields.map((f) => (
                    <div key={f.key} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-muted/40 transition-colors">
                      <Checkbox
                        id={`check-${f.key}`}
                        checked={!!selectedFields[f.label]}
                        onCheckedChange={(checked) => handleCheckboxChange(f.label, !!checked)}
                      />
                      <label htmlFor={`check-${f.key}`} className="text-xs font-semibold cursor-pointer flex-1">
                        {f.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Inputs based on selection */}
              {Object.values(selectedFields).some(Boolean) && (
                <div className="flex flex-col gap-4 border-t pt-4">
                  <span className="text-xs font-semibold text-muted-foreground block">2. Supply New Details</span>
                  <FieldGroup className="gap-4">
                    {availableFields.map((f) => {
                      if (!selectedFields[f.label]) return null
                      const currentVal = (currentUser as any)[f.key === "skills" ? "skills" : f.key]
                      const placeholderText = Array.isArray(currentVal) ? currentVal.join(", ") : currentVal || "—"
                      
                      return (
                        <Field key={f.key}>
                          <FieldLabel htmlFor={`input-${f.key}`}>{f.label} (New Value)</FieldLabel>
                          <Input
                            id={`input-${f.key}`}
                            placeholder={`Current: ${placeholderText}`}
                            value={fieldValues[f.label] || ""}
                            onChange={(e) => handleValueChange(f.label, e.target.value)}
                            required
                          />
                        </Field>
                      )
                    })}
                  </FieldGroup>
                </div>
              )}

              {/* Reason for change */}
              <div className="border-t pt-4">
                <Field>
                  <FieldLabel htmlFor="reason">3. Reason for requested change</FieldLabel>
                  <Textarea
                    id="reason"
                    rows={3}
                    placeholder="Provide a brief explanation or supporting facts for this change (e.g. Promoted to Year 3, corrected typo in contact number)..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required
                  />
                </Field>
              </div>

              <Button type="submit" disabled={isSubmitting} className="w-full cursor-pointer mt-2">
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Submitting Request...
                  </>
                ) : (
                  "Submit Edit Request"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Previous requests history */}
        <Card className="md:col-span-5 border shadow-md flex flex-col">
          <CardHeader className="p-5 border-b">
            <CardTitle className="text-base flex items-center gap-1.5"><History className="size-5 text-primary" /> Request History</CardTitle>
            <CardDescription className="text-xs">Track current and past edit updates.</CardDescription>
          </CardHeader>
          <CardContent className="p-4 flex-1 overflow-y-auto max-h-[500px]">
            {userRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center gap-2">
                <ClipboardList className="size-8 text-primary/30" />
                <span className="text-xs font-semibold">No requests logged</span>
                <span className="text-[10px] text-muted-foreground">You haven&apos;t filed any profile edit requests yet.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {userRequests.map((req) => (
                  <div key={req.id} className="rounded-lg border bg-card p-3.5 flex flex-col gap-2 shadow-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-heading text-xs font-bold text-foreground truncate">{req.field} Update</span>
                      <RequestBadge status={req.status} />
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 text-[10px] border-y py-1.5 my-0.5">
                      <div>
                        <span className="text-muted-foreground block">Old Value</span>
                        <span className="font-medium truncate block text-foreground">{req.oldValue}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block">New Value</span>
                        <span className="font-medium truncate block text-primary">{req.newValue}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      <span className="font-semibold text-foreground">Reason:</span> {req.reason}
                    </p>
                    {req.reviewedDate && (
                      <span className="text-[9px] text-muted-foreground self-end mt-1">Reviewed: {req.reviewedDate}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
