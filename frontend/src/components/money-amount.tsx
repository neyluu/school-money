import { cn } from "cn"

const formatter = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function MoneyAmount({
  amount,
  currency = "zł",
  className,
  ...props
}: React.ComponentProps<"span"> & { amount: number; currency?: string }) {
  const [whole, fraction] = formatter.format(Math.abs(amount)).split(",")

  return (
    <span
      className={cn("font-bold whitespace-nowrap text-foreground", className)}
      {...props}
    >
      {amount < 0 && "– "}
      {whole}
      <span className="text-[0.7em] font-normal text-muted-foreground">
        ,{fraction} {currency}
      </span>
    </span>
  )
}

export { MoneyAmount }
