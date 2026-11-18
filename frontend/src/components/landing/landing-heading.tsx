import { cn } from "cn"

function LandingHeading({
  title,
  description,
  className,
}: {
  title: string
  description?: string
  className?: string
}) {
  return (
    <div className={cn("flex max-w-2xl flex-col gap-3", className)}>
      <h2 className="font-serif text-3xl leading-tight font-normal md:text-4xl">
        {title}
      </h2>
      {description != null ? (
        <p className="text-muted-foreground">{description}</p>
      ) : null}
    </div>
  )
}

export { LandingHeading }
