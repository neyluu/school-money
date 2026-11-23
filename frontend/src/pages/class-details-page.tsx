import * as React from "react";
import { useNavigate, useParams } from "react-router";
import { GraduationCap, MessageCircle, Pencil, Trash2 } from "lucide-react";
import { ClassAccessCodeCard } from "@/components/classes/class-access-code-card";
import { ClassChildrenCard } from "@/components/classes/class-children-card";
import { ClassFundraisingsCard } from "@/components/classes/class-fundraisings-card";
import { ClassRequestsCard } from "@/components/classes/class-requests-card";
import { DeleteClassDialog } from "@/components/classes/delete-class-dialog";
import { EditClassDialog } from "@/components/classes/edit-class-dialog";
import { DataState } from "@/components/data-state";
import { EmptyState } from "@/components/empty-state";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast, Toaster } from "@/components/ui/toast";
import { useAsyncData } from "@/hooks/use-async-data";
import { ApiError } from "@/lib/api-client";
import {
  getClassDetails,
  getClassFundraisings,
  getPendingMemberships,
} from "@/lib/class-management";
import type { ClassDetails, PendingMembership } from "@/lib/class-management";
import { getClassChat } from "@/lib/chat";
import type { FundraisingListItem } from "@/lib/fundraising";

const CLASSES_PATH = "/dashboard/class";

type ActiveDialog = "edit" | "delete" | null;

function ClassDetailsContent({
  details,
  pending,
  fundraisings,
  onChanged,
}: {
  details: ClassDetails;
  pending: PendingMembership[];
  fundraisings: FundraisingListItem[];
  onChanged: () => void;
}) {
  const navigate = useNavigate();
  const [activeDialog, setActiveDialog] = React.useState<ActiveDialog>(null);
  const [isOpeningChat, setIsOpeningChat] = React.useState(false);

  function handleDialogChange(dialog: Exclude<ActiveDialog, null>) {
    return (open: boolean) => setActiveDialog(open ? dialog : null);
  }

  async function openClassChat() {
    setIsOpeningChat(true);
    try {
      const chat = await getClassChat(details.id);
      navigate(`/dashboard/chat?id=${chat.id}`);
    } catch (error) {
      setIsOpeningChat(false);
      toast.add({
        title:
          error instanceof ApiError && error.status === 403
            ? "Czat klasy będzie dostępny, gdy skarbnik zaakceptuje Twoje dziecko."
            : "Nie udało się otworzyć czatu klasy.",
        type: "error",
      });
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        backTo={CLASSES_PATH}
        backLabel="Klasy"
        leading={
          <span
            aria-hidden
            className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary [&_svg]:size-6"
          >
            <GraduationCap />
          </span>
        }
        title={details.name}
        badge={
          details.isOwner ? (
            <Badge variant="warning">Skarbnik</Badge>
          ) : undefined
        }
        description={
          details.isOwner
            ? `${details.school} · ${details.city}`
            : `${details.school} · ${details.city} · skarbnik: ${details.owner.firstName} ${details.owner.lastName}`
        }
        actions={
          <>
            <Button
              loading={isOpeningChat}
              onClick={() => void openClassChat()}
            >
              <MessageCircle />
              Czat klasy
            </Button>
            {details.isOwner ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => setActiveDialog("edit")}
                >
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
              </>
            ) : null}
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <ClassFundraisingsCard
            fundraisings={fundraisings}
            isOwner={details.isOwner}
          />
          <ClassChildrenCard
            classId={details.id}
            students={details.children}
            isOwner={details.isOwner}
            onChanged={onChanged}
          />
        </div>
        {details.isOwner ? (
          <div className="flex min-w-0 flex-col gap-6">
            <ClassRequestsCard
              classId={details.id}
              requests={pending}
              onChanged={onChanged}
            />
            <ClassAccessCodeCard
              classId={details.id}
              accessCode={details.accessCode}
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
    const [pending, fundraisings] = await Promise.all([
      details.isOwner
        ? getPendingMemberships(classId)
        : Promise.resolve<PendingMembership[]>([]),
      getClassFundraisings(classId),
    ]);
    return { details, pending, fundraisings };
  }, [classId]);
  const { data, error, isLoading, reload } = useAsyncData(load);

  const isUnavailable =
    error instanceof ApiError && (error.status === 404 || error.status === 403);

  return (
    <AppShell activeId="class">
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
              fundraisings={data.fundraisings}
              onChanged={reload}
            />
          ) : null}
        </DataState>
      ) : (
        <Card>
          <CardContent>
            <EmptyState
              icon={<GraduationCap />}
              title="Nie ma takiej klasy"
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
