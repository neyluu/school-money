import { cn } from "cn"
import { BottomNavigation } from "@/components/layout/bottom-navigation"
import { Sidebar } from "@/components/layout/sidebar"
import type { NavigationItem } from "@/components/layout/navigation"
import { Topbar } from "@/components/layout/topbar"

function AppShell({
  children,
  navigationItems,
  activeId,
  onNavigate,
  sidebar,
  topbar,
  bottomNavigation,
  unreadCount,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  navigationItems?: NavigationItem[]
  activeId?: string
  onNavigate?: (item: NavigationItem) => void
  sidebar?: React.ReactNode
  topbar?: React.ReactNode
  bottomNavigation?: React.ReactNode
  unreadCount?: number
}) {
  return (
    <div
      className={cn("flex h-dvh w-full overflow-hidden bg-background", className)}
      {...props}
    >
      {sidebar ?? (
        <Sidebar
          items={navigationItems}
          activeId={activeId}
          onNavigate={onNavigate}
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col md:pl-60">
        {topbar ?? <Topbar unreadCount={unreadCount} />}
        <main className="flex-1 overflow-y-auto px-4 pt-20 pb-24 md:px-6 md:pt-24 md:pb-8">
          <div className="mx-auto w-full max-w-5xl">{children}</div>
        </main>
      </div>
      {bottomNavigation ?? (
        <BottomNavigation
          items={navigationItems?.slice(0, 5)}
          activeId={activeId}
          onNavigate={onNavigate}
        />
      )}
    </div>
  )
}

export { AppShell }
export type { NavigationItem } from "@/components/layout/navigation"
