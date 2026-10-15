import { cn } from "cn"
import { Toaster } from "@/components/ui/toast"

function AuthLogo({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      <span
        aria-hidden
        className="flex size-9 items-center justify-center rounded-lg bg-foreground font-serif text-lg text-background"
      >
        S
      </span>
      <span className="text-lg font-bold">SchoolMoney</span>
    </div>
  )
}

function AuthLayout({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex min-h-dvh w-full bg-muted", className)}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center px-6 py-10 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-[400px]">{children}</div>
      </div>
      <div className="hidden min-w-0 flex-1 p-3 lg:block">
        <aside className="flex h-full flex-col justify-end gap-4 rounded-2xl bg-[#0F1115] p-10">
          <span
            aria-hidden
            className="flex size-10 items-center justify-center rounded-lg bg-primary font-serif text-xl text-primary-foreground"
          >
            S
          </span>
          <p className="max-w-sm font-serif text-3xl leading-tight text-white">
            Zbiórki klasowe bez gotówki i arkuszy.
          </p>
          <p className="max-w-sm text-sm text-neutral-400">
            Jasne wpłaty, osobny rachunek każdej zbiórki, pełna przejrzystość
            dla rodziców.
          </p>
        </aside>
      </div>
      <Toaster />
    </div>
  )
}

export { AuthLayout, AuthLogo }
