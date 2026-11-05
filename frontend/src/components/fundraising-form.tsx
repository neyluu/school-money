import * as React from "react"
import { Check } from "lucide-react"
import { FileUpload } from "@/components/file-upload"
import { MoneyAmount } from "@/components/money-amount"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { formatAmountInput, parseAmount } from "@/lib/amount"
import type { ClassSummary } from "@/lib/classes"
import type {
  FundraisingFieldErrors,
  FundraisingInput,
} from "@/lib/fundraising-management"

const FORM_ID = "fundraising-form"
const MAX_NAME_LENGTH = 50
const MAX_DESCRIPTION_LENGTH = 500
const MAX_AMOUNT = 10000
const MAX_LOGO_BYTES = 25 * 1024 * 1024
const LOGO_TYPES = ["image/png", "image/jpeg"]

export type FundraisingFormValues = FundraisingInput & {
  logo: File | null
}

function todayIso(): string {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${now.getFullYear()}-${month}-${day}`
}

function FundraisingForm({
  title,
  subtitleSuffix,
  submitLabel,
  classes,
  lockClass = false,
  initial,
  logoSlot,
  onSubmit,
  onCancel,
}: {
  title: string
  subtitleSuffix: string
  submitLabel: string
  classes: ClassSummary[]
  lockClass?: boolean
  initial?: FundraisingInput
  logoSlot?: React.ReactNode
  onSubmit: (
    values: FundraisingFormValues
  ) => Promise<FundraisingFieldErrors | undefined>
  onCancel: () => void
}) {
  const [classId, setClassId] = React.useState(() =>
    String(initial?.classId ?? classes[0]?.id ?? "")
  )
  const [name, setName] = React.useState(initial?.name ?? "")
  const [description, setDescription] = React.useState(
    initial?.description ?? ""
  )
  const [endDate, setEndDate] = React.useState(initial?.endDate ?? "")
  const [amount, setAmount] = React.useState(
    initial != null ? formatAmountInput(initial.amount) : ""
  )
  const [logo, setLogo] = React.useState<File | null>(null)
  const [errors, setErrors] = React.useState<FundraisingFieldErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const selectedClass = classes.find((item) => String(item.id) === classId)
  const parsedAmount = parseAmount(amount)
  const childrenCount = selectedClass?.childrenCount ?? 0
  const classItems = classes.map((item) => ({
    value: String(item.id),
    label: `${item.name} · ${item.school}`,
  }))

  function validate(): FundraisingFieldErrors {
    const nextErrors: FundraisingFieldErrors = {}

    if (selectedClass == null) {
      nextErrors.classId = "Wybierz klasę."
    }
    if (name.trim() === "") {
      nextErrors.name = "Podaj cel zbiórki."
    } else if (name.trim().length > MAX_NAME_LENGTH) {
      nextErrors.name = "Cel może mieć maks. 50 znaków."
    }
    if (description.trim() === "") {
      nextErrors.description = "Dodaj krótki opis."
    } else if (description.trim().length > MAX_DESCRIPTION_LENGTH) {
      nextErrors.description = "Opis może mieć maks. 500 znaków."
    }
    if (endDate === "") {
      nextErrors.endDate = "Podaj datę końca."
    } else if (endDate <= todayIso()) {
      nextErrors.endDate = "Data końca musi być w przyszłości."
    }
    if (parsedAmount == null) {
      nextErrors.amount = "Podaj poprawną kwotę, np. 45,00."
    } else if (parsedAmount > MAX_AMOUNT) {
      nextErrors.amount = "Maksymalna kwota to 10 000,00 zł."
    }
    if (logo != null && !LOGO_TYPES.includes(logo.type)) {
      nextErrors.logo = "Dozwolone formaty: PNG lub JPEG."
    } else if (logo != null && logo.size > MAX_LOGO_BYTES) {
      nextErrors.logo = "Plik może mieć maks. 25 MB."
    }

    return nextErrors
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const nextErrors = validate()
    setErrors(nextErrors)
    if (
      Object.keys(nextErrors).length > 0 ||
      selectedClass == null ||
      parsedAmount == null
    ) {
      return
    }

    setIsSubmitting(true)
    const serverErrors = await onSubmit({
      classId: selectedClass.id,
      name,
      description,
      endDate,
      amount: parsedAmount,
      logo,
    })
    setIsSubmitting(false)
    if (serverErrors != null) {
      setErrors(serverErrors)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{title}</h1>
          {selectedClass != null ? (
            <p className="text-sm text-muted-foreground">
              Klasa {selectedClass.name} · {subtitleSuffix}
            </p>
          ) : null}
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
          <Button type="submit" form={FORM_ID} loading={isSubmitting}>
            <Check />
            {submitLabel}
          </Button>
        </div>
      </div>
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        noValidate
        className="grid gap-4 lg:grid-cols-[2fr_1fr] lg:items-start"
      >
        <Card>
          <CardContent className="flex flex-col gap-5">
            {!lockClass && classes.length > 1 ? (
              <Field data-invalid={errors.classId != null}>
                <FieldLabel htmlFor="fundraising-class">Klasa</FieldLabel>
                <Select
                  items={classItems}
                  value={classId}
                  onValueChange={(value) => setClassId(value ?? "")}
                >
                  <SelectTrigger
                    id="fundraising-class"
                    className="w-full"
                    aria-invalid={errors.classId != null}
                  >
                    <SelectValue placeholder="Wybierz klasę" />
                  </SelectTrigger>
                  <SelectContent>
                    {classItems.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.classId != null ? (
                  <FieldError>{errors.classId}</FieldError>
                ) : null}
              </Field>
            ) : null}
            <Field data-invalid={errors.name != null}>
              <FieldLabel htmlFor="fundraising-name">Cel zbiórki</FieldLabel>
              <Input
                id="fundraising-name"
                type="text"
                autoComplete="off"
                placeholder="np. Wyjście do teatru"
                value={name}
                onChange={(event) => setName(event.target.value)}
                aria-invalid={errors.name != null}
              />
              {errors.name != null ? <FieldError>{errors.name}</FieldError> : null}
            </Field>
            <Field data-invalid={errors.description != null}>
              <FieldLabel htmlFor="fundraising-description">
                Krótki opis
              </FieldLabel>
              <Textarea
                id="fundraising-description"
                rows={4}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                aria-invalid={errors.description != null}
              />
              {errors.description != null ? (
                <FieldError>{errors.description}</FieldError>
              ) : null}
            </Field>
            <Field data-invalid={errors.endDate != null}>
              <FieldLabel htmlFor="fundraising-end-date">Data końca</FieldLabel>
              <Input
                id="fundraising-end-date"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                aria-invalid={errors.endDate != null}
              />
              {errors.endDate != null ? (
                <FieldError>{errors.endDate}</FieldError>
              ) : null}
            </Field>
            <Field data-invalid={errors.logo != null}>
              <FieldLabel>Logo</FieldLabel>
              {logoSlot}
              <FileUpload
                multiple={false}
                accept={LOGO_TYPES.join(",")}
                description="PNG lub JPEG, maks. 25 MB"
                onFilesChange={(files) => setLogo(files[0] ?? null)}
              />
              {errors.logo != null ? <FieldError>{errors.logo}</FieldError> : null}
            </Field>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Płatność</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Field data-invalid={errors.amount != null}>
              <FieldLabel htmlFor="fundraising-amount">
                Kwota od dziecka (zł)
              </FieldLabel>
              <Input
                id="fundraising-amount"
                type="text"
                inputMode="decimal"
                autoComplete="off"
                placeholder="0,00"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                aria-invalid={errors.amount != null}
              />
              {errors.amount != null ? (
                <FieldError>{errors.amount}</FieldError>
              ) : null}
            </Field>
            <p className="text-sm text-muted-foreground">
              Każde dziecko wpłaca tę samą kwotę. Zbiórka nie ma celu
              finansowego. Dostanie własny rachunek (IBAN).
            </p>
            <dl className="flex flex-col gap-2 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Dzieci w klasie</dt>
                <dd className="font-semibold">{childrenCount}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Zbierana kwota</dt>
                <dd>
                  {parsedAmount != null ? (
                    <MoneyAmount
                      amount={Math.round(parsedAmount * childrenCount * 100) / 100}
                    />
                  ) : (
                    <span className="font-semibold">kwota × {childrenCount}</span>
                  )}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export { FundraisingForm }
