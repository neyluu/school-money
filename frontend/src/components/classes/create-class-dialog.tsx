import * as React from "react";
import { Plus } from "lucide-react";
import {
  ClassFormFields,
  classFieldErrorsFrom,
  validateClassForm,
} from "@/components/classes/class-form";
import type {
  ClassFormErrors,
  ClassFormValues,
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
import { createClass } from "@/lib/class-management";

const EMPTY: ClassFormValues = { name: "", school: "", city: "" };

function CreateClassDialog({ onCreated }: { onCreated: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [values, setValues] = React.useState<ClassFormValues>(EMPTY);
  const [errors, setErrors] = React.useState<ClassFormErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) {
      return;
    }
    setOpen(nextOpen);
    if (!nextOpen) {
      setValues(EMPTY);
      setErrors({});
    }
  }

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

    setIsSubmitting(true);
    try {
      const created = await createClass({
        name: values.name.trim(),
        school: values.school.trim(),
        city: values.city.trim(),
      });
      toast.add({
        title: `Utworzono klasę: ${created.name}`,
        description: `Kod zaproszenia: ${created.accessCode}`,
        type: "success",
      });
      onCreated();
      setOpen(false);
      setValues(EMPTY);
      setErrors({});
    } catch (error) {
      const fieldErrors = classFieldErrorsFrom(error);
      if (fieldErrors != null) {
        setErrors(fieldErrors);
        return;
      }
      toast.add({
        title: "Nie udało się utworzyć klasy. Spróbuj ponownie.",
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
        Utwórz klasę
      </Button>
      <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
        <ResponsiveDialogContent className="sm:max-w-md">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Utwórz klasę</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Zostaniesz skarbnikiem klasy. Po utworzeniu dostaniesz kod
              zaproszenia dla rodziców.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="flex flex-col gap-4"
          >
            <ClassFormFields
              idPrefix="create-class"
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
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Zapisywanie…" : "Utwórz klasę"}
              </Button>
            </div>
          </form>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}

export { CreateClassDialog };
