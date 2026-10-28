import * as React from "react"
import { useNavigate } from "react-router"
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
import { ApiError } from "@/lib/api-client"
import { parseAmount } from "@/lib/amount"
import { describeError } from "@/lib/error-messages"
import { formatIban, isIbanValid } from "@/lib/iban"
import { withdraw } from "@/lib/wallet"

const MAX_RECIPIENT_NAME_LENGTH = 100
const MAX_FORMATTED_IBAN_LENGTH = 34

type WithdrawErrors = {
  recipientName?: string
  iban?: string
  amount?: string
}

function WithdrawDialog({
  open,
  onOpenChange,
  balance,
  onCompleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  balance: number
  onCompleted: () => void
}) {
  const navigate = useNavigate()
  const [recipientName, setRecipientName] = React.useState("")
  const [iban, setIban] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [errors, setErrors] = React.useState<WithdrawErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setRecipientName("")
      setIban("")
      setAmount("")
      setErrors({})
    }
    onOpenChange(nextOpen)
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const nextErrors: WithdrawErrors = {}
    const parsedAmount = parseAmount(amount)

    if (recipientName.trim() === "") {
      nextErrors.recipientName = "Podaj nazwę odbiorcy."
    } else if (recipientName.trim().length > MAX_RECIPIENT_NAME_LENGTH) {
      nextErrors.recipientName = "Nazwa odbiorcy może mieć maks. 100 znaków."
    }
    if (!isIbanValid(iban)) {
      nextErrors.iban = "Podaj numer w formacie PL oraz 26 cyfr."
    }
    if (parsedAmount == null) {
      nextErrors.amount = "Podaj poprawną kwotę, np. 50,00."
    } else if (parsedAmount > balance) {
      nextErrors.amount = "Kwota przekracza dostępne środki."
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || parsedAmount == null) {
      return
    }

    setIsSubmitting(true)
    try {
      await withdraw({ recipientName, iban, amount: parsedAmount })
      toast.add({
        title: "Wypłata została zlecona.",
        type: "success",
      })
      handleOpenChange(false)
      onCompleted()
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 401) {
        navigate("/login", { replace: true })
        return
      }
      const serverErrors = mapServerErrors(submitError)
      if (serverErrors != null) {
        setErrors(serverErrors)
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
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Wypłać środki</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Przelew na zewnętrzny rachunek bankowy. Dostępne środki:{" "}
            <MoneyAmount amount={balance} className="text-sm" />
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <Field data-invalid={errors.recipientName != null}>
            <FieldLabel htmlFor="withdraw-recipient">
              Nazwa odbiorcy
            </FieldLabel>
            <Input
              id="withdraw-recipient"
              type="text"
              autoComplete="off"
              placeholder="Jan Kowalski"
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              aria-invalid={errors.recipientName != null}
            />
            {errors.recipientName != null ? (
              <FieldError>{errors.recipientName}</FieldError>
            ) : null}
          </Field>
          <Field data-invalid={errors.iban != null}>
            <FieldLabel htmlFor="withdraw-iban">Numer rachunku (IBAN)</FieldLabel>
            <Input
              id="withdraw-iban"
              type="text"
              autoComplete="off"
              placeholder="PL00 0000 0000 0000 0000 0000 0000"
              maxLength={MAX_FORMATTED_IBAN_LENGTH}
              value={iban}
              onChange={(event) => setIban(event.target.value)}
              onBlur={() => setIban(formatIban(iban))}
              aria-invalid={errors.iban != null}
            />
            {errors.iban != null ? <FieldError>{errors.iban}</FieldError> : null}
          </Field>
          <Field data-invalid={errors.amount != null}>
            <FieldLabel htmlFor="withdraw-amount">Kwota (zł)</FieldLabel>
            <Input
              id="withdraw-amount"
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="50,00"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              aria-invalid={errors.amount != null}
            />
            {errors.amount != null ? (
              <FieldError>{errors.amount}</FieldError>
            ) : null}
          </Field>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
            >
              Anuluj
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Wypłać
            </Button>
          </div>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}

function mapServerErrors(error: unknown): WithdrawErrors | null {
  if (!(error instanceof ApiError)) {
    return null
  }
  if (error.status === 422) {
    return { amount: "Kwota przekracza dostępne środki." }
  }
  if (error.status !== 400) {
    return null
  }

  const fieldErrors = error.fieldErrors
  if (fieldErrors == null) {
    return { iban: "Wypłata jest możliwa tylko na rachunek zewnętrzny." }
  }

  const mapped: WithdrawErrors = {}
  if (fieldErrors.recipientName != null) {
    mapped.recipientName = "Podaj poprawną nazwę odbiorcy."
  }
  if (fieldErrors.iban != null) {
    mapped.iban = "Podaj numer w formacie PL oraz 26 cyfr."
  }
  if (fieldErrors.amount != null) {
    mapped.amount = "Podaj poprawną kwotę, np. 50,00."
  }
  return Object.keys(mapped).length > 0 ? mapped : null
}

export { WithdrawDialog }
