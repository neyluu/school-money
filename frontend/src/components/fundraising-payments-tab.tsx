import * as React from "react"
import { ReceiptText } from "lucide-react"
import { DataState } from "@/components/data-state"
import { EmptyState } from "@/components/empty-state"
import { MoneyAmount } from "@/components/money-amount"
import { Badge } from "@/components/ui/badge"
import { useAsyncData } from "@/hooks/use-async-data"
import { getFundraisingContributions } from "@/lib/fundraising"
import type { FundraisingChild } from "@/lib/fundraising"
import { formatMoney } from "@/lib/money"

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function FundraisingPaymentsTab({
  fundraisingId,
  amountPerChild,
  waitingStudents,
}: {
  fundraisingId: number
  amountPerChild: number
  waitingStudents: FundraisingChild[]
}) {
  const load = React.useCallback(
    () => getFundraisingContributions(fundraisingId),
    [fundraisingId]
  )
  const { data, error, isLoading, reload } = useAsyncData(load)

  return (
    <DataState
      isLoading={isLoading}
      hasError={error != null}
      isEmpty={data != null && data.length === 0 && waitingStudents.length === 0}
      onRetry={reload}
      emptyState={
        <EmptyState
          icon={<ReceiptText />}
          title="Brak wpłat"
          description="Wpłaty rodziców pojawią się tutaj."
        />
      }
    >
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
            {data?.map((contribution) => (
              <tr key={`contribution-${contribution.id}`} className="border-b last:border-0">
                <td className="py-3 pr-4 font-medium">
                  {contribution.child.firstName} {contribution.child.lastName}
                </td>
                <td className="py-3 pr-4">
                  {contribution.payer.firstName} {contribution.payer.lastName}
                </td>
                <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                  {dateFormatter.format(new Date(contribution.createdAt))}
                </td>
                <td className="py-3 pr-4">
                  <MoneyAmount amount={contribution.amount} />
                </td>
                <td className="py-3">
                  <Badge variant={contribution.refunded ? "neutral" : "success"}>
                    {contribution.refunded ? "Zwrócona" : "Zaksięgowana"}
                  </Badge>
                </td>
              </tr>
            ))}
            {waitingStudents.map((student) => (
              <tr key={`waiting-${student.id}`} className="border-b last:border-0">
                <td className="py-3 pr-4 font-medium">
                  {student.firstName} {student.lastName}
                </td>
                <td className="py-3 pr-4 text-muted-foreground">—</td>
                <td className="py-3 pr-4 text-muted-foreground">—</td>
                <td className="py-3 pr-4 whitespace-nowrap tabular-nums">
                  {formatMoney(student.paidAmount)} / {formatMoney(amountPerChild)}
                </td>
                <td className="py-3">
                  <Badge variant="warning">Czeka</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DataState>
  )
}

export { FundraisingPaymentsTab }
