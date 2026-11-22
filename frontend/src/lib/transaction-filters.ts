import type { SegmentedOption } from "@/components/segmented-control"
import type { ContributionFilter, Transaction } from "@/lib/wallet"

export type TransactionFilter = "all" | "income" | "outcome" | "refunds"

const TRANSACTION_FILTER_OPTIONS: SegmentedOption<TransactionFilter>[] = [
  { value: "all", label: "Wszystkie" },
  { value: "income", label: "Wpływy" },
  { value: "outcome", label: "Wydatki" },
  { value: "refunds", label: "Zwroty" },
]

const CONTRIBUTION_FILTER_OPTIONS: SegmentedOption<ContributionFilter>[] = [
  { value: "all", label: "Wszystkie" },
  { value: "completed", label: "Zaksięgowane" },
  { value: "refunded", label: "Zwrócone" },
]

function matchesFilter(
  transaction: Transaction,
  filter: TransactionFilter
): boolean {
  switch (filter) {
    case "all":
      return true
    case "refunds":
      return transaction.type === "REFUND"
    case "income":
      return transaction.incoming && transaction.type !== "REFUND"
    case "outcome":
      return !transaction.incoming && transaction.type !== "REFUND"
  }
}

export {
  CONTRIBUTION_FILTER_OPTIONS,
  matchesFilter,
  TRANSACTION_FILTER_OPTIONS,
}
