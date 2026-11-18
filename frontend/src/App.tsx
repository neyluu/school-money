import * as React from "react"
import { LandingAudience } from "@/components/landing/landing-audience"
import { LandingCta } from "@/components/landing/landing-cta"
import { LandingFaq } from "@/components/landing/landing-faq"
import { LandingFacts } from "@/components/landing/landing-facts"
import { LandingFeatures } from "@/components/landing/landing-features"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"
import { LandingHero } from "@/components/landing/landing-hero"
import { LandingSteps } from "@/components/landing/landing-steps"

const SMOOTH_SCROLL_CLASS = "motion-safe:scroll-smooth"

function App() {
  React.useEffect(() => {
    document.documentElement.classList.add(SMOOTH_SCROLL_CLASS)
    return () => document.documentElement.classList.remove(SMOOTH_SCROLL_CLASS)
  }, [])

  return (
    <div className="flex min-h-dvh w-full flex-col bg-background">
      <LandingHeader />
      <main className="flex-1">
        <LandingHero />
        <LandingFacts />
        <LandingSteps />
        <LandingFeatures />
        <LandingAudience />
        <LandingFaq />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  )
}

export default App
