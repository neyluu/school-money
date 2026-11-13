import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "cn"
import { LandingContainer } from "@/components/landing/landing-container"
import { LandingHeading } from "@/components/landing/landing-heading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Step = {
  title: string
  description: string
  preview: {
    title: string
    rows: { label: string; value: string }[]
    note: string
  }
}

const STEPS: Step[] = [
  {
    title: "Skarbnik tworzy klasę",
    description:
      "Wystarczy podać nazwę szkoły i miejscowość. System wygeneruje kod dostępu, który skarbnik może przekazać rodzicom w wiadomości, na grupie klasowej lub podczas zebrania.",
    preview: {
      title: "Klasa 3B · SP nr 12",
      rows: [
        { label: "Kod dostępu", value: "K7P4X2QA" },
        { label: "Dzieci w klasie", value: "24" },
        { label: "Oczekujące zgłoszenia", value: "2" },
      ],
      note: "Kod dostępu można w każdej chwili wygenerować ponownie.",
    },
  },
  {
    title: "Rodzice dodają dzieci",
    description:
      "Rodzic wpisuje otrzymany kod i zgłasza dziecko do klasy. Skarbnik zatwierdza zgłoszenie, dzięki czemu do klasy dołączają wyłącznie właściwe osoby.",
    preview: {
      title: "Moje dzieci",
      rows: [
        { label: "Zuzanna Nowak", value: "Zaakceptowane" },
        { label: "Jan Nowak", value: "Zaakceptowane" },
        { label: "Lena Nowak", value: "Oczekuje" },
      ],
      note: "Rodzic może przypisać swoje dzieci do kilku klas.",
    },
  },
  {
    title: "Skarbnik tworzy zbiórkę",
    description:
      "Każde dziecko ma taką samą składkę, a zbiórka nie wymaga określania celu finansowego. Otrzymuje własny numer rachunku, a jej koszt można podzielić między kilku rodziców.",
    preview: {
      title: "Nowa zbiórka",
      rows: [
        { label: "Cel", value: "Wyjście do teatru" },
        { label: "Składka na dziecko", value: "45,00 zł" },
        { label: "Łączna kwota", value: "45,00 zł × 24" },
      ],
      note: "Osobny rachunek jest tworzony automatycznie przy zakładaniu zbiórki.",
    },
  },
  {
    title: "Wypłaty, dokumenty i rozliczenie",
    description:
      "Skarbnik może wypłacać środki w trakcie zbiórki, na przykład na zaliczkę za bilety, i dodawać dokumenty potwierdzające wydatki. Po zakończeniu zbiórki system zwraca niewykorzystane wpłaty rodzicom.",
    preview: {
      title: "Wypłaty i faktury",
      rows: [
        { label: "Zaliczka na bilety", value: "– 400,00 zł" },
        { label: "Faktura – bilety.pdf", value: "Widoczna dla wszystkich" },
        { label: "Zamknięcie zbiórki", value: "Zwrot na konta rodziców" },
      ],
      note: "Każdy rodzic ma dostęp do historii wydatków i dokumentów.",
    },
  },
]

function StepPreview({ step }: { step: Step }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{step.preview.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <dl className="flex flex-col">
          {step.preview.rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 border-b py-3 text-sm last:border-0"
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="text-right tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>
        <p className="text-sm text-muted-foreground">{step.preview.note}</p>
      </CardContent>
    </Card>
  )
}

function LandingSteps() {
  const [active, setActive] = React.useState(0)

  return (
    <section id="jak-to-dziala" className="scroll-mt-20">
      <LandingContainer className="flex flex-col gap-12 py-16 md:py-24">
        <LandingHeading
          title="Od założenia klasy do rozliczenia zbiórki"
          description="Cały proces w czterech prostych krokach."
        />

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start lg:gap-16">
          <ul className="flex flex-col">
            {STEPS.map((step, index) => {
              const isActive = index === active
              const panelId = `landing-step-${index}`

              return (
                <li key={step.title} className="border-b first:border-t">
                  <button
                    type="button"
                    aria-expanded={isActive}
                    aria-controls={panelId}
                    onClick={() => setActive(index)}
                    className={cn(
                      "flex w-full items-center justify-between gap-3 py-5 text-left text-xl font-medium outline-none transition-colors duration-200 focus-visible:ring-3 focus-visible:ring-ring/50",
                      isActive
                        ? "text-foreground"
                        : "cursor-pointer text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="w-6 shrink-0 text-sm tabular-nums text-foreground/40">
                        {index + 1}.
                      </span>
                      <span>{step.title}</span>
                    </span>

                    <ChevronDown
                      aria-hidden
                      className={cn(
                        "size-5 shrink-0 text-muted-foreground transition-transform duration-250",
                        isActive && "rotate-180"
                      )}
                    />
                  </button>

                  <div
                    id={panelId}
                    inert={!isActive}
                    aria-hidden={!isActive}
                    className={cn(
                      "accordion-content",
                      isActive && "accordion-content-open"
                    )}
                  >
                    <div className="flex min-h-0 flex-col gap-6 overflow-hidden pb-6 pl-10">
                      <p className="text-muted-foreground">
                        {step.description}
                      </p>

                      <div className="lg:hidden">
                        <StepPreview step={step} />
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>

          <div className="hidden lg:block" aria-hidden>
            <StepPreview step={STEPS[active]} />
          </div>
        </div>
      </LandingContainer>
    </section>
  )
}

export { LandingSteps }
