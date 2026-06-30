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

export default function ExecutiveProfileUpdatePage() {
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
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlusCircle className="w-5 h-5 text-blue-600" />
              Submit Update Request
            </CardTitle>
            <CardDescription>Select fields, provide new values, and explain your request.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <FieldGroup>
                <FieldLabel>Fields to Update</FieldLabel>
                <div className="space-y-3 bg-gray-50 p-4 rounded-lg border">
                  {availableFields.map((f) => (
                    <div key={f.key} className="flex items-start gap-3">
                      <Checkbox
                        id={f.key}
                        checked={selectedFields[f.key] ?? false}
                        onCheckedChange={(checked) => handleCheckboxChange(f.key, checked as boolean)}
                        className="mt-1"
                      />
                      <label htmlFor={f.key} className="flex-1 flex flex-col gap-2">
                        <span className="text-sm font-medium text-gray-900">{f.label}</span>
                        {selectedFields[f.key] && (
                          <Input
                            type="text"
                            placeholder={`New ${f.label.toLowerCase()}`}
                            value={fieldValues[f.key] ?? ""}
                            onChange={(e) => handleValueChange(f.key, e.target.value)}
                            className="text-sm"
                          />
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </FieldGroup>

              <FieldGroup>
                <FieldLabel>Reason for Update *</FieldLabel>
                <Textarea
                  placeholder="Explain why you need these changes..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-24"
                />
              </FieldGroup>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Submit Request
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* History panel */}
        <Card className="md:col-span-5 border shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-emerald-600" />
              Request History
            </CardTitle>
            <CardDescription>Your recent profile update requests.</CardDescription>
          </CardHeader>
          <CardContent>
            {userRequests.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-gray-300 mb-2" />
                <p className="text-sm text-gray-600">No update requests yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {userRequests.map((req) => (
                  <div key={req.id} className="flex items-center justify-between p-3 bg-gray-50 rounded border">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {req.field}
                      </p>
                      <p className="text-xs text-gray-500">
                        {req.submittedDate}
                      </p>
                    </div>
                    <RequestBadge status={req.status} />
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
