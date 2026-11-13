import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress"
import { formatMoney } from "@/lib/money"

const PAYMENTS = [
  {
    child: "Zuzanna Nowak",
    payer: "M. Nowak",
    date: "13.10.2026",
    amount: "45,00 zł",
    paid: true,
  },
  {
    child: "Maja Zielińska",
    payer: "A. Kowalska",
    date: "15.10.2026",
    amount: "45,00 zł",
    paid: true,
  },
  {
    child: "Oliwia Kamińska",
    payer: "—",
    date: "—",
    amount: "0,00 / 45,00 zł",
    paid: false,
  },
]

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-xl tabular-nums">{value}</span>
    </div>
  )
}

function LandingPreview() {
  return (
    <div aria-hidden className="rounded-xl bg-muted p-3 md:p-8">
      <Card className="mx-auto max-w-4xl">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">
              Wyjście do teatru – „Pinokio”
            </CardTitle>
            <Badge variant="success">Zbiórka aktywna</Badge>
          </div>
          <p className="text-sm text-muted-foreground">
            Klasa 3B · do 24 października · {formatMoney(45)} od dziecka
          </p>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Progress value={75}>
              <ProgressTrack className="h-2">
                <ProgressIndicator />
              </ProgressTrack>
            </Progress>
            <p className="text-sm text-muted-foreground">
              18 z 24 dzieci ma już opłaconą składkę
            </p>  
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Stat label="Wpłacono" value={formatMoney(810)} />
            <Stat label="Wypłacono" value={formatMoney(400)} />
            <Stat label="Saldo zbiórki" value={formatMoney(410)} />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Dziecko</th>
                  <th className="py-2 pr-4 font-medium">Płatnik</th>
                  <th className="py-2 pr-4 font-medium">Data</th>
                  <th className="py-2 pr-4 font-medium">Kwota</th>
                  <th className="py-2 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {PAYMENTS.map((payment) => (
                  <tr key={payment.child} className="border-b last:border-0">
                    <td className="py-3 pr-4 font-medium">{payment.child}</td>
                    <td className="py-3 pr-4">{payment.payer}</td>
                    <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                      {payment.date}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap tabular-nums">
                      {payment.amount}
                    </td>
                    <td className="py-3">
                      <Badge variant={payment.paid ? "success" : "warning"}>
                        {payment.paid ? "Opłacone" : "Oczekuje"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export { LandingPreview }
