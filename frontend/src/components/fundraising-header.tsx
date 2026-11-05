import { HandCoins } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useFundraisingLogo } from "@/hooks/use-fundraising-logo"
import { formatMoney } from "@/lib/money"
import type { FundraisingSummary } from "@/lib/fundraising"

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

function StatusBadge({ summary }: { summary: FundraisingSummary }) {
  if (summary.isBlocked) {
    return <Badge variant="danger">Zablokowana</Badge>
  }
  if (summary.status === "CLOSED") {
    return <Badge variant="neutral">Zamknięta</Badge>
  }
  if (summary.status === "CANCELLED") {
    return <Badge variant="neutral">Zamknięta ze zwrotem</Badge>
  }
  return <Badge variant="success">Aktywna</Badge>
}

function FundraisingHeader({
  summary,
  actions,
}: {
  summary: FundraisingSummary
  actions?: React.ReactNode
}) {
  const logoUrl = useFundraisingLogo(summary.id)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary [&_svg]:size-6"
          >
            {logoUrl != null ? (
              <img src={logoUrl} alt="" className="size-full object-cover" />
            ) : (
              <HandCoins />
            )}
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-2xl font-bold">{summary.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <StatusBadge summary={summary} />
              <span>
                do {dateFormatter.format(new Date(summary.endDate))} ·{" "}
                {formatMoney(summary.amountPerChild)} od dziecka · Klasa{" "}
                {summary.className}
              </span>
            </div>
          </div>
        </div>
        {actions != null ? (
          <div className="flex flex-wrap gap-2">{actions}</div>
        ) : null}
      </div>
      {summary.description !== "" ? (
        <p className="text-sm">{summary.description}</p>
      ) : null}
    </div>
  )
}

export { FundraisingHeader }
