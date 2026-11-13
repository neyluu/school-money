import { Link } from "react-router"
import { LandingContainer } from "@/components/landing/landing-container"
import { LandingHeading } from "@/components/landing/landing-heading"

const AUDIENCES = [
  {
    title: "Dla skarbnika",
    description:
      "Tworzysz klasę, zatwierdzasz zgłoszenia dzieci i zarządzasz zbiórkami. Masz dostęp do pełnej listy wpłat, możesz wypłacać środki na bieżące wydatki i dodawać dokumenty potwierdzające zakupy. Po zakończeniu zbiórki zamykasz ją i rozliczasz zgromadzone środki.",
    action: "Załóż konto skarbnika",
    to: "/register?role=treasurer"
  },
  {
    title: "Dla rodzica",
    description:
      "Dołączasz do klasy za pomocą kodu otrzymanego od skarbnika i korzystasz z wirtualnego rachunku do opłacania składek. Możesz zapłacić za swoje dziecko, pomóc w opłaceniu składki innego dziecka lub podzielić płatność na kilka części.",
    action: "Załóż konto rodzica",
    to: "/register?role=parent"
  },
]

function LandingAudience() {
  return (
    <section className="border-t">
      <LandingContainer className="flex flex-col gap-12 py-16 md:py-24">
        <LandingHeading title="Dla skarbnika i dla rodzica" />
        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          {AUDIENCES.map((audience) => (
            <div
              key={audience.title}
              className="flex flex-col gap-4 border-t pt-6"
            >
              <h3 className="font-serif text-2xl font-normal">
                {audience.title}
              </h3>
              <p className="text-muted-foreground">{audience.description}</p>
              <Link
                to={audience.to}
                className="w-fit text-primary underline-offset-4 hover:underline"
              >
                {audience.action}
              </Link>
            </div>
          ))}
        </div>
      </LandingContainer>
    </section>
  )
}

export { LandingAudience }
