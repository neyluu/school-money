import { cn } from "cn";
import { GraduationCap } from "lucide-react";
import { userInitials } from "@/components/chat/chat-format";
import type { ChatUser } from "@/lib/chat";

function ChatAvatar({
  user,
  className,
}: {
  user: ChatUser | null;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {user != null ? userInitials(user) : <GraduationCap className="size-5" />}
    </span>
  );
}

export { ChatAvatar };
