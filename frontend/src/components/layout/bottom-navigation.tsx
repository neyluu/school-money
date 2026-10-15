import { cn } from "cn"
import { defaultNavigationItems } from "@/components/layout/navigation"
import type { NavigationItem } from "@/components/layout/navigation"

function BottomNavigation({
  items = defaultNavigationItems.slice(0, 5),
  activeId,
  onNavigate,
  className,
  ...props
}: React.ComponentProps<"nav"> & {
  items?: NavigationItem[]
  activeId?: string
  onNavigate?: (item: NavigationItem) => void
}) {
  return (
    <nav
      aria-label="Nawigacja dolna"
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 backdrop-blur md:hidden",
        className
      )}
      {...props}
    >
      <ul className="grid auto-cols-fr grid-flow-col gap-1 px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
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
                  "relative flex flex-col items-center gap-1 rounded-lg px-1 py-1.5 text-[11px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                  "[&_svg]:size-5 [&_svg]:shrink-0"
                )}
              >
                {item.icon}
                <span className="max-w-full truncate leading-none">
                  {item.label}
                </span>
                {typeof item.badge === "number" && item.badge > 0 ? (
                  <span
                    aria-hidden
                    className="absolute top-0.5 right-1/2 flex h-4 min-w-4 translate-x-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
                  >
                    {item.badge}
                  </span>
                ) : null}
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export { BottomNavigation }
