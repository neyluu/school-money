import { Section } from "@/components/section"
import {
  Progress,
  ProgressIndicator,
  ProgressTrack,
} from "@/components/ui/progress"

function FundraisingProgressCard({
  title,
  paidChildren,
  totalChildren,
  action,
}: {
  title: string
  paidChildren: number
  totalChildren: number
  action?: React.ReactNode
}) {
  const percent = totalChildren > 0 ? (paidChildren / totalChildren) * 100 : 0
  const waiting = totalChildren - paidChildren

  return (
    <Section title={title}>
      <div className="flex flex-col gap-3">
        <Progress value={percent}>
          <ProgressTrack className="h-2">
            <ProgressIndicator />
          </ProgressTrack>
        </Progress>
        <p className="text-sm tabular-nums">
          {paidChildren} z {totalChildren} dzieci opłaciło
        </p>
        <p className="text-sm text-muted-foreground">
          {waiting > 0
            ? `Na wpłatę czeka jeszcze ${waiting}.`
            : "Wszystkie dzieci mają opłaconą zbiórkę."}
        </p>
        {action}
      </div>
    </Section>
  )
}

export { FundraisingProgressCard }
