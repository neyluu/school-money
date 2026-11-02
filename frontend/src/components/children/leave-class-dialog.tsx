import * as React from "react";
import { UserMinus } from "lucide-react";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import type { Child } from "@/lib/children";
import { removeChildFromClass } from "@/lib/classes";
import type { ChildClassInfo } from "@/lib/classes";

function LeaveClassDialog({
  child,
  info,
  onChanged,
}: {
  child: Child;
  info: ChildClassInfo;
  onChanged: () => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const childName = `${child.firstname} ${child.lastname}`;
  const isPending = info.status === "PENDING";
  const actionLabel = isPending ? "Wycofaj prośbę" : "Usuń z klasy";

  function handleOpenChange(nextOpen: boolean) {
    if (isSaving) {
      return;
    }
    setOpen(nextOpen);
  }

  async function confirm() {
    setIsSaving(true);
    try {
      await removeChildFromClass(info.classId, child.id);
      toast.add({
        title: isPending
          ? `Wycofano prośbę: ${childName}`
          : `Usunięto z klasy: ${childName}`,
        description: info.className,
        type: "success",
      });
      onChanged();
      setOpen(false);
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
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label={`${actionLabel}: ${childName}`}
        className="text-danger hover:text-danger"
      >
        <UserMinus data-icon="inline-start" />
        <span className="hidden sm:inline">{actionLabel}</span>
      </Button>
      <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
        <ResponsiveDialogContent className="sm:max-w-md">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>
              {isPending ? "Wycofać prośbę?" : "Usunąć dziecko z klasy?"}
            </ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {childName} · {info.className}
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
              {isSaving ? "Usuwanie…" : actionLabel}
            </Button>
          </div>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}

export { LeaveClassDialog };
