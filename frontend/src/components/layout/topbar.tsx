import * as React from "react";
import { Link, useNavigate } from "react-router";
import { cn } from "cn";
import { LogOut, MessageCircle, Settings } from "lucide-react";
import { NotificationsBell } from "@/components/notifications-bell";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Logo from "@/assets/Logo.svg";
import { logout } from "@/lib/auth";
import type { AuthUser } from "@/lib/auth";
import {
  getCurrentUser,
  loadCurrentUser,
  subscribeCurrentUser,
} from "@/lib/current-user";

function userInitials(user: AuthUser | null): string {
  if (user == null) {
    return "?";
  }
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

function useCurrentUser(): AuthUser | null {
  const user = React.useSyncExternalStore(subscribeCurrentUser, getCurrentUser);

  React.useEffect(() => {
    void loadCurrentUser();
  }, []);

  return user;
}

function Topbar({
  onSearch,
  searchSlot,
  className,
  ...props
}: React.ComponentProps<"header"> & {
  onSearch?: () => void;
  searchSlot?: React.ReactNode;
}) {
  const navigate = useNavigate();
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
      <div className="flex items-center gap-2 text-lg md:hidden cursor-default">
        <img
          src={Logo}
          width="auto"
          height="auto"
          className="w-6"
          alt="Logo Icon"
          draggable="false"
        />
        <span className="text-lg font-medium">SchoolMoney</span>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        {searchSlot ??
          (onSearch ? (
            <Button variant="outline" size="sm" onClick={onSearch}>
              Szukaj
            </Button>
          ) : null)}
        <Link
          to="/dashboard/chat"
          aria-label="Czat"
          className={cn(
            buttonVariants({ variant: "ghost", size: "icon" }),
            "md:hidden",
          )}
        >
          <MessageCircle />
        </Link>
        <NotificationsBell />

        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <button
                type="button"
                aria-label="Menu użytkownika"
                className="cursor-pointer flex size-8 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground outline-none transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring"
              />
            }
          >
            {userInitials(user)}
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-fit p-2">
            {user != null ? (
              <div className="flex flex-col items-end px-1.5 py-1.5">
                <span className="truncate text-sm font-medium">{fullName}</span>
                <span className="truncate text-xs text-muted-foreground/75">
                  ({user.email})
                </span>
              </div>
            ) : null}
            <DropdownMenuItem
              onClick={() => navigate("/dashboard/settings")}
              className="cursor-pointer"
            >
              <Settings />
              Ustawienia konta
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={logout}
              className="cursor-pointer"
            >
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
