import * as React from "react";
import { ImagePlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AVATAR_TYPES } from "@/lib/children";

function AvatarPicker({
  id,
  file,
  fallback,
  invalid,
  onChange,
}: {
  id: string;
  file: File | null;
  // Shown when no image is selected, e.g. child's initials
  fallback: string;
  invalid?: boolean;
  onChange: (file: File | null) => void;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const previewUrl = React.useMemo(
    () => (file != null ? URL.createObjectURL(file) : null),
    [file],
  );

  React.useEffect(() => {
    return () => {
      if (previewUrl != null) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  return (
    <div className="flex items-center gap-4">
      <span
        aria-hidden
        className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-lg font-semibold text-primary"
      >
        {previewUrl != null ? (
          <img src={previewUrl} alt="" className="size-full object-cover" />
        ) : (
          fallback
        )}
      </span>
      <div className="flex min-w-0 flex-col gap-1.5">
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            aria-invalid={invalid}
          >
            <ImagePlus data-icon="inline-start" />
            {file != null ? "Zmień zdjęcie" : "Wybierz zdjęcie"}
          </Button>
          {file != null ? (
            <Button
              type="button"
              variant="ghost"
              onClick={() => onChange(null)}
            >
              <Trash2 data-icon="inline-start" />
              Usuń
            </Button>
          ) : null}
        </div>
        <span className="truncate text-xs text-muted-foreground">
          {file != null ? file.name : "PNG lub JPG, maks. 5 MB"}
        </span>
      </div>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={AVATAR_TYPES.join(",")}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          onChange(event.target.files?.[0] ?? null);
          event.target.value = "";
        }}
      />
    </div>
  );
}

export { AvatarPicker };
