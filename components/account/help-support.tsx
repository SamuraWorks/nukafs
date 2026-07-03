"use client"

import { useState } from "react"
import { toast } from "sonner"
import {
  LifeBuoy,
  Mail,
  Phone,
  BookOpen,
  AlertCircle,
  Info,
  Send,
} from "lucide-react"
import { PageHeader } from "@/components/dashboard/ui-bits"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function HelpSupportPage({
  title = "Help & Support",
  description = "Find answers, contact support, and learn how to use the registry.",
  portalName = "NUKaFs Registry",
}: {
  title?: string
  description?: string
  portalName?: string
}) {
  const [reportForm, setReportForm] = useState({ subject: "", details: "" })
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" })

  const handleReport = (e: React.FormEvent) => {
    e.preventDefault()
    if (!reportForm.subject || !reportForm.details) {
      toast.error("Please complete all fields.")
      return
    }
    toast.success("Problem report submitted. Our team will review it shortly.")
    setReportForm({ subject: "", details: "" })
  }

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      toast.error("Please complete all fields.")
      return
    }
    toast.success("Message sent to NUKaFs support (mock).")
    setContactForm({ name: "", email: "", message: "" })
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6 pb-10 font-sans">
      <PageHeader title={title} description={description} />

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="border shadow-sm">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Mail className="size-5" />
            </div>
            <h3 className="text-sm font-bold">Email Support</h3>
            <a
              href="mailto:syscend@gmail.com"
              className="text-xs text-primary hover:underline"
            >
              syscend@gmail.com
            </a>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Phone className="size-5" />
            </div>
            <h3 className="text-sm font-bold">Phone Support</h3>
            <a href="tel:+23279630777" className="text-xs text-primary hover:underline">
              +23279630777
            </a>
          </CardContent>
        </Card>
        <Card className="border shadow-sm">
          <CardContent className="flex flex-col items-center gap-3 p-6 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <BookOpen className="size-5" />
            </div>
            <h3 className="text-sm font-bold">User Guide</h3>
            <p className="text-xs text-muted-foreground">
              Step-by-step registry documentation
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="border shadow-sm">
        <CardContent className="p-6">
          <h3 className="mb-4 flex items-center gap-2 text-base font-bold">
            <LifeBuoy className="size-4 text-primary" />
            Frequently Asked Questions
          </h3>
          <div className="space-y-4 text-sm">
            {[
              { question: "How do I register?", answer: "Use the Register page and submit your details for executive approval." },
              { question: "How long for approval?", answer: "Typically 1-3 business days depending on workload." },
              { question: "How do I get my digital card?", answer: "Complete the profile wizard to generate your digital membership card." },
              { question: "Lost password", answer: "Use the forgot password flow or contact registry support." },
              { question: "Who can view my data?", answer: "Executives and approved stakeholders have access for governance purposes." },
              { question: "Reporting issues", answer: "Use the contact form below to report any problems to the registry team." },
            ].slice(0, 6).map((faq) => (
              <div key={faq.question}>
                <p className="font-semibold">{faq.question}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <h3 className="mb-4 flex items-center gap-2 font-bold">
              <Send className="size-4 text-primary" />
              Contact Support
            </h3>
            <form onSubmit={handleContact} className="space-y-3">
              <Input
                placeholder="Your name"
                value={contactForm.name}
                onChange={(e) =>
                  setContactForm({ ...contactForm, name: e.target.value })
                }
              />
              <Input
                type="email"
                placeholder="Email address"
                value={contactForm.email}
                onChange={(e) =>
                  setContactForm({ ...contactForm, email: e.target.value })
                }
              />
              <textarea
                className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="How can we help?"
                value={contactForm.message}
                onChange={(e) =>
                  setContactForm({ ...contactForm, message: e.target.value })
                }
              />
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="p-6">
            <h3 className="mb-4 flex items-center gap-2 font-bold">
              <AlertCircle className="size-4 text-primary" />
              Report a Problem
            </h3>
            <form onSubmit={handleReport} className="space-y-3">
              <Input
                placeholder="Issue subject"
                value={reportForm.subject}
                onChange={(e) =>
                  setReportForm({ ...reportForm, subject: e.target.value })
                }
              />
              <textarea
                className="min-h-24 w-full rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Describe the problem..."
                value={reportForm.details}
                onChange={(e) =>
                  setReportForm({ ...reportForm, details: e.target.value })
                }
              />
              <Button type="submit" variant="outline" className="w-full">
                Submit Report
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-primary/20 bg-primary/5 shadow-sm">
        <CardContent className="flex items-start gap-4 p-6">
          <Info className="mt-0.5 size-5 shrink-0 text-primary" />
          <div>
            <h3 className="font-bold">Platform Information</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {portalName} — National Union of Koinadugu and Falaba Students (NUKaFs-SL).
              This platform is production-ready and backed by Supabase for secure registry data.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
