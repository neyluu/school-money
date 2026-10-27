import * as React from "react"
import { useNavigate } from "react-router"
import { FileUpload } from "@/components/file-upload"
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
import { parseAmount } from "@/lib/amount"
import { ApiError } from "@/lib/api-client"
import { describeError } from "@/lib/error-messages"
import { addInvoice, withdrawFromFundraising } from "@/lib/fundraising"

const MAX_TITLE_LENGTH = 100
const MAX_FILE_BYTES = 25 * 1024 * 1024
const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "application/pdf"]

type WithdrawErrors = {
  amount?: string
  title?: string
  invoice?: string
}

function WithdrawForm({
  fundraisingId,
  balance,
  onClose,
  onCompleted,
}: {
  fundraisingId: number
  balance: number
  onClose: () => void
  onCompleted: () => void
}) {
  const navigate = useNavigate()
  const [amount, setAmount] = React.useState("")
  const [title, setTitle] = React.useState("")
  const [invoice, setInvoice] = React.useState<File | null>(null)
  const [errors, setErrors] = React.useState<WithdrawErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const nextErrors: WithdrawErrors = {}
    const parsedAmount = parseAmount(amount)

    if (parsedAmount == null) {
      nextErrors.amount = "Podaj poprawną kwotę, np. 50,00."
    } else if (parsedAmount > balance) {
      nextErrors.amount = "Kwota przekracza saldo zbiórki."
    }
    if (title.trim() === "") {
      nextErrors.title = "Podaj opis wydatku."
    } else if (title.trim().length > MAX_TITLE_LENGTH) {
      nextErrors.title = "Opis może mieć maks. 100 znaków."
    }
    if (invoice != null && !ALLOWED_FILE_TYPES.includes(invoice.type)) {
      nextErrors.invoice = "Dozwolone formaty: PNG, JPEG lub PDF."
    } else if (invoice != null && invoice.size > MAX_FILE_BYTES) {
      nextErrors.invoice = "Plik może mieć maks. 25 MB."
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || parsedAmount == null) {
      return
    }

    setIsSubmitting(true)
    try {
      await withdrawFromFundraising(fundraisingId, parsedAmount, title)
    } catch (submitError) {
      handleWithdrawError(submitError)
      setIsSubmitting(false)
      return
    }

    toast.add({
      title: "Wypłata została zrealizowana.",
      type: "success",
    })
    if (invoice != null) {
      try {
        await addInvoice(fundraisingId, invoice, title)
      } catch {
        toast.add({
          title: "Nie udało się dodać faktury. Dodaj ją ponownie później.",
          type: "error",
        })
      }
    }
    setIsSubmitting(false)
    onCompleted()
    onClose()
  }

  function handleWithdrawError(submitError: unknown) {
    if (submitError instanceof ApiError && submitError.status === 401) {
      navigate("/login", { replace: true })
      return
    }
    if (submitError instanceof ApiError && submitError.status === 422) {
      setErrors({ amount: "Kwota przekracza saldo zbiórki." })
      return
    }
    if (submitError instanceof ApiError && submitError.status === 400) {
      const mapped: WithdrawErrors = {}
      if (submitError.fieldErrors?.amount != null) {
        mapped.amount = "Podaj poprawną kwotę, np. 50,00."
      }
      if (submitError.fieldErrors?.title != null) {
        mapped.title = "Podaj opis wydatku (maks. 100 znaków)."
      }
      if (Object.keys(mapped).length > 0) {
        setErrors(mapped)
        return
      }
    }
    if (submitError instanceof ApiError && submitError.status === 409) {
      toast.add({
        title: "Ta zbiórka nie jest już aktywna.",
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
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <Field data-invalid={errors.amount != null}>
        <FieldLabel htmlFor="fundraising-withdraw-amount">Kwota (zł)</FieldLabel>
        <Input
          id="fundraising-withdraw-amount"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="50,00"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          aria-invalid={errors.amount != null}
        />
        <span className="text-xs text-muted-foreground">
          Saldo zbiórki: <MoneyAmount amount={balance} className="text-xs" />
        </span>
        {errors.amount != null ? <FieldError>{errors.amount}</FieldError> : null}
      </Field>
      <Field data-invalid={errors.title != null}>
        <FieldLabel htmlFor="fundraising-withdraw-title">Opis wydatku</FieldLabel>
        <Input
          id="fundraising-withdraw-title"
          type="text"
          autoComplete="off"
          placeholder="Zaliczka za bilety do teatru"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={errors.title != null}
        />
        {errors.title != null ? <FieldError>{errors.title}</FieldError> : null}
      </Field>
      <Field data-invalid={errors.invoice != null}>
        <FieldLabel>Faktura (opcjonalnie)</FieldLabel>
        <FileUpload
          multiple={false}
          accept={ALLOWED_FILE_TYPES.join(",")}
          description="PNG, JPEG lub PDF, maks. 25 MB"
          onFilesChange={(files) => setInvoice(files[0] ?? null)}
        />
        {errors.invoice != null ? <FieldError>{errors.invoice}</FieldError> : null}
      </Field>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Anuluj
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Wypłać
        </Button>
      </div>
    </form>
  )
}

function FundraisingWithdrawDialog({
  open,
  onOpenChange,
  fundraisingId,
  balance,
  onCompleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fundraisingId: number
  balance: number
  onCompleted: () => void
}) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Wypłata ze zbiórki</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Środki trafią na Twój rachunek. Dodaj fakturę, żeby rodzice
            widzieli, na co zostały wydane.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <WithdrawForm
          fundraisingId={fundraisingId}
          balance={balance}
          onClose={() => onOpenChange(false)}
          onCompleted={onCompleted}
        />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}

export { FundraisingWithdrawDialog }
