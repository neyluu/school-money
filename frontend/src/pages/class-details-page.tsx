import * as React from "react";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowLeft, GraduationCap, Pencil, Trash2 } from "lucide-react";
import { ClassAccessCodeCard } from "@/components/classes/class-access-code-card";
import { ClassChildrenCard } from "@/components/classes/class-children-card";
import { ClassRequestsCard } from "@/components/classes/class-requests-card";
import { DeleteClassDialog } from "@/components/classes/delete-class-dialog";
import { EditClassDialog } from "@/components/classes/edit-class-dialog";
import { DataState } from "@/components/data-state";
import { EmptyState } from "@/components/empty-state";
import { AppShell } from "@/components/layout/app-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Toaster } from "@/components/ui/toast";
import { useAsyncData } from "@/hooks/use-async-data";
import { ApiError } from "@/lib/api-client";
import { getClassDetails, getPendingMemberships } from "@/lib/class-management";
import type { ClassDetails, PendingMembership } from "@/lib/class-management";

const CLASSES_PATH = "/dashboard/class";

type ActiveDialog = "edit" | "delete" | null;

function ClassDetailsContent({
  details,
  pending,
  onChanged,
}: {
  details: ClassDetails;
  pending: PendingMembership[];
  onChanged: () => void;
}) {
  const navigate = useNavigate();
  const [activeDialog, setActiveDialog] = React.useState<ActiveDialog>(null);

  function handleDialogChange(dialog: Exclude<ActiveDialog, null>) {
    return (open: boolean) => setActiveDialog(open ? dialog : null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <Button
          variant="ghost"
          className="w-fit"
          render={<Link to={CLASSES_PATH} />}
        >
          <ArrowLeft />
          Klasy
        </Button>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <GraduationCap className="size-6" />
            </div>
            <div className="flex min-w-0 flex-col">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-2xl font-bold">{details.name}</h1>
                {details.isOwner ? (
                  <Badge variant="warning">Skarbnik</Badge>
                ) : null}
              </div>
              <p className="text-sm text-muted-foreground">
                {details.school} · {details.city}
              </p>
              {!details.isOwner ? (
                <p className="text-xs text-muted-foreground">
                  Skarbnik: {details.owner.firstName} {details.owner.lastName}
                </p>
              ) : null}
            </div>
          </div>

          {details.isOwner ? (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" onClick={() => setActiveDialog("edit")}>
                <Pencil />
                Edytuj
              </Button>
              <Button
                variant="outline"
                className="text-danger hover:text-danger"
                onClick={() => setActiveDialog("delete")}
              >
                <Trash2 />
                Usuń klasę
              </Button>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr] lg:items-start">
        <ClassChildrenCard
          classId={details.id}
          students={details.children}
          isOwner={details.isOwner}
          onChanged={onChanged}
        />
        {details.isOwner ? (
          <div className="flex flex-col gap-4">
            <ClassAccessCodeCard
              classId={details.id}
              accessCode={details.accessCode}
              onChanged={onChanged}
            />
            <ClassRequestsCard
              classId={details.id}
              requests={pending}
              onChanged={onChanged}
            />
          </div>
        ) : null}
      </div>

      <EditClassDialog
        schoolClass={details}
        open={activeDialog === "edit"}
        onOpenChange={handleDialogChange("edit")}
        onChanged={onChanged}
      />
      <DeleteClassDialog
        schoolClass={details}
        open={activeDialog === "delete"}
        onOpenChange={handleDialogChange("delete")}
        onChanged={() => navigate(CLASSES_PATH, { replace: true })}
      />
    </div>
  );
}

function ClassDetailsPage() {
  const params = useParams();
  const classId = Number(params.classId);

  const load = React.useCallback(async () => {
    const details = await getClassDetails(classId);
    const pending = details.isOwner ? await getPendingMemberships(classId) : [];
    return { details, pending };
  }, [classId]);
  const { data, error, isLoading, reload } = useAsyncData(load);

  const isUnavailable =
    error instanceof ApiError && (error.status === 404 || error.status === 403);

  return (
    <AppShell activeId="classes">
      {Number.isInteger(classId) && !isUnavailable ? (
        <DataState
          isLoading={isLoading && data == null}
          hasError={error != null}
          isEmpty={data == null}
          onRetry={reload}
          emptyState={null}
        >
          {data != null ? (
            <ClassDetailsContent
              details={data.details}
              pending={data.pending}
              onChanged={reload}
            />
          ) : null}
        </DataState>
      ) : (
        <Card>
          <CardContent>
            <EmptyState
              icon={<GraduationCap />}
              title="Nie znaleziono klasy"
              description="Klasa nie istnieje albo nie masz do niej dostępu."
            />
          </CardContent>
        </Card>
      )}
      <Toaster />
    </AppShell>
  );
}

export { ClassDetailsPage };
