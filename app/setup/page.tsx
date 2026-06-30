"use client"

import { Suspense, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2, ShieldCheck, User, GraduationCap } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"

function SetupPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { currentUser, currentRole, submitProfileWizard } = useAppState()
  const [membershipType, setMembershipType] = useState<"student" | "graduate" | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || currentUser?.name || "",
    phone: currentUser?.phone || "",
    email: currentUser?.email || "",
    gender: "",
    dob: "",
    nationality: "",
    district: "",
    chiefdom: "",
    town: "",
    homeAddress: "",
    currentAddress: "",
    university: "",
    campus: "",
    faculty: "",
    department: "",
    course: "",
    level: "",
    studentId: "",
    admissionYear: "",
    expectedGradYear: "",
    occupation: "",
    employer: "",
    skills: "",
    bio: "",
    emergencyName: "",
    emergencyRelation: "",
    emergencyPhone: "",
    graduationYear: "",
  })

  const statusParam = searchParams.get("status")
  const activeMembershipType = statusParam === "graduate" ? "graduate" : statusParam === "student" ? "student" : null

  const isPendingReview = useMemo(() => currentRole === "student_pending", [currentRole])

  const updateData = (fields: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...fields }))
  }

  const handleContinueToRegistration = () => {
    if (!membershipType) {
      toast.error("Please select whether you are a Current Student or a Graduate.")
      return
    }

    router.replace(`/setup?status=${membershipType}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.fullName || !formData.phone || !formData.email) {
      toast.error("Please provide your full name, phone number, and email address.")
      return
    }

    if (activeMembershipType === "student" && (!formData.university || !formData.department || !formData.course || !formData.level)) {
      toast.error("Please complete the university, department, course, and level fields.")
      return
    }

    if (activeMembershipType === "graduate" && (!formData.university || !formData.graduationYear)) {
      toast.error("Please complete your university and graduation year.")
      return
    }

    setIsSubmitting(true)
    submitProfileWizard({
      ...formData,
      employmentStatus: activeMembershipType === "student" ? "Student" : "Graduate",
      status: "pending",
      profileCompletion: 100,
    } as any)
    setIsSubmitted(true)
    setIsSubmitting(false)
    toast.success("Your application has been submitted successfully. The review team will assess your profile shortly.")
    router.replace("/setup")
  }

  if (isPendingReview || isSubmitted) {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 py-12">
        <Card className="w-full border-primary/20 shadow-xl">
          <CardContent className="flex flex-col gap-6 p-8 text-center">
            <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
              <CheckCircle2 className="size-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold">Application Submitted</h1>
              <p className="text-sm text-muted-foreground">
                Thank you for completing your registration. Your application is now pending review by the Membership & Registry team.
              </p>
            </div>
            <div className="rounded-xl border border-border bg-accent/30 p-4 text-left text-sm text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 font-semibold text-foreground">
                <ShieldCheck className="size-4 text-primary" /> Review Status
              </div>
              <p>Once approved, you will automatically receive your permanent Membership ID, QR Code, Digital ID Card, and portal access.</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button variant="outline" onClick={() => router.push("/dashboard/help")}>Contact Support</Button>
              <Button onClick={() => router.push("/login")}>Logout</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!statusParam || statusParam === "select") {
    return (
      <div className="mx-auto flex min-h-screen max-w-2xl items-center justify-center px-4 py-12">
        <Card className="w-full border-primary/10 shadow-xl">
          <CardContent className="space-y-6 p-8">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-semibold tracking-tight">Which best describes you?</h1>
              <p className="text-sm text-muted-foreground">Choose the option that fits your current academic status.</p>
            </div>

            <div className="rounded-xl border border-border bg-accent/20 p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                {[
                  { value: "student", label: "Current Student" },
                  { value: "graduate", label: "Graduate / Alumnus" },
                ].map((option) => (
                  <label key={option.value} className="flex flex-1 items-center gap-2 rounded-lg border border-border bg-background px-3 py-3 text-sm">
                    <input
                      type="radio"
                      name="membershipType"
                      checked={membershipType === option.value}
                      onChange={() => setMembershipType(option.value as "student" | "graduate")}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleContinueToRegistration} disabled={!membershipType} size="lg">
                Continue to Registration
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Complete Your Profile</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please complete the profile form below so your application can be reviewed.</p>
      </div>

      <Card className="border-primary/10 shadow-sm">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="rounded-xl border border-border bg-accent/20 p-4">
              <p className="mb-3 font-semibold">Which best describes you?</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                {[
                  { value: "student", label: "Current Student" },
                  { value: "graduate", label: "Graduate / Alumnus" },
                ].map((option) => (
                  <label key={option.value} className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm">
                    <input
                      type="radio"
                      name="membershipType"
                      checked={activeMembershipType === option.value}
                      onChange={() => {
                        setMembershipType(option.value as "student" | "graduate")
                        router.replace(`/setup?status=${option.value}`)
                      }}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="size-5 text-primary" />
                <h2 className="text-xl font-semibold">Personal Information</h2>
              </div>
              <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Full Name</FieldLabel>
                  <Input value={formData.fullName} onChange={(e) => updateData({ fullName: e.target.value })} required />
                </Field>
                <Field>
                  <FieldLabel>Phone Number</FieldLabel>
                  <Input value={formData.phone} onChange={(e) => updateData({ phone: e.target.value })} required />
                </Field>
                <Field>
                  <FieldLabel>Email Address</FieldLabel>
                  <Input type="email" value={formData.email} onChange={(e) => updateData({ email: e.target.value })} required />
                </Field>
                <Field>
                  <FieldLabel>Gender</FieldLabel>
                  <Select value={formData.gender} onValueChange={(value) => updateData({ gender: value })}>
                    <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel>Date of Birth</FieldLabel>
                  <Input type="date" value={formData.dob} onChange={(e) => updateData({ dob: e.target.value })} />
                </Field>
                <Field>
                  <FieldLabel>Nationality</FieldLabel>
                  <Input value={formData.nationality} onChange={(e) => updateData({ nationality: e.target.value })} />
                </Field>
                <Field>
                  <FieldLabel>District</FieldLabel>
                  <Input value={formData.district} onChange={(e) => updateData({ district: e.target.value })} />
                </Field>
                <Field>
                  <FieldLabel>Chiefdom</FieldLabel>
                  <Input value={formData.chiefdom} onChange={(e) => updateData({ chiefdom: e.target.value })} />
                </Field>
                <Field>
                  <FieldLabel>Town / Village</FieldLabel>
                  <Input value={formData.town} onChange={(e) => updateData({ town: e.target.value })} />
                </Field>
                <Field className="md:col-span-2">
                  <FieldLabel>Home Address</FieldLabel>
                  <Input value={formData.homeAddress} onChange={(e) => updateData({ homeAddress: e.target.value })} />
                </Field>
                <Field className="md:col-span-2">
                  <FieldLabel>Current Address</FieldLabel>
                  <Input value={formData.currentAddress} onChange={(e) => updateData({ currentAddress: e.target.value })} />
                </Field>
              </FieldGroup>
            </div>

            {activeMembershipType === "student" ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="size-5 text-primary" />
                  <h2 className="text-xl font-semibold">Academic Information</h2>
                </div>
                <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel>University</FieldLabel>
                    <Input value={formData.university} onChange={(e) => updateData({ university: e.target.value })} required />
                  </Field>
                  <Field>
                    <FieldLabel>Campus</FieldLabel>
                    <Input value={formData.campus} onChange={(e) => updateData({ campus: e.target.value })} />
                  </Field>
                  <Field>
                    <FieldLabel>Faculty</FieldLabel>
                    <Input value={formData.faculty} onChange={(e) => updateData({ faculty: e.target.value })} />
                  </Field>
                  <Field>
                    <FieldLabel>Department</FieldLabel>
                    <Input value={formData.department} onChange={(e) => updateData({ department: e.target.value })} />
                  </Field>
                  <Field>
                    <FieldLabel>Course of Study</FieldLabel>
                    <Input value={formData.course} onChange={(e) => updateData({ course: e.target.value })} required />
                  </Field>
                  <Field>
                    <FieldLabel>Academic Level</FieldLabel>
                    <Input value={formData.level} onChange={(e) => updateData({ level: e.target.value })} placeholder="e.g. Year 2 or Foundation" required />
                  </Field>
                  <Field>
                    <FieldLabel>Student ID (optional)</FieldLabel>
                    <Input value={formData.studentId} onChange={(e) => updateData({ studentId: e.target.value })} />
                  </Field>
                  <Field>
                    <FieldLabel>Admission Year</FieldLabel>
                    <Input value={formData.admissionYear} onChange={(e) => updateData({ admissionYear: e.target.value })} />
                  </Field>
                  <Field>
                    <FieldLabel>Expected Graduation Year</FieldLabel>
                    <Input value={formData.expectedGradYear} onChange={(e) => updateData({ expectedGradYear: e.target.value })} />
                  </Field>
                </FieldGroup>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <GraduationCap className="size-5 text-primary" />
                  <h2 className="text-xl font-semibold">Academic History</h2>
                </div>
                <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel>University Attended</FieldLabel>
                    <Input value={formData.university} onChange={(e) => updateData({ university: e.target.value })} required />
                  </Field>
                  <Field>
                    <FieldLabel>Faculty</FieldLabel>
                    <Input value={formData.faculty} onChange={(e) => updateData({ faculty: e.target.value })} />
                  </Field>
                  <Field>
                    <FieldLabel>Department</FieldLabel>
                    <Input value={formData.department} onChange={(e) => updateData({ department: e.target.value })} />
                  </Field>
                  <Field>
                    <FieldLabel>Course of Study</FieldLabel>
                    <Input value={formData.course} onChange={(e) => updateData({ course: e.target.value })} />
                  </Field>
                  <Field>
                    <FieldLabel>Graduation Year</FieldLabel>
                    <Input value={formData.graduationYear} onChange={(e) => updateData({ graduationYear: e.target.value })} required />
                  </Field>
                </FieldGroup>
              </div>
            )}

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Professional Information</h2>
              <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Occupation</FieldLabel>
                  <Input value={formData.occupation} onChange={(e) => updateData({ occupation: e.target.value })} />
                </Field>
                <Field>
                  <FieldLabel>Employer</FieldLabel>
                  <Input value={formData.employer} onChange={(e) => updateData({ employer: e.target.value })} />
                </Field>
                <Field>
                  <FieldLabel>Skills</FieldLabel>
                  <Input value={formData.skills} onChange={(e) => updateData({ skills: e.target.value })} />
                </Field>
                <Field className="md:col-span-2">
                  <FieldLabel>Biography</FieldLabel>
                  <Textarea value={formData.bio} onChange={(e) => updateData({ bio: e.target.value })} rows={4} />
                </Field>
              </FieldGroup>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Emergency Contact</h2>
              <FieldGroup className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field>
                  <FieldLabel>Name</FieldLabel>
                  <Input value={formData.emergencyName} onChange={(e) => updateData({ emergencyName: e.target.value })} />
                </Field>
                <Field>
                  <FieldLabel>Relationship</FieldLabel>
                  <Input value={formData.emergencyRelation} onChange={(e) => updateData({ emergencyRelation: e.target.value })} />
                </Field>
                <Field>
                  <FieldLabel>Phone Number</FieldLabel>
                  <Input value={formData.emergencyPhone} onChange={(e) => updateData({ emergencyPhone: e.target.value })} />
                </Field>
              </FieldGroup>
            </div>

            <div className="flex justify-end">
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  "Submit Profile"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default function SetupPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-muted-foreground">Loading setup…</div>}>
      <SetupPageContent />
    </Suspense>
  )
}
