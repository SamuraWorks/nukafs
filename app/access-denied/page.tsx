"use client"

import Link from "next/link"
import { ShieldX, ArrowLeft, Home } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { useAppState } from "@/lib/context/app-state-context"
import { getDefaultRouteForRole } from "@/lib/auth/route-access"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { PageLoading } from "@/components/shared/page-states"

function AccessDeniedContent() {
  const searchParams = useSearchParams()
  const { currentRole } = useAppState()
  const attempted = searchParams.get("from")
  const homeRoute = getDefaultRouteForRole(currentRole)

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg border-destructive/20 shadow-lg">
        <CardContent className="flex flex-col items-center gap-6 p-8 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <ShieldX className="size-8" />
          </div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-destructive">
              403 — Access Denied
            </p>
            <h1 className="mt-2 font-heading text-2xl font-bold">
              You don&apos;t have permission to view this page
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Your current role does not include access to this area of the registry.
              {attempted ? (
                <>
                  {" "}
                  Attempted path:{" "}
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                    {attempted}
                  </code>
                </>
              ) : null}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button className="flex-1 gap-2" render={<Link href={homeRoute} />}>
              <Home className="size-4" />
              Go to My Dashboard
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2"
              render={<Link href="/" />}
            >
              <ArrowLeft className="size-4" />
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AccessDeniedPage() {
  return (
    <Suspense fallback={<PageLoading message="Loading..." />}>
      <AccessDeniedContent />
    </Suspense>
  )
}
