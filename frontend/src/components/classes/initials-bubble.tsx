import type { ClassChild } from "@/lib/class-management";

function InitialsBubble({ child }: { child: ClassChild }) {
  const initials =
    `${child.firstName.charAt(0)}${child.lastName.charAt(0)}`.toUpperCase();
  return (
    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
      {initials}
    </div>
  );
}

export { InitialsBubble };
