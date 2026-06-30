import Link from "next/link"
import { Globe, Mail, Phone } from "lucide-react"
import { NUKAFSLogo } from "@/components/nukafs-logo"

const columns = [
  {
    title: "Platform",
    links: [
      { label: "Register", href: "/register" },
      { label: "Sign in", href: "/login" },
      { label: "Features", href: "#features" },
      { label: "Opportunities", href: "#benefits" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Scholarships", href: "#benefits" },
      { label: "Internships", href: "#benefits" },
      { label: "Events", href: "#about" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Union",
    links: [
      { label: "About NUKAFS", href: "#about" },
      { label: "Executive Council", href: "#about" },
      { label: "Contact", href: "#contact" },
      { label: "Partners", href: "#about" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <NUKAFSLogo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              The official membership registry of the Koinadugu &amp; Falaba Students&apos; Union — connecting students
              with opportunities, leadership and community.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[Globe, Mail, Phone].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label="Social link"
                  className="flex size-9 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="font-heading text-sm font-semibold">{col.title}</h4>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t pt-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} NUKAFS Registry. All rights reserved.</p>
          <p>Koinadugu &amp; Falaba, Sierra Leone</p>
        </div>
      </div>
    </footer>
  )
}
