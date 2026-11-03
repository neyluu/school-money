import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress"

function FundraisingProgressCard({
  title,
  paidChildren,
  totalChildren,
}: {
  title: string
  paidChildren: number
  totalChildren: number
}) {
  const percent = totalChildren > 0 ? (paidChildren / totalChildren) * 100 : 0
  const waiting = totalChildren - paidChildren

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Progress value={percent}>
          <ProgressTrack className="h-2">
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
        <p className="text-sm font-semibold tabular-nums">
          {paidChildren} / {totalChildren} dzieci
        </p>
        <p className="text-sm text-muted-foreground">
          {waiting > 0
            ? `Czeka na wpłatę: ${waiting}`
            : "Wszystkie dzieci mają opłaconą zbiórkę."}
        </p>
      </CardContent>
    </Card>
  )
}

export { FundraisingProgressCard }
