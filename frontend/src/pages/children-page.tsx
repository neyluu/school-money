import * as React from "react";
import { useNavigate } from "react-router";
import {
  ImageMinus,
  ImagePlus,
  MoreHorizontal,
  Pencil,
  Trash2,
  UserMinus,
  UserRound,
} from "lucide-react";
import { DeleteAvatarDialog } from "@/components/children/delete-avatar-dialog";
import { AddChildDialog } from "@/components/children/add-child-dialog";
import { ChangeAvatarDialog } from "@/components/children/change-avatar-dialog";
import { ChildAvatar } from "@/components/children/child-avatar";
import { JoinClassDialog } from "@/components/children/join-class-dialog";
import { LeaveClassDialog } from "@/components/children/leave-class-dialog";
import { EmptyState } from "@/components/empty-state";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast, Toaster } from "@/components/ui/toast";
import { ApiError } from "@/lib/api-client";
import { getChildren } from "@/lib/children";
import type { Child } from "@/lib/children";
import { getClasses, groupClassesByChild, STATUS_LABELS } from "@/lib/classes";
import type { ChildClassInfo, MembershipStatus } from "@/lib/classes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { EditChildDialog } from "@/components/children/edit-child-dialog";
import { DeleteChildDialog } from "@/components/children/delete-child-dialog";

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
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [deletingId, setDeletingId] = React.useState<number | null>(null);
  const [leavingId, setLeavingId] = React.useState<number | null>(null);
  const [avatarEditingId, setAvatarEditingId] = React.useState<number | null>(
    null,
  );
  const [avatarDeletingId, setAvatarDeletingId] = React.useState<number | null>(
    null,
  );

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
        <PageHeader
          title="Moje dzieci"
          description="Możesz dodać dowolną liczbę dzieci, także w różnych klasach."
          actions={<AddChildDialog onCreated={loadData} />}
        />

        <Section title="Dzieci">
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
              title="Nie dodano jeszcze dziecka"
              description="Dodaj dziecko, a potem dołącz do klasy kodem od skarbnika."
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
                    className="flex flex-wrap items-center gap-x-6 gap-y-3 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 flex-1 basis-56 items-center gap-3">
                      <ChildAvatar child={child} />
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate text-sm font-medium">
                          {child.firstname} {child.lastname}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ur. {formatBirthDate(child.birthDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex min-w-0 flex-1 basis-56 items-center gap-3">
                      {info != null ? (
                        <>
                          <div className="flex min-w-0 flex-1 flex-col">
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
                        <span className="text-sm text-muted-foreground">
                          Nie jest jeszcze w żadnej klasie
                        </span>
                      )}
                    </div>

                    <div className="ml-auto flex items-center gap-2">
                      {!isActive ? (
                        <JoinClassDialog child={child} onChanged={loadData} />
                      ) : null}

                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label={`Akcje: ${child.firstname} ${child.lastname}`}
                            />
                          }
                        >
                          <MoreHorizontal />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="min-w-44">
                          <DropdownMenuItem
                            onClick={() => setEditingId(child.id)}
                            className="cursor-pointer"
                          >
                            <Pencil />
                            Edytuj dane
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setAvatarEditingId(child.id)}
                            className="cursor-pointer"
                          >
                            <ImagePlus />
                            Zmień zdjęcie
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {child.avatarId != null ? (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setAvatarDeletingId(child.id)}
                              className="cursor-pointer"
                            >
                              <ImageMinus />
                              Usuń zdjęcie
                            </DropdownMenuItem>
                          ) : null}
                          {info != null && isActive ? (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setLeavingId(child.id)}
                              className="cursor-pointer"
                            >
                              <UserMinus />
                              {info.status === "PENDING"
                                ? "Wycofaj prośbę"
                                : "Usuń z klasy"}
                            </DropdownMenuItem>
                          ) : null}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setDeletingId(child.id)}
                            className="cursor-pointer"
                          >
                            <Trash2 />
                            Usuń dziecko
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <EditChildDialog
                        child={child}
                        open={editingId === child.id}
                        onOpenChange={(next) =>
                          setEditingId(next ? child.id : null)
                        }
                        onChanged={loadData}
                      />
                      <ChangeAvatarDialog
                        child={child}
                        open={avatarEditingId === child.id}
                        onOpenChange={(next) =>
                          setAvatarEditingId(next ? child.id : null)
                        }
                        onChanged={loadData}
                      />
                      <DeleteAvatarDialog
                        child={child}
                        open={avatarDeletingId === child.id}
                        onOpenChange={(next) =>
                          setAvatarDeletingId(next ? child.id : null)
                        }
                        onChanged={loadData}
                      />
                      {info != null ? (
                        <LeaveClassDialog
                          child={child}
                          info={info}
                          open={leavingId === child.id}
                          onOpenChange={(next) =>
                            setLeavingId(next ? child.id : null)
                          }
                          onChanged={loadData}
                        />
                      ) : null}
                      <DeleteChildDialog
                        child={child}
                        open={deletingId === child.id}
                        onOpenChange={(next) =>
                          setDeletingId(next ? child.id : null)
                        }
                        onChanged={loadData}
                      />
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>
      </div>
      <Toaster />
    </AppShell>
  );
}

export { ChildrenPage };
