"use client"

import { useCallback, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, ArrowLeft, Check, Loader2, Save, Upload } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function ProfileEditor({
  backHref = "/dashboard/profile",
}: {
  backHref?: string
}) {
  const { currentUser, currentRole } = useAppState()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(currentUser?.profilePhotoUrl || currentUser?.profilePhoto || null)

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    gender: currentUser?.gender || "",
    dob: currentUser?.dob || "",
    nationality: currentUser?.nationality || "",
    district: currentUser?.district || "",
    chiefdom: currentUser?.chiefdom || "",
    town: currentUser?.town || "",
    homeAddress: currentUser?.homeAddress || "",
    currentAddress: currentUser?.currentAddress || "",
    university: currentUser?.university || "",
    campus: currentUser?.campus || "",
    faculty: currentUser?.faculty || "",
    department: currentUser?.department || "",
    courseName: currentUser?.courseName || currentUser?.course || "",
    academicLevel: currentUser?.academicLevel || currentUser?.level || "",
    studentId: currentUser?.studentId || currentUser?.membershipNumber || "",
    admissionYear: currentUser?.admissionYear || "",
    graduationYear: currentUser?.graduationYear || "",
    occupation: currentUser?.occupation || "",
    skills: (currentUser?.skills || []).join(", "),
    biography: currentUser?.biography || currentUser?.bio || "",
    emergencyContact: currentUser?.emergencyContact || "",
  })

  const currentRoleLabel = useMemo(() => {
    if (currentRole === "super_admin") return "Super Admin"
    if (currentRole === "executive") return "Executive"
    if (currentRole === "stakeholder") return "Stakeholder"
    return "Student"
  }, [currentRole])

  const handlePhotoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Maximum size is 5MB.")
      return
    }

    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }, [])

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }, [])

  const handleSave = useCallback(async () => {
    if (!currentUser?.id) {
      toast.error("You must be signed in to update your profile.")
      return
    }

    const trimmedFullName = formData.fullName.trim()
    const trimmedEmail = formData.email.trim()
    const trimmedPhone = formData.phone.trim()

    if (!trimmedFullName) {
      toast.error("Full name is required before saving your profile.")
      return
    }

    if (!trimmedEmail) {
      toast.error("Email is required before saving your profile.")
      return
    }

    if (!trimmedPhone) {
      toast.error("Phone number is required before saving your profile.")
      return
    }

    setIsSaving(true)

    try {
      let profilePhotoPath = currentUser?.profilePhotoPath ?? currentUser?.profilePhoto ?? null
      let profilePhotoUrl = currentUser?.profilePhotoUrl ?? currentUser?.profilePhoto ?? null

      if (photoFile) {
        const photoFormData = new FormData()
        photoFormData.append("file", photoFile)

        const photoResponse = await fetch("/api/profile-photo-upload", {
          method: "POST",
          headers: {
            "X-User-Id": currentUser.id,
          },
          body: photoFormData,
        })

        if (!photoResponse.ok) {
          const errorData = await photoResponse.json().catch(() => ({}))
          throw new Error(errorData.error || "Failed to upload profile photo")
        }

        const photoData = await photoResponse.json()
        profilePhotoPath = photoData.path || profilePhotoPath
        profilePhotoUrl = photoData.url || profilePhotoUrl
        setPhotoPreview(profilePhotoUrl)
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          profile: {
            ...formData,
            studentId: formData.studentId || currentUser?.studentId || "",
            skills: formData.skills
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean),
            profilePhoto: profilePhotoPath,
            profilePhotoUrl,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update profile")
      }

      setPhotoFile(null)
      toast.success("Profile updated successfully")
      router.refresh()
    } catch (error) {
      console.error("Profile save failed:", error)
      toast.error(error instanceof Error ? error.message : "Unable to save your profile")
    } finally {
      setIsSaving(false)
    }
  }, [currentUser, formData, photoFile])

  if (!currentUser) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-6 p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <AlertCircle className="mb-2 h-5 w-5 text-red-600" />
            <p className="text-red-700">Please sign in to edit your profile.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 p-6">
      <div className="flex items-center gap-4">
        <Link href={backHref}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 size-4" />
            Back to Profile
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Your Profile</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Update your information directly. Changes take effect immediately.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="border shadow-md md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Profile Photo</CardTitle>
            <CardDescription>Upload a new profile photo</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {photoPreview ? (
              <img src={photoPreview} alt="Profile preview" className="size-24 rounded-lg object-cover" />
            ) : (
              <div className="flex size-24 items-center justify-center rounded-lg bg-gray-100">
                <span className="text-xs text-gray-500">No photo</span>
              </div>
            )}

            <label htmlFor="profile-photo-upload" className="w-full">
              <Button variant="outline" size="sm" className="w-full cursor-pointer">
                <span className="flex items-center gap-2">
                  <Upload className="size-4" />
                  {photoFile ? "Change Photo" : "Upload Photo"}
                </span>
              </Button>
              <input id="profile-photo-upload" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
            </label>
          </CardContent>
        </Card>

        <div className="space-y-6 md:col-span-2">
          <Card className="border shadow-md">
            <CardHeader>
              <CardTitle className="text-sm">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="fullName" className="text-xs font-semibold">Full Name</Label>
                  <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs font-semibold">Email</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="mt-1" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="phone" className="text-xs font-semibold">Phone Number</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="gender" className="text-xs font-semibold">Gender</Label>
                  <Input id="gender" name="gender" value={formData.gender} onChange={handleInputChange} className="mt-1" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="dob" className="text-xs font-semibold">Date of Birth</Label>
                  <Input id="dob" name="dob" value={formData.dob} onChange={handleInputChange} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="nationality" className="text-xs font-semibold">Nationality</Label>
                  <Input id="nationality" name="nationality" value={formData.nationality} onChange={handleInputChange} className="mt-1" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="district" className="text-xs font-semibold">District</Label>
                  <Input id="district" name="district" value={formData.district} onChange={handleInputChange} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="chiefdom" className="text-xs font-semibold">Chiefdom</Label>
                  <Input id="chiefdom" name="chiefdom" value={formData.chiefdom} onChange={handleInputChange} className="mt-1" />
                </div>
              </div>

              <div>
                <Label htmlFor="town" className="text-xs font-semibold">Town / Village</Label>
                <Input id="town" name="town" value={formData.town} onChange={handleInputChange} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="homeAddress" className="text-xs font-semibold">Home Address</Label>
                <Input id="homeAddress" name="homeAddress" value={formData.homeAddress} onChange={handleInputChange} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="currentAddress" className="text-xs font-semibold">Current Address</Label>
                <Input id="currentAddress" name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} className="mt-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-md">
            <CardHeader>
              <CardTitle className="text-sm">Academic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="university" className="text-xs font-semibold">University</Label>
                  <Input id="university" name="university" value={formData.university} onChange={handleInputChange} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="campus" className="text-xs font-semibold">Campus</Label>
                  <Input id="campus" name="campus" value={formData.campus} onChange={handleInputChange} className="mt-1" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="faculty" className="text-xs font-semibold">Faculty</Label>
                  <Input id="faculty" name="faculty" value={formData.faculty} onChange={handleInputChange} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="department" className="text-xs font-semibold">Department</Label>
                  <Input id="department" name="department" value={formData.department} onChange={handleInputChange} className="mt-1" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="courseName" className="text-xs font-semibold">Course of Study</Label>
                  <Input id="courseName" name="courseName" value={formData.courseName} onChange={handleInputChange} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="academicLevel" className="text-xs font-semibold">Academic Level</Label>
                  <Input id="academicLevel" name="academicLevel" value={formData.academicLevel} onChange={handleInputChange} className="mt-1" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-md">
            <CardHeader>
              <CardTitle className="text-sm">Professional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="occupation" className="text-xs font-semibold">Occupation</Label>
                <Input id="occupation" name="occupation" value={formData.occupation} onChange={handleInputChange} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="skills" className="text-xs font-semibold">Skills (comma-separated)</Label>
                <Textarea id="skills" name="skills" value={formData.skills} onChange={handleInputChange} rows={3} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="biography" className="text-xs font-semibold">Biography</Label>
                <Textarea id="biography" name="biography" value={formData.biography} onChange={handleInputChange} rows={4} className="mt-1" />
              </div>

              <div>
                <Label htmlFor="emergencyContact" className="text-xs font-semibold">Emergency Contact</Label>
                <Textarea id="emergencyContact" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} rows={3} className="mt-1" />
              </div>
            </CardContent>
          </Card>

          <Card className="border border-emerald-200 bg-emerald-50 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm text-emerald-900">
                <Check className="size-4" />
                Permanent Membership Information
              </CardTitle>
              <CardDescription className="text-emerald-800">These identity values are locked and cannot be changed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-emerald-700">Membership ID:</span>
                <p className="font-mono font-bold text-emerald-900">{currentUser?.membershipNumber || "—"}</p>
              </div>
              <div>
                <span className="text-emerald-700">QR Code:</span>
                <p className="font-mono font-bold text-emerald-900">{currentUser?.qrCode || "—"}</p>
              </div>
              <div>
                <span className="text-emerald-700">Membership Type:</span>
                <Badge className="mt-1" variant="outline">{currentUser?.membershipType || currentRoleLabel}</Badge>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} disabled={isSaving} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  Save Changes
                </>
              )}
            </Button>
            <Link href="/dashboard/profile">
              <Button variant="outline">Cancel</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
