import * as React from "react";
import type {
  ClassFormErrors,
  ClassFormValues,
} from "@/components/classes/class-form";
import {
  classFieldErrorsFrom,
  ClassFormFields,
  validateClassForm,
} from "@/components/classes/class-form";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { ClassBasics, ClassInput } from "@/lib/class-management";
import { updateClass } from "@/lib/class-management";

function toValues(schoolClass: ClassBasics): ClassFormValues {
  return {
    name: schoolClass.name,
    school: schoolClass.school,
    city: schoolClass.city,
  };
}

function EditClassDialog({
  schoolClass,
  open,
  onOpenChange,
  onChanged,
}: {
  schoolClass: ClassBasics;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const [values, setValues] = React.useState<ClassFormValues>(
    toValues(schoolClass),
  );
  const [errors, setErrors] = React.useState<ClassFormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Przy każdym otwarciu wczytaj aktualne dane klasy.
  React.useEffect(() => {
    if (open) {
      setValues(toValues(schoolClass));
      setErrors({});
    }
  }, [open, schoolClass]);

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }
    onOpenChange(nextOpen);
  }

  const trimmed = {
    name: values.name.trim(),
    school: values.school.trim(),
    city: values.city.trim(),
  };
  const unchanged =
    trimmed.name === schoolClass.name &&
    trimmed.school === schoolClass.school &&
    trimmed.city === schoolClass.city;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const nextErrors = validateClassForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const changes: Partial<ClassInput> = {};
    if (trimmed.name !== schoolClass.name) changes.name = trimmed.name;
    if (trimmed.school !== schoolClass.school) changes.school = trimmed.school;
    if (trimmed.city !== schoolClass.city) changes.city = trimmed.city;

    setIsSubmitting(true);
    try {
      const updated = await updateClass(schoolClass.id, changes);
      toast.add({
        title: `Zapisano zmiany: ${updated.name}`,
        type: "success",
      });
      onChanged();
      onOpenChange(false);
    } catch (error) {
      const fieldErrors = classFieldErrorsFrom(error);
      if (fieldErrors != null) {
        setErrors(fieldErrors);
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

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Edytuj klasę</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Zmień nazwę klasy, szkołę lub miasto.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-4"
        >
          <ClassFormFields
            idPrefix={`edit-class-${schoolClass.id}`}
            values={values}
            errors={errors}
            onChange={(field, value) => {
              setValues((prev) => ({ ...prev, [field]: value }));
              setErrors((prev) => ({ ...prev, [field]: undefined }));
            }}
          />

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

export { EditClassDialog };
