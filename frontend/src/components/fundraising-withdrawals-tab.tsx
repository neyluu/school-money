import * as React from "react"
import { HandCoins } from "lucide-react"
import { DataState } from "@/components/data-state"
import { EmptyState } from "@/components/empty-state"
import { MoneyAmount } from "@/components/money-amount"
import { useAsyncData } from "@/hooks/use-async-data"
import { getFundraisingWithdrawals } from "@/lib/fundraising"

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

function FundraisingWithdrawalsTab({ fundraisingId }: { fundraisingId: number }) {
  const load = React.useCallback(
    () => getFundraisingWithdrawals(fundraisingId),
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
          title="Brak wypłat"
          description="Wypłaty ze zbiórki pojawią się tutaj."
        />
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Opis wydatku</th>
              <th className="py-2 pr-4 font-medium">Data</th>
              <th className="py-2 text-right font-medium">Kwota</th>
            </tr>
          </thead>
          <tbody>
            {data?.map((withdrawal) => (
              <tr key={withdrawal.id} className="border-b last:border-0">
                <td className="py-3 pr-4">{withdrawal.title}</td>
                <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                  {dateFormatter.format(new Date(withdrawal.createdAt))}
                </td>
                <td className="py-3 text-right">
                  <MoneyAmount amount={-withdrawal.amount} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DataState>
  )
}

export { FundraisingWithdrawalsTab }
