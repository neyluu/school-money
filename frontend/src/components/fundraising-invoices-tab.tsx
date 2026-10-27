import * as React from "react"
import { Download, ExternalLink, FileText } from "lucide-react"
import { DataState } from "@/components/data-state"
import { EmptyState } from "@/components/empty-state"
import { InvoicePreview } from "@/components/invoice-preview"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { useAsyncData } from "@/hooks/use-async-data"
import { downloadBlob, openBlob } from "@/lib/download"
import { getFundraisingInvoices, getInvoiceFile } from "@/lib/fundraising"
import type { FundraisingInvoice } from "@/lib/fundraising"
import { formatSize } from "@/lib/format-size"

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
  year: "numeric",
})

function InvoiceRow({
  fundraisingId,
  invoice,
}: {
  fundraisingId: number
  invoice: FundraisingInvoice
}) {
  const [isBusy, setIsBusy] = React.useState(false)

  async function handleFile(action: (blob: Blob) => void) {
    setIsBusy(true)
    try {
      action(await getInvoiceFile(fundraisingId, invoice.id))
    } catch {
      toast.add({
        title: "Nie udało się pobrać pliku.",
        type: "error",
      })
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <li className="flex items-center gap-3 rounded-lg border border-input bg-card p-3">
      <InvoicePreview fundraisingId={fundraisingId} invoice={invoice} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {invoice.title ?? invoice.file.filename}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {invoice.file.filename} · {formatSize(invoice.file.sizeBytes)} ·{" "}
          {dateFormatter.format(new Date(invoice.createdAt))}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Button
          variant="outline"
          size="icon"
          aria-label="Otwórz fakturę"
          disabled={isBusy}
          onClick={() => handleFile(openBlob)}
        >
          <ExternalLink />
        </Button>
        <Button
          variant="outline"
          size="icon"
          aria-label="Pobierz fakturę"
          disabled={isBusy}
          onClick={() =>
            handleFile((blob) => downloadBlob(blob, invoice.file.filename))
          }
        >
          <Download />
        </Button>
      </div>
    </li>
  )
}

function FundraisingInvoicesTab({ fundraisingId }: { fundraisingId: number }) {
  const load = React.useCallback(
    () => getFundraisingInvoices(fundraisingId),
    [fundraisingId]
  )
  const { data, error, isLoading, reload } = useAsyncData(load)

  return (
    <DataState
      isLoading={isLoading}
      hasError={error != null}
      isEmpty={data != null && data.length === 0}
      onRetry={reload}
      emptyState={
        <EmptyState
          icon={<FileText />}
          title="Brak faktur"
          description="Faktury i rachunki za zakupy ze zbiórki pojawią się tutaj."
        />
      }
    >
      <ul className="flex flex-col gap-2">
        {data?.map((invoice) => (
          <InvoiceRow
            key={invoice.id}
            fundraisingId={fundraisingId}
            invoice={invoice}
          />
        ))}
      </ul>
    </DataState>
  )
}

export { FundraisingInvoicesTab }
