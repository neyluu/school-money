import { formatAmountInput } from "@/lib/amount"

export type HistoryFilters<T extends string> = {
  kind: T | "all"
  dateFrom: string
  dateTo: string
  minAmount: string
  maxAmount: string
  search: string
}

export type HistoryFilterErrors = {
  period?: string
  amount?: string
}

export type FilterChip<T extends string> = {
  id: string
  label: string
  reset: Partial<HistoryFilters<T>>
}

export type PeriodPreset = {
  label: string
  dateFrom: string
  dateTo: string
}

const EMPTY_HISTORY_FILTERS = {
  kind: "all",
  dateFrom: "",
  dateTo: "",
  minAmount: "",
  maxAmount: "",
  search: "",
} as const

const SEARCH_MAX_LENGTH = 100
const MIN_DATE = "1900-01-01"
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/
const AMOUNT_INPUT_PATTERN = /^(\d{1,10}([.,]\d{0,2})?)?$/

function toDateInput(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${date.getFullYear()}-${month}-${day}`
}

function getPeriodPresets(): PeriodPreset[] {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const day = now.getDate()
  const today = toDateInput(now)

  return [
    { label: "Dziś", dateFrom: today, dateTo: today },
    {
      label: "Ostatnie 7 dni",
      dateFrom: toDateInput(new Date(year, month, day - 6)),
      dateTo: today,
    },
    {
      label: "Ostatnie 30 dni",
      dateFrom: toDateInput(new Date(year, month, day - 29)),
      dateTo: today,
    },
    {
      label: "Ten miesiąc",
      dateFrom: toDateInput(new Date(year, month, 1)),
      dateTo: today,
    },
    {
      label: "Poprzedni miesiąc",
      dateFrom: toDateInput(new Date(year, month - 1, 1)),
      dateTo: toDateInput(new Date(year, month, 0)),
    },
  ]
}

function isAmountInput(value: string): boolean {
  return AMOUNT_INPUT_PATTERN.test(value)
}

function toAmount(value: string): number | null {
  return value === "" ? null : Number(value.replace(",", "."))
}

function validateHistoryFilters<T extends string>(
  filters: HistoryFilters<T>
): HistoryFilterErrors {
  const { dateFrom, dateTo, minAmount, maxAmount } = filters
  const errors: HistoryFilterErrors = {}
  const today = toDateInput(new Date())

  const hasInvalidDate = [dateFrom, dateTo].some(
    (date) =>
      date !== "" &&
      (!DATE_PATTERN.test(date) || date < MIN_DATE || date > today)
  )
  if (hasInvalidDate) {
    errors.period = "Podaj datę od 1900 roku do dziś."
  } else if (dateFrom !== "" && dateTo !== "" && dateFrom > dateTo) {
    errors.period = "Data początkowa nie może być późniejsza niż końcowa."
  }

  const min = toAmount(minAmount)
  const max = toAmount(maxAmount)
  if (min != null && max != null && min > max) {
    errors.amount = "Kwota minimalna nie może być większa niż maksymalna."
  }

  return errors
}

function toHistoryParams<T extends string>(
  filters: HistoryFilters<T>
): URLSearchParams {
  const params = new URLSearchParams()
  if (filters.kind !== "all") {
    params.set("filter", filters.kind.toUpperCase())
  }
  if (filters.dateFrom !== "") {
    params.set("from", new Date(`${filters.dateFrom}T00:00:00`).toISOString())
  }
  if (filters.dateTo !== "") {
    const end = new Date(`${filters.dateTo}T00:00:00`)
    end.setDate(end.getDate() + 1)
    params.set("to", end.toISOString())
  }

  const min = toAmount(filters.minAmount)
  const max = toAmount(filters.maxAmount)
  if (min != null) {
    params.set("minAmount", String(min))
  }
  if (max != null) {
    params.set("maxAmount", String(max))
  }
  if (filters.search.trim() !== "") {
    params.set("search", filters.search.trim())
  }

  return params
}

function formatDate(value: string): string {
  return value.split("-").reverse().join(".")
}

function formatAmount(value: string): string {
  return `${formatAmountInput(toAmount(value) ?? 0)} zł`
}

function formatRange(
  from: string,
  to: string,
  format: (value: string) => string
): string {
  if (from === "") return `do ${format(to)}`
  if (to === "") return `od ${format(from)}`
  return from === to ? format(from) : `${format(from)} – ${format(to)}`
}

function getFilterChips<T extends string>(
  filters: HistoryFilters<T>,
  kinds: { value: T | "all"; label: string }[]
): FilterChip<T>[] {
  const { kind, dateFrom, dateTo, minAmount, maxAmount, search } = filters
  const chips: FilterChip<T>[] = []

  if (kind !== "all") {
    chips.push({
      id: "kind",
      label: kinds.find((option) => option.value === kind)?.label ?? kind,
      reset: { kind: "all" },
    })
  }
  if (dateFrom !== "" || dateTo !== "") {
    chips.push({
      id: "period",
      label: formatRange(dateFrom, dateTo, formatDate),
      reset: { dateFrom: "", dateTo: "" },
    })
  }
  if (minAmount !== "" || maxAmount !== "") {
    chips.push({
      id: "amount",
      label: formatRange(minAmount, maxAmount, formatAmount),
      reset: { minAmount: "", maxAmount: "" },
    })
  }
  if (search.trim() !== "") {
    chips.push({
      id: "search",
      label: `„${search.trim()}”`,
      reset: { search: "" },
    })
  }

  return chips
}

export {
  EMPTY_HISTORY_FILTERS,
  getFilterChips,
  getPeriodPresets,
  isAmountInput,
  MIN_DATE,
  SEARCH_MAX_LENGTH,
  toDateInput,
  toHistoryParams,
  validateHistoryFilters,
}
