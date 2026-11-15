import {
  Hourglass,
  TrendingDown,
  TrendingUp,
} from "lucide-react"
import { MoneyAmount } from "@/components/money-amount"
import { StatStrip } from "@/components/stat-strip"
import type { StatItem } from "@/components/stat-strip"

type Tone = "success" | "warning"

const TONE_CLASSES: Record<Tone, string> = {
  success: "text-success",
  warning: "text-warning",
}

function AmountWithIcon({
  tone,
  icon,
  amount,
}: {
  tone?: Tone
  icon?: React.ReactNode
  amount: number
}) {
  return (
    <span className="inline-flex items-center gap-2">
      {icon != null && tone != null ? (
        <span
          aria-hidden
          className={`flex shrink-0 items-center [&_svg]:size-4.25 ${TONE_CLASSES[tone]}`}
        >
          {icon}
        </span>
      ) : null}
      <MoneyAmount amount={amount} />
    </span>
  )
}

function KpiCards({
  balance,
  income,
  expense,
  unpaid,
}: {
  balance: number
  income: number
  expense: number
  days?: number
  unpaid?: number
}) {
  const net = Math.round((income - expense) * 100) / 100

  const items: StatItem[] = [
    {
      label: "Dostępne środki",
      value: <MoneyAmount amount={balance} />,
    },
  ]

  if (unpaid != null) {
    const hasUnpaid = unpaid > 0

    items.push({
      label: "Niezapłacone",
      value: (
        <AmountWithIcon
          tone={hasUnpaid ? "warning" : undefined}
          icon={hasUnpaid ? <Hourglass /> : undefined}
          amount={unpaid}
        />
      ),
    })
  }

  items.push(
    {
      label: "Wpływy",
      value: (
        <AmountWithIcon tone="success" icon={<TrendingUp />} amount={income} />
      ),
    },
    {
      label: "Wydatki",
      value: (
        <AmountWithIcon
          tone="warning"
          icon={<TrendingDown />}
          amount={expense}
        />
      ),
    },
    {
      label: "Bilans",
      value: <MoneyAmount amount={net} />,
    }
  )

  return <StatStrip items={items} />
}

export { KpiCards }
