import * as React from "react";
import { Link } from "react-router";
import { Trash2 } from "lucide-react";
import { DataState } from "@/components/data-state";
import {
  ResponsiveDialog,
  ResponsiveDialogContent,
  ResponsiveDialogDescription,
  ResponsiveDialogHeader,
  ResponsiveDialogTitle,
} from "@/components/responsive-dialog";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useAsyncData } from "@/hooks/use-async-data";
import { deleteAccount } from "@/lib/account";
import { ApiError } from "@/lib/api-client";
import { clearToken } from "@/lib/auth-store";
import { getClassSummaries } from "@/lib/class-management";
import { describeError } from "@/lib/error-messages";
import { formatMoney } from "@/lib/money";
import { getWallet } from "@/lib/wallet";

async function loadAccountState() {
  const [wallet, classes] = await Promise.all([
    getWallet(),
    getClassSummaries(),
  ]);
  return {
    balance: wallet.balance,
    ownedClasses: classes.filter(
      (item) => item.isOwner && item.deletedAt == null,
    ),
  };
}

function DeleteAccountSection() {
  const { data, error, isLoading, reload } = useAsyncData(loadAccountState);
  const [open, setOpen] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [passwordError, setPasswordError] = React.useState<
    string | undefined
  >();
  const [isDeleting, setIsDeleting] = React.useState(false);

  const ownsClasses = (data?.ownedClasses.length ?? 0) > 0;
  const hasMoney = (data?.balance ?? 0) > 0;

  function close() {
    setOpen(false);
    setPassword("");
    setPasswordError(undefined);
  }

  async function handleDelete(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsDeleting(true);
    try {
      await deleteAccount(password);
      clearToken();
      window.location.assign("/");
    } catch (deleteError) {
      setIsDeleting(false);
      if (deleteError instanceof ApiError && deleteError.status === 403) {
        setPasswordError("Nieprawidłowe hasło.");
        return;
      }
      close();
      reload();
      toast.add({ title: describeError(deleteError), type: "error" });
    }
  }

  return (
    <Section
      title="Usuń konto"
      description="Konto zostanie usunięte, a Ty zostaniesz wylogowany."
    >
      <DataState
        isLoading={isLoading}
        hasError={error != null}
        isEmpty={false}
        emptyState={null}
        onRetry={reload}
      >
        <div className="flex flex-col gap-3 text-sm">
          {ownsClasses ? (
            <p className="rounded-lg bg-muted p-3">
              Prowadzisz klasy:{" "}
              {data?.ownedClasses.map((item) => item.name).join(", ")}. Usuń je
              najpierw na stronie{" "}
              <Link to="/dashboard/class" className="underline">
                Klasy
              </Link>
              .
            </p>
          ) : null}
          {hasMoney ? (
            <p className="rounded-lg bg-muted p-3">
              Na Twoim rachunku jest {formatMoney(data?.balance ?? 0)}. Wypłać
              pieniądze na stronie{" "}
              <Link to="/dashboard/payments" className="underline">
                Płatności
              </Link>
              .
            </p>
          ) : null}
          <div className="flex justify-end">
            <Button
              variant="destructive"
              disabled={data == null || ownsClasses || hasMoney}
              onClick={() => setOpen(true)}
            >
              <Trash2 />
              Usuń konto
            </Button>
          </div>
        </div>
      </DataState>

      <ResponsiveDialog
        open={open}
        onOpenChange={(next) => {
          if (!next && !isDeleting) {
            close();
          }
        }}
      >
        <ResponsiveDialogContent>
          <ResponsiveDialogHeader>
            <ResponsiveDialogTitle>Usunąć konto?</ResponsiveDialogTitle>
            <ResponsiveDialogDescription>
              Tej operacji nie można cofnąć. Twoje dane i dzieci zostaną
              usunięte, a historia wpłat zostanie w zbiórkach jako „Usunięte
              konto”.
            </ResponsiveDialogDescription>
          </ResponsiveDialogHeader>
          <form
            onSubmit={handleDelete}
            noValidate
            className="flex flex-col gap-4"
          >
            <Field data-invalid={passwordError != null}>
              <FieldLabel htmlFor="delete-account-password">
                Wpisz hasło, aby potwierdzić
              </FieldLabel>
              <Input
                id="delete-account-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setPasswordError(undefined);
                }}
              />
              {passwordError != null ? (
                <FieldError>{passwordError}</FieldError>
              ) : null}
            </Field>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={close}
              >
                Anuluj
              </Button>
              <Button
                type="submit"
                variant="destructive"
                loading={isDeleting}
                disabled={password === ""}
              >
                <Trash2 />
                Usuń konto na zawsze
              </Button>
            </div>
          </form>
        </ResponsiveDialogContent>
      </ResponsiveDialog>
    </Section>
  );
}

export { DeleteAccountSection };
