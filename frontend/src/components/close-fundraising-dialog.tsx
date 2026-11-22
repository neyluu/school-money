import * as React from "react"
import { useNavigate } from "react-router"
import { RotateCcw } from "lucide-react"
import { DataState } from "@/components/data-state"
import { MoneyAmount } from "@/components/money-amount"
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/responsive-dialog"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { useAsyncData } from "@/hooks/use-async-data"
import { ApiError } from "@/lib/api-client"
import { describeError } from "@/lib/error-messages"
import { getFundraisingContributions } from "@/lib/fundraising"
import type { Contribution } from "@/lib/fundraising"
import { closeFundraising, refundFundraising } from "@/lib/fundraising-closing"
import { formatMoney } from "@/lib/money"

const MAX_PREVIEW_ROWS = 5

type CloseMode = "refund" | "close" | "shortfall"

type PayerRefund = {
  id: number
  name: string
  amount: number
}

function toCents(amount: number): number {
  return Math.round(amount * 100)
}

function resolveMode(walletBalance: number, collectedAmount: number): CloseMode {
  if (toCents(walletBalance) === 0) {
    return "close"
  }
  return toCents(walletBalance) >= toCents(collectedAmount) ? "refund" : "shortfall"
}

function groupByPayer(contributions: Contribution[]): PayerRefund[] {
  const payers = new Map<number, PayerRefund>()

  for (const contribution of contributions) {
    if (contribution.refunded) {
      continue
    }
    const { payer } = contribution
    const existing = payers.get(payer.id)
    if (existing != null) {
      existing.amount += contribution.amount
    } else {
      payers.set(payer.id, {
        id: payer.id,
        name: `${payer.firstName.charAt(0)}. ${payer.lastName}`,
        amount: contribution.amount,
      })
    }
  }

  return [...payers.values()].sort((a, b) => a.name.localeCompare(b.name, "pl"))
}

function useCloseHandlers({
  onClose,
  onCompleted,
}: {
  onClose: () => void
  onCompleted: () => void
}) {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function run(action: () => Promise<unknown>, successTitle: string) {
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    try {
      await action()
      toast.add({ title: successTitle, type: "success" })
      onCompleted()
      onClose()
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 401) {
        navigate("/login", { replace: true })
        return
      }
      if (submitError instanceof ApiError && submitError.status === 409) {
        toast.add({
          title: "Saldo zbiórki zmieniło się. Sprawdź je i spróbuj ponownie.",
          type: "error",
        })
        onCompleted()
        onClose()
        return
      }
      toast.add({
        title: describeError(submitError),
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return { isSubmitting, run }
}

function RefundPreview({
  fundraisingId,
  collectedAmount,
  onClose,
  onCompleted,
}: {
  fundraisingId: number
  collectedAmount: number
  onClose: () => void
  onCompleted: () => void
}) {
  const load = React.useCallback(
    () => getFundraisingContributions(fundraisingId),
    [fundraisingId]
  )
  const { data, error, isLoading, reload } = useAsyncData(load)
  const { isSubmitting, run } = useCloseHandlers({ onClose, onCompleted })

  const payers = groupByPayer(data ?? [])
  const hiddenPayers = Math.max(0, payers.length - MAX_PREVIEW_ROWS)

  return (
    <DataState
      isLoading={isLoading}
      hasError={error != null}
      isEmpty={false}
      emptyState={null}
      onRetry={reload}
    >
      <div className="flex flex-col gap-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-xs text-muted-foreground">
                <th className="py-2 pr-4 font-medium">Rodzic</th>
                <th className="py-2 text-right font-medium">Zwrot</th>
              </tr>
            </thead>
            <tbody>
              {payers.slice(0, MAX_PREVIEW_ROWS).map((payer) => (
                <tr key={payer.id} className="border-b last:border-0">
                  <td className="py-2 pr-4">{payer.name}</td>
                  <td className="py-2 text-right tabular-nums">
                    {formatMoney(payer.amount)}
                  </td>
                </tr>
              ))}
              {hiddenPayers > 0 ? (
                <tr>
                  <td className="py-2 text-muted-foreground" colSpan={2}>
                    … +{hiddenPayers}
                  </td>
                </tr>
              ) : null}
              {payers.length === 0 ? (
                <tr>
                  <td className="py-2 text-muted-foreground" colSpan={2}>
                    Brak wpłat do zwrotu.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between gap-2 text-sm">
          <span className="text-muted-foreground">Do zwrotu</span>
          <MoneyAmount amount={collectedAmount} />
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Anuluj
          </Button>
          <Button
            loading={isSubmitting}
            onClick={() =>
              run(
                () => refundFundraising(fundraisingId),
                "Zbiórka została zamknięta, wpłaty zwrócono."
              )
            }
          >
            <RotateCcw />
            Zamknij i zwróć
          </Button>
        </div>
      </div>
    </DataState>
  )
}

function CloseWithoutRefund({
  fundraisingId,
  onClose,
  onCompleted,
}: {
  fundraisingId: number
  onClose: () => void
  onCompleted: () => void
}) {
  const { isSubmitting, run } = useCloseHandlers({ onClose, onCompleted })

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Rachunek zbiórki jest pusty, więc nie ma czego zwracać. Po zamknięciu
        zbiórka nie przyjmie już wpłat.
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Anuluj
        </Button>
        <Button
          loading={isSubmitting}
          onClick={() =>
            run(() => closeFundraising(fundraisingId), "Zbiórka została zamknięta.")
          }
        >
          Zamknij zbiórkę
        </Button>
      </div>
    </div>
  )
}

function Shortfall({
  shortfall,
  onClose,
  onReplenish,
}: {
  shortfall: number
  onClose: () => void
  onReplenish: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm">
        Na rachunku zbiórki brakuje{" "}
        <MoneyAmount amount={shortfall} className="text-sm" /> do zwrotu
        wszystkich wpłat, bo część środków została wypłacona. Wpłać z powrotem
        wypłaconą kwotę albo wypłać pozostałe saldo i zamknij zbiórkę bez
        zwrotu.
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Anuluj
        </Button>
        <Button
          onClick={() => {
            onClose()
            onReplenish()
          }}
        >
          Wpłać z powrotem
        </Button>
      </div>
    </div>
  )
}

function CloseFundraisingDialog({
  open,
  onOpenChange,
  fundraisingId,
  walletBalance,
  collectedAmount,
  onReplenish,
  onCompleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fundraisingId: number
  walletBalance: number
  collectedAmount: number
  onReplenish: () => void
  onCompleted: () => void
}) {
  const mode = resolveMode(walletBalance, collectedAmount)
  const close = () => onOpenChange(false)

  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Zamknąć zbiórkę?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {mode === "refund"
              ? "Pozostałe środki wrócą automatycznie na konta rodziców."
              : "Zamknięcia zbiórki nie można cofnąć."}
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        {mode === "refund" ? (
          <RefundPreview
            fundraisingId={fundraisingId}
            collectedAmount={collectedAmount}
            onClose={close}
            onCompleted={onCompleted}
          />
        ) : null}
        {mode === "close" ? (
          <CloseWithoutRefund
            fundraisingId={fundraisingId}
            onClose={close}
            onCompleted={onCompleted}
          />
        ) : null}
        {mode === "shortfall" ? (
          <Shortfall
            shortfall={Math.round((collectedAmount - walletBalance) * 100) / 100}
            onClose={close}
            onReplenish={onReplenish}
          />
        ) : null}
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}

export { CloseFundraisingDialog }
