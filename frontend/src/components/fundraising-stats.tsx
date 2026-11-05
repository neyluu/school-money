import { MoneyAmount } from "@/components/money-amount"
import { Card, CardContent } from "@/components/ui/card"
import type { FundraisingSummary } from "@/lib/fundraising"

function StatCard({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1">
        <span className="text-sm text-muted-foreground">{label}</span>
        {children}
      </CardContent>
    </Card>
  )
}

function FundraisingStats({ summary }: { summary: FundraisingSummary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Opłaciło">
        <span className="text-3xl font-bold tabular-nums">
          {summary.paidChildren} / {summary.totalChildren}
        </span>
      </StatCard>
      <StatCard label="Wpłacono">
        <MoneyAmount amount={summary.collectedAmount} className="text-3xl" />
      </StatCard>
      <StatCard label="Wypłacono">
        <MoneyAmount amount={summary.withdrawnAmount} className="text-3xl" />
      </StatCard>
      <StatCard label="Saldo zbiórki">
        <MoneyAmount amount={summary.walletBalance} className="text-3xl" />
      </StatCard>
    </div>
  )
}

export { FundraisingStats }
