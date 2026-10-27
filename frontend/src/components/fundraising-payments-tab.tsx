import * as React from "react"
import { ReceiptText } from "lucide-react"
import { DataState } from "@/components/data-state"
import { EmptyState } from "@/components/empty-state"
import { MoneyAmount } from "@/components/money-amount"
import { Badge } from "@/components/ui/badge"
import { useAsyncData } from "@/hooks/use-async-data"
import { getFundraisingContributions } from "@/lib/fundraising"

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function FundraisingPaymentsTab({ fundraisingId }: { fundraisingId: number }) {
  const load = React.useCallback(
    () => getFundraisingContributions(fundraisingId),
    [fundraisingId]
  )
  const { data, error, isLoading, reload } = useAsyncData(load)

  return (
    <DataState
      isLoading={isLoading}
      hasError={error != null}
      isEmpty={data != null && data.length === 0}
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
              <th className="py-2 pr-4 font-medium">Płacący</th>
              <th className="py-2 pr-4 font-medium">Za ucznia</th>
              <th className="py-2 pr-4 font-medium">Data</th>
              <th className="py-2 text-right font-medium">Kwota</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((contribution) => (
              <tr key={contribution.id} className="border-b last:border-0">
                <td className="py-3 pr-4">
                  {contribution.payer.firstName} {contribution.payer.lastName}
                </td>
                <td className="py-3 pr-4">
                  {contribution.child.firstName} {contribution.child.lastName}
                </td>
                <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                  {dateFormatter.format(new Date(contribution.createdAt))}
                </td>
                <td className="py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {contribution.refunded ? (
                      <Badge variant="neutral">Zwrócona</Badge>
                    ) : null}
                    <MoneyAmount amount={contribution.amount} />
                  </div>
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
