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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "@/components/ui/toast"
import { useAsyncData } from "@/hooks/use-async-data"
import { formatAmountInput, parseAmount } from "@/lib/amount"
import { ApiError } from "@/lib/api-client"
import { describeError } from "@/lib/error-messages"
import { getFundraisingChildren, payForFundraising } from "@/lib/fundraising"
import type { FundraisingChild } from "@/lib/fundraising"
import { getWallet } from "@/lib/wallet"

type PayErrors = {
  child?: string
  amount?: string
}

function studentLabel(student: FundraisingChild): string {
  const name = `${student.firstName} ${student.lastName}`
  if (student.isPaid) {
    return `${name} – opłacone`
  }
  return student.isMine ? `${name} (Twoje dziecko)` : name
}

function PayForm({
  fundraisingId,
  students,
  balance,
  onClose,
  onCompleted,
}: {
  fundraisingId: number
  students: FundraisingChild[]
  balance: number
  onClose: () => void
  onCompleted: () => void
}) {
  const navigate = useNavigate()
  const unpaid = students.filter((student) => !student.isPaid)
  const initial = unpaid.find((student) => student.isMine) ?? unpaid[0]

  const [childId, setChildId] = React.useState(
    initial != null ? String(initial.id) : ""
  )
  const [amount, setAmount] = React.useState(
    initial != null ? formatAmountInput(initial.remainingAmount) : ""
  )
  const [errors, setErrors] = React.useState<PayErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const selected = students.find((student) => String(student.id) === childId)
  const parsedAmount = parseAmount(amount)
  const items = students.map((student) => ({
    value: String(student.id),
    label: studentLabel(student),
  }))

  function handleChildChange(value: string | null) {
    if (value == null) {
      return
    }
    const student = students.find((candidate) => String(candidate.id) === value)
    setChildId(value)
    setErrors({})
    if (student != null) {
      setAmount(formatAmountInput(student.remainingAmount))
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const nextErrors: PayErrors = {}
    if (selected == null) {
      nextErrors.child = "Wybierz ucznia."
    }
    if (parsedAmount == null) {
      nextErrors.amount = "Podaj poprawną kwotę, np. 50,00."
    } else if (selected != null && parsedAmount > selected.remainingAmount) {
      nextErrors.amount = "Kwota przekracza pozostałą do zapłaty."
    } else if (parsedAmount > balance) {
      nextErrors.amount = "Kwota przekracza dostępne środki."
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || selected == null || parsedAmount == null) {
      return
    }

    setIsSubmitting(true)
    try {
      await payForFundraising(fundraisingId, selected.id, parsedAmount)
      toast.add({
        title: "Wpłata została zaksięgowana.",
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
        setErrors({ amount: "Kwota przekracza dostępne środki." })
        return
      }
      if (submitError instanceof ApiError && submitError.status === 400) {
        setErrors({ amount: "Kwota przekracza pozostałą do zapłaty." })
        return
      }
      if (submitError instanceof ApiError && submitError.status === 409) {
        toast.add({
          title: "Ta zbiórka nie przyjmuje już wpłat za wybranego ucznia.",
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

  if (unpaid.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Wszyscy uczniowie mają już opłaconą tę zbiórkę.
        </p>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Zamknij
          </Button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Field data-invalid={errors.child != null}>
        <FieldLabel htmlFor="pay-child">Za ucznia</FieldLabel>
        <Select items={items} value={childId} onValueChange={handleChildChange}>
          <SelectTrigger
            id="pay-child"
            className="w-full"
            aria-invalid={errors.child != null}
          >
            <SelectValue placeholder="Wybierz ucznia" />
          </SelectTrigger>
          <SelectContent>
            {students.map((student) => (
              <SelectItem
                key={student.id}
                value={String(student.id)}
                disabled={student.isPaid}
              >
                {studentLabel(student)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.child != null ? <FieldError>{errors.child}</FieldError> : null}
      </Field>
      <Field data-invalid={errors.amount != null}>
        <FieldLabel htmlFor="pay-amount">Kwota (zł)</FieldLabel>
        <Input
          id="pay-amount"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          aria-invalid={errors.amount != null}
        />
        {selected != null ? (
          <span className="text-xs text-muted-foreground">
            Pozostało do zapłaty:{" "}
            <MoneyAmount
              amount={selected.remainingAmount}
              className="text-xs"
            />
          </span>
        ) : null}
        {errors.amount != null ? <FieldError>{errors.amount}</FieldError> : null}
      </Field>
      <dl className="flex flex-col gap-2 rounded-lg bg-muted p-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Saldo rachunku</dt>
          <dd>
            <MoneyAmount amount={balance} />
          </dd>
        </div>
        <div className="flex items-center justify-between gap-2">
          <dt className="text-muted-foreground">Do pobrania z rachunku</dt>
          <dd>
            <MoneyAmount amount={-(parsedAmount ?? 0)} />
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
          Zapłać
        </Button>
      </div>
    </form>
  )
}

function PayLoader({
  fundraisingId,
  onClose,
  onCompleted,
}: {
  fundraisingId: number
  onClose: () => void
  onCompleted: () => void
}) {
  const load = React.useCallback(
    () =>
      Promise.all([getFundraisingChildren(fundraisingId), getWallet()]),
    [fundraisingId]
  )
  const { data, error, isLoading, reload } = useAsyncData(load)

  return (
    <DataState
      isLoading={isLoading}
      hasError={error != null}
      isEmpty={false}
      emptyState={null}
      onRetry={reload}
    >
      {data != null ? (
        <PayForm
          fundraisingId={fundraisingId}
          students={data[0]}
          balance={data[1].balance}
          onClose={onClose}
          onCompleted={onCompleted}
        />
      ) : null}
    </DataState>
  )
}

function PayDialog({
  open,
  onOpenChange,
  fundraisingId,
  fundraisingName,
  onCompleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fundraisingId: number
  fundraisingName: string
  onCompleted: () => void
}) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Wpłata na zbiórkę</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {fundraisingName}. Kwota zostanie pobrana z Twojego wirtualnego
            rachunku.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <PayLoader
          fundraisingId={fundraisingId}
          onClose={() => onOpenChange(false)}
          onCompleted={onCompleted}
        />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}

export { PayDialog }
