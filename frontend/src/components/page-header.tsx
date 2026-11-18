import { Link } from "react-router"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

function PageHeader({
  backTo,
  backLabel,
  leading,
  eyebrow,
  title,
  badge,
  description,
  actions,
  children,
}: {
  backTo?: string
  backLabel?: string
  leading?: React.ReactNode
  eyebrow?: React.ReactNode
  title: string
  badge?: React.ReactNode
  description?: React.ReactNode
  actions?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4">
      {backTo != null ? (
        <Button
          variant="ghost"
          size="sm"
          className="-ml-2 w-fit text-muted-foreground"
          render={<Link to={backTo} />}
        >
          <ArrowLeft />
          {backLabel ?? "Wróć"}
        </Button>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {leading}
          <div className="flex min-w-0 flex-col gap-1">
            {eyebrow != null ? (
              <p className="text-sm text-muted-foreground">{eyebrow}</p>
            ) : null}
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-normal md:text-3xl">{title}</h1>
              {badge}
            </div>
            {description != null ? (
              <p className="max-w-2xl text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {actions != null ? (
          <div className="flex flex-wrap items-center gap-2">{actions}</div>
        ) : null}
      </div>
      {children}
    </div>
  )
}

export { PageHeader }
