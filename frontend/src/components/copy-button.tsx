import * as React from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"

const COPIED_RESET_MS = 2000

function CopyButton({
  value,
  label,
  successTitle,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "onClick" | "children"> & {
  value: string
  label: string
  successTitle: string
}) {
  const [copied, setCopied] = React.useState(false)
  const timeoutRef = React.useRef<number | undefined>(undefined)

  React.useEffect(() => {
    return () => window.clearTimeout(timeoutRef.current)
  }, [])

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
    } catch {
      toast.add({
        title: "Nie udało się skopiować.",
        type: "error",
      })
      return
    }

    setCopied(true)
    toast.add({
      title: successTitle,
      type: "success",
    })
    window.clearTimeout(timeoutRef.current)
    timeoutRef.current = window.setTimeout(
      () => setCopied(false),
      COPIED_RESET_MS
    )
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      aria-label={copied ? "Skopiowano" : label}
      onClick={handleCopy}
      {...props}
    >
      {copied ? <Check /> : <Copy />}
    </Button>
  )
}

export { CopyButton }
