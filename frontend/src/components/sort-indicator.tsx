import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { SortDirection } from "@/hooks/use-table-sort";

function SortIndicator({
  active,
  direction,
}: {
  active: boolean;
  direction?: SortDirection;
}) {
  if (!active) {
    return (
      <ArrowUpDown
        aria-hidden
        className="ml-1 size-3.5 text-muted-foreground/50"
      />
    );
  }
  return direction === "asc" ? (
    <ArrowUp aria-hidden className="ml-1 size-3.5" />
  ) : (
    <ArrowDown aria-hidden className="ml-1 size-3.5" />
  );
}

export { SortIndicator };
