import * as React from "react"
import { useNavigate } from "react-router"
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
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { useAsyncData } from "@/hooks/use-async-data"
import { formatAmountInput, parseAmount } from "@/lib/amount"
import { ApiError } from "@/lib/api-client"
import { describeError } from "@/lib/error-messages"
import { replenishFundraising } from "@/lib/fundraising-closing"
import { getWallet } from "@/lib/wallet"

function ReplenishForm({
  fundraisingId,
  outstanding,
  balance,
  onClose,
  onCompleted,
}: {
  fundraisingId: number
  outstanding: number
  balance: number
  onClose: () => void
  onCompleted: () => void
}) {
  const navigate = useNavigate()
  const [amount, setAmount] = React.useState(formatAmountInput(outstanding))
  const [error, setError] = React.useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const parsedAmount = parseAmount(amount)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    if (parsedAmount == null) {
      setError("Podaj poprawną kwotę, np. 50,00.")
      return
    }
    if (parsedAmount > outstanding) {
      setError("Kwota przekracza wypłaconą kwotę.")
      return
    }
    if (parsedAmount > balance) {
      setError("Kwota przekracza dostępne środki na Twoim rachunku.")
      return
    }
    setError(undefined)

    setIsSubmitting(true)
    try {
      await replenishFundraising(fundraisingId, parsedAmount)
      toast.add({
        title: "Środki wróciły na rachunek zbiórki.",
        type: "success",
      })
      onCompleted()
      onClose()
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 401) {
        navigate("/login", { replace: true })
        return
      }
      if (submitError instanceof ApiError && submitError.status === 422) {
        setError("Kwota przekracza dostępne środki na Twoim rachunku.")
        return
      }
      if (submitError instanceof ApiError && submitError.status === 400) {
        setError("Kwota przekracza wypłaconą kwotę.")
        return
      }
      if (submitError instanceof ApiError && submitError.status === 409) {
        toast.add({
          title: "Nie ma już czego zwracać albo zbiórka nie jest aktywna.",
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

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Field data-invalid={error != null}>
        <FieldLabel htmlFor="replenish-amount">Kwota (zł)</FieldLabel>
        <Input
          id="replenish-amount"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          aria-invalid={error != null}
        />
        {error != null ? <FieldError>{error}</FieldError> : null}
      </Field>
      <dl className="flex flex-col gap-2 rounded-lg bg-muted p-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Wypłacono ze zbiórki</dt>
          <dd>
            <MoneyAmount amount={outstanding} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Saldo Twojego rachunku</dt>
          <dd>
            <MoneyAmount amount={balance} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2 border-t pt-2">
          <dt className="text-muted-foreground">Saldo po wpłacie</dt>
          <dd>
            <MoneyAmount amount={balance - (parsedAmount ?? 0)} />
          </dd>
        </div>
      </dl>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Anuluj
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Wpłać z powrotem
        </Button>
      </div>
    </form>
  )
}

function ReplenishLoader({
  fundraisingId,
  outstanding,
  onClose,
  onCompleted,
}: {
  fundraisingId: number
  outstanding: number
  onClose: () => void
  onCompleted: () => void
}) {
  const { data, error, isLoading, reload } = useAsyncData(getWallet)

  return (
    <DataState
      isLoading={isLoading}
      hasError={error != null}
      isEmpty={false}
      emptyState={null}
      onRetry={reload}
    >
      {data != null ? (
        <ReplenishForm
          fundraisingId={fundraisingId}
          outstanding={outstanding}
          balance={data.balance}
          onClose={onClose}
          onCompleted={onCompleted}
        />
      ) : null}
    </DataState>
  )
}

function ReplenishDialog({
  open,
  onOpenChange,
  fundraisingId,
  outstanding,
  onCompleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fundraisingId: number
  outstanding: number
  onCompleted: () => void
}) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Wpłać z powrotem po wypłacie</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Zwrot wcześniej wypłaconych środków na rachunek zbiórki. Nie
            możesz zwrócić więcej, niż wypłaciłeś.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <ReplenishLoader
          fundraisingId={fundraisingId}
          outstanding={outstanding}
          onClose={() => onOpenChange(false)}
          onCompleted={onCompleted}
        />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}

export { ReplenishDialog }
