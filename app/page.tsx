import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"
import {
  About,
  Benefits,
  Contact,
  CtaBand,
  Faqs,
  Features,
  Hero,
  StatsBar,
  Testimonials,
} from "@/components/marketing/landing-sections"

export default function HomePage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <StatsBar />
        <About />
        <Features />
        <Benefits />
        <Testimonials />
        <Faqs />
        <Contact />
        <CtaBand />
      </main>
      <SiteFooter />
    </div>
  )
}
