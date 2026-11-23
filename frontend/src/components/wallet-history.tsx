import * as React from "react"
import { ReceiptText } from "lucide-react"
import { DataState } from "@/components/data-state"
import { EmptyState } from "@/components/empty-state"
import { HistoryFilterChips } from "@/components/history-filter-chips"
import { HistoryFilterDialog } from "@/components/history-filter-dialog"
import type { FilterConfig } from "@/components/history-filter-dialog"
import { MoneyAmount } from "@/components/money-amount"
import { TransactionStatusBadge } from "@/components/transaction-status-badge"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePagedList } from "@/hooks/use-paged-list"
import {
  EMPTY_HISTORY_FILTERS,
  getFilterChips,
  toHistoryParams,
} from "@/lib/history-filters"
import type { HistoryFilters } from "@/lib/history-filters"
import {
  CONTRIBUTION_FILTER_OPTIONS,
  TRANSACTION_FILTER_OPTIONS,
} from "@/lib/transaction-filters"
import type { TransactionFilter } from "@/lib/transaction-filters"
import { getContributions, getTransactions } from "@/lib/wallet"
import type {
  ContributionFilter,
  Transaction,
  WalletContribution,
} from "@/lib/wallet"

type HistoryTab = "transactions" | "contributions"

const TRANSACTION_FILTERS: FilterConfig<TransactionFilter> = {
  title: "Filtry transakcji",
  kindLabel: "Rodzaj",
  kinds: TRANSACTION_FILTER_OPTIONS,
  searchLabel: "Szukaj w opisie",
  searchPlaceholder: "Np. wycieczka",
}

const CONTRIBUTION_FILTERS: FilterConfig<ContributionFilter> = {
  title: "Filtry wpłat",
  kindLabel: "Status",
  kinds: CONTRIBUTION_FILTER_OPTIONS,
  searchLabel: "Szukaj zbiórki lub dziecka",
  searchPlaceholder: "Np. wycieczka albo Zofia",
}

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

function FilteredEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <EmptyState
      icon={<ReceiptText />}
      title="Brak wyników"
      description="Żadna pozycja nie pasuje do wybranych filtrów."
      action={
        <Button variant="outline" onClick={onClear}>
          Wyczyść filtry
        </Button>
      }
    />
  )
}

function TransactionsTab({
  filters,
  onClear,
}: {
  filters: HistoryFilters<TransactionFilter>
  onClear: () => void
}) {
  const load = React.useCallback(
    (page: number, size: number) =>
      getTransactions(page, size, toHistoryParams(filters)),
    [filters]
  )
  const list = usePagedList(load)
  const isFiltered =
    getFilterChips(filters, TRANSACTION_FILTERS.kinds).length > 0

  return (
    <DataState
      isLoading={list.isLoading}
      hasError={list.failed}
      isEmpty={list.items.length === 0}
      onRetry={list.reload}
      emptyState={
        !isFiltered ? (
          <EmptyState
            icon={<ReceiptText />}
            title="Brak transakcji"
            description="Doładowania, wypłaty i wpłaty na zbiórki pojawią się tutaj."
          />
        ) : (
          <FilteredEmptyState onClear={onClear} />
        )
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

function ContributionsTab({
  filters,
  onClear,
}: {
  filters: HistoryFilters<ContributionFilter>
  onClear: () => void
}) {
  const load = React.useCallback(
    (page: number, size: number) =>
      getContributions(page, size, toHistoryParams(filters)),
    [filters]
  )
  const list = usePagedList(load)
  const isFiltered =
    getFilterChips(filters, CONTRIBUTION_FILTERS.kinds).length > 0

  return (
    <DataState
      isLoading={list.isLoading}
      hasError={list.failed}
      isEmpty={list.items.length === 0}
      onRetry={list.reload}
      emptyState={
        !isFiltered ? (
          <EmptyState
            icon={<ReceiptText />}
            title="Brak wpłat na zbiórki"
            description="Twoje wpłaty na zbiórki, także za cudze dzieci, pojawią się tutaj."
          />
        ) : (
          <FilteredEmptyState onClear={onClear} />
        )
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

function WalletHistory({ refreshToken }: { refreshToken: number }) {
  const [tab, setTab] = React.useState<HistoryTab>("transactions")
  const [transactionFilters, setTransactionFilters] = React.useState<
    HistoryFilters<TransactionFilter>
  >(EMPTY_HISTORY_FILTERS)
  const [contributionFilters, setContributionFilters] = React.useState<
    HistoryFilters<ContributionFilter>
  >(EMPTY_HISTORY_FILTERS)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historia</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={tab} onValueChange={(value: HistoryTab) => setTab(value)}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <TabsList>
              <TabsTrigger value="transactions">Transakcje</TabsTrigger>
              <TabsTrigger value="contributions">Wpłaty</TabsTrigger>
            </TabsList>
            {tab === "transactions" ? (
              <HistoryFilterDialog
                key="transactions"
                config={TRANSACTION_FILTERS}
                value={transactionFilters}
                onChange={setTransactionFilters}
              />
            ) : (
              <HistoryFilterDialog
                key="contributions"
                config={CONTRIBUTION_FILTERS}
                value={contributionFilters}
                onChange={setContributionFilters}
              />
            )}
          </div>
          {tab === "transactions" ? (
            <HistoryFilterChips
              kinds={TRANSACTION_FILTERS.kinds}
              value={transactionFilters}
              onChange={setTransactionFilters}
            />
          ) : (
            <HistoryFilterChips
              kinds={CONTRIBUTION_FILTERS.kinds}
              value={contributionFilters}
              onChange={setContributionFilters}
            />
          )}
          <TabsContent value="transactions" className="pt-4">
            <TransactionsTab
              key={`${JSON.stringify(transactionFilters)}-${refreshToken}`}
              filters={transactionFilters}
              onClear={() => setTransactionFilters(EMPTY_HISTORY_FILTERS)}
            />
          </TabsContent>
          <TabsContent value="contributions" className="pt-4">
            <ContributionsTab
              key={`${JSON.stringify(contributionFilters)}-${refreshToken}`}
              filters={contributionFilters}
              onClear={() => setContributionFilters(EMPTY_HISTORY_FILTERS)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export { WalletHistory }
