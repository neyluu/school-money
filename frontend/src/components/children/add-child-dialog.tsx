import * as React from "react";
import { Plus } from "lucide-react";
import { AvatarPicker } from "@/components/children/avatar-picker";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import { lookupClass } from "@/lib/auth";
import type { ClassInfo } from "@/lib/auth";
import {
  AVATAR_MAX_BYTES,
  AVATAR_TYPES,
  createChild,
  joinClass,
  uploadChildAvatar,
} from "@/lib/children";
import type { Child } from "@/lib/children";

const MIN_NAME_LENGTH = 2;
const MAX_NAME_LENGTH = 100;

type FormErrors = {
  firstName?: string;
  lastName?: string;
  birthDate?: string;
  avatar?: string;
  classCode?: string;
};

function today(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function initials(firstName: string, lastName: string): string {
  return `${firstName.trim().charAt(0)}${lastName.trim().charAt(0)}`.toUpperCase();
}

function validate(values: {
  firstName: string;
  lastName: string;
  birthDate: string;
  avatar: File | null;
}): FormErrors {
  const errors: FormErrors = {};
  const nameError = (value: string, label: string) => {
    const length = value.trim().length;
    if (length === 0) return `Podaj ${label}.`;
    if (length < MIN_NAME_LENGTH || length > MAX_NAME_LENGTH)
      return `Pole musi mieć od ${MIN_NAME_LENGTH} do ${MAX_NAME_LENGTH} znaków.`;
    return undefined;
  };

  errors.firstName = nameError(values.firstName, "imię");
  errors.lastName = nameError(values.lastName, "nazwisko");

  if (values.birthDate === "") {
    errors.birthDate = "Podaj datę urodzenia.";
  } else if (values.birthDate >= today()) {
    errors.birthDate = "Data urodzenia musi być w przeszłości.";
  }

  if (values.avatar != null) {
    if (!AVATAR_TYPES.includes(values.avatar.type)) {
      errors.avatar = "Wybierz zdjęcie w formacie PNG lub JPG.";
    } else if (values.avatar.size > AVATAR_MAX_BYTES) {
      errors.avatar = "Zdjęcie może mieć maks. 5 MB.";
    }
  }

  return Object.fromEntries(
    Object.entries(errors).filter(([, message]) => message != null),
  ) as FormErrors;
}

function AddChildDialog({ onCreated }: { onCreated: (child: Child) => void }) {
  const [open, setOpen] = React.useState(false);
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [birthDate, setBirthDate] = React.useState("");
  const [avatar, setAvatar] = React.useState<File | null>(null);
  const [classCode, setClassCode] = React.useState("");
  const [errors, setErrors] = React.useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function clearError(field: keyof FormErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function reset() {
    setFirstName("");
    setLastName("");
    setBirthDate("");
    setAvatar(null);
    setClassCode("");
    setErrors({});
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }
    setOpen(nextOpen);
    if (!nextOpen) {
      reset();
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const nextErrors = validate({ firstName, lastName, birthDate, avatar });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);
    try {
      const code = classCode.trim();
      let schoolClass: ClassInfo | null = null;
      if (code !== "") {
        try {
          schoolClass = await lookupClass(code);
        } catch (error) {
          if (error instanceof ApiError && error.status === 404) {
            setErrors({ classCode: "Nie znaleziono klasy o tym kodzie." });
            return;
          }
          throw error;
        }
      }

      const child = await createChild({
        firstname: firstName.trim(),
        lastname: lastName.trim(),
        birthDate,
      });

      const problems: string[] = [];
      if (avatar != null) {
        await uploadChildAvatar(child.id, avatar).catch(() => {
          problems.push(
            "Nie udało się zapisać zdjęcia, możesz dodać je później.",
          );
        });
      }

      let joinMessage: string | null = null;
      if (schoolClass != null) {
        try {
          const membership = await joinClass(code, child.id);
          joinMessage =
            membership.status === "ACCEPTED"
              ? `Dziecko dołączyło do klasy ${schoolClass.name}.`
              : `Prośba o dołączenie do klasy ${schoolClass.name} czeka na akceptację skarbnika.`;
        } catch (error) {
          problems.push(
            error instanceof ApiError && error.status === 409
              ? "Dziecko jest już w klasie lub czeka na akceptację."
              : "Nie udało się wysłać prośby o dołączenie do klasy.",
          );
        }
      }

      toast.add({
        title: `Dodano dziecko: ${child.firstname} ${child.lastname}`,
        description: joinMessage ?? undefined,
        type: "success",
      });
      if (problems.length > 0) {
        toast.add({ title: problems.join(" "), type: "warning" });
      }

      onCreated(child);
      setOpen(false);
      reset();
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
        title: "Nie udało się dodać dziecka. Spróbuj ponownie.",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <Button size="lg" onClick={() => setOpen(true)}>
        <Plus data-icon="inline-start" />
        Dodaj dziecko
      </Button>
      <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
        <ResponsiveDialogContent className="sm:max-w-md">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Dodaj dziecko</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Podaj dane dziecka. Jeśli masz kod od skarbnika, od razu wyślemy
              prośbę o dołączenie do klasy.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4"
          >
            <Field data-invalid={errors.avatar != null}>
              <FieldLabel htmlFor="child-avatar">
                Zdjęcie (opcjonalnie)
              </FieldLabel>
              <AvatarPicker
                id="child-avatar"
                file={avatar}
                fallback={initials(firstName, lastName) || "?"}
                invalid={errors.avatar != null}
                onChange={(file) => {
                  setAvatar(file);
                  setErrors((prev) => ({ ...prev, avatar: undefined }));
                }}
              />
              {errors.avatar != null ? (
                <FieldError>{errors.avatar}</FieldError>
              ) : null}
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field data-invalid={errors.firstName != null}>
                <FieldLabel htmlFor="child-first-name">Imię</FieldLabel>
                <Input
                  id="child-first-name"
                  value={firstName}
                  onChange={(event) => {
                    setFirstName(event.target.value);
                    clearError("firstName");
                  }}
                  placeholder="Zuzanna"
                  autoComplete="off"
                  maxLength={MAX_NAME_LENGTH}
                  aria-invalid={errors.firstName != null}
                />
                {errors.firstName != null ? (
                  <FieldError>{errors.firstName}</FieldError>
                ) : null}
              </Field>
              <Field data-invalid={errors.lastName != null}>
                <FieldLabel htmlFor="child-last-name">Nazwisko</FieldLabel>
                <Input
                  id="child-last-name"
                  value={lastName}
                  onChange={(event) => {
                    setLastName(event.target.value);
                    clearError("lastName");
                  }}
                  placeholder="Nowak"
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
              <FieldLabel htmlFor="child-birth-date">Data urodzenia</FieldLabel>
              <Input
                id="child-birth-date"
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

            <Field data-invalid={errors.classCode != null}>
              <FieldLabel htmlFor="child-class-code">
                Kod zaproszenia do klasy (opcjonalnie)
              </FieldLabel>
              <Input
                id="child-class-code"
                value={classCode}
                onChange={(event) => {
                  setClassCode(event.target.value.toUpperCase());
                  setErrors((prev) => ({ ...prev, classCode: undefined }));
                }}
                placeholder="np. 3BX7KQ2M"
                autoComplete="off"
                spellCheck={false}
                className="font-mono uppercase"
                aria-invalid={errors.classCode != null}
              />
              {errors.classCode != null ? (
                <FieldError>{errors.classCode}</FieldError>
              ) : (
                <FieldDescription>
                  Kod otrzymasz od skarbnika klasy. Możesz go podać także
                  później.
                </FieldDescription>
              )}
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
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Zapisywanie…" : "Dodaj dziecko"}
              </Button>
            </div>
          </form>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}

export { AddChildDialog };
