import { Link } from "react-router"
import { LandingContainer } from "@/components/landing/landing-container"
import { LandingPreview } from "@/components/landing/landing-preview"
import { Button } from "@/components/ui/button"

function LandingHero() {
  return (
    <section>
      <LandingContainer className="flex flex-col gap-12 pt-12 pb-16 md:pt-20 md:pb-24">
        <div className="flex max-w-3xl flex-col gap-6">
          <h1 className="font-serif text-4xl leading-tight font-normal md:text-6xl">
            Zbiórki klasowe, w których wszystko jest jasne.
          </h1>

          <p className="max-w-2xl text-lg text-muted-foreground">
            Skarbnik tworzy zbiórkę, rodzice wpłacają pieniądze, a każdy może
            sprawdzić historię wpłat i zobaczyć dodane faktury. Wszystko w jednym
            miejscu, bez kopert, arkuszy i ciągłego sprawdzania, kto już zapłacił.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button
              size="lg"
              render={<Link to="/register" />}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Zacznij korzystać
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<a href="#jak-to-dziala" />}
            >
              Zobacz, jak to działa
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Założenie konta zajmuje tylko kilka minut. Masz już konto?{" "}
            <Link
              to="/login"
              className="text-primary underline-offset-4 hover:underline"
            >
              Zaloguj się
            </Link>
          </p>
        </div>
        <LandingPreview />
      </LandingContainer>
    </section>
  )
}

export { LandingHero }
