import * as React from "react";
import { useNavigate } from "react-router";
import { UserRound } from "lucide-react";
import { AddChildDialog } from "@/components/children/add-child-dialog";
import { ChangeAvatarDialog } from "@/components/children/change-avatar-dialog";
import { ChildAvatar } from "@/components/children/child-avatar";
import { EmptyState } from "@/components/empty-state";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { toast, Toaster } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import { getChildren } from "@/lib/children";
import type { Child } from "@/lib/children";

function formatBirthDate(value: string): string {
  return new Date(`${value}T00:00:00`).toLocaleDateString("pl-PL");
}

function ChildrenPage() {
  const navigate = useNavigate();
  const [children, setChildren] = React.useState<Child[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const loadChildren = React.useCallback(() => {
    getChildren()
      .then((loaded) => {
        setChildren(loaded);
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
    loadChildren();
  }, [loadChildren]);

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
          <AddChildDialog onCreated={loadChildren} />
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
                {children.map((child) => (
                  <li
                    key={child.id}
                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <ChildAvatar child={child} />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm font-semibold">
                        {child.firstname} {child.lastname}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        ur. {formatBirthDate(child.birthDate)}
                      </span>
                    </div>
                    <ChangeAvatarDialog
                      child={child}
                      onChanged={loadChildren}
                    />
                  </li>
                ))}
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
