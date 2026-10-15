import { cn } from "cn"
import { Settings } from "lucide-react"
import { defaultNavigationItems } from "@/components/layout/navigation"
import type { NavigationItem } from "@/components/layout/navigation"

function Sidebar({
  items = defaultNavigationItems,
  activeId,
  onNavigate,
  className,
  ...props
}: React.ComponentProps<"aside"> & {
  items?: NavigationItem[]
  activeId?: string
  onNavigate?: (item: NavigationItem) => void
}) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r bg-sidebar text-sidebar-foreground md:flex",
        className
      )}
      {...props}
    >
      <div className="flex h-16 items-center gap-2 border-b px-4">
        <span
          aria-hidden
          className="flex size-9 items-center justify-center rounded-lg bg-primary font-serif text-lg text-primary-foreground"
        >
          S
        </span>
        <span className="font-serif text-lg leading-none">
          SchoolMoney
        </span>
      </div>
      <nav aria-label="Nawigacja główna" className="flex-1 overflow-y-auto p-3">
        <ul className="flex flex-col gap-1">
          {items.map((item) => {
            const isActive = item.id === activeId
            return (
              <li key={item.id}>
                <a
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={
                    onNavigate
                      ? (event) => {
                          event.preventDefault()
                          onNavigate(item)
                        }
                      : undefined
                  }
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive &&
                      "bg-sidebar-accent text-sidebar-accent-foreground",
                    !isActive && "text-sidebar-foreground/80",
                    "[&_svg]:size-4 [&_svg]:shrink-0"
                  )}
                >
                  {item.icon}
                  <span className="min-w-0 flex-1 truncate">
                    {item.label}
                  </span>
                  {typeof item.badge === "number" && item.badge > 0 ? (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
                      {item.badge}
                    </span>
                  ) : null}
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
      <div className="border-t p-3">
        <a
          href="/settings"
          onClick={
            onNavigate
              ? (event) => {
                  event.preventDefault()
                  onNavigate({
                    id: "settings",
                    label: "Ustawienia",
                    icon: <Settings />,
                    href: "/settings",
                  })
                }
              : undefined
          }
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground/80 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0"
        >
          <Settings />
          Ustawienia
        </a>
      </div>
    </aside>
  )
}

export { Sidebar }
