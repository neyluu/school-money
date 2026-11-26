import * as React from "react";
import { UsersRound } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { AdminBlockDialog } from "@/components/admin-block-dialog";
import { AppShell } from "@/components/layout/app-shell";
import { DataState } from "@/components/data-state";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast, Toaster } from "@/components/ui/toast";
import { useAsyncData } from "@/hooks/use-async-data";
import { SortIndicator } from "@/components/sort-indicator";
import { useTableSort } from "@/hooks/use-table-sort";
import {
  blockAdminUser,
  getAdminTreasurers,
  unblockAdminUser,
} from "@/lib/admin";
import type { AdminTreasurer } from "@/lib/admin";
import { describeError } from "@/lib/error-messages";
import { formatMoney } from "@/lib/money";

type TreasurerSortKey =
  "name" | "classes" | "fundraisings" | "collected" | "status";

const ACCESSORS: Record<
  TreasurerSortKey,
  (t: AdminTreasurer) => string | number
> = {
  name: (t) => `${t.lastName} ${t.firstName}`,
  classes: (t) => t.classes.length,
  fundraisings: (t) => t.fundraisingCount,
  collected: (t) => t.collected,
  status: (t) => (t.isBlocked ? "Zablokowany" : "Aktywny"),
};

function SortableTh({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: TreasurerSortKey;
  sort: { key: TreasurerSortKey; direction: "asc" | "desc" } | null;
  onSort: (key: TreasurerSortKey) => void;
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

function AdminTreasurersPage() {
  const load = React.useCallback(() => getAdminTreasurers(), []);
  const { data, error, isLoading, reload } = useAsyncData(load);
  const [search, setSearch] = React.useState("");
  const [target, setTarget] = React.useState<AdminTreasurer | null>(null);
  const [busy, setBusy] = React.useState(false);

  const query = search.trim().toLowerCase();
  const filtered = (data ?? []).filter((t) =>
    query === ""
      ? true
      : `${t.firstName} ${t.lastName} ${t.email}`.toLowerCase().includes(query),
  );
  const { sorted, sort, toggle } = useTableSort(filtered, ACCESSORS);

  async function confirmToggle() {
    if (target == null) {
      return;
    }
    setBusy(true);
    try {
      if (target.isBlocked) {
        await unblockAdminUser(target.id);
      } else {
        await blockAdminUser(target.id);
      }
      toast.add({
        title: target.isBlocked
          ? "Skarbnik odblokowany."
          : "Skarbnik zablokowany.",
        type: "success",
      });
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
          title="Skarbnicy"
          description="Właściciele klas, ich zbiórki i łącznie zebrane kwoty."
        />
        <Input
          type="search"
          placeholder="Szukaj po imieniu, nazwisku lub e-mailu"
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
              icon={<UsersRound />}
              title="Brak skarbników"
              description="Żaden skarbnik nie pasuje do wyszukiwania."
            />
          }
        >
          <Section title={`Skarbnicy (${sorted.length})`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <SortableTh
                      label="Skarbnik"
                      sortKey="name"
                      sort={sort}
                      onSort={toggle}
                    />
                    <SortableTh
                      label="Klasy"
                      sortKey="classes"
                      sort={sort}
                      onSort={toggle}
                    />
                    <SortableTh
                      label="Zbiórki"
                      sortKey="fundraisings"
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
                    <th className="py-2 text-right font-medium">Akcja</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((t) => (
                    <tr key={t.id} className="border-b last:border-0">
                      <td className="py-3 pr-4">
                        <p className="font-medium">
                          {t.firstName} {t.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {t.email}
                        </p>
                      </td>
                      <td className="py-3 pr-4 tabular-nums">
                        {t.classes.length}
                      </td>
                      <td className="py-3 pr-4 tabular-nums">
                        {t.fundraisingCount}
                      </td>
                      <td className="py-3 pr-4 tabular-nums">
                        {formatMoney(t.collected)}
                      </td>
                      <td className="py-3 pr-4">
                        {t.isBlocked ? (
                          <Badge variant="danger">Zablokowany</Badge>
                        ) : (
                          <Badge variant="success">Aktywny</Badge>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          size="sm"
                          variant={t.isBlocked ? "outline" : "destructive"}
                          className="cursor-pointer"
                          onClick={() => setTarget(t)}
                        >
                          {t.isBlocked ? "Odblokuj" : "Zablokuj"}
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
                name: `${target.firstName} ${target.lastName}`,
                isBlocked: target.isBlocked,
                kind: "skarbnika",
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

export { AdminTreasurersPage };
