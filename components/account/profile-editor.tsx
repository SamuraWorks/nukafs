"use client"

import { useEffect, useMemo, useRef, useState, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  BadgeCheck,
  BookOpen,
  BriefcaseBusiness,
  CalendarRange,
  Camera,
  FileText,
  Home,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
  UserRound,
} from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { fetchDistricts, fetchChiefdomsByDistrict, type District, type Chiefdom } from "@/lib/services/geography-service"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { SearchableSelect } from "@/components/ui/searchable-select"
import { toast } from "sonner"

const genderOptions = [
  { label: "Male", value: "Male" },
  { label: "Female", value: "Female" },
  { label: "Non-binary", value: "Non-binary" },
  { label: "Prefer not to say", value: "Prefer not to say" },
]

// District & Chiefdom options are loaded dynamically from the API via geography-service.

const universityOptions = [
  { label: "Fourah Bay College (USL)", value: "Fourah Bay College (USL)" },
  { label: "Njala University", value: "Njala University" },
  { label: "Institute of Public Administration (IPAM)", value: "Institute of Public Administration (IPAM)" },
  { label: "Ernest Bai Koroma University", value: "Ernest Bai Koroma University" },
  { label: "Eastern Technical University", value: "Eastern Technical University" },
  { label: "Milton Margai Technical University", value: "Milton Margai Technical University" },
  { label: "Limkokwing University", value: "Limkokwing University" },
]

const campusOptions = [
  { label: "Mount Aureol", value: "Mount Aureol" },
  { label: "Njala", value: "Njala" },
  { label: "Tower Hill", value: "Tower Hill" },
  { label: "Makeni", value: "Makeni" },
  { label: "Kenema", value: "Kenema" },
  { label: "Goderich", value: "Goderich" },
  { label: "Aberdeen", value: "Aberdeen" },
]

const collegeOptions = [
  { label: "College of Medicine and Allied Health Sciences", value: "College of Medicine and Allied Health Sciences" },
  { label: "Faculty of Engineering", value: "Faculty of Engineering" },
  { label: "Faculty of Science", value: "Faculty of Science" },
  { label: "Faculty of Business and Management", value: "Faculty of Business and Management" },
  { label: "Faculty of Social Sciences", value: "Faculty of Social Sciences" },
]

const facultyOptions = [
  { label: "Engineering", value: "Engineering" },
  { label: "Science", value: "Science" },
  { label: "Social Sciences", value: "Social Sciences" },
  { label: "Business", value: "Business" },
  { label: "Health Sciences", value: "Health Sciences" },
  { label: "Law", value: "Law" },
]

const departmentOptions = [
  { label: "Electrical and Electronics Engineering", value: "Electrical and Electronics Engineering" },
  { label: "Computer Science", value: "Computer Science" },
  { label: "Economics", value: "Economics" },
  { label: "Accounting and Finance", value: "Accounting and Finance" },
  { label: "Public Administration", value: "Public Administration" },
  { label: "Biology", value: "Biology" },
]

const academicLevelOptions = [
  { label: "Year 1", value: "Year 1" },
  { label: "Year 2", value: "Year 2" },
  { label: "Year 3", value: "Year 3" },
  { label: "Year 4", value: "Year 4" },
  { label: "Postgraduate", value: "Postgraduate" },
]

const collegeStatusOptions = [
  { label: "Current Student", value: "student" },
  { label: "Graduate", value: "graduate" },
]

export default function ProfileEditor({ backHref = "/dashboard/profile" }: { backHref?: string }) {
  const { currentUser, currentRole, refreshCurrentUser, updateCurrentUserContext } = useAppState()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const photoInputRef = useRef<HTMLInputElement | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(currentUser?.profilePhotoUrl || currentUser?.profilePhoto || null)

  const [documents, setDocuments] = useState<Record<string, File | null>>({
    studentId: null,
    nationalId: null,
    cv: null,
    certificates: null,
    other: null,
  })

  const [documentNames, setDocumentNames] = useState<Record<string, string>>({
    studentId: "",
    nationalId: "",
    cv: "",
    certificates: "",
    other: "",
  })

  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "",
    gender: currentUser?.gender || "",
    dob: currentUser?.dob || currentUser?.dateOfBirth || "",
    nationality: currentUser?.nationality || "",
    district: currentUser?.district || "",
    chiefdom: currentUser?.chiefdom || "",
    town: currentUser?.town || "",
    homeAddress: currentUser?.homeAddress || "",
    currentAddress: currentUser?.currentAddress || "",
    collegeStatus: currentUser?.employmentStatus === "Student" ? "student" : currentUser?.employmentStatus === "Graduate" ? "graduate" : "student",
    university: currentUser?.university || "",
    campus: currentUser?.campus || "",
    college: currentUser?.college || "",
    faculty: currentUser?.faculty || "",
    department: currentUser?.department || "",
    courseName: currentUser?.courseName || currentUser?.course || "",
    academicLevel: currentUser?.academicLevel || currentUser?.level || "",
    studentId: currentUser?.studentId || currentUser?.membershipNumber || "",
    admissionYear: currentUser?.admissionYear || "",
    expectedGraduationYear: currentUser?.expectedGraduationYear || "",
    graduationYear: currentUser?.graduationYear || "",
    occupation: currentUser?.occupation || "",
    organization: currentUser?.organization || "",
    biography: currentUser?.biography || currentUser?.bio || "",
    skills: (currentUser?.skills || []).map((skill: string) => skill),
    emergencyName: currentUser?.emergencyContact?.name || "",
    emergencyRelationship: currentUser?.emergencyContact?.relationship || "",
    emergencyPhone: currentUser?.emergencyContact?.phone || "",
  })

  const [skillInput, setSkillInput] = useState("")
  const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({})

  useEffect(() => {
    setFormData({
      fullName: currentUser?.fullName || currentUser?.name || "",
      email: currentUser?.email || "",
      phone: currentUser?.phone || "",
      gender: currentUser?.gender || "",
      dob: currentUser?.dob || currentUser?.dateOfBirth || "",
      nationality: currentUser?.nationality || "",
      district: currentUser?.district || "",
      chiefdom: currentUser?.chiefdom || "",
      town: currentUser?.town || "",
      homeAddress: currentUser?.homeAddress || "",
      currentAddress: currentUser?.currentAddress || "",
      collegeStatus: currentUser?.employmentStatus === "Student" ? "student" : currentUser?.employmentStatus === "Graduate" ? "graduate" : "student",
      university: currentUser?.university || "",
      campus: currentUser?.campus || "",
      college: currentUser?.college || "",
      faculty: currentUser?.faculty || "",
      department: currentUser?.department || "",
      courseName: currentUser?.courseName || currentUser?.course || "",
      academicLevel: currentUser?.academicLevel || currentUser?.level || "",
      studentId: currentUser?.studentId || currentUser?.membershipNumber || "",
      admissionYear: currentUser?.admissionYear || "",
      expectedGraduationYear: currentUser?.expectedGraduationYear || "",
      graduationYear: currentUser?.graduationYear || "",
      occupation: currentUser?.occupation || "",
      organization: currentUser?.organization || "",
      biography: currentUser?.biography || currentUser?.bio || "",
      skills: (currentUser?.skills || []).map((skill: string) => skill),
      emergencyName: currentUser?.emergencyContact?.name || "",
      emergencyRelationship: currentUser?.emergencyContact?.relationship || "",
      emergencyPhone: currentUser?.emergencyContact?.phone || "",
    })
    setTouchedFields({})
    setPhotoPreview(currentUser?.profilePhotoUrl || currentUser?.profilePhoto || null)
  }, [currentUser])

  // ── Dynamic Geography State ──────────────────────────────────────────
  const [geoDistricts, setGeoDistricts] = useState<District[]>([])
  const [geoChiefdoms, setGeoChiefdoms] = useState<Chiefdom[]>([])
  const [geoLoading, setGeoLoading] = useState(false)

  // Load districts once
  useEffect(() => {
    fetchDistricts().then(setGeoDistricts)
  }, [])

  // Load chiefdoms whenever district changes
  const loadChiefdoms = useCallback(async (districtName: string) => {
    if (!districtName) { setGeoChiefdoms([]); return }
    // Find district by name (either from API or fallback)
    const found = geoDistricts.find((d) => d.name === districtName)
    if (!found) { setGeoChiefdoms([]); return }
    setGeoLoading(true)
    try {
      const chiefdoms = await fetchChiefdomsByDistrict(found.id)
      setGeoChiefdoms(chiefdoms)
    } finally {
      setGeoLoading(false)
    }
  }, [geoDistricts])

  useEffect(() => {
    loadChiefdoms(formData.district)
  }, [formData.district, loadChiefdoms])

  const districtOptions = geoDistricts.map((d) => ({ label: d.name, value: d.name }))
  const chiefdomChoices = geoChiefdoms.map((c) => ({ label: c.name, value: c.name }))
  const showStudentFields = formData.collegeStatus === "student"

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
  }

  const handleDocumentChange = (key: keyof typeof documents, file?: File | null) => {
    if (!file) return
    setDocuments((prev) => ({ ...prev, [key]: file }))
    setDocumentNames((prev) => ({ ...prev, [key]: file.name }))
    setUploadProgress((prev) => ({ ...prev, [key]: 100 }))
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setTouchedFields((prev) => ({ ...prev, [name]: true }))
  }

  const currentRoleLabel = useMemo(() => {
    if (currentRole === "super_admin") return "Super Admin"
    if (currentRole === "executive") return "Executive"
    if (currentRole === "stakeholder") return "Stakeholder"
    return "Student"
  }, [currentRole])

  const handleSelectChange = (name: string, value: string) => {
    if (name === "district") {
      // Clear chiefdom when district changes
      setFormData((prev) => ({ ...prev, [name]: value, chiefdom: "" }))
      setTouchedFields((prev) => ({ ...prev, district: true, chiefdom: true }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
      setTouchedFields((prev) => ({ ...prev, [name]: true }))
    }
  }

  const handleAddSkill = () => {
    const nextSkill = skillInput.trim()
    if (!nextSkill) return
    if (formData.skills.includes(nextSkill)) {
      setSkillInput("")
      return
    }
    setFormData((prev) => ({ ...prev, skills: [...prev.skills, nextSkill] }))
    setTouchedFields((prev) => ({ ...prev, skills: true }))
    setSkillInput("")
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    setFormData((prev) => ({ ...prev, skills: prev.skills.filter((skill: string) => skill !== skillToRemove) }))
    setTouchedFields((prev) => ({ ...prev, skills: true }))
  }

  const handleSave = async () => {
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
      toast.error("Email address is required before saving your profile.")
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
      }

      const profile: Record<string, unknown> = {
        fullName: trimmedFullName,
        email: trimmedEmail,
        phone: trimmedPhone,
      }

      const assignField = (key: string, value: unknown) => {
        if (touchedFields[key as keyof typeof touchedFields]) {
          profile[key] = value
        }
      }

      assignField("gender", formData.gender)
      assignField("dob", formData.dob)
      assignField("nationality", formData.nationality)
      assignField("district", formData.district)
      assignField("chiefdom", formData.chiefdom)
      assignField("town", formData.town)
      assignField("homeAddress", formData.homeAddress)
      assignField("currentAddress", formData.currentAddress)
      assignField("university", formData.university)
      assignField("campus", formData.campus)
      assignField("college", formData.college)
      assignField("faculty", formData.faculty)
      assignField("department", formData.department)
      assignField("courseName", formData.courseName)
      assignField("academicLevel", formData.academicLevel)
      assignField("studentId", formData.studentId)
      assignField("admissionYear", formData.admissionYear)
      assignField("expectedGraduationYear", formData.expectedGraduationYear)
      assignField("graduationYear", formData.graduationYear)
      assignField("occupation", formData.occupation)
      assignField("organization", formData.organization)
      assignField("biography", formData.biography)
      if (touchedFields.skills) {
        profile.skills = formData.skills
      }

      const emergencyFieldsTouched =
        touchedFields.emergencyName ||
        touchedFields.emergencyRelationship ||
        touchedFields.emergencyPhone

      if (emergencyFieldsTouched) {
        profile.emergencyContact = {
          name: formData.emergencyName,
          relationship: formData.emergencyRelationship,
          phone: formData.emergencyPhone,
        }
      }

      if (touchedFields.collegeStatus) {
        profile.employmentStatus = formData.collegeStatus === "student" ? "Student" : "Graduate"
      }

      if (photoFile || touchedFields.profilePhoto || touchedFields.profilePhotoUrl) {
        profile.profilePhoto = profilePhotoPath
        profile.profilePhotoUrl = profilePhotoUrl
      }

      const hasChanges = photoFile || Object.values(touchedFields).some(Boolean)
      if (!hasChanges) {
        toast.error("No changes detected. Update one or more fields before saving.")
        setIsSaving(false)
        return
      }

      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          profile,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to update profile")
      }

      await response.json()
      const refreshedUser: any = await refreshCurrentUser()

      if (refreshedUser) {
        updateCurrentUserContext(refreshedUser)
        setFormData({
          fullName: refreshedUser.fullName || refreshedUser.name || "",
          email: refreshedUser.email || "",
          phone: refreshedUser.phone || "",
          gender: refreshedUser.gender || "",
          dob: refreshedUser.dob || refreshedUser.dateOfBirth || "",
          nationality: refreshedUser.nationality || "",
          district: refreshedUser.district || "",
          chiefdom: refreshedUser.chiefdom || "",
          town: refreshedUser.town || "",
          homeAddress: refreshedUser.homeAddress || "",
          currentAddress: refreshedUser.currentAddress || "",
          collegeStatus: refreshedUser.employmentStatus === "Student" ? "student" : refreshedUser.employmentStatus === "Graduate" ? "graduate" : "student",
          university: refreshedUser.university || "",
          campus: refreshedUser.campus || "",
          college: refreshedUser.college || "",
          faculty: refreshedUser.faculty || "",
          department: refreshedUser.department || "",
          courseName: refreshedUser.courseName || refreshedUser.course || "",
          academicLevel: refreshedUser.academicLevel || refreshedUser.level || "",
          studentId: refreshedUser.studentId || refreshedUser.membershipNumber || "",
          admissionYear: refreshedUser.admissionYear || "",
          expectedGraduationYear: refreshedUser.expectedGraduationYear || "",
          graduationYear: refreshedUser.graduationYear || "",
          occupation: refreshedUser.occupation || "",
          organization: refreshedUser.organization || "",
          biography: refreshedUser.biography || refreshedUser.bio || "",
          skills: (refreshedUser.skills || []).map((skill: string) => skill),
          emergencyName: refreshedUser.emergencyContact?.name || "",
          emergencyRelationship: refreshedUser.emergencyContact?.relationship || "",
          emergencyPhone: refreshedUser.emergencyContact?.phone || "",
        })
        setPhotoPreview(refreshedUser.profilePhotoUrl || refreshedUser.profilePhoto || profilePhotoUrl || null)
      }

      setTouchedFields({})
      setPhotoFile(null)
      toast.success("Profile saved successfully. Your registry profile has been updated.")
      router.refresh()
    } catch (error) {
      console.error("Profile save failed:", error)
      toast.error(error instanceof Error ? error.message : "Unable to save your profile")
    } finally {
      setIsSaving(false)
    }
  }

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
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 pb-24">
      <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-start">
          <Link href={backHref}>
            <Button variant="ghost" size="sm" className="gap-2 w-full sm:w-auto">
              <ArrowLeft className="size-4" />
              Back to Profile
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-3xl font-bold text-foreground">Edit Profile & Registry</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Maintain your verified membership profile with structured updates and secure document uploads.
            </p>
          </div>
        </div>
        <div className="flex w-full flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Badge variant="secondary" className="gap-2">
            <ShieldCheck className="size-3.5" />
            {currentRoleLabel}
          </Badge>
          <Button onClick={handleSave} disabled={isSaving} className="hidden sm:inline-flex w-auto gap-2 bg-emerald-600 hover:bg-emerald-700">
            {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Save Changes
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.7fr_0.9fr]">
        <Accordion type="multiple" defaultValue={[
          "personal-information",
          "contact-information",
          "location-information",
          "academic-information",
          "professional-information",
          "emergency-contact",
          "documents",
          "membership-information",
        ]} className="space-y-3">
          <AccordionItem value="personal-information" className="rounded-2xl border bg-card p-2 shadow-sm">
            <AccordionTrigger className="rounded-xl px-3 py-2 text-base font-semibold">
              <span className="flex items-center gap-2"><UserRound className="size-4" /> Personal Information</span>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="fullName" className="text-xs font-semibold">Full Name</Label>
                  <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} className="mt-1 w-full" />
                </div>
                <div>
                  <Label htmlFor="gender" className="text-xs font-semibold">Gender</Label>
                  <div className="mt-1">
                    <div className="w-full">
                      <SearchableSelect options={genderOptions} value={formData.gender} onChange={(value) => handleSelectChange("gender", value)} allowOther={true} otherPlaceholder="Specify gender" />
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="dob" className="text-xs font-semibold">Date of Birth</Label>
                  <Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleInputChange} className="mt-1 w-full" />
                </div>
                <div>
                  <Label htmlFor="nationality" className="text-xs font-semibold">Nationality</Label>
                  <Input id="nationality" name="nationality" value={formData.nationality} onChange={handleInputChange} className="mt-1 w-full" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="contact-information" className="rounded-2xl border bg-card p-2 shadow-sm">
            <AccordionTrigger className="rounded-xl px-3 py-2 text-base font-semibold">
              <span className="flex items-center gap-2"><Mail className="size-4" /> Contact Information</span>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="email" className="text-xs font-semibold">Email Address</Label>
                  <Input id="email" name="email" type="email" value={formData.email} onChange={handleInputChange} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs font-semibold">Phone Number</Label>
                  <Input id="phone" name="phone" value={formData.phone} onChange={handleInputChange} className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="homeAddress" className="text-xs font-semibold">Home Address</Label>
                  <Input id="homeAddress" name="homeAddress" value={formData.homeAddress} onChange={handleInputChange} className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="currentAddress" className="text-xs font-semibold">Current Address</Label>
                  <Input id="currentAddress" name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} className="mt-1" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="location-information" className="rounded-2xl border bg-card p-2 shadow-sm">
            <AccordionTrigger className="rounded-xl px-3 py-2 text-base font-semibold">
              <span className="flex items-center gap-2"><MapPin className="size-4" /> Location Information</span>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Country – always Sierra Leone */}
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Country</Label>
                  <div className="mt-1 flex items-center rounded-lg border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
                    🇸🇱 Sierra Leone
                  </div>
                </div>

                {/* District */}
                <div>
                  <Label className="text-xs font-semibold">District</Label>
                  <div className="mt-1">
                    <SearchableSelect
                      options={districtOptions}
                      value={formData.district}
                      onChange={(value) => handleSelectChange("district", value)}
                      allowOther
                    />
                  </div>
                </div>

                {/* Chiefdom – dependent on district */}
                <div>
                  <Label className="text-xs font-semibold flex items-center gap-2">
                    Chiefdom
                    {geoLoading && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
                  </Label>
                  <div className="mt-1">
                    <SearchableSelect
                      options={chiefdomChoices}
                      value={formData.chiefdom}
                      onChange={(value) => handleSelectChange("chiefdom", value)}
                      allowOther
                    />
                    {formData.district && chiefdomChoices.length === 0 && !geoLoading && (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        No chiefdoms found for {formData.district}.
                      </p>
                    )}
                  </div>
                </div>

                {/* Town / Village */}
                <div className="md:col-span-2">
                  <Label htmlFor="town" className="text-xs font-semibold">Town / Village</Label>
                  <Input id="town" name="town" value={formData.town} onChange={handleInputChange} className="mt-1" placeholder="Enter your town or village" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>


          <AccordionItem value="academic-information" className="rounded-2xl border bg-card p-2 shadow-sm">
            <AccordionTrigger className="rounded-xl px-3 py-2 text-base font-semibold">
              <span className="flex items-center gap-2"><BookOpen className="size-4" /> Academic Information</span>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label className="text-xs font-semibold">College Status</Label>
                  <div className="mt-1">
                    <SearchableSelect options={collegeStatusOptions} value={formData.collegeStatus} onChange={(value) => handleSelectChange("collegeStatus", value)} allowOther={false} />
                  </div>
                </div>
                {showStudentFields ? (
                  <>
                    <div>
                      <Label className="text-xs font-semibold">University</Label>
                      <div className="mt-1">
                        <SearchableSelect options={universityOptions} value={formData.university} onChange={(value) => handleSelectChange("university", value)} allowOther />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Campus</Label>
                      <div className="mt-1">
                        <SearchableSelect options={campusOptions} value={formData.campus} onChange={(value) => handleSelectChange("campus", value)} allowOther />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">College (if applicable)</Label>
                      <div className="mt-1">
                        <SearchableSelect options={collegeOptions} value={formData.college} onChange={(value) => handleSelectChange("college", value)} allowOther />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Faculty</Label>
                      <div className="mt-1">
                        <SearchableSelect options={facultyOptions} value={formData.faculty} onChange={(value) => handleSelectChange("faculty", value)} allowOther />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Department</Label>
                      <div className="mt-1">
                        <SearchableSelect options={departmentOptions} value={formData.department} onChange={(value) => handleSelectChange("department", value)} allowOther />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="courseName" className="text-xs font-semibold">Course of Study</Label>
                      <Input id="courseName" name="courseName" value={formData.courseName} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Academic Level</Label>
                      <div className="mt-1">
                        <SearchableSelect options={academicLevelOptions} value={formData.academicLevel} onChange={(value) => handleSelectChange("academicLevel", value)} allowOther />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="studentId" className="text-xs font-semibold">Student ID Number</Label>
                      <Input id="studentId" name="studentId" value={formData.studentId} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="admissionYear" className="text-xs font-semibold">Admission Year</Label>
                      <Input id="admissionYear" name="admissionYear" value={formData.admissionYear} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="expectedGraduationYear" className="text-xs font-semibold">Expected Graduation Year</Label>
                      <Input id="expectedGraduationYear" name="expectedGraduationYear" value={formData.expectedGraduationYear} onChange={handleInputChange} className="mt-1" />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label className="text-xs font-semibold">University Attended</Label>
                      <div className="mt-1">
                        <SearchableSelect options={universityOptions} value={formData.university} onChange={(value) => handleSelectChange("university", value)} allowOther />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Campus</Label>
                      <div className="mt-1">
                        <SearchableSelect options={campusOptions} value={formData.campus} onChange={(value) => handleSelectChange("campus", value)} allowOther />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">College (if applicable)</Label>
                      <div className="mt-1">
                        <SearchableSelect options={collegeOptions} value={formData.college} onChange={(value) => handleSelectChange("college", value)} allowOther />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Faculty</Label>
                      <div className="mt-1">
                        <SearchableSelect options={facultyOptions} value={formData.faculty} onChange={(value) => handleSelectChange("faculty", value)} allowOther />
                      </div>
                    </div>
                    <div>
                      <Label className="text-xs font-semibold">Department</Label>
                      <div className="mt-1">
                        <SearchableSelect options={departmentOptions} value={formData.department} onChange={(value) => handleSelectChange("department", value)} allowOther />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="courseName" className="text-xs font-semibold">Course of Study</Label>
                      <Input id="courseName" name="courseName" value={formData.courseName} onChange={handleInputChange} className="mt-1" />
                    </div>
                    <div>
                      <Label htmlFor="graduationYear" className="text-xs font-semibold">Graduation Year</Label>
                      <Input id="graduationYear" name="graduationYear" value={formData.graduationYear} onChange={handleInputChange} className="mt-1" />
                    </div>
                  </>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="professional-information" className="rounded-2xl border bg-card p-2 shadow-sm">
            <AccordionTrigger className="rounded-xl px-3 py-2 text-base font-semibold">
              <span className="flex items-center gap-2"><BriefcaseBusiness className="size-4" /> Professional Information</span>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="occupation" className="text-xs font-semibold">Occupation</Label>
                  <Input id="occupation" name="occupation" value={formData.occupation} onChange={handleInputChange} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="organization" className="text-xs font-semibold">Organization / Employer</Label>
                  <Input id="organization" name="organization" value={formData.organization} onChange={handleInputChange} className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-xs font-semibold">Skills</Label>
                  <div className="mt-1 flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} placeholder="Add a skill" />
                      <Button type="button" variant="secondary" onClick={handleAddSkill} className="gap-2">
                        <Plus className="size-4" /> Add
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="gap-2 px-3 py-1">
                          {skill}
                          <button type="button" onClick={() => handleRemoveSkill(skill)} className="text-muted-foreground hover:text-foreground">
                            <Trash2 className="size-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="biography" className="text-xs font-semibold">Biography / About</Label>
                  <Textarea id="biography" name="biography" value={formData.biography} onChange={handleInputChange} rows={5} className="mt-1" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="emergency-contact" className="rounded-2xl border bg-card p-2 shadow-sm">
            <AccordionTrigger className="rounded-xl px-3 py-2 text-base font-semibold">
              <span className="flex items-center gap-2"><Phone className="size-4" /> Emergency Contact</span>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="emergencyName" className="text-xs font-semibold">Full Name</Label>
                  <Input id="emergencyName" name="emergencyName" value={formData.emergencyName} onChange={handleInputChange} className="mt-1" />
                </div>
                <div>
                  <Label htmlFor="emergencyRelationship" className="text-xs font-semibold">Relationship</Label>
                  <Input id="emergencyRelationship" name="emergencyRelationship" value={formData.emergencyRelationship} onChange={handleInputChange} className="mt-1" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="emergencyPhone" className="text-xs font-semibold">Phone Number</Label>
                  <Input id="emergencyPhone" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleInputChange} className="mt-1" />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="documents" className="rounded-2xl border bg-card p-2 shadow-sm">
            <AccordionTrigger className="rounded-xl px-3 py-2 text-base font-semibold">
              <span className="flex items-center gap-2"><FileText className="size-4" /> Documents</span>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="grid gap-3">
                {[
                  { key: "studentId", label: "Student ID", icon: BadgeCheck },
                  { key: "nationalId", label: "National ID", icon: Home },
                  { key: "cv", label: "CV / Resume", icon: FileText },
                  { key: "certificates", label: "Certificates", icon: BadgeCheck },
                  { key: "other", label: "Other Supporting Documents", icon: Upload },
                ].map(({ key, label, icon: Icon }) => (
                  <div key={key} className="rounded-xl border p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Icon className="size-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{label}</span>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => document.getElementById(`document-${key}`)?.click()}
                      >
                        <Upload className="size-3.5" />
                        Upload
                      </Button>
                    </div>
                    <input
                      id={`document-${key}`}
                      type="file"
                      className="hidden"
                      onChange={(e) => handleDocumentChange(key as keyof typeof documents, e.target.files?.[0])}
                    />
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{documentNames[key] || "No file selected"}</span>
                        {uploadProgress[key] ? <span>{uploadProgress[key]}%</span> : null}
                      </div>
                      {uploadProgress[key] ? <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-emerald-600" style={{ width: `${uploadProgress[key]}%` }} /></div> : null}
                    </div>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="membership-information" className="rounded-2xl border bg-card p-2 shadow-sm">
            <AccordionTrigger className="rounded-xl px-3 py-2 text-base font-semibold">
              <span className="flex items-center gap-2"><BadgeCheck className="size-4" /> Membership Information (Read Only)</span>
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Membership ID</p>
                  <p className="mt-2 font-mono font-semibold text-foreground">{currentUser?.membershipNumber || currentUser?.membershipId || "Pending assignment"}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">QR Code</p>
                  <p className="mt-2 font-mono font-semibold text-foreground">{currentUser?.qrCode || currentUser?.permanentQrCode || "Pending assignment"}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Membership Type</p>
                  <p className="mt-2 font-semibold">{currentUser?.membershipType || (currentUser?.employmentStatus === "Student" ? "Student" : "Graduate/Alumnus")}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Current Role</p>
                  <p className="mt-2 font-semibold">{currentRoleLabel}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Membership Status</p>
                  <p className="mt-2 font-semibold">{currentUser?.status ? currentUser.status : "Active"}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Verification Status</p>
                  <p className="mt-2 font-semibold">{currentUser?.verificationStatus || currentUser?.status || "Verified"}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Registration Date</p>
                  <p className="mt-2 font-semibold">{currentUser?.joinedDate || currentUser?.createdAt || "Not available"}</p>
                </div>
                <div className="rounded-xl border p-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">Approval Date</p>
                  <p className="mt-2 font-semibold">{currentUser?.dateApproved || currentUser?.joinedDate || "Pending approval"}</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Camera className="size-4" /> Profile Photo
              </CardTitle>
              <CardDescription>Change, remove, or replace your portfolio image.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center rounded-2xl border bg-muted/40 p-4">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile preview" className="h-20 w-20 sm:h-28 sm:w-28 rounded-2xl object-cover shadow-sm" />
                ) : (
                  <div className="flex h-20 w-20 sm:h-28 sm:w-28 items-center justify-center rounded-2xl bg-background text-3xl font-bold text-muted-foreground shadow-sm">
                    {String(currentUser?.fullName || currentUser?.name || "U").charAt(0)}
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2"
                  onClick={() => photoInputRef.current?.click()}
                >
                  <Upload className="size-4" />
                  {photoFile ? "Change Photo" : "Upload Photo"}
                </Button>
                <input
                  ref={photoInputRef}
                  id="profile-photo-upload"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={(event) => {
                    handlePhotoChange(event)
                    event.target.value = ""
                  }}
                  className="sr-only"
                />
                {photoPreview ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full gap-2 text-destructive"
                    onClick={() => {
                      setPhotoFile(null)
                      setPhotoPreview(null)
                    }}
                  >
                    <Trash2 className="size-4" /> Remove Photo
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>

          <Card className="border shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <CalendarRange className="size-4" /> Membership Snapshot
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-col gap-2 rounded-xl border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-muted-foreground">Membership ID</span>
                <span className="font-semibold break-words">{currentUser?.membershipNumber || "Pending assignment"}</span>
              </div>
              <div className="flex flex-col gap-2 rounded-xl border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-muted-foreground">QR Code</span>
                <span className="font-semibold break-words">{currentUser?.qrCode || "Pending assignment"}</span>
              </div>
              <div className="flex flex-col gap-2 rounded-xl border px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-muted-foreground">Verification</span>
                <span className="font-semibold">{currentUser?.verificationStatus || "Verified"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Mobile fixed save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-card/95 backdrop-blur border-t py-3 px-4 sm:hidden">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Button onClick={handleSave} disabled={isSaving} className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700">
                {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                {isSaving ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}