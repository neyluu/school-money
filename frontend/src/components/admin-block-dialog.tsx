import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type BlockTarget = {
  name: string;
  isBlocked: boolean;
  kind: string;
};

function AdminBlockDialog({
  target,
  busy,
  onOpenChange,
  onConfirm,
}: {
  target: BlockTarget | null;
  busy: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}) {
  const isUnblock = target?.isBlocked ?? false;
  const kind = target?.kind ?? "";

  return (
    <Dialog open={target != null} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isUnblock ? "Odblokować" : "Zablokować"} {kind}?
          </DialogTitle>
          <DialogDescription>
            {target != null ? (
              isUnblock ? (
                <>
                  <span className="font-medium text-foreground">
                    {target.name}
                  </span>{" "}
                  wróci do normalnego działania.
                </>
              ) : (
                <>
                  <span className="font-medium text-foreground">
                    {target.name}
                  </span>{" "}
                  straci dostęp do platformy. Operację można cofnąć
                  odblokowaniem.
                </>
              )
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => onOpenChange(false)}
          >
            Anuluj
          </Button>
          <Button
            variant={isUnblock ? "default" : "destructive"}
            loading={busy}
            onClick={onConfirm}
            className="cursor-pointer"
          >
            {isUnblock ? "Odblokuj" : "Zablokuj"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { AdminBlockDialog };
