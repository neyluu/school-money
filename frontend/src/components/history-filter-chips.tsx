import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { SegmentedOption } from "@/components/segmented-control"
import { EMPTY_HISTORY_FILTERS, getFilterChips } from "@/lib/history-filters"
import type { HistoryFilters } from "@/lib/history-filters"

function HistoryFilterChips<T extends string>({
  kinds,
  value,
  onChange,
}: {
  kinds: SegmentedOption<T | "all">[]
  value: HistoryFilters<T>
  onChange: (value: HistoryFilters<T>) => void
}) {
  const chips = getFilterChips(value, kinds)

  if (chips.length === 0) {
    return null
  }

  return (
    <div
      role="group"
      aria-label="Aktywne filtry"
      className="flex min-w-0 flex-wrap items-center gap-2 pt-2"
    >
      {chips.map((chip) => (
        <Button
          key={chip.id}
          variant="secondary"
          size="sm"
          className="max-w-full"
          aria-label={`Usuń filtr: ${chip.label}`}
          onClick={() => onChange({ ...value, ...chip.reset })}
        >
          <span className="min-w-0 truncate">{chip.label}</span>
          <X />
        </Button>
      ))}
      {chips.length > 1 ? (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onChange(EMPTY_HISTORY_FILTERS)}
        >
          Wyczyść wszystko
        </Button>
      ) : null}
    </div>
  )
}

export { HistoryFilterChips }
