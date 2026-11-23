import * as React from "react";
import {
  MIN_PASSWORD_LENGTH,
  NewPasswordFields,
  PASSWORD_INVALID,
} from "@/components/new-password-fields";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { changePassword } from "@/lib/account";
import { ApiError } from "@/lib/api-client";
import { describeError } from "@/lib/error-messages";

function PasswordForm() {
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [currentError, setCurrentError] = React.useState<string | undefined>();
  const [nextError, setNextError] = React.useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const canSubmit =
    current !== "" && next.length >= MIN_PASSWORD_LENGTH && confirm === next;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      await changePassword(current, next);
      setCurrent("");
      setNext("");
      setConfirm("");
      toast.add({ title: "Hasło zostało zmienione.", type: "success" });
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 403) {
        setCurrentError("Nieprawidłowe obecne hasło.");
      } else if (
        submitError instanceof ApiError &&
        submitError.fieldErrors?.newPassword != null
      ) {
        setNextError(PASSWORD_INVALID);
      } else {
        toast.add({ title: describeError(submitError), type: "error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Section title="Hasło">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Field data-invalid={currentError != null}>
          <FieldLabel htmlFor="settings-current-password">
            Obecne hasło
          </FieldLabel>
          <Input
            id="settings-current-password"
            type="password"
            autoComplete="current-password"
            value={current}
            onChange={(event) => {
              setCurrent(event.target.value);
              setCurrentError(undefined);
            }}
            aria-invalid={currentError != null}
          />
          {currentError != null ? (
            <FieldError>{currentError}</FieldError>
          ) : null}
        </Field>
        <NewPasswordFields
          idPrefix="settings-new"
          passwordLabel="Nowe hasło"
          confirmLabel="Powtórz nowe hasło"
          password={next}
          confirm={confirm}
          onPasswordChange={(value) => {
            setNext(value);
            setNextError(undefined);
          }}
          onConfirmChange={setConfirm}
          passwordError={nextError}
        />
        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting} disabled={!canSubmit}>
            Zmień hasło
          </Button>
        </div>
      </form>
    </Section>
  );
}

export { PasswordForm };
