import { ReceiptText } from "lucide-react"
import { DataState } from "@/components/data-state"
import { EmptyState } from "@/components/empty-state"
import { MoneyAmount } from "@/components/money-amount"
import { TransactionStatusBadge } from "@/components/transaction-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePagedList } from "@/hooks/use-paged-list"
import { getContributions, getTransactions } from "@/lib/wallet"
import type { Transaction, WalletContribution } from "@/lib/wallet"

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
})

function LoadMore({
  hasMore,
  isLoading,
  onClick,
}: {
  hasMore: boolean
  isLoading: boolean
  onClick: () => void
}) {
  if (!hasMore) {
    return null
  }

  return (
    <div className="flex justify-center pt-4">
      <Button variant="outline" loading={isLoading} onClick={onClick}>
        Pokaż więcej
      </Button>
    </div>
  )
}

function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Data</th>
            <th className="py-2 pr-4 font-medium">Opis</th>
            <th className="py-2 pr-4 font-medium">Kwota</th>
            <th className="py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id} className="border-b last:border-0">
              <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                {dateFormatter.format(new Date(transaction.createdAt))}
              </td>
              <td className="py-3 pr-4">{transaction.title}</td>
              <td className="py-3 pr-4">
                <MoneyAmount
                  amount={
                    transaction.incoming ? transaction.amount : -transaction.amount
                  }
                />
              </td>
              <td className="py-3">
                <TransactionStatusBadge status={transaction.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function ContributionsTable({
  contributions,
}: {
  contributions: WalletContribution[]
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b text-xs text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Data</th>
            <th className="py-2 pr-4 font-medium">Zbiórka</th>
            <th className="py-2 pr-4 font-medium">Dziecko</th>
            <th className="py-2 pr-4 font-medium">Kwota</th>
            <th className="py-2 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {contributions.map((contribution) => (
            <tr key={contribution.id} className="border-b last:border-0">
              <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                {dateFormatter.format(new Date(contribution.createdAt))}
              </td>
              <td className="py-3 pr-4">{contribution.fundraisingName}</td>
              <td className="py-3 pr-4">
                {contribution.child.firstName} {contribution.child.lastName}
              </td>
              <td className="py-3 pr-4">
                <MoneyAmount amount={-contribution.amount} />
              </td>
              <td className="py-3">
                <Badge variant={contribution.refunded ? "neutral" : "success"}>
                  {contribution.refunded ? "Zwrócona" : "Zaksięgowana"}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TransactionsTab() {
  const list = usePagedList(getTransactions)

  return (
    <DataState
      isLoading={list.isLoading}
      hasError={list.failed}
      isEmpty={list.items.length === 0}
      onRetry={list.reload}
      emptyState={
        <EmptyState
          icon={<ReceiptText />}
          title="Brak transakcji"
          description="Doładowania, wypłaty i wpłaty na zbiórki pojawią się tutaj."
        />
      }
    >
      <TransactionsTable transactions={list.items} />
      <LoadMore
        hasMore={list.hasMore}
        isLoading={list.isLoadingMore}
        onClick={list.loadMore}
      />
    </DataState>
  )
}

function ContributionsTab() {
  const list = usePagedList(getContributions)

  return (
    <DataState
      isLoading={list.isLoading}
      hasError={list.failed}
      isEmpty={list.items.length === 0}
      onRetry={list.reload}
      emptyState={
        <EmptyState
          icon={<ReceiptText />}
          title="Brak wpłat na zbiórki"
          description="Twoje wpłaty na zbiórki, także za cudze dzieci, pojawią się tutaj."
        />
      }
    >
      <ContributionsTable contributions={list.items} />
      <LoadMore
        hasMore={list.hasMore}
        isLoading={list.isLoadingMore}
        onClick={list.loadMore}
      />
    </DataState>
  )
}

function WalletHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Historia</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="transactions">
          <TabsList>
            <TabsTrigger value="transactions">Transakcje</TabsTrigger>
            <TabsTrigger value="contributions">Moje wpłaty</TabsTrigger>
          </TabsList>
          <TabsContent value="transactions" className="pt-4">
            <TransactionsTab />
          </TabsContent>
          <TabsContent value="contributions" className="pt-4">
            <ContributionsTab />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export { WalletHistory }
