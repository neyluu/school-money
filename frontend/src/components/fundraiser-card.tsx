import { Link } from "react-router"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MoneyAmount } from "@/components/money-amount"
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress"

export type FundraiserStatus = "active" | "closed" | "cancelled"

const STATUS_LABELS: Record<FundraiserStatus, string> = {
  active: "Aktywna",
  closed: "Zamknięta",
  cancelled: "Zwrócona",
}

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
})

const targetFormatter = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 0,
})

function FundraiserCard({
  icon,
  imageUrl,
  title,
  classLabel,
  isOwner = false,
  dueDate,
  collected,
  target,
  amountPerChild,
  status,
  href,
  currency = "zł",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: React.ReactNode
  imageUrl?: string
  title: string
  classLabel?: string
  isOwner?: boolean
  dueDate: string | number | Date
  collected?: number
  target?: number
  amountPerChild?: number
  status: FundraiserStatus
  href?: string
  currency?: string
}) {
  const hasProgress = collected != null && target != null
  const percent =
    hasProgress && target > 0 ? Math.min(100, (collected / target) * 100) : 0

  const card = (
    <Card
      className={cn(
        "w-80 gap-0 overflow-hidden rounded-lg border-0 bg-card py-0 shadow-sm",
        isOwner && "ring-1 ring-primary/15",
        href != null && "transition-shadow hover:shadow-md",
        className
      )}
      {...props}
    >
      <CardHeader className="relative space-y-2 px-4 pt-4 pb-3">
        {/* Badge + data po prawej */}
        <div className="absolute right-4 top-4 flex flex-col items-end gap-1.5">
          <Badge
            variant={status === "active" ? "success" : "neutral"}
            className="shrink-0"
          >
            {STATUS_LABELS[status]}
          </Badge>
          <p className="text-[11px] font-medium text-muted-foreground/80">
            Do {dateFormatter.format(new Date(dueDate))}
          </p>
        </div>

        {/* Logo */}
        <span
          aria-hidden
          className="flex size-10 items-center justify-center overflow-hidden rounded-xl bg-primary/10 text-primary [&_svg]:size-6"
        >
          {imageUrl ? (
            <img src={imageUrl} alt="" className="size-full object-cover" />
          ) : (
            icon
          )}
        </span>

        {/* Tytuł + opis */}
        <div className="space-y-0.5">
          <CardTitle className="pr-16 text-[0.925rem] font-medium leading-snug tracking-tight">
            {title}
          </CardTitle>
          {classLabel && (
            <p className="text-xs leading-relaxed text-muted-foreground">
              {classLabel}
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3 px-4 pb-4 pt-0">
        {hasProgress ? (
          <div className="space-y-2">
            <Progress value={percent}>
              <ProgressTrack className="h-2 rounded-full bg-muted">
                <ProgressIndicator className="rounded-full" />
              </ProgressTrack>
            </Progress>

            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold tabular-nums">
                {Math.round(percent)}%
              </span>
              <span className="text-xs tabular-nums text-muted-foreground">
                {targetFormatter.format(collected)} /{" "}
                {targetFormatter.format(target)} {currency}
              </span>
            </div>
          </div>
        ) : amountPerChild != null ? (
          <div className="flex items-baseline justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2.5">
            <span className="text-xs text-muted-foreground">
              Kwota od dziecka
            </span>
            <span className="text-sm font-medium tabular-nums">
              <MoneyAmount amount={amountPerChild} currency={currency} />
            </span>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )

  if (href == null) {
    return card
  }

  return (
    <Link
      to={href}
      className="block rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {card}
    </Link>
  )
}

export { FundraiserCard }
