import * as React from "react"
import { Link } from "react-router"
import { HandCoins, Plus } from "lucide-react"
import { DataState } from "@/components/data-state"
import { EmptyState } from "@/components/empty-state"
import { FundraiserCard } from "@/components/fundraiser-card"
import type { FundraiserStatus } from "@/components/fundraiser-card"
import { AppShell } from "@/components/layout/app-shell"
import { PageHeader } from "@/components/page-header"
import { SegmentedControl } from "@/components/segmented-control"
import type { SegmentedOption } from "@/components/segmented-control"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/toast"
import { useAsyncData } from "@/hooks/use-async-data"
import { getClasses } from "@/lib/classes"
import type { ClassSummary } from "@/lib/classes"
import { getFundraisings } from "@/lib/fundraising"
import type { FundraisingListItem, FundraisingStatus } from "@/lib/fundraising"

type FundraisingFilter = "all" | "mine" | "active" | "closed"

const NEW_FUNDRAISING_PATH = "/dashboard/fundraisers/new"

const FILTER_OPTIONS: SegmentedOption<FundraisingFilter>[] = [
  { value: "all", label: "Wszystkie" },
  { value: "mine", label: "Prowadzone przeze mnie" },
  { value: "active", label: "Trwające" },
  { value: "closed", label: "Zakończone" },
]

const EMPTY_TEXTS: Record<FundraisingFilter, string> = {
  all: "W Twoich klasach nie ma jeszcze żadnej zbiórki.",
  mine: "Nie prowadzisz jeszcze żadnej zbiórki.",
  active: "Żadna zbiórka aktualnie nie trwa.",
  closed: "Żadna zbiórka nie jest jeszcze zakończona.",
}

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
    case "mine":
      return fundraising.isOwner
    case "active":
      return fundraising.status === "ACTIVE"
    case "closed":
      return fundraising.status !== "ACTIVE"
  }
}

function describeClass(schoolClass: ClassSummary | undefined): string | undefined {
  return schoolClass != null
    ? `Klasa ${schoolClass.name} · ${schoolClass.school}`
    : undefined
}

function FundraisingsPage() {
  const [filter, setFilter] = React.useState<FundraisingFilter>("all")
  const load = React.useCallback(
    () => Promise.all([getFundraisings(), getClasses()]),
    []
  )
  const { data, error, isLoading, reload } = useAsyncData(load)

  const classes = new Map((data?.[1] ?? []).map((item) => [item.id, item]))
  const canCreate = data?.[1].some((item) => item.isOwner) ?? false
  const visible = (data?.[0] ?? []).filter((fundraising) =>
    matchesFilter(fundraising, filter)
  )

  const createButton = canCreate ? (
    <Button render={<Link to={NEW_FUNDRAISING_PATH} />}>
      <Plus />
      Nowa zbiórka
    </Button>
  ) : undefined

  return (
    <AppShell activeId="fundraisers">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Zbiórki"
          description="Zbiórki w klasach, które prowadzisz, i w klasach Twoich dzieci."
          actions={createButton}
        />
        <SegmentedControl<FundraisingFilter>
          aria-label="Filtr zbiórek"
          className="max-w-2xl"
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
              title="Nic tu jeszcze nie ma"
              description={EMPTY_TEXTS[filter]}
              action={filter === "all" || filter === "mine" ? createButton : undefined}
            />
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((fundraising) => (
              <FundraiserCard
                key={fundraising.id}
                icon={<HandCoins />}
                title={fundraising.name}
                classLabel={describeClass(classes.get(fundraising.classId))}
                isOwner={fundraising.isOwner}
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
