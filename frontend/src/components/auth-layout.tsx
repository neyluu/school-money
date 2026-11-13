
import { cn } from "cn"
import { Toaster } from "@/components/ui/toast"
import Logo from "@/assets/Logo.svg"

function AuthLogo({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <a
      className={cn("flex items-center gap-2", className)}
      {...props}
      href="/"
    >
      <img
        src={Logo}
        width="auto"
        height="auto"
        className="w-6"
        alt="Logo Icon"
        draggable="false"
      />
      <span className="text-lg font-medium">SchoolMoney</span>
    </a>
  )
}

function AuthLayout({
  children,
  className,
  ...props
}: React.ComponentProps<"div">) {
  const columns = 24
  const rows = 36

  return (
    <div
      className={cn("flex min-h-dvh w-full bg-muted", className)}
      {...props}
    >
      <div className="flex min-w-0 flex-1 flex-col justify-center px-6 py-10 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-[400px]">{children}</div>
      </div>

      <div className="hidden min-w-0 flex-1 p-3 lg:block">
        <aside className="relative flex h-full flex-col justify-end gap-4 overflow-hidden rounded-2xl bg-[#0a0a0a] p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 grid content-start gap-0 p-0"
            style={{
              gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
              gridAutoRows: "1fr",
            }}
          >
            {Array.from({ length: columns * rows }).map((_, index) => {
              const row = Math.floor(index / columns)
              const column = index % columns
              const diagonal = (column + row) / (columns + rows - 2)
              const opacity = 0.025 + diagonal * 0.085

              return (
                <div
                  key={index}
                  className="flex aspect-square min-w-0 items-center justify-center overflow-hidden"
                >
                  <img
                    src={Logo}
                    alt=""
                    draggable="false"
                    className="block size-[calc(100%-1px)] object-fill"
                    style={{
                      opacity,
                      filter: "brightness(0) invert(1)",
                    }}
                  />
                </div>
              )
            })}
          </div>

          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-[#0a0a0a]/90 via-transparent to-transparent"
          />

          <div className="relative z-10 flex size-10 items-center justify-center rounded-lg border border-white/10 bg-white/10 p-2">
            <img
              src={Logo}
              width="auto"
              height="auto"
              className="w-6 invert"
              alt="Logo Icon"
              draggable="false"
            />
          </div>

          <p className="relative z-10 max-w-sm font-serif text-3xl leading-tight text-white">
            Zbiórki klasowe bez gotówki i arkuszy.
          </p>

          <p className="relative z-10 max-w-sm text-sm text-neutral-400">
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
