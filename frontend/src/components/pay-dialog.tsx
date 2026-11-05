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
import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress"
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
import {
  getFundraisingChildren,
  getFundraisingContributions,
  payForFundraising,
} from "@/lib/fundraising"
import type { Contribution, FundraisingChild } from "@/lib/fundraising"
import { formatMoney } from "@/lib/money"
import { getWallet } from "@/lib/wallet"

export type PayPreselect = number | "others"

type PayErrors = {
  child?: string
  amount?: string
}

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "numeric",
  year: "numeric",
})

function studentLabel(student: FundraisingChild): string {
  const name = `${student.firstName} ${student.lastName}`
  if (student.isPaid) {
    return `${name} – opłacone`
  }
  return student.isMine ? `${name} (Twoje dziecko)` : name
}

function toCents(amount: number): number {
  return Math.round(amount * 100)
}

function pickInitialStudent(
  students: FundraisingChild[],
  preselect: PayPreselect | undefined
): FundraisingChild | undefined {
  const unpaid = students.filter((student) => !student.isPaid)

  if (typeof preselect === "number") {
    const chosen = unpaid.find((student) => student.id === preselect)
    if (chosen != null) {
      return chosen
    }
  }
  if (preselect === "others") {
    const other = unpaid.find((student) => !student.isMine)
    if (other != null) {
      return other
    }
  }

  return unpaid.find((student) => student.isMine) ?? unpaid[0]
}

function PaymentStatus({
  student,
  amountPerChild,
  contributions,
}: {
  student: FundraisingChild
  amountPerChild: number
  contributions: Contribution[]
}) {
  const percent =
    amountPerChild > 0 ? Math.min(100, (student.paidAmount / amountPerChild) * 100) : 0
  const payments = contributions.filter(
    (contribution) => contribution.child.id === student.id && !contribution.refunded
  )

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-input p-3">
      <p className="text-sm font-medium">Stan opłaty</p>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Wpłacono</span>
          <MoneyAmount amount={student.paidAmount} className="text-xl" />
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-muted-foreground">Pozostało</span>
          <MoneyAmount amount={student.remainingAmount} className="text-xl" />
        </div>
      </div>
      <Progress value={percent}>
        <ProgressTrack className="h-2">
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
      {payments.length > 0 ? (
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b text-muted-foreground">
              <th className="py-1 pr-2 font-medium">Rodzic</th>
              <th className="py-1 pr-2 font-medium">Data</th>
              <th className="py-1 text-right font-medium">Kwota</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr key={payment.id} className="border-b last:border-0">
                <td className="py-1 pr-2">
                  {payment.payer.firstName.charAt(0)}. {payment.payer.lastName}
                </td>
                <td className="py-1 pr-2 text-muted-foreground">
                  {dateFormatter.format(new Date(payment.createdAt))}
                </td>
                <td className="py-1 text-right tabular-nums">
                  {formatMoney(payment.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-xs text-muted-foreground">
          Za to dziecko nie wpłacono jeszcze nic.
        </p>
      )}
    </div>
  )
}

function PayForm({
  fundraisingId,
  amountPerChild,
  students,
  contributions,
  balance,
  preselect,
  onClose,
  onCompleted,
}: {
  fundraisingId: number
  amountPerChild: number
  students: FundraisingChild[]
  contributions: Contribution[]
  balance: number
  preselect: PayPreselect | undefined
  onClose: () => void
  onCompleted: () => void
}) {
  const navigate = useNavigate()
  const unpaid = students.filter((student) => !student.isPaid)
  const initial = pickInitialStudent(students, preselect)

  const [childId, setChildId] = React.useState(
    initial != null ? String(initial.id) : ""
  )
  const [amount, setAmount] = React.useState(
    initial != null ? formatAmountInput(initial.remainingAmount) : ""
  )
  const [payAll, setPayAll] = React.useState(true)
  const [errors, setErrors] = React.useState<PayErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const selected = students.find((student) => String(student.id) === childId)
  const parsedAmount = parseAmount(amount)
  const isPartial =
    selected != null &&
    parsedAmount != null &&
    toCents(parsedAmount) < toCents(selected.remainingAmount)
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
    setPayAll(true)
    if (student != null) {
      setAmount(formatAmountInput(student.remainingAmount))
    }
  }

  function handlePayAllChange(checked: boolean) {
    setPayAll(checked)
    if (checked && selected != null) {
      setAmount(formatAmountInput(selected.remainingAmount))
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
      nextErrors.amount = "Podaj poprawną kwotę, np. 20,00."
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
      {selected != null ? (
        <PaymentStatus
          student={selected}
          amountPerChild={amountPerChild}
          contributions={contributions}
        />
      ) : null}
      <Field data-invalid={errors.amount != null}>
        <FieldLabel htmlFor="pay-amount">Kwota części (zł)</FieldLabel>
        <Input
          id="pay-amount"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          value={amount}
          disabled={payAll}
          onChange={(event) => setAmount(event.target.value)}
          aria-invalid={errors.amount != null}
        />
        {errors.amount != null ? <FieldError>{errors.amount}</FieldError> : null}
      </Field>
      <Field orientation="horizontal">
        <Checkbox
          id="pay-all"
          checked={payAll}
          onCheckedChange={handlePayAllChange}
        />
        <FieldLabel htmlFor="pay-all">Wpłać całą brakującą kwotę</FieldLabel>
      </Field>
      <p className="text-sm text-muted-foreground">
        Opłata zostanie uznana po wpłacie pełnej kwoty{" "}
        {formatMoney(amountPerChild)}.
      </p>
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
          {isPartial ? "Zapłać część" : "Zapłać"}
        </Button>
      </div>
    </form>
  )
}

function PayLoader({
  fundraisingId,
  amountPerChild,
  preselect,
  onClose,
  onCompleted,
}: {
  fundraisingId: number
  amountPerChild: number
  preselect: PayPreselect | undefined
  onClose: () => void
  onCompleted: () => void
}) {
  const load = React.useCallback(
    () =>
      Promise.all([
        getFundraisingChildren(fundraisingId),
        getFundraisingContributions(fundraisingId),
        getWallet(),
      ]),
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
          amountPerChild={amountPerChild}
          students={data[0]}
          contributions={data[1]}
          balance={data[2].balance}
          preselect={preselect}
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
  amountPerChild,
  preselect,
  onCompleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fundraisingId: number
  fundraisingName: string
  amountPerChild: number
  preselect?: PayPreselect
  onCompleted: () => void
}) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Wpłać na zbiórkę</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {fundraisingName} · {formatMoney(amountPerChild)} od dziecka. Wpłatę
            można podzielić: kilku rodziców może pokryć jedno dziecko.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <PayLoader
          fundraisingId={fundraisingId}
          amountPerChild={amountPerChild}
          preselect={preselect}
          onClose={() => onOpenChange(false)}
          onCompleted={onCompleted}
        />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}

export { PayDialog }
