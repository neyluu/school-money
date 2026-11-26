import * as React from "react";
import { HandCoins } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { AdminBlockDialog } from "@/components/admin-block-dialog";
import { AppShell } from "@/components/layout/app-shell";
import { DataState } from "@/components/data-state";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { SortIndicator } from "@/components/sort-indicator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "@/components/ui/toast";
import { useAsyncData } from "@/hooks/use-async-data";
import { useTableSort } from "@/hooks/use-table-sort";
import {
  blockAdminFundraising,
  getAdminFundraisings,
  refundAdminFundraising,
  unblockAdminFundraising,
} from "@/lib/admin";
import type { AdminFundraising } from "@/lib/admin";
import { describeError } from "@/lib/error-messages";
import { formatMoney } from "@/lib/money";

type FundraisingSortKey =
  "name" | "class" | "collected" | "status" | "createdAt";

const STATUS_LABEL: Record<AdminFundraising["status"], string> = {
  ACTIVE: "Trwa",
  CLOSED: "Zamknięta",
  CANCELLED: "Zamknięta ze zwrotem",
};

const ACCESSORS: Record<
  FundraisingSortKey,
  (f: AdminFundraising) => string | number
> = {
  name: (f) => f.name,
  class: (f) => f.schoolClass.name,
  collected: (f) => f.collected,
  status: (f) => STATUS_LABEL[f.status],
  createdAt: (f) => new Date(f.createdAt).getTime(),
};

function SortableTh({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: FundraisingSortKey;
  sort: { key: FundraisingSortKey; direction: "asc" | "desc" } | null;
  onSort: (key: FundraisingSortKey) => void;
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

function AdminFundraisingsPage() {
  const load = React.useCallback(() => getAdminFundraisings(), []);
  const { data, error, isLoading, reload } = useAsyncData(load);
  const [search, setSearch] = React.useState("");
  const [target, setTarget] = React.useState<AdminFundraising | null>(null);
  const [busy, setBusy] = React.useState(false);

  const query = search.trim().toLowerCase();
  const filtered = (data ?? []).filter((f) =>
    query === ""
      ? true
      : `${f.name} ${f.schoolClass.name} ${f.schoolClass.school}`
          .toLowerCase()
          .includes(query),
  );
  const { sorted, sort, toggle } = useTableSort(filtered, ACCESSORS);

  async function confirmToggle() {
    if (target == null) {
      return;
    }
    setBusy(true);
    try {
      if (target.isBlocked) {
        await unblockAdminFundraising(target.id);
        toast.add({ title: "Zbiórka odblokowana.", type: "success" });
      } else {
        await blockAdminFundraising(target.id);

        try {
          const summary = await refundAdminFundraising(target.id);
          toast.add({
            title: `Zbiórka zablokowana. Zwrócono (${formatMoney(summary.refundedAmount)}).`,
            type: "success",
          });
        } catch (refundError) {
          toast.add({
            title: `Zbiórka zablokowana, ale zwrot się nie udał: ${describeError(refundError)}`,
            type: "error",
          });
        }
      }
      setTarget(null);
      reload();
    } catch (actionError) {
      toast.add({ title: describeError(actionError), type: "error" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell activeId="admin">
      <div className="flex flex-col gap-6">
        <AdminNav />
        <PageHeader
          title="Zbiórki"
          description="Wszystkie zbiórki na platformie. Zablokowana zbiórka nie przyjmuje wpłat ani wypłat."
        />
        <Input
          type="search"
          placeholder="Szukaj po nazwie zbiórki lub klasie"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          className="max-w-md"
        />
        <DataState
          isLoading={isLoading && data == null}
          hasError={error != null}
          isEmpty={data != null && sorted.length === 0}
          onRetry={reload}
          emptyState={
            <EmptyState
              icon={<HandCoins />}
              title="Brak zbiórek"
              description="Żadna zbiórka nie pasuje do wyszukiwania."
            />
          }
        >
          <Section title={`Zbiórki (${sorted.length})`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <SortableTh
                      label="Zbiórka"
                      sortKey="name"
                      sort={sort}
                      onSort={toggle}
                    />
                    <SortableTh
                      label="Klasa"
                      sortKey="class"
                      sort={sort}
                      onSort={toggle}
                    />
                    <SortableTh
                      label="Zebrano"
                      sortKey="collected"
                      sort={sort}
                      onSort={toggle}
                    />
                    <SortableTh
                      label="Status"
                      sortKey="status"
                      sort={sort}
                      onSort={toggle}
                    />
                    <SortableTh
                      label="Utworzono"
                      sortKey="createdAt"
                      sort={sort}
                      onSort={toggle}
                    />
                    <th className="py-2 text-right font-medium">Akcja</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((f) => (
                    <tr key={f.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{f.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {f.schoolClass.name}
                      </td>
                      <td className="py-3 pr-4 tabular-nums">
                        {formatMoney(f.collected)}
                      </td>
                      <td className="py-3 pr-4">
                        {f.isBlocked || f.isClassBlocked ? (
                          <Badge variant="danger">
                            {f.isClassBlocked && !f.isBlocked
                              ? "Klasa zablokowana"
                              : "Zablokowana"}
                          </Badge>
                        ) : (
                          <Badge
                            variant={
                              f.status === "ACTIVE" ? "success" : "neutral"
                            }
                          >
                            {STATUS_LABEL[f.status]}
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                        {new Date(f.createdAt).toLocaleDateString("pl-PL")}
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          size="sm"
                          variant={f.isBlocked ? "outline" : "destructive"}
                          className="cursor-pointer"
                          onClick={() => setTarget(f)}
                        >
                          {f.isBlocked ? "Odblokuj" : "Zablokuj"}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </DataState>
      </div>
      <AdminBlockDialog
        target={
          target == null
            ? null
            : {
                name: target.name,
                isBlocked: target.isBlocked,
                kind: "zbiórkę",
                refundOnBlock: !target.isBlocked,
              }
        }
        busy={busy}
        onOpenChange={(open) => !open && setTarget(null)}
        onConfirm={confirmToggle}
      />
      <Toaster />
    </AppShell>
  );
}

export { AdminFundraisingsPage };
