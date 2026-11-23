import type { ChatUser } from "@/lib/chat";

function fullName(user: ChatUser): string {
  return `${user.firstName} ${user.lastName}`;
}

function userInitials(user: ChatUser): string {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
}

function formatTime(value: string): string {
  return new Date(value).toLocaleTimeString("pl-PL", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isSameDay(a: string, b: string): boolean {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

function formatDay(value: string): string {
  const date = new Date(value);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return "Dziś";
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return "Wczoraj";
  }
  return date.toLocaleDateString("pl-PL", {
    day: "numeric",
    month: "long",
    year: date.getFullYear() === today.getFullYear() ? undefined : "numeric",
  });
}

function formatListTime(value: string): string {
  return isSameDay(value, new Date().toISOString())
    ? formatTime(value)
    : new Date(value).toLocaleDateString("pl-PL", {
        day: "2-digit",
        month: "2-digit",
      });
}

export {
  formatDay,
  formatListTime,
  formatTime,
  fullName,
  isSameDay,
  userInitials,
};
