import * as React from "react";
import { Copy, Eye, EyeOff, RefreshCw } from "lucide-react";
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
  const [isVisible, setIsVisible] = React.useState(false);
  const MASK_CHAR = "∗";
  const VISIBLE_PREFIX_LENGTH = 2;
  const prefix = accessCode.slice(0, VISIBLE_PREFIX_LENGTH);
  const rest = accessCode.slice(VISIBLE_PREFIX_LENGTH);
  const maskedRest = MASK_CHAR.repeat(Math.max(0, rest.length));

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
      <CardContent className="@container flex flex-col gap-2">
        <div className="flex flex-col gap-2 md:@min-[17.5rem]:flex-row md:@min-[17.5rem]:items-center">
          <code
            className="rounded-md bg-muted px-3 py-0.5 text-center font-mono text-lg tracking-[0.2em] whitespace-nowrap select-none md:@min-[17.5rem]:flex-1"
            aria-label={isVisible ? undefined : "Kod ukryty"}
          >
            {prefix}
            <span
              key={isVisible ? "visible" : "masked"}
              className="inline-block animate-in fade-in duration-350"
            >
              {isVisible ? rest : maskedRest}
            </span>
          </code>
          <div className="grid grid-cols-3 gap-2 md:@min-[17.5rem]:grid-cols-[repeat(3,--spacing(8))]">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="w-full"
              onClick={() => setIsVisible((v) => !v)}
              aria-label={isVisible ? "Ukryj kod" : "Pokaż kod"}
              aria-pressed={isVisible}
            >
              {isVisible ? <EyeOff /> : <Eye />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="w-full"
              onClick={copy}
              aria-label="Kopiuj kod"
            >
              <Copy />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="w-full"
              onClick={() => void regenerate()}
              disabled={isBusy}
              aria-label="Wygeneruj nowy kod"
            >
              <RefreshCw />
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          Wygenerowanie nowego kodu unieważnia poprzedni.
        </p>
      </CardContent>
    </Card>
  );
}

export { ClassAccessCodeCard };
