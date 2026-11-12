import * as React from "react";
import { cn } from "cn";
import { Bell, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout, me } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";

let cachedUser: AuthUser | null = null;

function userInitials(user: AuthUser | null): string {
  if (user == null) {
    return "?";
  }
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

function useCurrentUser(): AuthUser | null {
  const [user, setUser] = React.useState<AuthUser | null>(cachedUser);

  React.useEffect(() => {
    let cancelled = false;
    me()
      .then((loaded) => {
        cachedUser = loaded;
        if (!cancelled) {
          setUser(loaded);
        }
      })
      .catch(() => {
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return user;
}

function Topbar({
  onSearch,
  onNotifications,
  unreadCount = 0,
  searchSlot,
  className,
  ...props
}: React.ComponentProps<"header"> & {
  onSearch?: () => void;
  onNotifications?: () => void;
  unreadCount?: number;
  searchSlot?: React.ReactNode;
}) {
  const user = useCurrentUser();
  const fullName = user != null ? `${user.firstName} ${user.lastName}` : "";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-30 flex h-16 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur md:left-60 md:px-6",
        className,
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

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Menu użytkownika"
                className="flex size-8 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground outline-none transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring"
              />
            }
          >
            {userInitials(user)}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {user != null ? (
              <div className="flex flex-col px-1.5 py-1.5">
                <span className="truncate text-sm font-medium">{fullName}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {user.email}
                </span>
              </div>
            ) : null}
            <DropdownMenuItem variant="destructive" onClick={logout}>
              <LogOut />
              Wyloguj się
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export { Topbar };
