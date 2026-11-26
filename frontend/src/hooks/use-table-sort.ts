import * as React from "react";

export type SortDirection = "asc" | "desc";
export type SortState<K extends string> = {
  key: K;
  direction: SortDirection;
} | null;

export function useTableSort<T, K extends string>(
  rows: T[],
  accessors: Record<K, (row: T) => string | number>,
) {
  const [sort, setSort] = React.useState<SortState<K>>(null);

  const sorted = React.useMemo(() => {
    if (sort == null) {
      return rows;
    }
    const get = accessors[sort.key];
    const factor = sort.direction === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * factor;
      }
      return String(va).localeCompare(String(vb), "pl") * factor;
    });
  }, [rows, sort, accessors]);

  function toggle(key: K) {
    setSort((current) => {
      if (current == null || current.key !== key) {
        return { key, direction: "asc" };
      }
      if (current.direction === "asc") {
        return { key, direction: "desc" };
      }
      return null;
    });
  }

  return { sorted, sort, toggle };
}
