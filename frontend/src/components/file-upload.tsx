import { useEffect, useRef, useState } from "react"
import { FileText, UploadCloud, X } from "lucide-react"
import { cn } from "cn"

type AttachedFile = {
  file: File
  previewUrl: string | null
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`
}

function FileUpload({
  accept,
  multiple = true,
  description = "Faktury, paragony, dokumenty zbiórki",
  onFilesChange,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  accept?: string
  multiple?: boolean
  description?: React.ReactNode
  onFilesChange?: (files: File[]) => void
}) {
  const [items, setItems] = useState<AttachedFile[]>([])
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCount = useRef(0)
  const itemsRef = useRef(items)
  itemsRef.current = items

  useEffect(() => {
    return () => {
      for (const item of itemsRef.current) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl)
      }
    }
  }, [])

  function emit(next: AttachedFile[]) {
    onFilesChange?.(next.map((item) => item.file))
  }

  function addFiles(list: FileList | File[]) {
    const incoming = Array.from(list).map((file) => ({
      file,
      previewUrl: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
    }))
    setItems((prev) => {
      const next = multiple ? [...prev, ...incoming] : incoming
      emit(next)
      return next
    })
  }

  function removeAt(index: number) {
    setItems((prev) => {
      const target = prev[index]
      if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl)
      const next = prev.filter((_, i) => i !== index)
      emit(next)
      return next
    })
  }

  return (
    <div className={cn("w-full", className)} {...props}>
      <div
        role="button"
        tabIndex={0}
        aria-label="Dodaj pliki"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        onDragEnter={(event) => {
          event.preventDefault()
          dragCount.current += 1
          setDragging(true)
        }}
        onDragLeave={(event) => {
          event.preventDefault()
          dragCount.current -= 1
          if (dragCount.current <= 0) {
            dragCount.current = 0
            setDragging(false)
          }
        }}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault()
          dragCount.current = 0
          setDragging(false)
          if (event.dataTransfer.files.length > 0) {
            addFiles(event.dataTransfer.files)
          }
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          dragging
            ? "border-primary bg-primary/5 text-foreground"
            : "border-input bg-transparent text-muted-foreground hover:border-primary/50 hover:text-foreground"
        )}
      >
        <UploadCloud aria-hidden className="size-8" />
        <p className="text-sm font-medium">
          Upuść pliki tutaj albo kliknij, aby wybrać
        </p>
        {description ? <p className="text-xs">{description}</p> : null}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          tabIndex={-1}
          onChange={(event) => {
            if (event.target.files && event.target.files.length > 0) {
              addFiles(event.target.files)
              event.target.value = ""
            }
          }}
        />
      </div>
      {items.length > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {items.map((item, index) => (
            <li
              key={`${item.file.name}-${item.file.size}-${item.file.lastModified}`}
              className="flex items-center gap-3 rounded-lg border border-input bg-card px-3 py-2 text-sm"
            >
              {item.previewUrl ? (
                <img
                  src={item.previewUrl}
                  alt={item.file.name}
                  className="size-10 shrink-0 rounded-md object-cover"
                />
              ) : (
                <FileText
                  aria-hidden
                  className="size-5 shrink-0 text-muted-foreground"
                />
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium text-foreground">
                  {item.file.name}
                </span>
                <span className="block text-xs text-muted-foreground tabular-nums">
                  {formatSize(item.file.size)}
                </span>
              </span>
              <button
                type="button"
                aria-label={`Usuń plik ${item.file.name}`}
                onClick={() => removeAt(index)}
                className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors outline-none hover:bg-danger/10 hover:text-danger focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <X aria-hidden className="size-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export { FileUpload }
