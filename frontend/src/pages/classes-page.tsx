import * as React from "react";
import { GraduationCap } from "lucide-react";
import { CreateClassDialog } from "@/components/classes/create-class-dialog";
import { ClassRow } from "@/components/classes/class-row";
import { Card, CardContent } from "@/components/ui/card";
import { DataState } from "@/components/data-state";
import { EmptyState } from "@/components/empty-state";
import { AppShell } from "@/components/layout/app-shell";
import { SegmentedControl } from "@/components/segmented-control";
import type { SegmentedOption } from "@/components/segmented-control";
import { Toaster } from "@/components/ui/toast";
import { useAsyncData } from "@/hooks/use-async-data";
import { getClassSummaries } from "@/lib/class-management";
import type { ClassSummary } from "@/lib/class-management";

type ClassFilter = "all" | "mine" | "others";

const CLASS_PATH = "/dashboard/class";

const FILTER_OPTIONS: SegmentedOption<ClassFilter>[] = [
  { value: "all", label: "Wszystkie" },
  { value: "mine", label: "Moje" },
  { value: "others", label: "Moich dzieci" },
];

function matchesFilter(item: ClassSummary, filter: ClassFilter): boolean {
  switch (filter) {
    case "all":
      return true;
    case "mine":
      return item.isOwner;
    case "others":
      return !item.isOwner;
  }
}

function ClassesPage() {
  const [filter, setFilter] = React.useState<ClassFilter>("all");
  const load = React.useCallback(() => getClassSummaries(), []);
  const { data, error, isLoading, reload } = useAsyncData(load);

  const visible = (data ?? []).filter((item) => matchesFilter(item, filter));

  return (
    <AppShell activeId="classes">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Klasy</h1>
            <p className="text-sm text-muted-foreground">
              Klasy, którymi zarządzasz, oraz klasy Twoich dzieci
            </p>
          </div>
          <CreateClassDialog onCreated={reload} />
        </div>
        <SegmentedControl<ClassFilter>
          aria-label="Filtr klas"
          className="max-w-md"
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
              title="Brak klas"
              description="Nie ma klas pasujących do tego filtra."
            />
          }
        >
          <Card>
            <CardContent>
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
