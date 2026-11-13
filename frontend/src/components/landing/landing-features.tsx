import {
  ArrowDownLeft,
  ArrowUpRight,
  Check,
  FileImage,
  FileText,
  RefreshCcw,
} from "lucide-react"
import { LandingContainer } from "@/components/landing/landing-container"
import { LandingHeading } from "@/components/landing/landing-heading"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress"

function FeatureText({ children }: { children: React.ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

function PartialPaymentPreview() {
  return (
    <div aria-hidden className="flex flex-col gap-4 rounded-lg bg-muted p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Wpłacono</span>
          <span className="text-xl tabular-nums">25,00 zł</span>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-muted-foreground">Pozostało</span>
          <span className="text-xl tabular-nums">20,00 zł</span>
        </div>
      </div>
      <Progress value={55}>
        <ProgressTrack className="h-2">
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
      <dl className="flex flex-col text-sm">
        <div className="flex justify-between border-b py-2">
          <dt>J. Kamińska</dt>
          <dd className="tabular-nums">15,00 zł</dd>
        </div>
        <div className="flex justify-between py-2">
          <dt>A. Kowalska</dt>
          <dd className="tabular-nums">10,00 zł</dd>
        </div>
      </dl>
    </div>
  )
}

function HistoryPreview() {
  return (
    <div aria-hidden className="rounded-lg bg-muted p-4">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th className="py-2 pr-3 font-medium">Dziecko</th>
            <th className="py-2 pr-3 font-medium">Płatnik</th>
            <th className="py-2 font-medium">Data</th>
          </tr>
        </thead>
        <tbody>
          <tr className="border-b">
            <td className="py-2 pr-3">Maja Zielińska</td>
            <td className="py-2 pr-3">A. Kowalska</td>
            <td className="py-2 text-muted-foreground">15.10</td>
          </tr>
          <tr className="border-b">
            <td className="py-2 pr-3">Jan Nowak</td>
            <td className="py-2 pr-3">M. Nowak</td>
            <td className="py-2 text-muted-foreground">13.10</td>
          </tr>
          <tr>
            <td className="py-2 pr-3">Adam Kowalski</td>
            <td className="py-2 pr-3">M. Nowak</td>
            <td className="py-2 text-muted-foreground">17.10</td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

function DocumentsPreview() {
  const documents = [
    { name: "Faktura za bilety", format: "PDF", icon: FileText },
    { name: "Paragon za materiały", format: "JPG", icon: FileImage },
  ]

  return (
    <div aria-hidden className="flex flex-col gap-2 rounded-lg bg-muted p-3">
      {documents.map(({ name, format, icon: Icon }) => (
        <div
          key={name}
          className="flex items-center gap-3 rounded-md border bg-background p-3"
        >
          <Icon
            className="size-5 shrink-0 text-muted-foreground"
            strokeWidth={1.7}
          />
          <span className="min-w-0 flex-1 truncate text-sm font-medium">
            {name}
          </span>
          <span className="text-xs text-muted-foreground">{format}</span>
        </div>
      ))}
    </div>
  )
}

function PayoutPreview() {
  return (
    <div aria-hidden className="flex flex-col gap-3 rounded-lg bg-muted p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md border bg-background">
            <ArrowUpRight className="size-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Zaliczka na bilety</span>
            <span className="text-xs text-muted-foreground">
              Wyjście do teatru
            </span>
          </div>
        </div>
        <span className="text-sm font-medium tabular-nums">400,00 zł</span>
      </div>
      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-xs text-muted-foreground">Status wypłaty</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <Check className="size-3.5" />
          Zrealizowana
        </span>
      </div>
    </div>
  )
}

function RefundPreview() {
  return (
    <div aria-hidden className="flex flex-col gap-3 rounded-lg bg-muted p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-md border bg-background">
            <RefreshCcw className="size-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium">Zwrot składki</span>
            <span className="text-xs text-muted-foreground">
              Zamknięcie zbiórki
            </span>
          </div>
        </div>
        <span className="text-sm font-medium tabular-nums">45,00 zł</span>
      </div>
      <div className="flex items-center justify-between border-t pt-3">
        <span className="text-xs text-muted-foreground">Status zwrotu</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
          <ArrowDownLeft className="size-3.5" />
          Zwrócono
        </span>
      </div>
    </div>
  )
}

function LandingFeatures() {
  return (
    <section id="funkcje" className="scroll-mt-20 border-t bg-muted/40">
      <LandingContainer className="flex flex-col gap-12 py-16 md:py-24">
        <LandingHeading
          title="Wszystko, czego potrzeba do rozliczeń klasowych"
          description="Wpłaty, wydatki i dokumenty w jednym miejscu, dostępnym dla całej klasy."
        />

        <div className="grid items-stretch gap-4 md:grid-cols-6">
          <Card className="flex h-full flex-col md:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg">Wpłaty w częściach</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <FeatureText>
                Jedną składkę może opłacić kilku rodziców. System na bieżąco
                pokazuje, ile zostało już wpłacone i jaka kwota pozostała do zapłaty.
              </FeatureText>
              <div className="mt-auto pt-2">
                <PartialPaymentPreview />
              </div>
            </CardContent>
          </Card>

          <Card className="flex h-full flex-col md:col-span-3">
            <CardHeader>
              <CardTitle className="text-lg">Pełna historia wpłat</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <FeatureText>
                Każdy rodzic widzi, kto dokonał wpłaty, za które dziecko i kiedy.
                Nie trzeba już kontaktować się ze skarbnikiem, żeby potwierdzić,
                czy przelew dotarł.
              </FeatureText>
              <div className="mt-auto pt-2">
                <HistoryPreview />
              </div>
            </CardContent>
          </Card>

          <Card className="flex h-full flex-col md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Wypłaty w trakcie zbiórki</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <FeatureText>
                Nie trzeba czekać na zakończenie zbiórki, żeby skorzystać z zebranych
                środków. Skarbnik może wypłacić zaliczkę, a w razie potrzeby
                zwrócić ją na rachunek zbiórki.
              </FeatureText>
              <div className="mt-auto pt-2">
                <PayoutPreview />
              </div>
            </CardContent>
          </Card>

          <Card className="flex h-full flex-col md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Faktury i rachunki</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <FeatureText>
                Skarbnik dodaje faktury i rachunki dokumentujące wydatki.
                Każdy rodzic może je w dowolnym momencie wyświetlić lub pobrać.
              </FeatureText>
              <div className="mt-auto pt-2">
                <DocumentsPreview />
              </div>
            </CardContent>
          </Card>

          <Card className="flex h-full flex-col md:col-span-2">
            <CardHeader>
              <CardTitle className="text-lg">Automatyczne zwroty</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4">
              <FeatureText>
                Po zamknięciu zbiórki system zwraca wpłacone środki na konta osób,
                które dokonały płatności. Dotyczy to również sytuacji, w których
                za dziecko zapłacił inny rodzic.
              </FeatureText>
              <div className="mt-auto pt-2">
                <RefundPreview />
              </div>
            </CardContent>
          </Card>
        </div>
      </LandingContainer>
    </section>
  )
}

export { LandingFeatures }
