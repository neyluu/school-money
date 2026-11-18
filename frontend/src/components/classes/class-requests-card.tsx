import * as React from "react";
import { Check, X } from "lucide-react";
import { InitialsBubble } from "@/components/classes/initials-bubble";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { acceptMembership, rejectMembership } from "@/lib/class-management";
import type { PendingMembership } from "@/lib/class-management";

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("pl-PL");
}

function ClassRequestsCard({
  classId,
  requests,
  onChanged,
}: {
  classId: number;
  requests: PendingMembership[];
  onChanged: () => void;
}) {
  const [busyId, setBusyId] = React.useState<number | null>(null);

  async function decide(
    request: PendingMembership,
    action: typeof acceptMembership,
    successPrefix: string,
  ) {
    const name = `${request.child.firstName} ${request.child.lastName}`;
    setBusyId(request.child.id);
    try {
      await action(classId, request.child.id);
      toast.add({ title: `${successPrefix}: ${name}`, type: "success" });
      onChanged();
    } catch {
      toast.add({
        title: "Nie udało się wykonać operacji. Spróbuj ponownie.",
        type: "error",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prośby o dołączenie ({requests.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Brak oczekujących próśb.
          </p>
        ) : (
          <ul className="flex flex-col divide-y">
            {requests.map((request) => {
              const name = `${request.child.firstName} ${request.child.lastName}`;
              return (
                <li
                  key={request.child.id}
                  className="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
                >
                  <InitialsBubble child={request.child} />
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm font-medium">{name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {request.parentEmail} · {formatDate(request.requestedAt)}
                    </span>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    disabled={busyId != null}
                    aria-label={`Zaakceptuj: ${name}`}
                    onClick={() =>
                      void decide(request, acceptMembership, "Zaakceptowano")
                    }
                  >
                    <Check />
                  </Button>
                  <Button
                    type="button"
                    size="icon"
                    variant="outline"
                    disabled={busyId != null}
                    className="text-danger hover:text-danger"
                    aria-label={`Odrzuć: ${name}`}
                    onClick={() =>
                      void decide(request, rejectMembership, "Odrzucono")
                    }
                  >
                    <X />
                  </Button>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export { ClassRequestsCard };
