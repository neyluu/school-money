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

export type CollectionStatus = "active" | "closed"

const dateFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
})

const targetFormatter = new Intl.NumberFormat("pl-PL", {
  maximumFractionDigits: 0,
})

function CollectionCard({
  icon,
  imageUrl,
  title,
  dueDate,
  collected,
  target,
  status,
  currency = "zł",
  className,
  ...props
}: React.ComponentProps<"div"> & {
  icon?: React.ReactNode
  imageUrl?: string
  title: string
  dueDate: string | number | Date
  collected: number
  target: number
  status: CollectionStatus
  currency?: string
}) {
  const percent = target > 0 ? Math.min(100, (collected / target) * 100) : 0

  return (
    <Card className={cn("w-80", className)} {...props}>
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
            <p className="text-xs text-muted-foreground">
              Termin: {dateFormatter.format(new Date(dueDate))}
            </p>
          </div>
        </div>
        <CardAction>
          <Badge variant={status === "active" ? "success" : "neutral"}>
            {status === "active" ? "Aktywna" : "Zamknięta"}
          </Badge>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
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
      </CardContent>
    </Card>
  )
}

export { CollectionCard }
