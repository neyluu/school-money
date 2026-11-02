import * as React from "react"
import { HandCoins } from "lucide-react"
import { DataState } from "@/components/data-state"
import { EmptyState } from "@/components/empty-state"
import { FundraiserCard } from "@/components/fundraiser-card"
import type { FundraiserStatus } from "@/components/fundraiser-card"
import { AppShell } from "@/components/layout/app-shell"
import { SegmentedControl } from "@/components/segmented-control"
import type { SegmentedOption } from "@/components/segmented-control"
import { Toaster } from "@/components/ui/toast"
import { useAsyncData } from "@/hooks/use-async-data"
import { getFundraisings } from "@/lib/fundraising"
import type { FundraisingListItem, FundraisingStatus } from "@/lib/fundraising"

type FundraisingFilter = "all" | "active" | "closed"

const FILTER_OPTIONS: SegmentedOption<FundraisingFilter>[] = [
  { value: "all", label: "Wszystkie" },
  { value: "active", label: "Aktywne" },
  { value: "closed", label: "Zamknięte" },
]

const CARD_STATUSES: Record<FundraisingStatus, FundraiserStatus> = {
  ACTIVE: "active",
  CLOSED: "closed",
  CANCELLED: "cancelled",
}

function matchesFilter(
  fundraising: FundraisingListItem,
  filter: FundraisingFilter
): boolean {
  switch (filter) {
    case "all":
      return true
    case "active":
      return fundraising.status === "ACTIVE"
    case "closed":
      return fundraising.status !== "ACTIVE"
  }
}

function FundraisingsPage() {
  const [filter, setFilter] = React.useState<FundraisingFilter>("all")
  const { data, error, isLoading, reload } = useAsyncData(getFundraisings)

  const visible = (data ?? []).filter((fundraising) =>
    matchesFilter(fundraising, filter)
  )

  return (
    <AppShell activeId="fundraisers">
      <div className="flex flex-col gap-6">
        <h1 className="text-2xl font-bold">Zbiórki</h1>
        <SegmentedControl<FundraisingFilter>
          aria-label="Filtr zbiórek"
          className="max-w-md"
          options={FILTER_OPTIONS}
          value={filter}
          onChange={setFilter}
        />
        <DataState
          isLoading={isLoading}
          hasError={error != null}
          isEmpty={data != null && visible.length === 0}
          onRetry={reload}
          emptyState={
            <EmptyState
              icon={<HandCoins />}
              title="Brak zbiórek"
              description="Nie ma zbiórek pasujących do tego filtra."
            />
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((fundraising) => (
              <FundraiserCard
                key={fundraising.id}
                icon={<HandCoins />}
                title={fundraising.name}
                dueDate={fundraising.endDate}
                amountPerChild={fundraising.amountPerChild}
                status={CARD_STATUSES[fundraising.status]}
                href={`/dashboard/fundraisers/${fundraising.id}`}
                className="w-full"
              />
            ))}
          </div>
        </DataState>
      </div>
      <Toaster />
    </AppShell>
  )
}

export { FundraisingsPage }
