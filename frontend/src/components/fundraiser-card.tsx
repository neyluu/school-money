import { Link } from "react-router"
import { cn } from "cn"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { MoneyAmount } from "@/components/money-amount"
import {
  Progress,
  ProgressIndicator,
  ProgressOverlay,
  ProgressTrack,
} from "@/components/ui/progress"

export type FundraiserStatus = "active" | "closed" | "cancelled"

const STATUS_LABELS: Record<FundraiserStatus, string> = {
  active: "Aktywna",
  closed: "Zamknięta",
  cancelled: "Zamknięta ze zwrotem",
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
        "w-80",
        isOwner && "ring-2 ring-primary/60",
        href != null && "transition-shadow hover:ring-foreground/25",
        className
      )}
      {...props}
    >
      <CardHeader>
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 text-primary [&_svg]:size-5"
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt=""
                className="size-full object-cover"
              />
            ) : (
              icon
            )}
          </span>
          <div className="min-w-0">
            <CardTitle className="truncate">{title}</CardTitle>
            {classLabel != null ? (
              <p className="truncate text-xs text-muted-foreground">
                {classLabel}
              </p>
            ) : null}
            <p className="text-xs text-muted-foreground">
              Termin: {dateFormatter.format(new Date(dueDate))}
            </p>
          </div>
        </div>
        <CardAction>
          <div className="flex flex-col items-end gap-1">
            <Badge variant={status === "active" ? "success" : "neutral"}>
              {STATUS_LABELS[status]}
            </Badge>
            {isOwner ? <Badge variant="warning">Twoja zbiórka</Badge> : null}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {hasProgress ? (
          <>
            <Progress value={percent}>
              <ProgressTrack className="h-5">
                <ProgressIndicator />
                <ProgressOverlay>
                  {targetFormatter.format(collected)} /{" "}
                  {targetFormatter.format(target)} {currency}
                </ProgressOverlay>
              </ProgressTrack>
            </Progress>
            <p className="flex items-baseline justify-between text-xs text-muted-foreground">
              <span>
                Zebrano <MoneyAmount amount={collected} currency={currency} />
              </span>
              <span className="tabular-nums">
                cel: {targetFormatter.format(target)} {currency}
              </span>
            </p>
          </>
        ) : null}
        {!hasProgress && amountPerChild != null ? (
          <p className="flex items-baseline justify-between text-xs text-muted-foreground">
            <span>Kwota od dziecka</span>
            <MoneyAmount amount={amountPerChild} currency={currency} />
          </p>
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
      className="block rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {card}
    </Link>
  )
}

export { FundraiserCard }
