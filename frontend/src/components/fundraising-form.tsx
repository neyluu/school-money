import * as React from "react"
import { Check } from "lucide-react"
import { FileUpload } from "@/components/file-upload"
import { PageHeader } from "@/components/page-header"
import { Section } from "@/components/section"
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
import { Textarea } from "@/components/ui/textarea"
import { formatAmountInput, parseAmount } from "@/lib/amount"
import type { ClassSummary } from "@/lib/classes"
import type {
  FundraisingFieldErrors,
  FundraisingInput,
} from "@/lib/fundraising-management"
import { formatMoney } from "@/lib/money"

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
  description,
  backTo,
  submitLabel,
  classes,
  lockClass = false,
  initial,
  logoSlot,
  onSubmit,
  onCancel,
}: {
  title: string
  description: string
  backTo: string
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
  const [text, setText] = React.useState(initial?.description ?? "")
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
  const showClassSelect = !lockClass && classes.length > 1
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
      nextErrors.name = "Wpisz, na co zbieracie."
    } else if (name.trim().length > MAX_NAME_LENGTH) {
      nextErrors.name = "Cel może mieć maks. 50 znaków."
    }
    if (text.trim() === "") {
      nextErrors.description = "Dodaj kilka słów o zbiórce."
    } else if (text.trim().length > MAX_DESCRIPTION_LENGTH) {
      nextErrors.description = "Opis może mieć maks. 500 znaków."
    }
    if (endDate === "") {
      nextErrors.endDate = "Wybierz datę końca."
    } else if (endDate <= todayIso()) {
      nextErrors.endDate = "Data końca musi być w przyszłości."
    }
    if (parsedAmount == null) {
      nextErrors.amount = "Podaj kwotę, np. 45,00."
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
      description: text,
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
      <PageHeader
        backTo={backTo}
        backLabel="Zbiórki"
        title={title}
        description={description}
        actions={
          <>
            <Button type="button" variant="outline" onClick={onCancel}>
              Anuluj
            </Button>
            <Button type="submit" form={FORM_ID} loading={isSubmitting}>
              <Check />
              {submitLabel}
            </Button>
          </>
        }
      />
      <form
        id={FORM_ID}
        onSubmit={handleSubmit}
        noValidate
        className="grid gap-6 lg:grid-cols-[3fr_2fr] lg:items-start"
      >
        <Section title="O zbiórce">
          <div className="flex flex-col gap-5">
            {showClassSelect ? (
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
            ) : selectedClass != null ? (
              <p className="text-sm text-muted-foreground">
                Klasa {selectedClass.name} · {selectedClass.school}
              </p>
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
                placeholder="Na co pójdą pieniądze i kiedy będą potrzebne?"
                value={text}
                onChange={(event) => setText(event.target.value)}
                aria-invalid={errors.description != null}
              />
              {errors.description != null ? (
                <FieldError>{errors.description}</FieldError>
              ) : null}
            </Field>
            <Field data-invalid={errors.endDate != null}>
              <FieldLabel htmlFor="fundraising-end-date">
                Wpłaty do
              </FieldLabel>
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
              <FieldLabel>Logo (opcjonalnie)</FieldLabel>
              {logoSlot}
              <FileUpload
                multiple={false}
                accept={LOGO_TYPES.join(",")}
                description="PNG lub JPEG, maks. 25 MB"
                onFilesChange={(files) => setLogo(files[0] ?? null)}
              />
              {errors.logo != null ? <FieldError>{errors.logo}</FieldError> : null}
            </Field>
          </div>
        </Section>
        <Section
          title="Wpłata"
          description="Każde dziecko wpłaca tyle samo. Zbiórka nie ma celu finansowego i dostaje własny numer rachunku."
        >
          <div className="flex flex-col gap-5">
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
            <dl className="flex flex-col gap-2 rounded-lg bg-muted p-3 text-sm">
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Dzieci w klasie</dt>
                <dd className="font-medium tabular-nums">{childrenCount}</dd>
              </div>
              <div className="flex items-center justify-between gap-2">
                <dt className="text-muted-foreground">Przy komplecie wpłat</dt>
                <dd className="font-medium tabular-nums">
                  {parsedAmount != null
                    ? formatMoney(
                        Math.round(parsedAmount * childrenCount * 100) / 100
                      )
                    : `kwota × ${childrenCount}`}
                </dd>
              </div>
            </dl>
          </div>
        </Section>
      </form>
    </div>
  )
}

export { FundraisingForm }
