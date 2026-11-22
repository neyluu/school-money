import * as React from "react"
import { useNavigate } from "react-router"
import { MaskedInput } from "@/components/masked-input"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { toast } from "@/components/ui/toast"
import { ApiError } from "@/lib/api-client"
import { parseAmount } from "@/lib/amount"
import { describeError } from "@/lib/error-messages"
import { maskAmount } from "@/lib/input-rules"
import { deposit } from "@/lib/wallet"

const MAX_DEPOSIT = 1000000

function TopUpForm({
  onCompleted,
  onCancel,
}: {
  onCompleted: () => void
  onCancel?: () => void
}) {
  const navigate = useNavigate()
  const [amount, setAmount] = React.useState("")
  const [error, setError] = React.useState<string | undefined>()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const parsedAmount = parseAmount(amount)
  const limitError =
    parsedAmount != null && parsedAmount > MAX_DEPOSIT
      ? "Maksymalna kwota doładowania to 1 000 000,00 zł."
      : undefined
  const shownError = limitError ?? error
  const canSubmit = parsedAmount != null && limitError == null

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const parsed = parseAmount(amount)
    if (parsed == null) {
      setError("Podaj poprawną kwotę, np. 50,00.")
      return
    }
    if (parsed > MAX_DEPOSIT) {
      setError("Maksymalna kwota doładowania to 1 000 000,00 zł.")
      return
    }
    setError(undefined)

    setIsSubmitting(true)
    try {
      await deposit(parsed)
      toast.add({
        title: "Konto zostało doładowane.",
        type: "success",
      })
      setAmount("")
      onCompleted()
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 401) {
        navigate("/login", { replace: true })
        return
      }
      if (submitError instanceof ApiError && submitError.status === 400) {
        setError("Podaj poprawną kwotę, np. 50,00.")
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
      <Field data-invalid={shownError != null}>
        <FieldLabel htmlFor="top-up-amount">Kwota</FieldLabel>
        <MaskedInput
          id="top-up-amount"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00 zł"
          value={amount}
          mask={maskAmount}
          onValueChange={(value) => {
            setAmount(value)
            setError(undefined)
          }}
          aria-invalid={shownError != null}
        />
        {shownError != null ? <FieldError>{shownError}</FieldError> : null}
      </Field>
      <div className="flex justify-end gap-2">
        {onCancel != null ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
        ) : null}
        <Button
          type="submit"
          loading={isSubmitting}
          disabled={!canSubmit}
          className="flex-1"
        >
          Wykonaj przelew wirtualny
        </Button>
      </div>
    </form>
  )
}

export { TopUpForm }
