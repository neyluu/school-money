import * as React from "react"
import { useNavigate } from "react-router"
import { ArrowUpRight } from "lucide-react"
import { MaskedInput } from "@/components/masked-input"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { ApiError } from "@/lib/api-client"
import { parseAmount } from "@/lib/amount"
import { describeError } from "@/lib/error-messages"
import { isIbanValid } from "@/lib/iban"
import { IBAN_DIGITS, maskAmount, maskIban } from "@/lib/input-rules"
import { formatMoney } from "@/lib/money"
import { withdraw } from "@/lib/wallet"

const MAX_RECIPIENT_NAME_LENGTH = 100

type WithdrawErrors = {
  recipientName?: string
  iban?: string
  amount?: string
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

function WithdrawForm({
  balance,
  onCompleted,
  onCancel,
}: {
  balance: number
  onCompleted: () => void
  onCancel?: () => void
}) {
  const navigate = useNavigate()
  const [recipientName, setRecipientName] = React.useState("")
  const [iban, setIban] = React.useState("")
  const [amount, setAmount] = React.useState("")
  const [errors, setErrors] = React.useState<WithdrawErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const hasFunds = balance > 0
  const parsed = parseAmount(amount)
  const amountError =
    parsed != null && parsed > balance
      ? `Możesz wypłacić najwyżej ${formatMoney(balance)}.`
      : errors.amount
  const ibanDigits = iban.replace(/\D/g, "").length
  const canSubmit =
    recipientName.trim() !== "" &&
    isIbanValid(iban) &&
    parsed != null &&
    parsed <= balance

  function clearError(field: keyof WithdrawErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }))
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
      setRecipientName("")
      setIban("")
      setAmount("")
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
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Field data-invalid={errors.recipientName != null}>
        <FieldLabel htmlFor="withdraw-recipient">Nazwa odbiorcy</FieldLabel>
        <Input
          id="withdraw-recipient"
          type="text"
          autoComplete="off"
          placeholder="Jan Kowalski"
          maxLength={MAX_RECIPIENT_NAME_LENGTH}
          value={recipientName}
          onChange={(event) => {
            setRecipientName(event.target.value)
            clearError("recipientName")
          }}
          aria-invalid={errors.recipientName != null}
        />
        {errors.recipientName != null ? (
          <FieldError>{errors.recipientName}</FieldError>
        ) : null}
      </Field>
      <Field data-invalid={errors.iban != null}>
        <FieldLabel htmlFor="withdraw-iban">Rachunek docelowy (IBAN)</FieldLabel>
        <MaskedInput
          id="withdraw-iban"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="PL…"
          value={iban}
          mask={maskIban}
          onValueChange={(value) => {
            setIban(value)
            clearError("iban")
          }}
          aria-invalid={errors.iban != null}
        />
        {errors.iban != null ? (
          <FieldError>{errors.iban}</FieldError>
        ) : iban !== "" && ibanDigits < IBAN_DIGITS ? (
          <FieldDescription className="text-xs">
            Wpisano {ibanDigits} z {IBAN_DIGITS} cyfr.
          </FieldDescription>
        ) : null}
      </Field>
      <Field data-invalid={amountError != null}>
        <FieldLabel htmlFor="withdraw-amount">Kwota</FieldLabel>
        <MaskedInput
          id="withdraw-amount"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00 zł"
          value={amount}
          disabled={!hasFunds}
          mask={maskAmount}
          onValueChange={(value) => {
            setAmount(value)
            clearError("amount")
          }}
          aria-invalid={amountError != null}
        />
        {!hasFunds ? (
          <FieldDescription className="text-xs">
            Brak środków do wypłaty.
          </FieldDescription>
        ) : amountError != null ? (
          <FieldError>{amountError}</FieldError>
        ) : null}
      </Field>
      <div className="flex justify-end gap-2">
        {onCancel != null ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
        ) : null}
        <Button
          type="submit"
          variant="outline"
          loading={isSubmitting}
          disabled={!canSubmit}
          className="flex-1"
        >
          <ArrowUpRight />
          Wypłać
        </Button>
      </div>
    </form>
  )
}

export { WithdrawForm }
