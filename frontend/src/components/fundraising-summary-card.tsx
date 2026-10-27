import { MoneyAmount } from "@/components/money-amount"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Progress,
  ProgressIndicator,
  ProgressOverlay,
  ProgressTrack,
} from "@/components/ui/progress"
import type { FundraisingSummary } from "@/lib/fundraising"

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
})

function StatusBadge({ summary }: { summary: FundraisingSummary }) {
  if (summary.isBlocked) {
    return <Badge variant="danger">Zablokowana</Badge>
  }
  if (summary.status === "CANCELLED") {
    return <Badge variant="neutral">Zamknięta</Badge>
  }
  return <Badge variant="success">Aktywna</Badge>
}

function Stat({ label, amount }: { label: string; amount: number }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <MoneyAmount amount={amount} className="text-xl" />
    </div>
  )
}

function FundraisingSummaryCard({
  summary,
  actions,
}: {
  summary: FundraisingSummary
  actions?: React.ReactNode
}) {
  const percent =
    summary.totalChildren > 0
      ? (summary.paidChildren / summary.totalChildren) * 100
      : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-xl">{summary.name}</CardTitle>
          <StatusBadge summary={summary} />
        </div>
        <p className="text-sm text-muted-foreground">
          Klasa {summary.className} · {dateFormatter.format(new Date(summary.startAt))} –{" "}
          {dateFormatter.format(new Date(summary.endAt))}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-sm">{summary.description}</p>
        {actions != null ? (
          <div className="flex flex-wrap gap-2">{actions}</div>
        ) : null}
        <Progress value={percent}>
          <ProgressTrack className="h-5">
            <ProgressIndicator />
            <ProgressOverlay>
              {summary.paidChildren}/{summary.totalChildren} opłaconych dzieci
            </ProgressOverlay>
          </ProgressTrack>
        </Progress>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Kwota na dziecko" amount={summary.amountPerChild} />
          <Stat label="Saldo zbiórki" amount={summary.walletBalance} />
          <Stat label="Zebrano" amount={summary.collectedAmount} />
          <Stat label="Wypłacono" amount={summary.withdrawnAmount} />
        </div>
      </CardContent>
    </Card>
  )
}

export { FundraisingSummaryCard }
