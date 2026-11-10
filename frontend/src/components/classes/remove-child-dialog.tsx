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
import { removeMembership } from "@/lib/class-management";
import type { ClassChild } from "@/lib/class-management";

function RemoveChildDialog({
  classId,
  child,
  open,
  onOpenChange,
  onChanged,
}: {
  classId: number;
  child: ClassChild;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged: () => void;
}) {
  const [isSaving, setIsSaving] = React.useState(false);

  const childName = `${child.firstName} ${child.lastName}`;

  function handleOpenChange(nextOpen: boolean) {
    if (isSaving) {
      return;
    }
    onOpenChange(nextOpen);
  }

  async function confirm() {
    setIsSaving(true);
    try {
      await removeMembership(classId, child.id);
      toast.add({
        title: `Usunięto z klasy: ${childName}`,
        type: "success",
      });
      onChanged();
      onOpenChange(false);
    } catch {
      toast.add({
        title: "Nie udało się usunąć dziecka z klasy. Spróbuj ponownie.",
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
          <ResponsiveDialogTitle>Usunąć dziecko z klasy?</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>
            {childName} · rodzic: {child.parent.firstName}{" "}
            {child.parent.lastName}.
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
            {isSaving ? "Usuwanie…" : "Usuń z klasy"}
          </Button>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

export { RemoveChildDialog };
