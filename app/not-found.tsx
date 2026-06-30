import Link from "next/link"
import { Home, ArrowLeft, Search } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background font-sans px-4">
      <div className="text-center max-w-md">
        {/* Big 404 number */}
        <div className="relative mb-6">
          <div
            className="text-[120px] font-heading font-black leading-none select-none"
            style={{
              background: "linear-gradient(135deg, oklch(0.52 0.12 158), oklch(0.62 0.1 200))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            404
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="w-12 h-12 text-muted-foreground/20" />
          </div>
        </div>

        <h1 className="text-2xl font-heading font-bold text-foreground mb-3">Page Not Found</h1>
        <p className="text-muted-foreground text-sm leading-relaxed mb-8">
          The page you are looking for does not exist or may have been moved. Check the URL or navigate back to the
          registry.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors w-full sm:w-auto justify-center"
          >
            <Home className="w-4 h-4" />
            Return Home
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition-colors w-full sm:w-auto justify-center"
          >
            <ArrowLeft className="w-4 h-4" />
            My Dashboard
          </Link>
        </div>

        {/* NUKAFS branding */}
        <div className="mt-12 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground">
            NUKAFS Registry — Koinadugu &amp; Falaba Students&apos; Union
          </p>
        </div>
      </div>
    </div>
  )
}
