import * as React from "react";
import { AvatarPicker } from "@/components/children/avatar-picker";
import { useChildAvatarUrl } from "@/components/children/use-child-avatar-url";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/responsive-dialog";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import {
  childInitials,
  uploadChildAvatar,
  validateAvatar,
} from "@/lib/children";
import type { Child } from "@/lib/children";

function ChangeAvatarDialog({
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
  const [file, setFile] = React.useState<File | null>(null);
  const [error, setError] = React.useState<string | undefined>(undefined);
  const [isSaving, setIsSaving] = React.useState(false);
  const currentAvatarUrl = useChildAvatarUrl(child.id, child.avatarId);

  const childName = `${child.firstname} ${child.lastname}`;
  const inputId = `child-avatar-${child.id}`;

  function handleOpenChange(nextOpen: boolean) {
    if (isSaving) {
      return;
    }
    onOpenChange(nextOpen);
    if (!nextOpen) {
      setFile(null);
      setError(undefined);
    }
  }

  async function save() {
    if (file == null) {
      return;
    }
    const validationError = validateAvatar(file);
    if (validationError != null) {
      setError(validationError);
      return;
    }

    setIsSaving(true);
    try {
      await uploadChildAvatar(child.id, file);
      toast.add({
        title: `Zapisano nowe zdjęcie: ${childName}`,
        type: "success",
      });
      onChanged();
      onOpenChange(false);
      setFile(null);
    } catch {
      toast.add({
        title: "Nie udało się zmienić zdjęcia. Spróbuj ponownie.",
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
          <ResponsiveDialogTitle>Zdjęcie dziecka</ResponsiveDialogTitle>
          <ResponsiveDialogDescription>{childName}</ResponsiveDialogDescription>
        </ResponsiveDialogHeader>

        <Field data-invalid={error != null}>
          <AvatarPicker
            id={inputId}
            file={file}
            fallback={childInitials(child)}
            currentImageUrl={currentAvatarUrl}
            invalid={error != null}
            onChange={(nextFile) => {
              setFile(nextFile);
              setError(undefined);
            }}
          />
          {error != null ? <FieldError>{error}</FieldError> : null}
        </Field>

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
            size="lg"
            onClick={() => void save()}
            disabled={file == null || isSaving}
          >
            {isSaving ? "Zapisywanie…" : "Zapisz"}
          </Button>
        </div>
      </ResponsiveDialogContent>
    </ResponsiveDialog>
  );
}

export { ChangeAvatarDialog };
