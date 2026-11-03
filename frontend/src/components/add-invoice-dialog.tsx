import * as React from "react"
import { useNavigate } from "react-router"
import { FileUpload } from "@/components/file-upload"
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
import { describeError } from "@/lib/error-messages"
import { addInvoice } from "@/lib/fundraising"

const MAX_TITLE_LENGTH = 100
const MAX_FILE_BYTES = 25 * 1024 * 1024
const ALLOWED_FILE_TYPES = ["image/png", "image/jpeg", "application/pdf"]

type InvoiceErrors = {
  title?: string
  file?: string
}

function AddInvoiceForm({
  fundraisingId,
  onClose,
  onCompleted,
}: {
  fundraisingId: number
  onClose: () => void
  onCompleted: () => void
}) {
  const navigate = useNavigate()
  const [title, setTitle] = React.useState("")
  const [file, setFile] = React.useState<File | null>(null)
  const [errors, setErrors] = React.useState<InvoiceErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const nextErrors: InvoiceErrors = {}
    if (file == null) {
      nextErrors.file = "Wybierz plik faktury."
    } else if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      nextErrors.file = "Dozwolone formaty: PNG, JPEG lub PDF."
    } else if (file.size > MAX_FILE_BYTES) {
      nextErrors.file = "Plik może mieć maks. 25 MB."
    }
    if (title.trim().length > MAX_TITLE_LENGTH) {
      nextErrors.title = "Tytuł może mieć maks. 100 znaków."
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0 || file == null) {
      return
    }

    setIsSubmitting(true)
    try {
      await addInvoice(fundraisingId, file, title)
      toast.add({
        title: "Faktura została dodana.",
        type: "success",
      })
      onCompleted()
      onClose()
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 401) {
        navigate("/login", { replace: true })
        return
      }
      if (submitError instanceof ApiError && submitError.status === 400) {
        setErrors({ file: "Plik został odrzucony. Użyj PNG, JPEG lub PDF." })
        return
      }
      if (submitError instanceof ApiError && submitError.status === 403) {
        toast.add({
          title: "Nie możesz dodać faktury do tej zbiórki.",
          type: "error",
        })
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
      <Field data-invalid={errors.title != null}>
        <FieldLabel htmlFor="invoice-title">Tytuł (opcjonalnie)</FieldLabel>
        <Input
          id="invoice-title"
          type="text"
          autoComplete="off"
          placeholder="Faktura – bilety"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          aria-invalid={errors.title != null}
        />
        {errors.title != null ? <FieldError>{errors.title}</FieldError> : null}
      </Field>
      <Field data-invalid={errors.file != null}>
        <FieldLabel>Plik faktury</FieldLabel>
        <FileUpload
          multiple={false}
          accept={ALLOWED_FILE_TYPES.join(",")}
          description="PNG, JPEG lub PDF, maks. 25 MB"
          onFilesChange={(files) => setFile(files[0] ?? null)}
        />
        {errors.file != null ? <FieldError>{errors.file}</FieldError> : null}
      </Field>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Anuluj
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Dodaj fakturę
        </Button>
      </div>
    </form>
  )
}

function AddInvoiceDialog({
  open,
  onOpenChange,
  fundraisingId,
  onCompleted,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  fundraisingId: number
  onCompleted: () => void
}) {
  return (
    <ResponsiveDialog open={open} onOpenChange={onOpenChange}>
      <ResponsiveDialogContent>
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Dodaj fakturę</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Faktura będzie widoczna dla wszystkich rodziców w klasie.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>
        <AddInvoiceForm
          fundraisingId={fundraisingId}
          onClose={() => onOpenChange(false)}
          onCompleted={onCompleted}
        />
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  )
}

export { AddInvoiceDialog }
