import {
  CircleAlert,
  CircleCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { MoneyAmount } from "@/components/money-amount"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

type Tone = "success" | "warning" | "danger"

const TONE_CLASSES: Record<Tone, string> = {
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  danger: "bg-danger/10 text-danger",
}

function KpiCard({
  label,
  amount,
  hint,
  tone,
  indicator,
}: {
  label: string
  amount: number
  hint: string
  tone: Tone
  indicator: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm text-muted-foreground">
            {label}
          </CardTitle>
          <span
            aria-hidden
            className={`flex size-8 items-center justify-center rounded-full [&_svg]:size-4 ${TONE_CLASSES[tone]}`}
          >
            {indicator}
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-1">
        <MoneyAmount amount={amount} className="text-2xl" />
        <span className="text-xs text-muted-foreground">{hint}</span>
      </CardContent>
    </Card>
  )
}

function KpiCards({
  balance,
  income,
  expense,
  days,
}: {
  balance: number
  income: number
  expense: number
  days: number
}) {
  const net = Math.round((income - expense) * 100) / 100
  const period = `Ostatnie ${days} dni`

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <KpiCard
        label="Dostępne środki"
        amount={balance}
        hint="Na Twoim rachunku"
        tone={balance > 0 ? "success" : "warning"}
        indicator={balance > 0 ? <CircleCheck /> : <CircleAlert />}
      />
      <KpiCard
        label="Wpływy"
        amount={income}
        hint={period}
        tone="success"
        indicator={<TrendingUp />}
      />
      <KpiCard
        label="Wydatki"
        amount={expense}
        hint={period}
        tone="warning"
        indicator={<TrendingDown />}
      />
      <KpiCard
        label="Bilans"
        amount={net}
        hint={period}
        tone={net >= 0 ? "success" : "danger"}
        indicator={net >= 0 ? <TrendingUp /> : <TrendingDown />}
      />
    </div>
  )
}

export { KpiCards }
