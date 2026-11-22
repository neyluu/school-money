import { Link } from "react-router"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress"
import { daysUntil, formatDaysLeft } from "@/lib/dates"
import type { OwnedFundraising } from "@/lib/dashboard"

const MAX_ROWS = 5
const URGENT_DAYS = 3

function DeadlineRow({ fundraising }: { fundraising: OwnedFundraising }) {
  const days = daysUntil(fundraising.endDate)
  const percent =
    fundraising.totalChildren > 0
      ? (fundraising.paidChildren / fundraising.totalChildren) * 100
      : 0
  const variant = days < 0 ? "danger" : days <= URGENT_DAYS ? "warning" : "neutral"

  return (
    <li className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <Link
          to={`/dashboard/fundraisers/${fundraising.id}`}
          className="min-w-0 truncate text-sm font-medium underline-offset-4 hover:underline"
        >
          {fundraising.name}
        </Link>
        <Badge variant={variant}>{formatDaysLeft(days)}</Badge>
      </div>
      <Progress value={percent}>
        <ProgressTrack className="h-2">
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
      <p className="text-xs text-muted-foreground tabular-nums">
        {fundraising.paidChildren} / {fundraising.totalChildren} dzieci
      </p>
    </li>
  )
}

function DashboardDeadlinesCard({
  fundraisings,
}: {
  fundraisings: OwnedFundraising[]
}) {
  const active = fundraisings
    .filter((fundraising) => fundraising.status === "ACTIVE" && !fundraising.isBlocked)
    .sort((a, b) => a.endDate.localeCompare(b.endDate))
    .slice(0, MAX_ROWS)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Terminy</CardTitle>
      </CardHeader>
      <CardContent>
        {active.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Brak aktywnych zbiórek.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {active.map((fundraising) => (
              <DeadlineRow key={fundraising.id} fundraising={fundraising} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export { DashboardDeadlinesCard }
