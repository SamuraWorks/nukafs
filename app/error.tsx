"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Home, RefreshCw, AlertTriangle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-sans px-4">
      <div className="text-center max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-destructive" />
        </div>

        {/* Big number */}
        <div
          className="text-8xl font-heading font-black mb-4 select-none"
          style={{
            background: "linear-gradient(135deg, oklch(0.55 0.13 25), oklch(0.45 0.1 15))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          500
        </div>

        <h1 className="text-2xl font-heading font-bold text-foreground mb-3">Something Went Wrong</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-2">
          An unexpected error occurred while loading this page. The system has been notified and our team is
          investigating.
        </p>
        {error.digest && (
          <p className="text-xs text-muted-foreground/60 mb-6 font-mono">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button
            onClick={reset}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
        </div>

        {/* NUKAFS branding */}
        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            NUKAFS Registry — If this error persists, contact{" "}
            <a href="mailto:support@NUKAFS.org" className="text-primary underline">
              support@NUKAFS.org
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
