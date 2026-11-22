import * as React from "react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import { deleteClass } from "@/lib/class-management";
import type { ClassSummary } from "@/lib/class-management";
import type { ClassBasics } from "@/lib/class-management";

function DeleteClassDialog({
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
  const [isSaving, setIsSaving] = React.useState(false);

  function handleOpenChange(nextOpen: boolean) {
    if (isSaving) {
      return;
    }
    onOpenChange(nextOpen);
  }

  async function confirm() {
    setIsSaving(true);
    try {
      await deleteClass(schoolClass.id);
      toast.add({
        title: `Usunięto klasę: ${schoolClass.name}`,
        type: "success",
      });
      onChanged();
      onOpenChange(false);
    } catch (error) {
      const blocked =
        error instanceof ApiError &&
        (error.status === 400 || error.status === 409);
      toast.add({
        title: blocked
          ? "Nie można usunąć klasy, która ma zbiórki."
          : "Nie udało się usunąć klasy. Spróbuj ponownie.",
        type: "error",
      });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
      <ResponsiveDialogContent className="sm:max-w-md">
        <ResponsiveDialogHeader>
          <ResponsiveDialogTitle>Usunąć klasę?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {schoolClass.name} · {schoolClass.school}. Klasę można usunąć tylko
            wtedy, gdy nie ma w niej zbiórek. Dzieci stracą członkostwo w tej
            klasie.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="lg"
            onClick={() => handleOpenChange(false)}
            disabled={isSaving}
          >
            Anuluj
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="lg"
            onClick={() => void confirm()}
            disabled={isSaving}
          >
            {isSaving ? "Usuwanie…" : "Usuń klasę"}
          </Button>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

export { DeleteClassDialog };
