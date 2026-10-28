import * as React from "react"
import { ReceiptText } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { MoneyAmount } from "@/components/money-amount"
import { SegmentedControl } from "@/components/segmented-control"
import type { SegmentedOption } from "@/components/segmented-control"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { matchesFilter } from "@/lib/transaction-filters"
import type { TransactionFilter } from "@/lib/transaction-filters"
import type { Transaction, TransactionStatus } from "@/lib/wallet"

const MAX_ROWS = 10

const FILTER_OPTIONS: SegmentedOption<TransactionFilter>[] = [
  { value: "all", label: "Wszystkie" },
  { value: "income", label: "Wpływy" },
  { value: "outcome", label: "Wydatki" },
  { value: "refunds", label: "Zwroty" },
]

const STATUS_BADGES: Record<
  TransactionStatus,
  { variant: "success" | "warning" | "danger"; label: string }
> = {
  COMPLETED: { variant: "success", label: "Zakończona" },
  PENDING: { variant: "warning", label: "Oczekuje" },
  FAILED: { variant: "danger", label: "Odrzucona" },
}

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
})

function RecentTransactions({
  transactions,
}: {
  transactions: Transaction[]
}) {
  const [filter, setFilter] = React.useState<TransactionFilter>("all")

  const visible = transactions
    .filter((transaction) => matchesFilter(transaction, filter))
    .slice(0, MAX_ROWS)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ostatnie transakcje</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <SegmentedControl<TransactionFilter>
          aria-label="Filtr transakcji"
          options={FILTER_OPTIONS}
          value={filter}
          onChange={setFilter}
        />
        {visible.length === 0 ? (
          <EmptyState
            icon={<ReceiptText />}
            title="Brak transakcji"
            description="Nie ma jeszcze transakcji pasujących do tego filtra."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Tytuł</th>
                  <th className="py-2 pr-4 font-medium">Data</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 text-right font-medium">Kwota</th>
                </tr>
              </thead>
              <tbody>
                {visible.map((transaction) => {
                  const status = STATUS_BADGES[transaction.status]
                  return (
                    <tr key={transaction.id} className="border-b last:border-0">
                      <td className="max-w-56 truncate py-3 pr-4">
                        {transaction.title}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                        {dateFormatter.format(new Date(transaction.createdAt))}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </td>
                      <td className="py-3 text-right">
                        <MoneyAmount
                          amount={
                            transaction.incoming
                              ? transaction.amount
                              : -transaction.amount
                          }
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export { RecentTransactions }
