import { cn } from "cn"

export type SegmentedOption<T extends string> = {
  value: T
  label: string
}

function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  className,
  ...props
}: Omit<React.ComponentProps<"div">, "onChange"> & {
  options: SegmentedOption<T>[]
  value: T
  onChange?: (value: T) => void
}) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "flex w-full rounded-full bg-muted p-1",
        className
      )}
      {...props}
    >
      {options.map((option) => {
        const selected = option.value === value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange?.(option.value)}
            className={cn(
              "flex-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
              selected
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

export { SegmentedControl }
