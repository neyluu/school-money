import * as React from "react"
import { Progress as ProgressPrimitive } from "@base-ui/react/progress"
import { cn } from "cn"

function Progress({
  className,
  children,
  value,
  ...props
}: ProgressPrimitive.Root.Props) {
  return (
    <ProgressPrimitive.Root
      value={value}
      data-slot="progress"
      className={cn("flex flex-wrap gap-3", className)}
      {...props}
    >
      {children}
    </ProgressPrimitive.Root>
  )
}

function ProgressTrack({ className, ...props }: ProgressPrimitive.Track.Props) {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "relative flex h-3 w-full items-center overflow-hidden rounded-md bg-muted",
        className
      )}
      data-slot="progress-track"
      {...props}
    />
  )
}

function ProgressIndicator({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props) {
  return (
    <ProgressPrimitive.Indicator
      data-slot="progress-indicator"
      className={cn(
        "relative h-full rounded-md bg-amber-500 transition-[width,background-color] duration-500 ease-out",
        "after:absolute after:inset-0 after:animate-[progress-shimmer_2.5s_ease-in-out_infinite]",
        "after:bg-gradient-to-r after:from-transparent after:via-white/35 after:to-transparent",
        "motion-reduce:after:animate-none",
        className
      )}
      {...props}
    />
  )
}

function ProgressOverlay({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="progress-overlay"
      className={cn(
        "pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] font-semibold whitespace-nowrap text-white drop-shadow-sm",
        className
      )}
      {...props}
    />
  )
}

function ProgressLabel({ className, ...props }: ProgressPrimitive.Label.Props) {
  return (
    <ProgressPrimitive.Label
      className={cn("text-sm font-medium", className)}
      data-slot="progress-label"
      {...props}
    />
  )
}

function ProgressValue({ className, ...props }: ProgressPrimitive.Value.Props) {
  return (
    <ProgressPrimitive.Value
      className={cn(
        "ml-auto text-sm text-muted-foreground tabular-nums",
        className
      )}
      data-slot="progress-value"
      {...props}
    />
  )
}

export {
  Progress,
  ProgressTrack,
  ProgressIndicator,
  ProgressOverlay,
  ProgressLabel,
  ProgressValue,
}
