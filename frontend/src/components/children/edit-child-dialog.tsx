import * as React from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import { updateChild } from "@/lib/children";
import type { Child } from "@/lib/children";

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;

type FormErrors = {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
};

function today(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function nameError(value: string, label: string): string | undefined {
  const length = value.trim().length;
  if (length === 0) return `Podaj ${label}.`;
  if (length < MIN_NAME_LENGTH || length > MAX_NAME_LENGTH)
    return `Pole musi mieć od ${MIN_NAME_LENGTH} do ${MAX_NAME_LENGTH} znaków.`;
  return undefined;
}

function validate(values: {
  firstName: string;
  lastName: string;
  birthDate: string;
}): FormErrors {
  const errors: FormErrors = {
    firstName: nameError(values.firstName, "imię"),
    lastName: nameError(values.lastName, "nazwisko"),
  };

  if (values.birthDate === "") {
    errors.birthDate = "Podaj datę urodzenia.";
  } else if (values.birthDate >= today()) {
    errors.birthDate = "Data urodzenia musi być w przeszłości.";
  }

  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message != null),
  ) as FormErrors;
}

function EditChildDialog({
  child,
  open,
  onOpenChange,
  onChanged,
}: {
  child: Child;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const [firstName, setFirstName] = React.useState(child.firstname);
  const [lastName, setLastName] = React.useState(child.lastname);
  const [birthDate, setBirthDate] = React.useState(child.birthDate);
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) {
      setFirstName(child.firstname);
      setLastName(child.lastname);
      setBirthDate(child.birthDate);
      setErrors({});
    }
  }, [open, child]);

  function clearError(field: keyof FormErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }
    onOpenChange(nextOpen);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const nextErrors = validate({ firstName, lastName, birthDate });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const trimmedFirst = firstName.trim();
      const trimmedLast = lastName.trim();

      const updated = await updateChild(child.id, {
        ...(trimmedFirst !== child.firstname && { firstname: trimmedFirst }),
        ...(trimmedLast !== child.lastname && { lastname: trimmedLast }),
        ...(birthDate !== child.birthDate && { birthDate }),
      });
      toast.add({
        title: `Zapisano zmiany: ${updated.firstname} ${updated.lastname}`,
        type: "success",
      });
      onChanged();
      onOpenChange(false);
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.status === 400 &&
        error.fieldErrors != null
      ) {
        setErrors({
          firstName: error.fieldErrors.firstname,
          lastName: error.fieldErrors.lastname,
          birthDate: error.fieldErrors.birthDate,
        });
        return;
      }
      toast.add({
        title: "Nie udało się zapisać zmian. Spróbuj ponownie.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  const unchanged =
    firstName.trim() === child.firstname &&
    lastName.trim() === child.lastname &&
    birthDate === child.birthDate;

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Edytuj dziecko</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Zmień imię, nazwisko lub datę urodzenia.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={errors.firstName != null}>
              <FieldLabel htmlFor={`edit-child-first-name-${child.id}`}>
                Imię
              </FieldLabel>
              <Input
                id={`edit-child-first-name-${child.id}`}
                value={firstName}
                onChange={(event) => {
                  setFirstName(event.target.value);
                  clearError("firstName");
                }}
                autoComplete="off"
                maxLength={MAX_NAME_LENGTH}
                aria-invalid={errors.firstName != null}
              />
              {errors.firstName != null ? (
                <FieldError>{errors.firstName}</FieldError>
              ) : null}
            </Field>
            <Field data-invalid={errors.lastName != null}>
              <FieldLabel htmlFor={`edit-child-last-name-${child.id}`}>
                Nazwisko
              </FieldLabel>
              <Input
                id={`edit-child-last-name-${child.id}`}
                value={lastName}
                onChange={(event) => {
                  setLastName(event.target.value);
                  clearError("lastName");
                }}
                autoComplete="off"
                maxLength={MAX_NAME_LENGTH}
                aria-invalid={errors.lastName != null}
              />
              {errors.lastName != null ? (
                <FieldError>{errors.lastName}</FieldError>
              ) : null}
            </Field>
          </div>

          <Field data-invalid={errors.birthDate != null}>
            <FieldLabel htmlFor={`edit-child-birth-date-${child.id}`}>
              Data urodzenia
            </FieldLabel>
            <Input
              id={`edit-child-birth-date-${child.id}`}
              type="date"
              value={birthDate}
              max={today()}
              onChange={(event) => {
                setBirthDate(event.target.value);
                clearError("birthDate");
              }}
              aria-invalid={errors.birthDate != null}
            />
            {errors.birthDate != null ? (
              <FieldError>{errors.birthDate}</FieldError>
            ) : null}
          </Field>

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={() => handleOpenChange(false)}
              disabled={isSubmitting}
            >
              Anuluj
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isSubmitting || unchanged}
            >
              {isSubmitting ? "Zapisywanie…" : "Zapisz"}
            </Button>
          </div>
        </form>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

export { EditChildDialog };
