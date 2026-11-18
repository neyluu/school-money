export type StatItem = {
  label: string
  value: React.ReactNode
  hint?: React.ReactNode
}

const COLUMNS: Record<number, string> = {
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
}

function StatStrip({ items }: { items: StatItem[] }) {
  return (
    <dl
      className={`grid gap-px overflow-hidden rounded-xl bg-border ring-1 ring-foreground/10 sm:grid-cols-2 sm:[&>:last-child:nth-child(odd)]:col-span-2 lg:[&>:last-child:nth-child(odd)]:col-span-1 ${COLUMNS[items.length] ?? "lg:grid-cols-4"}`}
    >
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-1 bg-card p-4">
          <dt className="text-sm text-muted-foreground">{item.label}</dt>
          <dd className="text-xl">{item.value}</dd>
          {item.hint != null ? (
            <dd className="text-xs text-muted-foreground">{item.hint}</dd>
          ) : null}
        </div>
      ))}
    </dl>
  )
}

export { StatStrip }
