import * as React from "react";
import { useNavigate } from "react-router";
import { UserRound } from "lucide-react";
import { AddChildDialog } from "@/components/children/add-child-dialog";
import { ChangeAvatarDialog } from "@/components/children/change-avatar-dialog";
import { ChildAvatar } from "@/components/children/child-avatar";
import { JoinClassDialog } from "@/components/children/join-class-dialog";
import { LeaveClassDialog } from "@/components/children/leave-class-dialog";
import { EmptyState } from "@/components/empty-state";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast, Toaster } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import { getChildren } from "@/lib/children";
import type { Child } from "@/lib/children";
import { getClasses, groupClassesByChild, STATUS_LABELS } from "@/lib/classes";
import type { ChildClassInfo, MembershipStatus } from "@/lib/classes";

const STATUS_VARIANTS: Record<
  MembershipStatus,
  "success" | "warning" | "danger" | "neutral"
> = {
  ACCEPTED: "success",
  PENDING: "warning",
  REJECTED: "danger",
  CLASS_DELETED: "neutral",
};

const STATUS_PRIORITY: Record<MembershipStatus, number> = {
  ACCEPTED: 0,
  PENDING: 1,
  REJECTED: 2,
  CLASS_DELETED: 3,
};

function pickPrimary(list: ChildClassInfo[]): ChildClassInfo | undefined {
  return [...list].sort(
    (a, b) => STATUS_PRIORITY[a.status] - STATUS_PRIORITY[b.status],
  )[0];
}

function formatBirthDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("pl-PL");
}

function ChildrenPage() {
  const navigate = useNavigate();
  const [children, setChildren] = React.useState<Child[]>([]);
  const [classesByChild, setClassesByChild] = React.useState<
    Map<number, ChildClassInfo[]>
  >(new Map());
  const [isLoading, setIsLoading] = React.useState(true);

  const loadData = React.useCallback(() => {
    Promise.all([getChildren(), getClasses()])
      .then(([loadedChildren, loadedClasses]) => {
        setChildren(loadedChildren);
        setClassesByChild(groupClassesByChild(loadedClasses));
        setIsLoading(false);
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          navigate("/login", { replace: true });
          return;
        }
        setIsLoading(false);
        toast.add({ title: "Nie udało się wczytać dzieci.", type: "error" });
      });
  }, [navigate]);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <AppShell activeId="children">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Moje dzieci</h1>
            <p className="text-sm text-muted-foreground">
              Dowolna liczba dzieci w różnych klasach
            </p>
          </div>
          <AddChildDialog onCreated={loadData} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Dzieci</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col gap-4">
                {[0, 1].map((index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Skeleton className="size-10 rounded-full" />
                    <div className="flex flex-col gap-1.5">
                      <Skeleton className="h-4 w-36" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : children.length === 0 ? (
              <EmptyState
                icon={<UserRound />}
                title="Nie dodano jeszcze dzieci"
                description="Dodaj dziecko, aby dołączyć do klasy i brać udział w zbiórkach."
              />
            ) : (
              <ul className="flex flex-col divide-y">
                {children.map((child) => {
                  const memberships = classesByChild.get(child.id) ?? [];
                  const info = pickPrimary(memberships);
                  const isActive =
                    info?.status === "ACCEPTED" || info?.status === "PENDING";

                  return (
                    <li
                      key={child.id}
                      className="flex justify-between py-3 first:pt-0 last:pb-0 md:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto]"
                    >
                      <div className="flex gap-15">
                        <div className="flex gap-3">
                          <ChildAvatar child={child} />

                          <div className="flex min-w-24 flex-col ">
                            <span className="truncate text-sm font-semibold">
                              {child.firstname} {child.lastname}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              ur. {formatBirthDate(child.birthDate)}
                            </span>
                          </div>
                        </div>

                        <div className="col-span-2 flex min-w-0 items-center gap-2 md:col-span-1">
                          {info != null ? (
                            <>
                              <div className="flex min-w-36 flex-1 flex-col">
                                <span className="truncate text-sm font-medium">
                                  {info.className}
                                </span>
                                <span className="truncate text-xs text-muted-foreground">
                                  {info.school}
                                </span>
                              </div>
                              <Badge variant={STATUS_VARIANTS[info.status]}>
                                {STATUS_LABELS[info.status]}
                              </Badge>
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">
                              Brak klasy
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="col-span-2 flex items-center justify-end gap-2 md:col-span-1">
                        {info != null && isActive ? (
                          <LeaveClassDialog
                            child={child}
                            info={info}
                            onChanged={loadData}
                          />
                        ) : (
                          <JoinClassDialog child={child} onChanged={loadData} />
                        )}
                        <ChangeAvatarDialog
                          child={child}
                          onChanged={loadData}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </AppShell>
  );
}

export { ChildrenPage };
