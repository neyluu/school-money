import { cn } from "cn";
import { useChildAvatarUrl } from "@/components/children/use-child-avatar-url";
import { childInitials } from "@/lib/children";
import type { Child } from "@/lib/children";

function ChildAvatar({
  child,
  className,
}: {
  child: Child;
  className?: string;
}) {
  const avatarUrl = useChildAvatarUrl(child.id, child.avatarId);

  return (
    <span
      aria-hidden
      className={cn(
        "flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-sm font-semibold text-primary",
        className,
      )}
    >
      {avatarUrl != null ? (
        <img src={avatarUrl} alt="" className="size-full object-cover" />
      ) : (
        childInitials(child)
      )}
    </span>
  );
}

export { ChildAvatar };
