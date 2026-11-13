import {
  ReceiptText,
  RefreshCcw,
  Users,
  Wallet,
} from "lucide-react"
import { LandingContainer } from "@/components/landing/landing-container"

const FACTS = [
  {
    label: "Jednakowa składka dla każdego dziecka",
    icon: Users,
  },
  {
    label: "Osobny rachunek dla każdej zbiórki",
    icon: Wallet,
  },
  {
    label: "Pełna historia wpłat i dostęp do faktur",
    icon: ReceiptText,
  },
  {
    label: "Automatyczny zwrot wpłat po zamknięciu zbiórki",
    icon: RefreshCcw,
  },
]

function LandingFacts() {
  return (
    <section className="border-y">
      <LandingContainer>
        <ul className="grid grid-cols-2 lg:grid-cols-4">
          {FACTS.map(({ label, icon: Icon }, _) => (
            <li
              key={label}
              className="flex flex-col items-center justify-center gap-3 px-4 py-8 text-center sm:px-6 md:py-10 lg:border-r lg:last:border-r-0"
            >
              <Icon
                aria-hidden="true"
                className="size-6 text-muted-foreground"
                strokeWidth={1.6}
              />
              <span className="max-w-52 text-sm leading-relaxed text-muted-foreground">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </LandingContainer>
    </section>
  )
}

export { LandingFacts }
