import * as React from "react";
import { Link } from "react-router";
import { Bell, CircleAlert, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePolling } from "@/hooks/use-polling";
import { getNotifications } from "@/lib/notifications";
import type {
  NotificationItem,
  NotificationsResponse,
} from "@/lib/notifications";

const SEEN_KEY = "sm.notificationsSeenAt";
const POLL_INTERVAL_MS = 5000;

function NotificationRow({
  item,
  onNavigate,
}: {
  item: NotificationItem;
  onNavigate: () => void;
}) {
  const Icon = item.type === "PENDING_REQUESTS" ? CircleAlert : CreditCard;

  return (
    <li className="flex items-center gap-3 py-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground [&_svg]:size-4">
        <Icon />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{item.title}</p>
        <p className="truncate text-xs text-muted-foreground">
          {item.description}
        </p>
      </div>
      <Button
        size="sm"
        variant="outline"
        render={<Link to={item.link} onClick={onNavigate} />}
      >
        Otwórz
      </Button>
    </li>
  );
}

function NotificationsBell() {
  const [data, setData] = React.useState<NotificationsResponse | null>(null);
  const [open, setOpen] = React.useState(false);

  const refresh = React.useCallback(async () => {
    try {
      const seenAt = localStorage.getItem(SEEN_KEY) ?? undefined;
      setData(await getNotifications(seenAt));
    } catch {
      // Zostajemy przy ostatnim znanym stanie, kolejny tick spróbuje ponownie.
    }
  }, []);

  usePolling(refresh, POLL_INTERVAL_MS, true);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      localStorage.setItem(SEEN_KEY, new Date().toISOString());
      void refresh();
    }
  }

  if (data == null || !data.treasurer) {
    return null;
  }

  const count = data.items.length;

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={count > 0 ? `Powiadomienia, ${count}` : "Powiadomienia"}
        onClick={() => setOpen(true)}
        className="relative cursor-pointer"
      >
        <Bell />
        {count > 0 ? (
          <span
            aria-hidden
            className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger px-1 text-[10px] font-medium text-white"
          >
            {count > 9 ? "9+" : count}
          </span>
        ) : null}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Powiadomienia</DialogTitle>
            <DialogDescription>
              Sprawy, które wymagają Twojej uwagi.
            </DialogDescription>
          </DialogHeader>
          {count === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nic nowego. Wszystko zatwierdzone.
            </p>
          ) : (
            <ul className="flex flex-col divide-y">
              {data.items.map((item) => (
                <NotificationRow
                  key={item.id}
                  item={item}
                  onNavigate={() => handleOpenChange(false)}
                />
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export { NotificationsBell };
