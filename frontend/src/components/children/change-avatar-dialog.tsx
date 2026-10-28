import * as React from "react";
import { ImagePlus } from "lucide-react";
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
  deleteChildAvatar,
  uploadChildAvatar,
  validateAvatar,
} from "@/lib/children";
import type { Child } from "@/lib/children";

function ChangeAvatarDialog({
  child,
  onChanged,
}: {
  child: Child;
  onChanged: () => void;
}) {
  const [open, setOpen] = React.useState(false);
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
    setOpen(nextOpen);
    if (!nextOpen) {
      setFile(null);
      setError(undefined);
    }
  }

  async function run(action: () => Promise<void>, successTitle: string) {
    setIsSaving(true);
    try {
      await action();
      toast.add({ title: successTitle, type: "success" });
      onChanged();
      setOpen(false);
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

  function save() {
    if (file == null) {
      return;
    }
    const validationError = validateAvatar(file);
    if (validationError != null) {
      setError(validationError);
      return;
    }
    void run(
      () => uploadChildAvatar(child.id, file),
      `Zapisano nowe zdjęcie: ${childName}`,
    );
  }

  function remove() {
    void run(
      () => deleteChildAvatar(child.id),
      `Usunięto zdjęcie: ${childName}`,
    );
  }

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        aria-label={`Zmień zdjęcie: ${childName}`}
      >
        <ImagePlus data-icon="inline-start" />
        <span className="hidden sm:inline">Zmień zdjęcie</span>
      </Button>
      <ResponsiveDialog open={open} onOpenChange={handleOpenChange}>
        <ResponsiveDialogContent className="sm:max-w-md">
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Zdjęcie dziecka</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              {childName}
            </ResponsiveDialogDescription>
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

          <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center">
            {child.avatarId != null && file == null ? (
              <Button
                type="button"
                variant="ghost"
                size="lg"
                onClick={remove}
                disabled={isSaving}
                className="text-danger hover:text-danger sm:mr-auto"
              >
                Usuń obecne zdjęcie
              </Button>
            ) : null}
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
              size="lg"
              onClick={save}
              disabled={file == null || isSaving}
            >
              {isSaving ? "Zapisywanie…" : "Zapisz"}
            </Button>
          </div>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </>
  );
}

export { ChangeAvatarDialog };
