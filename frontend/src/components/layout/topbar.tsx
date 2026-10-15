import { cn } from "cn"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"

function Topbar({
  onSearch,
  onNotifications,
  unreadCount = 0,
  searchSlot,
  className,
  ...props
}: React.ComponentProps<"header"> & {
  onSearch?: () => void
  onNotifications?: () => void
  unreadCount?: number
  searchSlot?: React.ReactNode
}) {
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur md:left-60 md:px-6",
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-2 font-serif text-lg md:hidden">
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-lg bg-primary text-base text-primary-foreground"
        >
          S
        </span>
        SchoolMoney
      </span>
      <div className="ml-auto flex items-center gap-1.5">
        {searchSlot ??
          (onSearch ? (
            <Button variant="outline" size="sm" onClick={onSearch}>
              Szukaj
            </Button>
          ) : null)}
        <Button
          variant="ghost"
          size="icon"
          aria-label="Powiadomienia"
          onClick={onNotifications}
          className="relative"
        >
          <Bell />
          {unreadCount > 0 ? (
            <span
              aria-hidden
              className="absolute top-1 right-1 size-2 rounded-full bg-danger"
            />
          ) : null}
        </Button>
        <span
          aria-hidden
          className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground"
        >
          JK
        </span>
      </div>
    </header>
  )
}

export { Topbar }
