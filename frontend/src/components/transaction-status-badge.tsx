import { Badge } from "@/components/ui/badge"
import type { TransactionStatus } from "@/lib/wallet"

const STATUS_BADGES: Record<
  TransactionStatus,
  { variant: "success" | "warning" | "danger"; label: string }
> = {
  COMPLETED: { variant: "success", label: "Zaksięgowana" },
  PENDING: { variant: "warning", label: "Oczekuje" },
  FAILED: { variant: "danger", label: "Odrzucona" },
}

function TransactionStatusBadge({ status }: { status: TransactionStatus }) {
  const badge = STATUS_BADGES[status]
  return <Badge variant={badge.variant}>{badge.label}</Badge>
}

export { TransactionStatusBadge }
