import * as React from "react";
import { ChartColumn } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { AppShell } from "@/components/layout/app-shell";
import { DataState } from "@/components/data-state";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { SortIndicator } from "@/components/sort-indicator";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Toaster } from "@/components/ui/toast";
import { useAsyncData } from "@/hooks/use-async-data";
import { useTableSort } from "@/hooks/use-table-sort";
import {
  getAdminClasses,
  getAdminFundraisings,
  getAdminMonthlySummary,
  getAdminUsers,
} from "@/lib/admin";
import type { AdminMonth } from "@/lib/admin";
import { formatMoney } from "@/lib/money";

const MONTHS = [
  "Styczeń",
  "Luty",
  "Marzec",
  "Kwiecień",
  "Maj",
  "Czerwiec",
  "Lipiec",
  "Sierpień",
  "Wrzesień",
  "Październik",
  "Listopad",
  "Grudzień",
];

const DEFAULT_MONTHS_BACK = 5;
const MIN_SELECTABLE_MONTHS = 2;

type Period = { year: number; month: number };
type ReportSortKey = "month" | "turnover" | "newUsers" | "newFundraisings";

const ACCESSORS: Record<ReportSortKey, (m: AdminMonth) => string | number> = {
  month: (m) => m.month,
  turnover: (m) => m.turnover,
  newUsers: (m) => m.newUsers,
  newFundraisings: (m) => m.newFundraisings,
};

function monthIndex(p: Period): number {
  return p.year * 12 + p.month;
}

function fromIndex(i: number): Period {
  return { year: Math.floor(i / 12), month: i % 12 };
}

function toPeriod(iso: string): Period {
  const d = new Date(iso);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() };
}

function startOf(p: Period): string {
  return new Date(Date.UTC(p.year, p.month, 1)).toISOString();
}

function startOfNext(p: Period): string {
  return new Date(Date.UTC(p.year, p.month + 1, 1)).toISOString();
}

function monthsBetween(first: Period, last: Period): Period[] {
  const out: Period[] = [];
  for (let i = monthIndex(first); i <= monthIndex(last); i++) {
    out.push(fromIndex(i));
  }
  return out;
}

function PeriodPicker({
  label,
  value,
  options,
  disabled,
  onChange,
}: {
  label: string;
  value: Period;
  options: Period[];
  disabled: boolean;
  onChange: (next: Period) => void;
}) {
  const years = [...new Set(options.map((p) => p.year))];
  const monthsOfYear = options
    .filter((p) => p.year === value.year)
    .map((p) => p.month);
  const monthId = `period-${label}-month`;
  const yearId = `period-${label}-year`;

  function setYear(year: number) {
    const sameYearMonths = options
      .filter((p) => p.year === year)
      .map((p) => p.month);
    const month = sameYearMonths.includes(value.month)
      ? value.month
      : sameYearMonths[0];
    onChange({ year, month });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex gap-2">
        <Field className="flex-1">
          <FieldLabel htmlFor={monthId} className="sr-only">
            Miesiąc
          </FieldLabel>
          <Select
            value={String(value.month)}
            disabled={disabled}
            onValueChange={(v) =>
              v != null && onChange({ ...value, month: Number(v) })
            }
          >
            <SelectTrigger id={monthId} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {monthsOfYear.map((m) => (
                <SelectItem key={m} value={String(m)}>
                  {MONTHS[m]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field className="w-28">
          <FieldLabel htmlFor={yearId} className="sr-only">
            Rok
          </FieldLabel>
          <Select
            value={String(value.year)}
            disabled={disabled}
            onValueChange={(v) => v != null && setYear(Number(v))}
          >
            <SelectTrigger id={yearId} className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      </div>
    </div>
  );
}

async function loadFirstActivity(): Promise<Period | null> {
  const [users, classes, fundraisings] = await Promise.all([
    getAdminUsers(),
    getAdminClasses(),
    getAdminFundraisings(),
  ]);
  const dates = [
    ...users.map((u) => u.createdAt),
    ...classes.map((c) => c.createdAt),
    ...fundraisings.map((f) => f.createdAt),
  ];
  if (dates.length === 0) {
    return null;
  }
  const earliest = dates.reduce((a, b) => (a < b ? a : b));
  return toPeriod(earliest);
}

function AdminReportsPage() {
  const now = React.useMemo(() => new Date(), []);
  const currentPeriod = React.useMemo<Period>(
    () => ({ year: now.getUTCFullYear(), month: now.getUTCMonth() }),
    [now],
  );

  const firstActivity = useAsyncData(loadFirstActivity);
  const firstPeriod = firstActivity.data ?? null;

  const allowed = React.useMemo(
    () =>
      firstPeriod != null ? monthsBetween(firstPeriod, currentPeriod) : [],
    [firstPeriod, currentPeriod],
  );
  const selectable = allowed.length >= MIN_SELECTABLE_MONTHS;

  const [from, setFrom] = React.useState<Period | null>(null);
  const [to, setTo] = React.useState<Period | null>(null);

  const effectiveFrom = React.useMemo<Period | null>(() => {
    if (allowed.length === 0) {
      return null;
    }
    const back = monthIndex(currentPeriod) - DEFAULT_MONTHS_BACK;
    const candidate = from ?? fromIndex(back);
    return monthIndex(candidate) < monthIndex(allowed[0])
      ? allowed[0]
      : candidate;
  }, [allowed, from, currentPeriod]);

  const effectiveTo = to ?? currentPeriod;

  const rangeValid =
    effectiveFrom != null &&
    monthIndex(effectiveFrom) <= monthIndex(effectiveTo);

  const load = React.useCallback(
    () =>
      rangeValid && effectiveFrom != null
        ? getAdminMonthlySummary(
            startOf(effectiveFrom),
            startOfNext(effectiveTo),
          )
        : Promise.resolve([]),
    [rangeValid, effectiveFrom, effectiveTo],
  );
  const { data, error, isLoading, reload } = useAsyncData(load);

  const rangeRows = (data ?? []).filter((m) => {
    if (effectiveFrom == null) {
      return false;
    }
    const [y, mo] = m.month.split("-").map(Number);
    const idx = monthIndex({ year: y, month: mo - 1 });
    return idx >= monthIndex(effectiveFrom) && idx <= monthIndex(effectiveTo);
  });

  const { sorted, sort, toggle } = useTableSort(rangeRows, ACCESSORS);

  const noActivity = !firstActivity.isLoading && firstPeriod === null;

  return (
    <AppShell activeId="admin">
      <div className="flex flex-col gap-6">
        <AdminNav />
        <PageHeader
          title="Raporty finansowe"
          description="Obrót (wpłaty i doładowania) oraz nowi użytkownicy i zbiórki w wybranym okresie."
        />
        {noActivity ? (
          <EmptyState
            icon={<ChartColumn />}
            title="Brak danych do raportu"
            description="Na platformie nie ma jeszcze żadnej aktywności, więc raport nie ma z czego powstać."
          />
        ) : effectiveFrom != null ? (
          <>
            <div className="flex flex-wrap gap-4">
              <PeriodPicker
                label="Od"
                value={effectiveFrom}
                options={allowed}
                disabled={!selectable}
                onChange={setFrom}
              />
              <PeriodPicker
                label="Do"
                value={effectiveTo}
                options={allowed.filter(
                  (p) => monthIndex(p) >= monthIndex(effectiveFrom),
                )}
                disabled={!selectable}
                onChange={setTo}
              />
            </div>
            {!selectable ? (
              <p className="text-sm text-muted-foreground">
                Filtr dat będzie dostępny, gdy na platformie pojawią się dane z
                co najmniej dwóch miesięcy.
              </p>
            ) : null}
            {!rangeValid ? (
              <p className="text-sm text-destructive">
                Miesiąc „od” nie może być późniejszy niż „do”.
              </p>
            ) : null}
            <DataState
              isLoading={isLoading && data == null}
              hasError={error != null}
              isEmpty={rangeValid && sorted.length === 0}
              onRetry={reload}
              emptyState={
                <EmptyState
                  icon={<ChartColumn />}
                  title="Brak danych"
                  description="W wybranym okresie nie ma żadnej aktywności."
                />
              }
            >
              <Section title="Miesiące">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b text-xs text-muted-foreground">
                        <SortableTh
                          label="Miesiąc"
                          sortKey="month"
                          sort={sort}
                          onSort={toggle}
                        />
                        <SortableTh
                          label="Obrót"
                          sortKey="turnover"
                          sort={sort}
                          onSort={toggle}
                        />
                        <SortableTh
                          label="Nowi użytkownicy"
                          sortKey="newUsers"
                          sort={sort}
                          onSort={toggle}
                        />
                        <SortableTh
                          label="Nowe zbiórki"
                          sortKey="newFundraisings"
                          sort={sort}
                          onSort={toggle}
                        />
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.map((m) => (
                        <tr key={m.month} className="border-b last:border-0">
                          <td className="py-3 pr-4 font-medium">{m.month}</td>
                          <td className="py-3 pr-4 tabular-nums">
                            {formatMoney(m.turnover)}
                          </td>
                          <td className="py-3 pr-4 tabular-nums">
                            {m.newUsers}
                          </td>
                          <td className="py-3 tabular-nums">
                            {m.newFundraisings}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Section>
            </DataState>
          </>
        ) : null}
      </div>
      <Toaster />
    </AppShell>
  );
}

function SortableTh({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: ReportSortKey;
  sort: { key: ReportSortKey; direction: "asc" | "desc" } | null;
  onSort: (key: ReportSortKey) => void;
}) {
  return (
    <th className="py-2 pr-4 font-medium">
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex cursor-pointer items-center hover:text-foreground"
      >
        {label}
        <SortIndicator
          active={sort?.key === sortKey}
          direction={sort?.direction}
        />
      </button>
    </th>
  );
}

export { AdminReportsPage };
