import { MoneyAmount } from "@/components/money-amount"
import { StatStrip } from "@/components/stat-strip"
import type { FundraisingSummary } from "@/lib/fundraising"

function FundraisingStats({ summary }: { summary: FundraisingSummary }) {
  return (
    <StatStrip
      items={[
        {
          label: "Opłaciło",
          value: (
            <span className="tabular-nums">
              {summary.paidChildren} z {summary.totalChildren}
            </span>
          ),
          hint: "dzieci",
        },
        {
          label: "Wpłacono",
          value: <MoneyAmount amount={summary.collectedAmount} />,
        },
        {
          label: "Wypłacono",
          value: <MoneyAmount amount={summary.withdrawnAmount} />,
          hint: "po uwzględnieniu zwrotów",
        },
        {
          label: "Saldo zbiórki",
          value: <MoneyAmount amount={summary.walletBalance} />,
        },
      ]}
    />
  )
}

export { FundraisingStats }
