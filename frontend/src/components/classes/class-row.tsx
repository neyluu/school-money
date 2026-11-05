import { Link } from "react-router";
import { ChevronRight, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ClassSummary } from "@/lib/class-management";
import { STATUS_LABELS } from "@/lib/classes";
import type { MembershipStatus } from "@/lib/classes";

const STATUS_VARIANTS: Record<
  MembershipStatus,
  "success" | "warning" | "danger" | "neutral"
> = {
  ACCEPTED: "success",
  PENDING: "warning",
  REJECTED: "danger",
  CLASS_DELETED: "neutral",
};

const ROW_CLASS =
  "flex flex-wrap items-center justify-between gap-3 rounded-md px-2 py-3";

function ClassRow({ item, href }: { item: ClassSummary; href: string }) {
  const isDeleted = item.deletedAt != null;

  const content = (
    <>
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <GraduationCap className="size-5" />
        </div>
        <div className="flex min-w-0 flex-col">
          <span className="truncate text-sm font-semibold">{item.name}</span>
          <span className="truncate text-xs text-muted-foreground">
            {item.school} · {item.city}
          </span>
          {!item.isOwner ? (
            <span className="truncate text-xs text-muted-foreground">
              Skarbnik: {item.owner.firstName} {item.owner.lastName}
            </span>
          ) : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        {!item.isOwner
          ? item.myChildren
            .filter((membership) => membership.status === "ACCEPTED")
            .map((membership) => (
              <div
                key={membership.childId}
                className="flex items-center gap-1.5"
              >
                <span className="text-xs text-muted-foreground">
                  {membership.childFirstName}
                </span>
                <Badge variant={STATUS_VARIANTS[membership.status]}>
                  {STATUS_LABELS[membership.status]}
                </Badge>
              </div>
            ))
          : null}
        <Badge variant="neutral">Dzieci: {item.childrenCount}</Badge>
        {isDeleted ? (
          <Badge variant="neutral">Usunięta</Badge>
        ) : item.isOwner ? (
          <Badge variant="warning">Skarbnik</Badge>
        ) : null}
        {!isDeleted ? (
          <ChevronRight className="size-4 text-muted-foreground" />
        ) : null}
      </div>
    </>
  );

  return (
    <li>
      {isDeleted ? (
        <div className={ROW_CLASS}>{content}</div>
      ) : (
        <Link
          to={href}
          className={`${ROW_CLASS} outline-none transition-colors hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring`}
        >
          {content}
        </Link>
      )}
    </li>
  );
}

export { ClassRow };
