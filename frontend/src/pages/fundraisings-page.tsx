import * as React from "react"
import { Link } from "react-router"
import { HandCoins, Plus } from "lucide-react"
import { DataState } from "@/components/data-state"
import { EmptyState } from "@/components/empty-state"
import { FundraiserCard } from "@/components/fundraiser-card"
import type { FundraiserStatus } from "@/components/fundraiser-card"
import { AppShell } from "@/components/layout/app-shell"
import { SegmentedControl } from "@/components/segmented-control"
import type { SegmentedOption } from "@/components/segmented-control"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toast"
import { useAsyncData } from "@/hooks/use-async-data"
import { getClasses } from "@/lib/classes"
import { getFundraisings } from "@/lib/fundraising"
import type { FundraisingListItem, FundraisingStatus } from "@/lib/fundraising"

type FundraisingFilter = "all" | "active" | "closed"

const NEW_FUNDRAISING_PATH = "/dashboard/fundraisers/new"

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
  const load = React.useCallback(
    () => Promise.all([getFundraisings(), getClasses()]),
    []
  )
  const { data, error, isLoading, reload } = useAsyncData(load)

  const canCreate = data?.[1].some((item) => item.isOwner) ?? false
  const visible = (data?.[0] ?? []).filter((fundraising) =>
    matchesFilter(fundraising, filter)
  )

  return (
    <AppShell activeId="fundraisers">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-2xl font-bold">Zbiórki</h1>
          {canCreate ? (
            <Button render={<Link to={NEW_FUNDRAISING_PATH} />}>
              <Plus />
              Nowa zbiórka
            </Button>
          ) : null}
        </div>
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
              action={
                canCreate ? (
                  <Button render={<Link to={NEW_FUNDRAISING_PATH} />}>
                    Nowa zbiórka
                  </Button>
                ) : undefined
              }
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
