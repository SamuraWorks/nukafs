"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LogIn, Loader2, ShieldCheck, ArrowLeft, Lock } from "lucide-react"
import { useAppState } from "@/lib/context/app-state-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { NUKaFsLogo } from "@/components/nukafs-logo"
import { toast } from "sonner"
import { validateEmail } from "@/lib/security/validation"

export default function LoginPage() {
  const { login, currentRole, currentUser, logout } = useAppState()
  const router = useRouter()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isPendingScreen, setIsPendingScreen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateEmail(email)
    if (!validation.valid) {
      toast.error(validation.message)
      return
    }

    setIsSubmitting(true)

    const result = await login(email, password)
    setIsSubmitting(false)

    if (result.success) {
      toast.success("Signed in successfully")
      if (result.role === "student_pending") {
        setIsPendingScreen(true)
      } else if (result.role === "student_active_wizard") {
        router.push("/setup")
      } else if (result.role === "student_active_complete") {
        router.push("/dashboard")
      } else if (result.role === "executive") {
        router.push("/executive")
      } else if (result.role === "stakeholder") {
        router.push("/stakeholder")
      } else if (result.role === "super_admin") {
        router.push("/admin")
      } else {
        router.push("/dashboard")
      }
    } else {
      toast.error(result.error ?? "Invalid credentials")
    }
  }

  const showPendingApproval = isPendingScreen || (currentRole === "student_pending" && currentUser?.role !== "super_admin")

  if (showPendingApproval) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 font-sans">
        <Card className="w-full max-w-md border-amber-500/20 shadow-2xl animate-in fade-in duration-300">
          <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
            <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/10 text-amber-500">
              <Lock className="size-8" />
            </div>

            <div className="flex flex-col gap-2">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-amber-600 dark:text-amber-400">Account Pending Approval</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Your registration has been successfully submitted and is awaiting approval by the NUKaFs Administration. Your QR Membership Verification Code will be generated automatically once your registration is approved.
              </p>
            </div>

            <div className="rounded-xl bg-muted border border-border p-4 text-xs text-left leading-relaxed text-muted-foreground flex gap-3">
              <ShieldCheck className="size-5 shrink-0 text-primary mt-0.5" />
              <div>
                <p className="font-semibold text-foreground mb-1">What Happens Next</p>
                <ul className="space-y-2">
                  <li>• NUKaFs Executives will review your application</li>
                  <li>• Upon approval, your membership ID and QR code are generated instantly</li>
                  <li>• You'll gain full access to the member dashboard</li>
                  <li>• Your membership card will be available for download</li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col w-full gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  logout()
                  setIsPendingScreen(false)
                  router.push("/login")
                }}
                className="w-full"
              >
                Sign out
              </Button>
              <Button
                variant="ghost"
                render={<Link href="/" className="flex items-center justify-center gap-2"><ArrowLeft className="size-4" /> Back to Homepage</Link>}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 font-sans">
      <div className="mb-6 flex flex-col items-center">
        <Link href="/" aria-label="NUKaFs Registry Home">
          <NUKaFsLogo className="scale-110 mb-2" />
        </Link>
      </div>

      <div className="flex w-full justify-center gap-6 flex-col lg:flex-row max-w-5xl">
        {/* Login Form */}
        <Card className="shadow-xl border w-full lg:w-96">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col gap-2 pb-6">
              <h2 className="font-heading text-2xl font-bold tracking-tight">Welcome back</h2>
              <p className="text-sm text-muted-foreground">
                Sign in to manage your profile and explore opportunities.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <FieldGroup className="gap-4">
                <Field>
                  <FieldLabel htmlFor="email">Email Address</FieldLabel>
                  <Input
                    id="email"
                    name="email"
                    placeholder="e.g. aminata@student.edu.sl"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>

                <Field>
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="password">Password</FieldLabel>
                    <a href="#" className="text-xs text-primary font-medium hover:underline">
                      Forgot?
                    </a>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>

                <Button type="submit" size="lg" className="w-full mt-2 cursor-pointer" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="size-4 mr-2" />
                      Sign In
                    </>
                  )}
                </Button>
              </FieldGroup>
            </form>

            <div className="mt-6 text-center text-xs text-muted-foreground border-t pt-4">
              Don&apos;t have an account yet?{" "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                Register here
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
