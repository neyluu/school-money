import { cn } from "cn"

const formatter = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function FundsRatioBar({
  moneyIn,
  moneyOut,
  currency = "zł",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  moneyIn: number
  moneyOut: number
  currency?: string
}) {
  const total = moneyIn + moneyOut
  const inPct = total > 0 ? (moneyIn / total) * 100 : 0

  return (
    <div className={cn("w-full", className)} {...props}>
      <div
        role="img"
        aria-label={`Wpływy ${formatter.format(moneyIn)} ${currency}, wydatki ${formatter.format(moneyOut)} ${currency}`}
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <div
          className="bg-success transition-all"
          style={{ width: `${inPct}%` }}
        />
        <div
          className="bg-warning transition-all"
          style={{ width: `${100 - inPct}%` }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-full bg-success"
          />
          Wpływy
          <strong className="font-semibold text-foreground tabular-nums">
            {formatter.format(moneyIn)} {currency}
          </strong>
        </span>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span
            aria-hidden
            className="size-2 shrink-0 rounded-full bg-warning"
          />
          Wydatki
          <strong className="font-semibold text-foreground tabular-nums">
            {formatter.format(moneyOut)} {currency}
          </strong>
        </span>
      </div>
    </div>
  )
}

export { FundsRatioBar }
