import { HandCoins } from "lucide-react"
import { PageHeader } from "@/components/page-header"
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
  if (summary.isBlocked || summary.isClassBlocked) {
    return <Badge variant="danger">Zablokowana</Badge>
  }
  if (summary.status === "CLOSED") {
    return <Badge variant="neutral">Zamknięta</Badge>
  }
  if (summary.status === "CANCELLED") {
    return <Badge variant="neutral">Zamknięta ze zwrotem</Badge>
  }
  return <Badge variant="success">Trwa</Badge>
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
    <PageHeader
      backTo="/dashboard/fundraisers"
      backLabel="Zbiórki"
      leading={
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
      }
      title={summary.name}
      badge={<StatusBadge summary={summary} />}
      description={
        <>
          Klasa {summary.className} · wpłaty do{" "}
          {dateFormatter.format(new Date(summary.endDate))} ·{" "}
          {formatMoney(summary.amountPerChild)} od dziecka
        </>
      }
      actions={actions}
    >
      {summary.description !== "" ? (
        <p className="max-w-3xl text-sm">{summary.description}</p>
      ) : null}
    </PageHeader>
  )
}

export { FundraisingHeader }
