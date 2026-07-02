import Image from "next/image"
import Link from "next/link"
import {
  Award,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  GraduationCap,
  IdCard,
  LineChart,
  Quote,
  ShieldCheck,
  Sparkles,
  Star,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
// Use a small static marketing FAQ/testimonial set instead of demo mock-data
const faqs = [
  { question: "What is NUKaFs Registry?", answer: "A verified registry for students from Koinadugu & Falaba districts." },
  { question: "Who can join?", answer: "Any student originally from Koinadugu or Falaba studying at a recognised institution." },
]

const testimonials = [
  { name: "Aminata K.", role: "Member", quote: "The registry connected me to scholarship opportunities." },
]

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-8 lg:py-24">
        <div className="flex flex-col gap-6">
          <Badge variant="secondary" className="w-fit gap-1.5 py-1">
            <Sparkles className="size-3.5" />
            Koinadugu &amp; Falaba Students&apos; Union
          </Badge>
          <h1 className="font-heading text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            One registry for every student of <span className="text-primary">Koinadugu &amp; Falaba</span>
          </h1>
          <p className="max-w-lg text-lg leading-relaxed text-muted-foreground text-pretty">
            Register once, get verified, and unlock scholarships, internships, a digital membership card and a
            community that backs your future.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button size="lg" nativeButton={false} render={<Link href="/register">Become a member</Link>} />
            <Button size="lg" variant="outline" nativeButton={false} render={<a href="#features">Explore features</a>} />
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4 text-primary" /> Free to join
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="size-4 text-primary" /> Verified membership
            </span>
            <span className="flex items-center gap-1.5">
              <Award className="size-4 text-primary" /> Trusted by partners
            </span>
          </div>
        </div>
        <div className="relative">
          <div className="relative overflow-hidden rounded-2xl border shadow-xl">
            <Image
              src="/hero-students.jpeg"
              alt="University students from Koinadugu and Falaba"
              width={720}
              height={560}
              priority
              className="h-full w-full object-cover"
            />
          </div>
          <Card className="absolute -bottom-5 -left-4 w-48 shadow-lg sm:-left-6">
            <CardContent className="flex items-center gap-3 p-3">
              <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Users className="size-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading text-lg font-bold leading-none">2,480+</span>
                <span className="text-xs text-muted-foreground">Registered members</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

export function StatsBar() {
  const items = [
    { value: "2,480+", label: "Members" },
    { value: "7", label: "Universities" },
    { value: "64", label: "Scholarships awarded" },
    { value: "12", label: "Chiefdoms reached" },
  ]
  return (
    <section className="border-y bg-card">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
        {items.map((item) => (
          <div key={item.label} className="flex flex-col items-center text-center">
            <span className="font-heading text-3xl font-bold tracking-tight text-primary sm:text-4xl">{item.value}</span>
            <span className="mt-1 text-sm text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

export function About() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-5">
          <Badge variant="secondary" className="w-fit">
            About NUKaFs Registry
          </Badge>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            A trusted home for students from two districts, one union
          </h2>
          <p className="leading-relaxed text-muted-foreground text-pretty">
            The NUKaFs Registry is the official information system of the Koinadugu &amp; Falaba Students&apos; Union. We
            bring together students from across every university in Sierra Leone who hail from our two home districts —
            so we can track our growth, celebrate our achievements, and connect every member to opportunity.
          </p>
          <ul className="flex flex-col gap-3">
            {[
              "A single verified record of every member",
              "Direct access to scholarships, internships and jobs",
              "Leadership pathways and mentorship programmes",
              "Data that helps our executives serve members better",
            ].map((point) => (
              <li key={point} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-primary" />
                <span className="text-sm leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            { icon: Users, title: "Community", text: "Belong to a verified network of peers and alumni." },
            { icon: GraduationCap, title: "Academic", text: "Support across all programmes and levels." },
            { icon: Award, title: "Opportunity", text: "Curated scholarships and career openings." },
            { icon: LineChart, title: "Transparency", text: "Clear analytics on union membership." },
          ].map((card) => (
            <Card key={card.title} className="h-full">
              <CardContent className="flex flex-col gap-2 p-5">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <card.icon className="size-5" />
                </div>
                <h3 className="font-heading font-semibold">{card.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{card.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

const FEATURES = [
  { icon: IdCard, title: "Verified registration", text: "Every member is approved by the Executive Council, keeping the registry authentic and trustworthy." },
  { icon: CreditCard, title: "Digital membership card", text: "A professional QR-enabled card that proves your membership anywhere, anytime." },
  { icon: Award, title: "Scholarships board", text: "Discover and apply for scholarships matched to your district, course and level." },
  { icon: Briefcase, title: "Internships & jobs", text: "Browse opportunities from partner organisations and government ministries." },
  { icon: LineChart, title: "Live analytics", text: "Executives and stakeholders see member distribution, skills and employment trends." },
  { icon: CalendarDays, title: "Events & meetings", text: "Stay on top of AGMs, fairs and bootcamps with simple event registration." },
]

export function Features() {
  return (
    <section id="features" className="border-y bg-card">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge variant="secondary">Features</Badge>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Everything the union needs, in one place
          </h2>
          <p className="leading-relaxed text-muted-foreground text-pretty">
            From your first registration to your digital ID and every opportunity in between — built for students and
            the executives who serve them.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="h-full transition-shadow hover:shadow-md">
              <CardContent className="flex flex-col gap-3 p-6">
                <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <feature.icon className="size-5" />
                </div>
                <h3 className="font-heading text-lg font-semibold">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{feature.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Benefits() {
  const benefits = [
    { title: "Scholarships", text: "Full-tuition and need-based scholarships from universities and partners." },
    { title: "Internships", text: "Paid and structured internships in tech, health, agriculture and more." },
    { title: "Jobs", text: "Entry-level roles posted by ministries and reputable employers." },
    { title: "Leadership", text: "Coordinator and volunteer roles to grow your influence and CV." },
  ]
  return (
    <section id="benefits" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div className="flex flex-col gap-5">
          <Badge variant="secondary" className="w-fit">
            Why register
          </Badge>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Membership that opens doors
          </h2>
          <p className="leading-relaxed text-muted-foreground text-pretty">
            Your verified membership is the key to a board of curated opportunities — reviewed and shared by the union
            so you never miss what matters.
          </p>
          <Button size="lg" className="w-fit" nativeButton={false} render={<Link href="/register">Start your registration</Link>} />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {benefits.map((b) => (
            <Card key={b.title} className="h-full border-l-4 border-l-primary">
              <CardContent className="flex flex-col gap-1.5 p-5">
                <h3 className="font-heading font-semibold">{b.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{b.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Testimonials() {
  return (
    <section className="border-y bg-card">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <Badge variant="secondary">Member stories</Badge>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Loved by students across the union
          </h2>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t) => (
            <Card key={t.name} className="h-full">
              <CardContent className="flex h-full flex-col gap-4 p-6">
                <Quote className="size-7 text-primary/40" />
                <p className="flex-1 text-sm leading-relaxed text-pretty">{t.quote}</p>
                <div className="flex items-center gap-1 text-chart-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="size-4 fill-current" />
                  ))}
                </div>
                <div className="flex items-center gap-3 border-t pt-4">
                  <Avatar className="size-10">
                    <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{t.name}</span>
                    <span className="text-xs text-muted-foreground">{t.role}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export function Faqs() {
  return (
    <section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center gap-4 text-center">
        <Badge variant="secondary">FAQ</Badge>
        <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Frequently asked questions
        </h2>
      </div>
      <Accordion className="mt-10 w-full">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`item-${i}`}>
            <AccordionTrigger className="text-left font-medium">{faq.question}</AccordionTrigger>
            <AccordionContent className="leading-relaxed text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}

export function Contact() {
  return (
    <section id="contact" className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="flex flex-col gap-5">
          <Badge variant="secondary" className="w-fit">
            Contact
          </Badge>
          <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Get in touch with the Registry Office
          </h2>
          <p className="leading-relaxed text-muted-foreground text-pretty">
            Questions about membership, approvals or opportunities? Send us a message and an executive will respond.
          </p>
          <div className="flex flex-col gap-3 text-sm">
            <p><span className="font-medium">Email:</span> registry@NUKaFs.org</p>
            <p><span className="font-medium">Phone:</span> +232 76 000 000</p>
            <p><span className="font-medium">Office:</span> Kabala, Koinadugu District, Sierra Leone</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="contact-name">Full name</FieldLabel>
                <Input id="contact-name" placeholder="Your name" />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact-email">Email</FieldLabel>
                <Input id="contact-email" type="email" placeholder="you@example.com" />
              </Field>
              <Field>
                <FieldLabel htmlFor="contact-message">Message</FieldLabel>
                <Textarea id="contact-message" rows={4} placeholder="How can we help?" />
              </Field>
              <Button>Send message</Button>
            </FieldGroup>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}

export function CtaBand() {
  return (
    <section className="bg-primary text-primary-foreground">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-16 text-center sm:px-6 lg:px-8">
        <h2 className="font-heading text-3xl font-bold tracking-tight text-balance sm:text-4xl">
          Ready to join the union?
        </h2>
        <p className="max-w-xl leading-relaxed text-primary-foreground/80 text-pretty">
          Create your account today and become part of the most connected student community in Koinadugu &amp; Falaba.
        </p>
        <Button size="lg" variant="secondary" nativeButton={false} render={<Link href="/register">Register now</Link>} />
      </div>
    </section>
  )
}
