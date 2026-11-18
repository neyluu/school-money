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
import { deleteChild } from "@/lib/children";
import type { Child } from "@/lib/children";

function DeleteChildDialog({
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
  const [isSaving, setIsSaving] = React.useState(false);

  const childName = `${child.firstname} ${child.lastname}`;

  function handleOpenChange(nextOpen: boolean) {
    if (isSaving) {
      return;
    }
    onOpenChange(nextOpen);
  }

  async function confirm() {
    setIsSaving(true);
    try {
      await deleteChild(child.id);
      toast.add({
        title: `Usunięto dziecko: ${childName}`,
        type: "success",
      });
      onChanged();
      onOpenChange(false);
    } catch {
      toast.add({
        title: "Nie udało się usunąć dziecka. Spróbuj ponownie.",
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
          <ResponsiveDialogTitle>Usunąć dziecko?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            Dziecko {childName} zostanie usunięte. Tej operacji nie można cofnąć.
          </ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

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
            type="button"
            variant="destructive"
            size="lg"
            onClick={() => void confirm()}
            disabled={isSaving}
          >
            {isSaving ? "Usuwanie…" : "Usuń"}
          </Button>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

export { DeleteChildDialog };
