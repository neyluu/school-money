import * as React from "react";
import { Copy, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/toast";
import { regenerateAccessCode } from "@/lib/class-management";

function ClassAccessCodeCard({
  classId,
  accessCode,
  onChanged,
}: {
  classId: number;
  accessCode: string;
  onChanged: () => void;
}) {
  const [isBusy, setIsBusy] = React.useState(false);

  function copy() {
    navigator.clipboard
      .writeText(accessCode)
      .then(() => toast.add({ title: "Skopiowano kod", type: "success" }))
      .catch(() =>
        toast.add({ title: "Nie udało się skopiować kodu.", type: "error" }),
      );
  }

  async function regenerate() {
    setIsBusy(true);
    try {
      await regenerateAccessCode(classId);
      toast.add({ title: "Wygenerowano nowy kod", type: "success" });
      onChanged();
    } catch {
      toast.add({
        title: "Nie udało się wygenerować kodu. Spróbuj ponownie.",
        type: "error",
      });
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Kod zaproszenia</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-md bg-muted px-3 py-2 text-center font-mono text-lg tracking-widest">
            {accessCode}
          </code>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={copy}
            aria-label="Kopiuj kod"
          >
            <Copy />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => void regenerate()}
            disabled={isBusy}
            aria-label="Wygeneruj nowy kod"
          >
            <RefreshCw />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Po wygenerowaniu nowego kodu poprzedni przestaje działać.
        </p>
      </CardContent>
    </Card>
  );
}

export { ClassAccessCodeCard };
