import * as React from "react";
import { UserMinus } from "lucide-react";
import { InitialsBubble } from "@/components/classes/initials-bubble";
import { RemoveChildDialog } from "@/components/classes/remove-child-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ClassChild } from "@/lib/class-management";

function ClassChildrenCard({
  classId,
  students,
  isOwner,
  onChanged,
}: {
  classId: number;
  students: ClassChild[];
  isOwner: boolean;
  onChanged: () => void;
}) {
  const [removingId, setRemovingId] = React.useState<number | null>(null);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dzieci w klasie ({students.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {students.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Do klasy nie dołączyło jeszcze żadne dziecko.
          </p>
        ) : (
          <ul className="flex flex-col divide-y">
            {students.map((child) => (
              <li
                key={child.id}
                className="flex items-center gap-3 py-2 first:pt-0 last:pb-0"
              >
                <InitialsBubble child={child} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-medium">
                    {child.firstName} {child.lastName}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    Rodzic: {child.parent.firstName} {child.parent.lastName}
                  </span>
                </div>
                {isOwner ? (
                  <>
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      className="text-danger hover:text-danger"
                      aria-label={`Usuń z klasy: ${child.firstName} ${child.lastName}`}
                      onClick={() => setRemovingId(child.id)}
                    >
                      <UserMinus />
                    </Button>
                    <RemoveChildDialog
                      classId={classId}
                      child={child}
                      open={removingId === child.id}
                      onOpenChange={(next) =>
                        setRemovingId(next ? child.id : null)
                      }
                      onChanged={onChanged}
                    />
                  </>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export { ClassChildrenCard };
