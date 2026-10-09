import { cn } from "cn"

function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  icon: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center gap-2 px-6 py-10 text-center",
        className
      )}
      {...props}
    >
      <span
        aria-hidden
        className="mb-1 flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-6"
      >
        {icon}
      </span>
      <p className="text-sm font-semibold text-foreground">{title}</p>
      {description ? (
        <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <span className="mt-2">{action}</span> : null}
    </div>
  )
}

export { EmptyState }
