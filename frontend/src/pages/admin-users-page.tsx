import * as React from "react";
import { Users } from "lucide-react";
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
import { blockAdminUser, getAdminUsers, unblockAdminUser } from "@/lib/admin";
import type { AdminUser } from "@/lib/admin";
import { describeError } from "@/lib/error-messages";

type UserSortKey = "name" | "role" | "classes" | "createdAt" | "status";

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

const ACCESSORS: Record<UserSortKey, (u: AdminUser) => string | number> = {
  name: (u) => `${u.lastName} ${u.firstName}`,
  role: (u) => (u.role === "ADMIN" ? "Administrator" : "Użytkownik"),
  classes: (u) => u.classes.length,
  createdAt: (u) => new Date(u.createdAt).getTime(),
  status: (u) => (u.isBlocked ? "Zablokowany" : "Aktywny"),
};

function SortableTh({
  label,
  sortKey,
  sort,
  onSort,
  className = "",
}: {
  label: string;
  sortKey: UserSortKey;
  sort: { key: UserSortKey; direction: "asc" | "desc" } | null;
  onSort: (key: UserSortKey) => void;
  className?: string;
}) {
  const active = sort?.key === sortKey;
  return (
    <th className={`py-2 pr-4 font-medium ${className}`}>
      <button
        type="button"
        onClick={() => onSort(sortKey)}
        className="inline-flex cursor-pointer items-center hover:text-foreground"
      >
        {label}
        <SortIndicator active={active} direction={sort?.direction} />
      </button>
    </th>
  );
}

function AdminUsersPage() {
  const load = React.useCallback(() => getAdminUsers(), []);
  const { data, error, isLoading, reload } = useAsyncData(load);
  const [search, setSearch] = React.useState("");
  const [target, setTarget] = React.useState<AdminUser | null>(null);
  const [busy, setBusy] = React.useState(false);

  const query = search.trim().toLowerCase();
  const filtered = (data ?? []).filter((user) =>
    query === ""
      ? true
      : `${user.firstName} ${user.lastName} ${user.email}`
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
        await unblockAdminUser(target.id);
      } else {
        await blockAdminUser(target.id);
      }
      toast.add({
        title: target.isBlocked ? "Konto odblokowane." : "Konto zablokowane.",
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
          title="Użytkownicy"
          description="Wszystkie konta na platformie. Zablokowane konto nie może się zalogować."
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
              icon={<Users />}
              title="Brak użytkowników"
              description="Żadne konto nie pasuje do wyszukiwania."
            />
          }
        >
          <Section title={`Konta (${sorted.length})`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <SortableTh
                      label="Użytkownik"
                      sortKey="name"
                      sort={sort}
                      onSort={toggle}
                    />
                    <SortableTh
                      label="Rola"
                      sortKey="role"
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
                      label="Dołączył"
                      sortKey="createdAt"
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
                  {sorted.map((user) => {
                    const isAdmin = user.role === "ADMIN";
                    return (
                      <tr key={user.id} className="border-b last:border-0">
                        <td className="py-3 pr-4">
                          <p className="font-medium">
                            {user.firstName} {user.lastName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={isAdmin ? "success" : "neutral"}>
                            {isAdmin ? "Administrator" : "Użytkownik"}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 tabular-nums">
                          {user.classes.length}
                        </td>
                        <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                          {dateFormatter.format(new Date(user.createdAt))}
                        </td>
                        <td className="py-3 pr-4">
                          {user.isBlocked ? (
                            <Badge variant="danger">Zablokowany</Badge>
                          ) : (
                            <Badge variant="success">Aktywny</Badge>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          {isAdmin ? null : (
                            <Button
                              size="sm"
                              variant={
                                user.isBlocked ? "outline" : "destructive"
                              }
                              className="cursor-pointer"
                              onClick={() => setTarget(user)}
                            >
                              {user.isBlocked ? "Odblokuj" : "Zablokuj"}
                            </Button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
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
                kind: "konto",
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

export { AdminUsersPage };
