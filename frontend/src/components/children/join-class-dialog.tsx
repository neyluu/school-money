import * as React from "react";
import { UserPlus } from "lucide-react";
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
import { joinClass } from "@/lib/children";
import type { Child } from "@/lib/children";

function JoinClassDialog({
  child,
  onChanged,
}: {
  child: Child;
  onChanged: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [code, setCode] = React.useState("");
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = React.useState(false);

  const childName = `${child.firstname} ${child.lastname}`;
  const inputId = `join-class-code-${child.id}`;

  function handleOpenChange(nextOpen: boolean) {
    if (isSaving) {
      return;
    }
    setOpen(nextOpen);
    if (!nextOpen) {
      setCode("");
      setError(undefined);
    }
  }

  async function save(event: React.FormEvent) {
    event.preventDefault();
    const trimmed = code.trim();
    if (trimmed === "") {
      return;
    }
    setIsSaving(true);
    try {
      await joinClass(trimmed, child.id);
      toast.add({
        title: `Wysłano prośbę o dołączenie: ${childName}`,
        description: "Dziecko zostanie dodane po akceptacji właściciela klasy.",
        type: "success",
      });
      onChanged();
      setOpen(false);
      setCode("");
    } catch (caught) {
      if (caught instanceof ApiError && caught.status === 404) {
        setError("Nie znaleziono klasy o tym kodzie.");
      } else {
        toast.add({
          title: "Nie udało się dołączyć do klasy. Spróbuj ponownie.",
          type: "error",
        });
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label={`Dołącz do klasy: ${childName}`}
      >
        <UserPlus data-icon="inline-start" />
        <span className="hidden sm:inline">Dołącz</span>
      </Button>
      <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
        <ResponsiveDialogContent className="sm:max-w-md">
          <form onSubmit={save} className="flex flex-col gap-4">
            <ResponsiveDialogHeader>
              <ResponsiveDialogTitle>Dołącz do klasy</ResponsiveDialogTitle>
              <ResponsiveDialogDescription>
                {childName}
              </ResponsiveDialogDescription>
            </ResponsiveDialogHeader>

            <Field data-invalid={error != null}>
              <FieldLabel htmlFor={inputId}>Kod klasy</FieldLabel>
              <Input
                id={inputId}
                placeholder="3BTX7KQ2"
                value={code}
                aria-invalid={error != null}
                onChange={(event) => {
                  setCode(event.target.value);
                  setError(undefined);
                }}
              />
              {error != null ? <FieldError>{error}</FieldError> : null}
            </Field>

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="outline"
                size="lg"
                onClick={() => handleOpenChange(false)}
                disabled={isSaving}
                className="sm:ml-auto"
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                size="lg"
                disabled={code.trim() === "" || isSaving}
              >
                {isSaving ? "Wysyłanie…" : "Dołącz"}
              </Button>
            </div>
          </form>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}

export { JoinClassDialog };
