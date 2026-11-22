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
        "@container flex w-full flex-wrap rounded-lg bg-muted p-1",
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
              "flex-1 cursor-pointer rounded-md px-2 py-1.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 @sm:px-3",
              options.length > 3 && "@max-[18.5rem]:basis-2/5",
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
