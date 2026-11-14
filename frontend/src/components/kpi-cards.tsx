import {
  CircleAlert,
  CircleCheck,
  Hourglass,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { MoneyAmount } from "@/components/money-amount"
import { StatStrip } from "@/components/stat-strip"
import type { StatItem } from "@/components/stat-strip"

type Tone = "success" | "warning" | "danger"

const TONE_CLASSES: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
}

function Hint({
  tone,
  icon,
  children,
}: {
  tone: Tone
  icon: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span aria-hidden className={`[&_svg]:size-3.5 ${TONE_CLASSES[tone]}`}>
        {icon}
      </span>
      {children}
    </span>
  )
}

function KpiCards({
  balance,
  income,
  expense,
  days,
  unpaid,
}: {
  balance: number
  income: number
  expense: number
  days: number
  unpaid?: number
}) {
  const net = Math.round((income - expense) * 100) / 100
  const period = `Ostatnie ${days} dni`

  const items: StatItem[] = [
    {
      label: "Dostępne środki",
      value: <MoneyAmount amount={balance} />,
      hint: (
        <Hint
          tone={balance > 0 ? "success" : "warning"}
          icon={balance > 0 ? <CircleCheck /> : <CircleAlert />}
        >
          Na Twoim rachunku
        </Hint>
      ),
    },
  ]

  if (unpaid != null) {
    items.push({
      label: "Niezapłacone",
      value: <MoneyAmount amount={unpaid} />,
      hint: (
        <Hint
          tone={unpaid > 0 ? "warning" : "success"}
          icon={unpaid > 0 ? <Hourglass /> : <CircleCheck />}
        >
          Jeszcze do wpłacenia
        </Hint>
      ),
    })
  }

  items.push(
    {
      label: "Wpływy",
      value: <MoneyAmount amount={income} />,
      hint: (
        <Hint tone="success" icon={<TrendingUp />}>
          {period}
        </Hint>
      ),
    },
    {
      label: "Wydatki",
      value: <MoneyAmount amount={expense} />,
      hint: (
        <Hint tone="warning" icon={<TrendingDown />}>
          {period}
        </Hint>
      ),
    },
    {
      label: "Bilans",
      value: <MoneyAmount amount={net} />,
      hint: (
        <Hint
          tone={net >= 0 ? "success" : "danger"}
          icon={net >= 0 ? <TrendingUp /> : <TrendingDown />}
        >
          {net >= 0 ? "Na plusie" : "Na minusie"}
        </Hint>
      ),
    }
  )

  return <StatStrip items={items} />
}

export { KpiCards }
