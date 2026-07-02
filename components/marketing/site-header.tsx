"use client"

import Link from "next/link"
import { Menu } from "lucide-react"
import { useState } from "react"
import { NUKaFsLogo } from "@/components/nukafs-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const links = [
  { label: "About", href: "#about" },
  { label: "Features", href: "#features" },
  { label: "Opportunities", href: "#benefits" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
]

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label="NUKaFs Registry home">
          <NUKaFsLogo />
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <Button key={link.href} variant="ghost" size="sm" nativeButton={false} render={<a href={link.href}>{link.label}</a>} />
          ))}
        </nav>
        <div className="flex items-center gap-1.5">
          <ThemeToggle />
          <Button variant="ghost" size="sm" nativeButton={false} className="hidden sm:inline-flex" render={<Link href="/login">Sign in</Link>} />
          <Button size="sm" nativeButton={false} className="hidden sm:inline-flex" render={<Link href="/register">Register</Link>} />
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                  <Menu />
                </Button>
              }
            />
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <NUKaFsLogo />
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 px-4">
                {links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-accent"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="mt-3 flex flex-col gap-2">
                  <Button variant="outline" nativeButton={false} render={<Link href="/login">Sign in</Link>} />
                  <Button nativeButton={false} render={<Link href="/register">Register</Link>} />
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
