import * as React from "react"
import { FileText } from "lucide-react"
import { getInvoiceFile } from "@/lib/fundraising"
import type { FundraisingInvoice } from "@/lib/fundraising"

function InvoicePreview({
  fundraisingId,
  invoice,
}: {
  fundraisingId: number
  invoice: FundraisingInvoice
}) {
  const isImage = invoice.file.contentType.startsWith("image/")
  const [url, setUrl] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!isImage) {
      return
    }

    let ignored = false
    let objectUrl: string | null = null
    getInvoiceFile(fundraisingId, invoice.id)
      .then((blob) => {
        if (!ignored) {
          objectUrl = URL.createObjectURL(blob)
          setUrl(objectUrl)
        }
      })
      .catch(() => undefined)
    return () => {
      ignored = true
      if (objectUrl != null) {
        URL.revokeObjectURL(objectUrl)
      }
    }
  }, [fundraisingId, invoice.id, isImage])

  return (
    <span
      aria-hidden
      className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground [&_svg]:size-6"
    >
      {url != null ? (
        <img src={url} alt="" className="size-full object-cover" />
      ) : (
        <FileText />
      )}
    </span>
  )
}

export { InvoicePreview }
