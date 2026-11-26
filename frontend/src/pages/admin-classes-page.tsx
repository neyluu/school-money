import * as React from "react";
import { GraduationCap } from "lucide-react";
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
  blockAdminClass,
  getAdminClasses,
  unblockAdminClass,
} from "@/lib/admin";
import type { AdminClass } from "@/lib/admin";
import { describeError } from "@/lib/error-messages";

type ClassSortKey =
  "name" | "school" | "owner" | "members" | "fundraisings" | "status";

const ACCESSORS: Record<ClassSortKey, (c: AdminClass) => string | number> = {
  name: (c) => c.name,
  school: (c) => `${c.school} ${c.city}`,
  owner: (c) => `${c.owner.lastName} ${c.owner.firstName}`,
  members: (c) => c.memberCount,
  fundraisings: (c) => c.fundraisingCount,
  status: (c) => (c.isBlocked ? "Zablokowana" : "Aktywna"),
};

function SortableTh({
  label,
  sortKey,
  sort,
  onSort,
}: {
  label: string;
  sortKey: ClassSortKey;
  sort: { key: ClassSortKey; direction: "asc" | "desc" } | null;
  onSort: (key: ClassSortKey) => void;
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

function AdminClassesPage() {
  const load = React.useCallback(() => getAdminClasses(), []);
  const { data, error, isLoading, reload } = useAsyncData(load);
  const [search, setSearch] = React.useState("");
  const [target, setTarget] = React.useState<AdminClass | null>(null);
  const [busy, setBusy] = React.useState(false);

  const query = search.trim().toLowerCase();
  const filtered = (data ?? []).filter((c) =>
    query === ""
      ? true
      : `${c.name} ${c.school} ${c.city} ${c.owner.firstName} ${c.owner.lastName}`
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
        await unblockAdminClass(target.id);
      } else {
        await blockAdminClass(target.id);
      }
      toast.add({
        title: target.isBlocked ? "Klasa odblokowana." : "Klasa zablokowana.",
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
          title="Klasy"
          description="Wszystkie klasy na platformie. Zablokowana klasa nie przyjmuje zapisów ani zmian, a jej zbiórki zatrzymują wpłaty."
        />
        <Input
          type="search"
          placeholder="Szukaj po nazwie, szkole, mieście lub skarbniku"
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
              icon={<GraduationCap />}
              title="Brak klas"
              description="Żadna klasa nie pasuje do wyszukiwania."
            />
          }
        >
          <Section title={`Klasy (${sorted.length})`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <SortableTh
                      label="Klasa"
                      sortKey="name"
                      sort={sort}
                      onSort={toggle}
                    />
                    <SortableTh
                      label="Szkoła"
                      sortKey="school"
                      sort={sort}
                      onSort={toggle}
                    />
                    <SortableTh
                      label="Skarbnik"
                      sortKey="owner"
                      sort={sort}
                      onSort={toggle}
                    />
                    <SortableTh
                      label="Dzieci"
                      sortKey="members"
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
                      label="Status"
                      sortKey="status"
                      sort={sort}
                      onSort={toggle}
                    />
                    <th className="py-2 text-right font-medium">Akcja</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map((c) => (
                    <tr key={c.id} className="border-b last:border-0">
                      <td className="py-3 pr-4 font-medium">{c.name}</td>
                      <td className="py-3 pr-4">
                        <p>{c.school}</p>
                        <p className="text-xs text-muted-foreground">
                          {c.city}
                        </p>
                      </td>
                      <td className="py-3 pr-4">
                        {c.owner.firstName} {c.owner.lastName}
                      </td>
                      <td className="py-3 pr-4 tabular-nums">
                        {c.memberCount}
                      </td>
                      <td className="py-3 pr-4 tabular-nums">
                        {c.fundraisingCount}
                      </td>
                      <td className="py-3 pr-4">
                        {c.isBlocked ? (
                          <Badge variant="danger">Zablokowana</Badge>
                        ) : (
                          <Badge variant="success">Aktywna</Badge>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <Button
                          size="sm"
                          variant={c.isBlocked ? "outline" : "destructive"}
                          className="cursor-pointer"
                          onClick={() => setTarget(c)}
                        >
                          {c.isBlocked ? "Odblokuj" : "Zablokuj"}
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
            : { name: target.name, isBlocked: target.isBlocked, kind: "klasę" }
        }
        busy={busy}
        onOpenChange={(open) => !open && setTarget(null)}
        onConfirm={confirmToggle}
      />
      <Toaster />
    </AppShell>
  );
}

export { AdminClassesPage };
