import * as React from "react";
import { cn } from "cn";
import { BottomNavigation } from "@/components/layout/bottom-navigation";
import { RouteTransition } from "@/components/layout/route-transition";
import { Sidebar } from "@/components/layout/sidebar";
import {
  adminNavigationItems,
  defaultNavigationItems,
} from "@/components/layout/navigation";
import type { NavigationItem } from "@/components/layout/navigation";
import { Topbar } from "@/components/layout/topbar";
import {
  getCurrentUser,
  loadCurrentUser,
  subscribeCurrentUser,
} from "@/lib/current-user";

const SUPPORTS_VIEW_TRANSITIONS =
  typeof document !== "undefined" && "startViewTransition" in document;

function isPlainLeftClick(event: MouseEvent): boolean {
  return (
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey
  );
}

function AppShell({
  children,
  navigationItems,
  activeId,
  onNavigate,
  sidebar,
  topbar,
  bottomNavigation,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  navigationItems?: NavigationItem[];
  activeId?: string;
  onNavigate?: (item: NavigationItem) => void;
  sidebar?: React.ReactNode;
  topbar?: React.ReactNode;
  bottomNavigation?: React.ReactNode;
}) {
  const user = React.useSyncExternalStore(subscribeCurrentUser, getCurrentUser);

  React.useEffect(() => {
    void loadCurrentUser();
  }, []);

  React.useEffect(() => {
    if (!SUPPORTS_VIEW_TRANSITIONS) {
      return;
    }

    function handleClick(event: MouseEvent) {
      if (!isPlainLeftClick(event) || event.defaultPrevented) {
        return;
      }
      const anchor = (event.target as HTMLElement).closest("a");
      if (anchor == null || anchor.target === "_blank") {
        return;
      }
      const url = new URL(anchor.href, window.location.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname === window.location.pathname
      ) {
        return;
      }
      document.startViewTransition(
        () => new Promise<void>((resolve) => window.setTimeout(resolve, 0)),
      );
    }

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, []);

  const isAdmin = user?.role === "ADMIN";
  const base = isAdmin
    ? adminNavigationItems
    : (navigationItems ?? defaultNavigationItems);
  const items = base;
  const bottomItems = isAdmin ? adminNavigationItems : base.slice(0, 5);

  return (
    <div
      className={cn(
        "flex h-dvh w-full overflow-hidden bg-background",
        className,
      )}
      {...props}
    >
      {sidebar ?? (
        <Sidebar items={items} activeId={activeId} onNavigate={onNavigate} />
      )}
      <div className="flex min-w-0 flex-1 flex-col md:pl-60">
        {topbar ?? <Topbar />}
        <main className="flex-1 overflow-y-auto px-4 pt-20 pb-24 md:px-6 md:pt-24 md:pb-8">
          <div className="mx-auto w-full max-w-5xl">
            <RouteTransition>{children}</RouteTransition>
          </div>
        </main>
      </div>
      {bottomNavigation ?? (
        <BottomNavigation
          items={bottomItems}
          activeId={activeId}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
}

export { AppShell };
export type { NavigationItem } from "@/components/layout/navigation";
