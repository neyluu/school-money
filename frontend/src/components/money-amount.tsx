import { cn } from "cn"

const formatter = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function MoneyAmount({
  amount,
  currency = "zł",
  inverse = false,
  className,
  ...props
}: React.ComponentProps<"span"> & {
  amount: number
  currency?: string
  inverse?: boolean
}) {
  const [whole, fraction] = formatter.format(Math.abs(amount)).split(",")

  return (
    <span
      className={cn(
        "font-medium whitespace-nowrap tabular-nums",
        inverse ? "text-white" : "text-foreground",
        className
      )}
      {...props}
    >
      {amount < 0 && "– "}
      {whole}
      <span
        className={cn(
          "text-[0.7em] font-normal",
          inverse ? "text-neutral-400" : "text-muted-foreground"
        )}
      >
        ,{fraction} {currency}
      </span>
    </span>
  )
}

export { MoneyAmount }
