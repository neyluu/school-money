import * as React from "react";
import { Link } from "react-router";
import { ChartColumn } from "lucide-react";
import { AdminNav } from "@/components/admin-nav";
import { AppShell } from "@/components/layout/app-shell";
import { DataState } from "@/components/data-state";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { StatStrip } from "@/components/stat-strip";
import type { StatItem } from "@/components/stat-strip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toast";
import { useAsyncData } from "@/hooks/use-async-data";
import {
  getAdminClasses,
  getAdminFundraisings,
  getAdminMonthlySummary,
  getAdminStats,
  getAdminTreasurers,
  getAdminUsers,
} from "@/lib/admin";
import type {
  AdminClass,
  AdminFundraising,
  AdminMonth,
  AdminStats,
  AdminTreasurer,
  AdminUser,
} from "@/lib/admin";
import { formatMoney } from "@/lib/money";

const RECENT_LIMIT = 5;
const ACTIVITY_LIMIT = 8;

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

const STATUS_LABEL: Record<AdminFundraising["status"], string> = {
  ACTIVE: "Trwa",
  CLOSED: "Zamknięta",
  CANCELLED: "Zamknięta ze zwrotem",
};

type DashboardData = {
  stats: AdminStats;
  months: AdminMonth[];
  users: AdminUser[];
  treasurers: AdminTreasurer[];
  classes: AdminClass[];
  fundraisings: AdminFundraising[];
};

type Activity = {
  id: string;
  at: string;
  text: string;
};

async function loadDashboard(): Promise<DashboardData> {
  const [stats, months, users, treasurers, classes, fundraisings] =
    await Promise.all([
      getAdminStats(),
      getAdminMonthlySummary(),
      getAdminUsers(),
      getAdminTreasurers(),
      getAdminClasses(),
      getAdminFundraisings(),
    ]);
  return { stats, months, users, treasurers, classes, fundraisings };
}

function buildActivity(data: DashboardData): Activity[] {
  const events: Activity[] = [
    ...data.users.map((u) => ({
      id: `user-${u.id}`,
      at: u.createdAt,
      text: `Rejestracja: ${u.firstName} ${u.lastName} (${u.email})`,
    })),
    ...data.classes.map((c) => ({
      id: `class-${c.id}`,
      at: c.createdAt,
      text: `Nowa klasa: ${c.name}, ${c.school}`,
    })),
    ...data.fundraisings.map((f) => ({
      id: `fundraising-${f.id}`,
      at: f.createdAt,
      text: `Nowa zbiórka: ${f.name} (${f.schoolClass.name})`,
    })),
  ];

  return events
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, ACTIVITY_LIMIT);
}

function AdminDashboardPage() {
  const load = React.useCallback(() => loadDashboard(), []);
  const { data, error, isLoading, reload } = useAsyncData(load);

  const blockedTotal =
    data != null
      ? data.stats.blockedUsers +
        data.stats.blockedClasses +
        data.stats.blockedFundraisings
      : 0;

  const collectedTotal =
    data != null ? data.treasurers.reduce((sum, t) => sum + t.collected, 0) : 0;

  const turnover6m =
    data != null ? data.months.reduce((sum, m) => sum + m.turnover, 0) : 0;

  const newUsers6m =
    data != null ? data.months.reduce((sum, m) => sum + m.newUsers, 0) : 0;

  const platformItems: StatItem[] = data
    ? [
        {
          label: "Użytkownicy",
          value: data.stats.users,
          hint: "wszystkie konta",
        },
        {
          label: "Skarbnicy",
          value: data.stats.treasurers,
          hint: "właściciele klas",
        },
        { label: "Klasy", value: data.classes.length, hint: "łącznie" },
        {
          label: "Zbiórki aktywne",
          value: data.stats.activeFundraisings,
          hint: `${data.stats.closedFundraisings + data.stats.cancelledFundraisings} zakończonych`,
        },
      ]
    : [];

  const financeItems: StatItem[] = data
    ? [
        {
          label: "Zebrane łącznie",
          value: formatMoney(collectedTotal),
          hint: "wszystkie zbiórki",
        },
        {
          label: "Obrót (6 mies.)",
          value: formatMoney(turnover6m),
          hint: "wpłaty i doładowania",
        },
        { label: "Nowi użytkownicy (6 mies.)", value: newUsers6m },
        {
          label: "Zablokowane",
          value: blockedTotal,
          hint: `${data.stats.blockedUsers} kont, ${data.stats.blockedClasses} klas, ${data.stats.blockedFundraisings} zbiórek`,
        },
      ]
    : [];

  return (
    <AppShell activeId="admin">
      <div className="flex flex-col gap-6">
        <AdminNav />
        <PageHeader
          title="Panel administratora"
          description="Przegląd platformy, finansów i ostatnich zdarzeń."
          actions={
            <>
              <Button
                variant="outline"
                render={<Link to="/dashboard/admin/reports" />}
              >
                <ChartColumn />
                Raporty
              </Button>
              <Button
                variant="outline"
                render={<Link to="/dashboard/admin/users" />}
              >
                Zarządzaj użytkownikami
              </Button>
            </>
          }
        />

        <DataState
          isLoading={isLoading && data == null}
          hasError={error != null}
          isEmpty={false}
          onRetry={reload}
          emptyState={null}
        >
          {data != null ? (
            <>
              <StatStrip items={platformItems} />
              <StatStrip items={financeItems} />

              <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
                <Section
                  title="Obrót w ostatnich miesiącach"
                  description="Wpłaty i doładowania oraz nowi użytkownicy i zbiórki."
                  action={
                    <Button
                      size="sm"
                      variant="ghost"
                      render={<Link to="/dashboard/admin/reports" />}
                    >
                      Pełny raport
                    </Button>
                  }
                >
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b text-xs text-muted-foreground">
                          <th className="py-2 pr-4 font-medium">Miesiąc</th>
                          <th className="py-2 pr-4 font-medium">Obrót</th>
                          <th className="py-2 pr-4 font-medium">Użytkownicy</th>
                          <th className="py-2 font-medium">Zbiórki</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.months.map((m) => (
                          <tr key={m.month} className="border-b last:border-0">
                            <td className="py-2 pr-4 font-medium">{m.month}</td>
                            <td className="py-2 pr-4 tabular-nums">
                              {formatMoney(m.turnover)}
                            </td>
                            <td className="py-2 pr-4 tabular-nums">
                              {m.newUsers}
                            </td>
                            <td className="py-2 tabular-nums">
                              {m.newFundraisings}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </Section>

                <Section
                  title="Ostatnia aktywność"
                  description="Rejestracje, nowe klasy i zbiórki."
                >
                  {buildActivity(data).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Brak zdarzeń.
                    </p>
                  ) : (
                    <ul className="flex flex-col divide-y">
                      {buildActivity(data).map((a) => (
                        <li key={a.id} className="flex flex-col gap-0.5 py-2">
                          <span className="text-sm">{a.text}</span>
                          <span className="text-xs text-muted-foreground">
                            {dateFormatter.format(new Date(a.at))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Section>
              </div>

              <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
                <Section
                  title="Skarbnicy"
                  description="Ostatnio zarejestrowani właściciele klas."
                  action={
                    <Button
                      size="sm"
                      variant="ghost"
                      render={<Link to="/dashboard/admin/treasurers" />}
                    >
                      Wszyscy
                    </Button>
                  }
                >
                  <ul className="flex flex-col divide-y">
                    {data.treasurers.slice(0, RECENT_LIMIT).map((t) => (
                      <li key={t.id} className="flex items-center gap-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {t.firstName} {t.lastName}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {t.classes.length} klas, {t.fundraisingCount}{" "}
                            zbiórek, zebrano {formatMoney(t.collected)}
                          </p>
                        </div>
                        {t.isBlocked ? (
                          <Badge variant="danger">Zablokowany</Badge>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section
                  title="Zbiórki"
                  description="Najnowsze zbiórki na platformie."
                  action={
                    <Button
                      size="sm"
                      variant="ghost"
                      render={<Link to="/dashboard/admin/fundraisings" />}
                    >
                      Wszystkie
                    </Button>
                  }
                >
                  <ul className="flex flex-col divide-y">
                    {data.fundraisings.slice(0, RECENT_LIMIT).map((f) => (
                      <li key={f.id} className="flex items-center gap-3 py-2">
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">
                            {f.name}
                          </p>
                          <p className="truncate text-xs text-muted-foreground">
                            {f.schoolClass.name} · zebrano{" "}
                            {formatMoney(f.collected)}
                          </p>
                        </div>
                        {f.isBlocked || f.isClassBlocked ? (
                          <Badge variant="danger">Zablokowana</Badge>
                        ) : (
                          <Badge
                            variant={
                              f.status === "ACTIVE" ? "success" : "neutral"
                            }
                          >
                            {STATUS_LABEL[f.status]}
                          </Badge>
                        )}
                      </li>
                    ))}
                  </ul>
                </Section>
              </div>
            </>
          ) : null}
        </DataState>
      </div>
      <Toaster />
    </AppShell>
  );
}

export { AdminDashboardPage };
