import { authorizedRequest } from "@/lib/authorized-client";

export type NotificationType = "PENDING_REQUESTS" | "NEW_PAYMENT";

export type NotificationItem = {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  link: string;
  createdAt: string | null;
};

export type NotificationsResponse = {
  treasurer: boolean;
  items: NotificationItem[];
};

function getNotifications(since?: string): Promise<NotificationsResponse> {
  const query = since ? `?since=${encodeURIComponent(since)}` : "";
  return authorizedRequest<NotificationsResponse>(`/notifications${query}`);
}

export { getNotifications };
