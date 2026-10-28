import * as React from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { ChartColumn } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { ChartConfig } from "@/components/ui/chart"
import { formatMoney } from "@/lib/money"
import type { DailyFlow } from "@/lib/wallet"

const chartConfig = {
  income: { label: "Wpływy", color: "var(--success)" },
  expense: { label: "Wydatki", color: "var(--warning)" },
} satisfies ChartConfig

const shortDayFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "short",
  timeZone: "UTC",
})

const longDayFormatter = new Intl.DateTimeFormat("pl-PL", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
})

const axisValueFormatter = new Intl.NumberFormat("pl-PL", {
  notation: "compact",
  maximumFractionDigits: 0,
})

function parseDay(value: string): Date {
  return new Date(`${value}T00:00:00Z`)
}

function formatShortDay(value: string): string {
  return shortDayFormatter.format(parseDay(value))
}

function formatLongDay(label: React.ReactNode): React.ReactNode {
  return typeof label === "string"
    ? longDayFormatter.format(parseDay(label))
    : label
}

function CashFlowChart({ daily }: { daily: DailyFlow[] }) {
  const hasFlow = daily.some((day) => day.income > 0 || day.expense > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Wpływy i wydatki</CardTitle>
        <CardDescription>Ostatnie {daily.length} dni</CardDescription>
      </CardHeader>
      <CardContent>
        {hasFlow ? (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart data={daily}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={24}
                tickFormatter={formatShortDay}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={48}
                tickFormatter={(value: number) => axisValueFormatter.format(value)}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={formatLongDay}
                    valueFormatter={(value) => formatMoney(value)}
                  />
                }
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Bar
                dataKey="income"
                fill="var(--color-income)"
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="expense"
                fill="var(--color-expense)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ChartContainer>
        ) : (
          <EmptyState
            icon={<ChartColumn />}
            title="Brak ruchu na rachunku"
            description="Wykres pojawi się po pierwszej wpłacie lub wypłacie."
          />
        )}
      </CardContent>
    </Card>
  )
}

export { CashFlowChart }
