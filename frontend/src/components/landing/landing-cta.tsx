import { Link } from "react-router"
import { LandingContainer } from "@/components/landing/landing-container"
import { Button } from "@/components/ui/button"

function LandingCta() {
  return (
    <section className="pb-16 md:pb-24">
      <LandingContainer>
        <div className="flex flex-col gap-8 rounded-2xl bg-[#0F1115] p-8 md:flex-row md:items-end md:justify-between md:p-12">
          <div className="flex max-w-xl flex-col gap-3">
            <h2 className="font-serif text-3xl leading-tight font-normal text-white md:text-4xl">
              Zacznij zarządzać zbiórkami w swojej klasie.
            </h2>

            <p className="text-neutral-400">
              Założenie konta, utworzenie klasy i pierwszej zbiórki zajmuje
              tylko kilka minut. Reszta jest już po stronie rodziców.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              render={<Link to="/register" />}
              className="bg-white text-neutral-900 hover:bg-neutral-200"
            >
              Zacznij korzystać
            </Button>
            <Button
              size="lg"
              variant="ghost"
              render={<Link to="/login" />}
              className="text-white hover:bg-white/10 hover:text-white border-1 border-white/20"
            >
              Zaloguj się
            </Button>
          </div>
        </div>
      </LandingContainer>
    </section>
  )
}

export { LandingCta }
