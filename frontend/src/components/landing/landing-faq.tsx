import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "cn"
import { LandingContainer } from "@/components/landing/landing-container"
import { LandingHeading } from "@/components/landing/landing-heading"

const QUESTIONS = [
  {
    question: "Czy SchoolMoney obsługuje prawdziwe pieniądze?",
    answer:
      "Nie. SchoolMoney korzysta z wirtualnych środków. Doładowania i przelewy na rachunki zewnętrzne są symulowane. Możesz jednak korzystać z sald, wpłat, wypłat i zwrotów tak, jak w systemie obsługującym rzeczywiste płatności.",
  },
  {
    question: "Kto może tworzyć zbiórki?",
    answer:
      "Zbiórki może tworzyć skarbnik, czyli osoba zarządzająca daną klasą. Rodzice mają dostęp do zbiórek swojej klasy i mogą dokonywać wpłat.",
  },
  {
    question: "Czy mogę opłacić składkę za inne dziecko?",
    answer:
      "Tak. Możesz dokonać wpłaty za dowolne dziecko zaakceptowane w klasie. Możesz pokryć całą składkę lub tylko jej część. Pozostałą kwotę może dopłacić inny rodzic.",
  },
  {
    question: "Co się dzieje, jeśli skarbnik wcześniej wypłacił część środków?",
    answer:
      "Aby zamknąć zbiórkę i zwrócić wpłaty, wszystkie środki muszą znajdować się ponownie na jej rachunku. Skarbnik musi więc najpierw uzupełnić wypłaconą kwotę. Następnie system zwraca pieniądze osobom, które dokonały wpłat.",
  },
  {
    question: "Kto ma dostęp do faktur i rachunków?",
    answer:
      "Dostęp do dokumentów mają skarbnik oraz rodzice, których dzieci zostały zaakceptowane w klasie. Osoby spoza klasy nie mogą ich przeglądać.",
  },
]

function LandingFaq() {
  const [active, setActive] = React.useState<number | null>(null)

  return (
    <section id="pytania" className="scroll-mt-20 border-t">
      <LandingContainer className="grid gap-10 py-16 md:py-24 lg:grid-cols-[1fr_2fr] lg:gap-16">
        <LandingHeading title="Najczęstsze pytania" />

        <div className="flex flex-col">
          {QUESTIONS.map((item, index) => {
            const isActive = active === index
            const panelId = `landing-faq-${index}`

            return (
              <div
                key={item.question}
                className="border-b first:border-t"
              >
                <button
                  type="button"
                  aria-expanded={isActive}
                  aria-controls={panelId}
                  onClick={() =>
                    setActive(isActive ? null : index)
                  }
                  className={cn(
                    "flex w-full items-center justify-between gap-4 py-5 text-left text-lg font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    isActive
                      ? "text-foreground"
                      : "cursor-pointer text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span>{item.question}</span>

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
                  <div className="min-h-0 overflow-hidden">
                    <p className="pb-5 text-muted-foreground">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </LandingContainer>
    </section>
  )
}

export { LandingFaq }
