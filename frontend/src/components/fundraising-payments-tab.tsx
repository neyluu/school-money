import * as React from "react";
import { ChevronDown, ReceiptText } from "lucide-react";
import { DataState } from "@/components/data-state";
import { EmptyState } from "@/components/empty-state";
import { MoneyAmount } from "@/components/money-amount";
import { Badge } from "@/components/ui/badge";
import { useAsyncData } from "@/hooks/use-async-data";
import { getFundraisingContributions } from "@/lib/fundraising";
import type { FundraisingChild } from "@/lib/fundraising";
import { formatMoney } from "@/lib/money";

type Contribution = Awaited<
  ReturnType<typeof getFundraisingContributions>
>[number];

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

type ChildRow = {
  childId: number;
  firstName: string;
  lastName: string;
  paid: number;
  all: Contribution[];
  refundedAll: boolean;
  lastPaymentAt: string | null;
  payerNames: string[];
};

type Status = "paid" | "partial" | "waiting" | "refunded";

const STATUS_LABEL: Record<Status, string> = {
  paid: "Zaksięgowana",
  partial: "Częściowo",
  waiting: "Czeka",
  refunded: "Zwrócona",
};

const STATUS_VARIANT: Record<Status, "success" | "warning" | "neutral"> = {
  paid: "success",
  partial: "warning",
  waiting: "warning",
  refunded: "neutral",
};

// Kolejność na liście: opłacone, częściowo, czeka, zwrócone na końcu.
const STATUS_ORDER: Record<Status, number> = {
  paid: 0,
  partial: 1,
  waiting: 2,
  refunded: 3,
};

function buildRows(
  contributions: Contribution[],
  waitingStudents: FundraisingChild[],
  amountPerChild: number,
): ChildRow[] {
  const byChild = new Map<number, ChildRow>();

  for (const c of contributions) {
    let row = byChild.get(c.child.id);
    if (!row) {
      row = {
        childId: c.child.id,
        firstName: c.child.firstName,
        lastName: c.child.lastName,
        paid: 0,
        all: [],
        refundedAll: true,
        lastPaymentAt: null,
        payerNames: [],
      };
      byChild.set(c.child.id, row);
    }
    row.all.push(c);
    if (!c.refunded) {
      row.paid += c.amount;
      row.refundedAll = false;
    }
    if (row.lastPaymentAt == null || c.createdAt > row.lastPaymentAt) {
      row.lastPaymentAt = c.createdAt;
    }
  }

  for (const student of waitingStudents) {
    if (!byChild.has(student.id)) {
      byChild.set(student.id, {
        childId: student.id,
        firstName: student.firstName,
        lastName: student.lastName,
        paid: 0,
        all: [],
        refundedAll: false,
        lastPaymentAt: null,
        payerNames: [],
      });
    }
  }

  return [...byChild.values()]
    .map((row) => ({
      ...row,
      payerNames: [
        ...new Set(
          row.all.map((c) => `${c.payer.firstName} ${c.payer.lastName}`),
        ),
      ],
    }))
    .sort((a, b) => {
      const byStatus =
        STATUS_ORDER[statusOf(a, amountPerChild)] -
        STATUS_ORDER[statusOf(b, amountPerChild)];
      if (byStatus !== 0) {
        return byStatus;
      }
      return `${a.lastName} ${a.firstName}`.localeCompare(
        `${b.lastName} ${b.firstName}`,
        "pl",
      );
    });
}

function statusOf(row: ChildRow, amountPerChild: number): Status {
  if (row.all.length > 0 && row.refundedAll) {
    return "refunded";
  }
  if (amountPerChild > 0 && row.paid >= amountPerChild) {
    return "paid";
  }
  if (row.paid > 0) {
    return "partial";
  }
  return "waiting";
}

function payerLabel(names: string[]): string {
  if (names.length === 0) {
    return "—";
  }
  return names.length === 1 ? names[0] : `${names[0]} +${names.length - 1}`;
}

function FundraisingPaymentsTab({
  fundraisingId,
  amountPerChild,
  waitingStudents,
}: {
  fundraisingId: number;
  amountPerChild: number;
  waitingStudents: FundraisingChild[];
}) {
  const load = React.useCallback(
    () => getFundraisingContributions(fundraisingId),
    [fundraisingId],
  );
  const { data, error, isLoading, reload } = useAsyncData(load);
  const [expanded, setExpanded] = React.useState<number | null>(null);

  const rows =
    data != null ? buildRows(data, waitingStudents, amountPerChild) : [];

  return (
    <DataState
      isLoading={isLoading}
      hasError={error != null}
      isEmpty={rows.length === 0}
      onRetry={reload}
      emptyState={
        <EmptyState
          icon={<ReceiptText />}
          title="Brak dzieci w zbiórce"
          description="Gdy dzieci zaczną wpłacać, pojawią się tutaj."
        />
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-xs text-muted-foreground">
              <th className="py-2 pr-4 font-medium">Dziecko</th>
              <th className="py-2 pr-4 font-medium">Płatnik</th>
              <th className="py-2 pr-4 font-medium">Ostatnia wpłata</th>
              <th className="py-2 pr-4 font-medium">Wpłacono</th>
              <th className="py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const status = statusOf(row, amountPerChild);
              const isOpen = expanded === row.childId;
              const hasDetails = row.all.length > 0;
              return (
                <React.Fragment key={row.childId}>
                  <tr
                    className={`border-b last:border-0 ${hasDetails ? "cursor-pointer hover:bg-muted/50" : ""}`}
                    onClick={() =>
                      hasDetails && setExpanded(isOpen ? null : row.childId)
                    }
                  >
                    <td className="py-3 pr-4 font-medium">
                      <span className="flex items-center gap-2">
                        {hasDetails ? (
                          <ChevronDown
                            aria-hidden
                            className={`size-4 shrink-0 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`}
                          />
                        ) : null}
                        {row.firstName} {row.lastName}
                      </span>
                    </td>
                    <td className="py-3 pr-4">{payerLabel(row.payerNames)}</td>
                    <td className="py-3 pr-4 whitespace-nowrap text-muted-foreground">
                      {row.lastPaymentAt != null
                        ? dateFormatter.format(new Date(row.lastPaymentAt))
                        : "—"}
                    </td>
                    <td className="py-3 pr-4 whitespace-nowrap tabular-nums">
                      <MoneyAmount amount={row.paid} />
                      <span className="text-muted-foreground">
                        {" / "}
                        {formatMoney(amountPerChild)}
                      </span>
                    </td>
                    <td className="py-3">
                      <Badge variant={STATUS_VARIANT[status]}>
                        {STATUS_LABEL[status]}
                      </Badge>
                    </td>
                  </tr>
                  {isOpen
                    ? row.all.map((c) => (
                        <tr
                          key={`detail-${c.id}`}
                          className="border-b bg-muted/30 text-xs"
                        >
                          <td className="py-2 pr-4 pl-8 text-muted-foreground">
                            Wpłata
                          </td>
                          <td className="py-2 pr-4">{`${c.payer.firstName} ${c.payer.lastName}`}</td>
                          <td className="py-2 pr-4 whitespace-nowrap text-muted-foreground">
                            {dateFormatter.format(new Date(c.createdAt))}
                          </td>
                          <td className="py-2 pr-4 tabular-nums">
                            {formatMoney(c.amount)}
                          </td>
                          <td className="py-2">
                            {c.refunded ? "Zwrócona" : "Zaksięgowana"}
                          </td>
                        </tr>
                      ))
                    : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </DataState>
  );
}

export { FundraisingPaymentsTab };
