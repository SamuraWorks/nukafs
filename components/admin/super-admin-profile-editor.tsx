/**
 * Super Admin Profile Editor
 * Allows Super Admin to directly edit their profile without Profile Update Requests
 * Changes take effect immediately and sync across the entire application
 */

"use client"

import React, { useState, useCallback } from "react"
import { useAppState } from "@/lib/context/app-state-context"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Loader2, Save, Upload, Check, AlertCircle } from "lucide-react"
import Image from "next/image"

export default function SuperAdminProfileEditor() {
  const { currentUser, currentRole } = useAppState()
  const [isSaving, setIsSaving] = useState(false)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    currentUser?.profilePhoto || null
  )

  const [formData, setFormData] = useState({
    fullName: currentUser?.fullName || "",
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
    courseName: currentUser?.courseName || "",
    academicLevel: currentUser?.academicLevel || "",
    studentId: currentUser?.studentId || "",
    admissionYear: currentUser?.admissionYear || "",
    graduationYear: currentUser?.graduationYear || "",
    skills: currentUser?.skills?.join(", ") || "",
    occupation: currentUser?.occupation || "",
    biography: currentUser?.biography || "",
    emergencyContact: currentUser?.emergencyContact || "",
  })

  // Permanent fields (cannot edit)
  const permanentFields = {
    membershipId: currentUser?.membershipNumber || "—",
    qrCode: currentUser?.qrCode || "—",
    registrationDate: currentUser?.joinedDate || "—",
    approvalDate: currentUser?.joinedDate || "—",
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Invalid image format. Please use JPEG, PNG, or WebP.")
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image too large. Maximum size is 5MB.")
      return
    }

    setPhotoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onload = (event) => {
      setPhotoPreview(event.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSave = useCallback(async () => {
    if (!currentUser?.id) {
      toast.error("User not authenticated")
      return
    }

    setIsSaving(true)

    try {
      // Upload profile photo if changed
      let profilePhotoUrl = currentUser?.profilePhoto

      if (photoFile) {
        const formDataWithPhoto = new FormData()
        formDataWithPhoto.append("file", photoFile)

        const photoResponse = await fetch("/api/profile-photo-upload", {
          method: "POST",
          headers: {
            "X-User-Id": currentUser.id,
          },
          body: formDataWithPhoto,
        })

        if (photoResponse.ok) {
          const photoData = await photoResponse.json()
          profilePhotoUrl = photoData.url
          toast.success("Profile photo updated")
        } else {
          toast.error("Failed to upload profile photo")
        }
      }

      // Update profile in database
      const updateResponse = await fetch("/api/super-admin/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          profile: {
            ...formData,
            skills: formData.skills.split(",").map((s) => s.trim()),
            profilePhoto: profilePhotoUrl,
          },
        }),
      })

      if (updateResponse.ok) {
        toast.success("Profile updated successfully")
        // Trigger app state refresh (would need to be implemented in context)
        window.location.reload() // For now, refresh the page
      } else {
        const error = await updateResponse.json()
        toast.error(error.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("Profile save error:", error)
      toast.error("An error occurred while saving your profile")
    } finally {
      setIsSaving(false)
    }
  }, [currentUser, photoFile, formData])

  if (currentRole !== "super_admin") {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <AlertCircle className="w-5 h-5 text-red-600 mb-2" />
            <p className="text-red-700">
              Only Super Admins can directly edit their profile.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Edit Your Profile</h1>
        <p className="text-gray-600 mt-1">
          As Super Admin, you can directly update your profile. Changes take effect immediately.
        </p>
      </div>

      {/* Profile Photo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Profile Photo
          </CardTitle>
          <CardDescription>
            Upload a new profile photo (JPEG, PNG, or WebP, max 5MB)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-6">
            {/* Current/Preview Photo */}
            <div className="flex-shrink-0">
              {photoPreview ? (
                <div className="w-32 h-32 rounded-lg overflow-hidden border-2 border-emerald-200">
                  <Image
                    src={photoPreview}
                    alt="Profile preview"
                    width={128}
                    height={128}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-lg bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
                  <span className="text-2xl font-bold text-gray-400">
                    {currentUser?.fullName.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Upload Input */}
            <div className="flex-1">
              <label className="block">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={isSaving}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={(e) => {
                    const input = e.currentTarget.parentElement?.querySelector("input")
                    input?.click()
                  }}
                  disabled={isSaving}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {photoFile ? "Change Photo" : "Upload Photo"}
                </Button>
              </label>
              {photoFile && (
                <div className="mt-2 p-3 bg-emerald-50 rounded border border-emerald-200 text-sm text-emerald-700">
                  <Check className="w-4 h-4 inline mr-2" />
                  Ready to upload: {photoFile.name}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Full Name
              </label>
              <Input
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Email
              </label>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Phone
              </label>
              <Input
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Date of Birth
              </label>
              <Input
                name="dob"
                type="date"
                value={formData.dob}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Gender
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Nationality
              </label>
              <Input
                name="nationality"
                value={formData.nationality}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card>
        <CardHeader>
          <CardTitle>Location Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                District
              </label>
              <Input
                name="district"
                value={formData.district}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Chiefdom
              </label>
              <Input
                name="chiefdom"
                value={formData.chiefdom}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Town/Village
              </label>
              <Input
                name="town"
                value={formData.town}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Home Address
              </label>
              <Input
                name="homeAddress"
                value={formData.homeAddress}
                onChange={handleInputChange}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Current Address
              </label>
              <Input
                name="currentAddress"
                value={formData.currentAddress}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Academic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                University
              </label>
              <Input
                name="university"
                value={formData.university}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Campus
              </label>
              <Input
                name="campus"
                value={formData.campus}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Faculty
              </label>
              <Input
                name="faculty"
                value={formData.faculty}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Department
              </label>
              <Input
                name="department"
                value={formData.department}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Course of Study
              </label>
              <Input
                name="courseName"
                value={formData.courseName}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Academic Level
              </label>
              <Input
                name="academicLevel"
                value={formData.academicLevel}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Student ID
              </label>
              <Input
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Admission Year
              </label>
              <Input
                name="admissionYear"
                type="year"
                value={formData.admissionYear}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 block">
                Expected Graduation Year
              </label>
              <Input
                name="graduationYear"
                type="year"
                value={formData.graduationYear}
                onChange={handleInputChange}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Professional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Professional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Skills (comma-separated)
            </label>
            <Input
              name="skills"
              value={formData.skills}
              onChange={handleInputChange}
              placeholder="e.g. Software Development, Data Analysis, Project Management"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Occupation
            </label>
            <Input
              name="occupation"
              value={formData.occupation}
              onChange={handleInputChange}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Biography
            </label>
            <Textarea
              name="biography"
              value={formData.biography}
              onChange={handleInputChange}
              rows={4}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Emergency Contact
            </label>
            <Input
              name="emergencyContact"
              value={formData.emergencyContact}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
      </Card>

      {/* Permanent System Fields */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Permanent Membership Identity
          </CardTitle>
          <CardDescription className="text-amber-800">
            These fields are permanent and can never be changed
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-amber-900 uppercase tracking-wide">
                Membership ID
              </label>
              <p className="text-lg font-mono font-semibold text-amber-900 mt-1">
                {permanentFields.membershipId}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-amber-900 uppercase tracking-wide">
                QR Code
              </label>
              <Badge className="mt-2 bg-amber-600">Active</Badge>
            </div>
            <div>
              <label className="text-xs font-medium text-amber-900 uppercase tracking-wide">
                Registration Date
              </label>
              <p className="text-sm text-amber-900 mt-1">
                {permanentFields.registrationDate}
              </p>
            </div>
            <div>
              <label className="text-xs font-medium text-amber-900 uppercase tracking-wide">
                Approval Date
              </label>
              <p className="text-sm text-amber-900 mt-1">
                {permanentFields.approvalDate}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button variant="outline">Cancel</Button>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
