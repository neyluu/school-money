import * as React from "react"
import { ListFilter } from "lucide-react"
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/responsive-dialog"
import type { SegmentedOption } from "@/components/segmented-control"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldError,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  EMPTY_HISTORY_FILTERS,
  getFilterChips,
  getPeriodPresets,
  isAmountInput,
  MIN_DATE,
  SEARCH_MAX_LENGTH,
  toDateInput,
  validateHistoryFilters,
} from "@/lib/history-filters"
import type { HistoryFilterErrors, HistoryFilters } from "@/lib/history-filters"

type FilterConfig<T extends string> = {
  title: string
  kindLabel: string
  kinds: SegmentedOption<T | "all">[]
  searchLabel: string
  searchPlaceholder: string
}

function ChoiceButton({
  selected,
  ...props
}: React.ComponentProps<typeof Button> & { selected: boolean }) {
  return (
    <Button
      type="button"
      variant={selected ? "default" : "outline"}
      aria-pressed={selected}
      {...props}
    />
  )
}

function FilterForm<T extends string>({
  config,
  initial,
  onApply,
}: {
  config: FilterConfig<T>
  initial: HistoryFilters<T>
  onApply: (value: HistoryFilters<T>) => void
}) {
  const id = React.useId()
  const [draft, setDraft] = React.useState(initial)
  const [errors, setErrors] = React.useState<HistoryFilterErrors>({})
  const today = toDateInput(new Date())

  function update(patch: Partial<HistoryFilters<T>>) {
    setDraft((current) => ({ ...current, ...patch }))
    setErrors({})
  }

  function updateAmount(field: "minAmount" | "maxAmount", value: string) {
    if (!isAmountInput(value)) {
      return
    }
    setDraft((current) => ({ ...current, [field]: value }))
    setErrors({})
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors = validateHistoryFilters(draft)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length === 0) {
      onApply({ ...draft, search: draft.search.trim() })
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      data-slot="history-filter-fields"
      className="-mx-1 flex min-h-0 scroll-pb-16 flex-col overflow-y-auto overscroll-contain md:max-h-[calc(100dvh-8rem)]"
    >
      <div className="flex shrink-0 flex-col gap-5 px-1 pt-1 pb-4">
        <FieldSet className="min-w-0 shrink-0 gap-2">
          <FieldLegend variant="label">Okres</FieldLegend>
          <div className="flex flex-wrap gap-2">
            {getPeriodPresets().map((preset) => {
              const selected =
                draft.dateFrom === preset.dateFrom &&
                draft.dateTo === preset.dateTo
              return (
                <ChoiceButton
                  key={preset.label}
                  selected={selected}
                  onClick={() =>
                    update({
                      dateFrom: selected ? "" : preset.dateFrom,
                      dateTo: selected ? "" : preset.dateTo,
                    })
                  }
                >
                  {preset.label}
                </ChoiceButton>
              )
            })}
          </div>
          <div className="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2">
            <Field className="min-w-0" data-invalid={errors.period != null}>
              <FieldLabel htmlFor={`${id}-from`}>Od dnia</FieldLabel>
              <Input
                id={`${id}-from`}
                type="date"
                min={MIN_DATE}
                max={draft.dateTo || today}
                value={draft.dateFrom}
                aria-invalid={errors.period != null}
                onChange={(event) => update({ dateFrom: event.target.value })}
              />
            </Field>
            <Field className="min-w-0" data-invalid={errors.period != null}>
              <FieldLabel htmlFor={`${id}-to`}>Do dnia</FieldLabel>
              <Input
                id={`${id}-to`}
                type="date"
                min={draft.dateFrom || MIN_DATE}
                max={today}
                value={draft.dateTo}
                aria-invalid={errors.period != null}
                onChange={(event) => update({ dateTo: event.target.value })}
              />
            </Field>
          </div>
          {errors.period != null ? (
            <FieldError>{errors.period}</FieldError>
          ) : null}
        </FieldSet>

        <FieldSet className="min-w-0 shrink-0 gap-2">
          <FieldLegend variant="label">{config.kindLabel}</FieldLegend>
          <div className="flex flex-wrap gap-2">
            {config.kinds.map((option) => (
              <ChoiceButton
                key={option.value}
                selected={draft.kind === option.value}
                onClick={() => update({ kind: option.value })}
              >
                {option.label}
              </ChoiceButton>
            ))}
          </div>
        </FieldSet>

        <FieldSet className="min-w-0 shrink-0 gap-2">
          <FieldLegend variant="label">Kwota (zł)</FieldLegend>
          <div className="grid grid-cols-2 gap-3">
            <Input
              aria-label="Kwota od"
              inputMode="decimal"
              autoComplete="off"
              placeholder="Od"
              value={draft.minAmount}
              aria-invalid={errors.amount != null}
              onChange={(event) => updateAmount("minAmount", event.target.value)}
            />
            <Input
              aria-label="Kwota do"
              inputMode="decimal"
              autoComplete="off"
              placeholder="Do"
              value={draft.maxAmount}
              aria-invalid={errors.amount != null}
              onChange={(event) => updateAmount("maxAmount", event.target.value)}
            />
          </div>
          {errors.amount != null ? (
            <FieldError>{errors.amount}</FieldError>
          ) : null}
        </FieldSet>

        <Field className="shrink-0">
          <FieldLabel htmlFor={`${id}-search`}>{config.searchLabel}</FieldLabel>
          <Input
            id={`${id}-search`}
            type="search"
            autoComplete="off"
            maxLength={SEARCH_MAX_LENGTH}
            placeholder={config.searchPlaceholder}
            value={draft.search}
            onChange={(event) => update({ search: event.target.value })}
          />
        </Field>
      </div>

      <div className="sticky bottom-0 z-10 flex shrink-0 justify-between gap-2 border-t bg-popover px-1 pt-3 pb-1">
        <Button
          type="button"
          variant="ghost"
          size="lg"
          disabled={getFilterChips(draft, config.kinds).length === 0}
          onClick={() => update(EMPTY_HISTORY_FILTERS)}
        >
          Wyczyść
        </Button>
        <Button type="submit" size="lg">
          Zastosuj filtry
        </Button>
      </div>
    </form>
  )
}

function HistoryFilterDialog<T extends string>({
  config,
  value,
  onChange,
}: {
  config: FilterConfig<T>
  value: HistoryFilters<T>
  onChange: (value: HistoryFilters<T>) => void
}) {
  const [open, setOpen] = React.useState(false)
  const [session, setSession] = React.useState(0)
  const activeCount = getFilterChips(value, config.kinds).length

  function openDialog() {
    setSession((current) => current + 1)
    setOpen(true)
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={openDialog}
        aria-haspopup="dialog"
        aria-label={
          activeCount > 0
            ? `${config.title}, aktywne: ${activeCount}`
            : config.title
        }
      >
        <ListFilter />
        Filtruj
        {activeCount > 0 ? (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-md bg-primary px-1 text-[11px] font-semibold text-primary-foreground">
            {activeCount}
          </span>
        ) : null}
      </Button>
      <ResponsiveDialog open={open} onOpenChange={setOpen}>
        <ResponsiveDialogContent className="md:max-w-lg lg:max-w-lg">
          <ResponsiveDialogHeader className="shrink-0">
            <ResponsiveDialogTitle>{config.title}</ResponsiveDialogTitle>
          </ResponsiveDialogHeader>
          <FilterForm
            key={session}
            config={config}
            initial={value}
            onApply={(next) => {
              onChange(next)
              setOpen(false)
            }}
          />
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  )
}

export { HistoryFilterDialog }
export type { FilterConfig }
