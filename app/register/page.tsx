"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { UserPlus, Loader2 } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { NUKaFsLogo } from "@/components/nukafs-logo"
import { toast } from "sonner"
import {
  validateRegistrationForm,
  validatePassword,
} from "@/lib/security/validation"

export default function RegisterPage() {
  const { register } = useAppState()
  const router = useRouter()
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const registrationCheck = validateRegistrationForm(
      formData.fullName,
      formData.email,
      formData.phone,
    )
    if (!registrationCheck.valid) {
      toast.error(registrationCheck.message)
      return
    }

    const passwordCheck = validatePassword(formData.password)
    if (!passwordCheck.valid) {
      toast.error(passwordCheck.message)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setIsSubmitting(true)

    const result = await register(
      formData.fullName,
      formData.email,
      formData.phone,
      formData.password,
    )

    setIsSubmitting(false)

    if (result.success) {
      toast.success("Account created. Please choose your college status to continue.")
      router.replace("/setup?status=select")
    } else {
      console.error("Registration failed details:", result)
      toast.error(result.error ?? "Registration failed")
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 font-sans">
      <div className="mb-6 flex flex-col items-center">
        <Link href="/" aria-label="NUKaFs Registry Home">
          <NUKaFsLogo className="scale-110 mb-2" />
        </Link>
      </div>
      
      <Card className="w-full max-w-md border shadow-xl">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-2 pb-6">
            <h2 className="font-heading text-2xl font-bold tracking-tight">Create Account</h2>
            <p className="text-sm text-muted-foreground">
              Enter your details to begin the NUKaFs Registry sign-up process.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <FieldGroup className="gap-4">
              <Field>
                <FieldLabel htmlFor="fullName">Full Name</FieldLabel>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="e.g. Aminata Kamara"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="email">Email Address</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="e.g. name@student.edu.sl"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="phone">Phone Number</FieldLabel>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="e.g. +23279630777"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor="confirmPassword">Confirm Password</FieldLabel>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </Field>

              <Button type="submit" size="lg" className="w-full mt-2" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin mr-2" />
                    Registering Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="size-4 mr-2" />
                    Register
                  </>
                )}
              </Button>
            </FieldGroup>
          </form>

          <div className="mt-6 text-center text-xs text-muted-foreground border-t pt-4">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
