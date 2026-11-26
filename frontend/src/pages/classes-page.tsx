import * as React from "react";
import { GraduationCap } from "lucide-react";
import { CreateClassDialog } from "@/components/classes/create-class-dialog";
import { ClassRow } from "@/components/classes/class-row";
import { Card, CardContent } from "@/components/ui/card";
import { DataState } from "@/components/data-state";
import { EmptyState } from "@/components/empty-state";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/page-header";
import { SegmentedControl } from "@/components/segmented-control";
import type { SegmentedOption } from "@/components/segmented-control";
import { Toaster } from "@/components/ui/toast";
import { useAsyncData } from "@/hooks/use-async-data";
import { getClassSummaries } from "@/lib/class-management";
import type { ClassSummary } from "@/lib/class-management";

type ClassFilter = "all" | "mine" | "others" | "blocked";

const CLASS_PATH = "/dashboard/class";

const FILTER_OPTIONS: SegmentedOption<ClassFilter>[] = [
  { value: "all", label: "Wszystkie" },
  { value: "mine", label: "Moje" },
  { value: "others", label: "Moich dzieci" },
  { value: "blocked", label: "Zablokowane" },
];

const EMPTY_TEXTS: Record<ClassFilter, string> = {
  all: "Załóż klasę albo dodaj dziecko kodem od skarbnika.",
  mine: "Nie prowadzisz jeszcze żadnej klasy.",
  others: "Żadne z Twoich dzieci nie jest jeszcze w klasie.",
  blocked: "Żadna z Twoich klas nie została zablokowana.",
};

function matchesFilter(item: ClassSummary, filter: ClassFilter): boolean {
  switch (filter) {
    case "blocked":
      return item.isBlocked;
    case "all":
      return true;
    case "mine":
      return item.isOwner && !item.isBlocked;
    case "others":
      return !item.isOwner && !item.isBlocked;
  }
}

function isVisible(item: ClassSummary): boolean {
  return (
    item.isOwner ||
    item.myChildren.some((membership) => membership.status === "ACCEPTED")
  );
}

function ClassesPage() {
  const [filter, setFilter] = React.useState<ClassFilter>("all");
  const load = React.useCallback(() => getClassSummaries(), []);
  const { data, error, isLoading, reload } = useAsyncData(load);

  const visible = (data ?? [])
    .filter(isVisible)
    .filter((item) => matchesFilter(item, filter));

  return (
    <AppShell activeId="class">
      <div className="flex flex-col gap-6">
        <PageHeader
          title="Klasy"
          description="Klasy, które prowadzisz, i klasy, do których należą Twoje dzieci."
          actions={<CreateClassDialog onCreated={reload} />}
        />
        <SegmentedControl<ClassFilter>
          aria-label="Filtr klas"
          className="max-w-xl"
          options={FILTER_OPTIONS}
          value={filter}
          onChange={setFilter}
        />
        <DataState
          isLoading={isLoading}
          hasError={error != null}
          isEmpty={data != null && visible.length === 0}
          onRetry={reload}
          emptyState={
            <EmptyState
              icon={<GraduationCap />}
              title="Nic tu jeszcze nie ma"
              description={EMPTY_TEXTS[filter]}
            />
          }
        >
          <Card className="p-0">
            <CardContent className="p-0">
              <ul className="flex flex-col divide-y">
                {visible.map((item) => (
                  <ClassRow
                    key={item.id}
                    item={item}
                    href={`${CLASS_PATH}/${item.id}`}
                  />
                ))}
              </ul>
            </CardContent>
          </Card>
        </DataState>
      </div>
      <Toaster />
    </AppShell>
  );
}

export { ClassesPage };
