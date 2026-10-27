import type { Transaction } from "@/lib/wallet"

export type TransactionFilter = "all" | "income" | "outcome" | "refunds"

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

export { matchesFilter }
