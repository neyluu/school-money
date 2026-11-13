import * as React from "react"
import { HandCoins } from "lucide-react"
import { DataState } from "@/components/data-state"
import { EmptyState } from "@/components/empty-state"
import { MoneyAmount } from "@/components/money-amount"
import { Badge } from "@/components/ui/badge"
import { useAsyncData } from "@/hooks/use-async-data"
import {
  getFundraisingReplenishments,
  getFundraisingWithdrawals,
} from "@/lib/fundraising"
import type { FundraisingTransfer } from "@/lib/fundraising"

const REPLENISHMENT_LABEL = "Zwrot środków na zbiórkę"

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function byNewest(a: FundraisingTransfer, b: FundraisingTransfer): number {
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

function FundraisingWithdrawalsTab({ fundraisingId }: { fundraisingId: number }) {
  const load = React.useCallback(
    async () => {
      const [withdrawals, replenishments] = await Promise.all([
        getFundraisingWithdrawals(fundraisingId),
        getFundraisingReplenishments(fundraisingId),
      ])
      return [...withdrawals, ...replenishments].sort(byNewest)
    },
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
          icon={<HandCoins />}
          title="Brak wypłat i zwrotów"
          description="Wypłaty ze zbiórki i zwroty wypłaconych środków pojawią się tutaj."
        />
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Opis</th>
              <th className="py-2 pr-4 font-medium">Data</th>
              <th className="py-2 text-right font-medium">Kwota</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((transfer) => {
              const isReplenishment = transfer.type === "REPLENISHMENT"
              return (
                <tr
                  key={`${transfer.type}-${transfer.id}`}
                  className="border-b last:border-0"
                >
                  <td className="py-3 pr-4">
                    {isReplenishment ? REPLENISHMENT_LABEL : transfer.title}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                    {dateFormatter.format(new Date(transfer.createdAt))}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {isReplenishment ? (
                        <Badge variant="success">Zwrot</Badge>
                      ) : null}
                      <MoneyAmount
                        amount={isReplenishment ? transfer.amount : -transfer.amount}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </DataState>
  )
}

export { FundraisingWithdrawalsTab }
