import * as React from "react";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { changeEmail } from "@/lib/account";
import { ApiError } from "@/lib/api-client";
import type { AuthUser } from "@/lib/auth";
import { setCurrentUser } from "@/lib/current-user";
import { describeError } from "@/lib/error-messages";
import { EMAIL_MAX_LENGTH } from "@/lib/input-rules";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function EmailForm({ user }: { user: AuthUser }) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const normalized = email.trim().toLowerCase();
  const canSubmit =
    EMAIL_PATTERN.test(normalized) &&
    normalized !== user.email &&
    password !== "";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      setCurrentUser(await changeEmail(normalized, password));
      setEmail("");
      setPassword("");
      toast.add({ title: "Adres e-mail został zmieniony.", type: "success" });
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 403) {
        setError("Nieprawidłowe hasło.");
      } else if (
        submitError instanceof ApiError &&
        submitError.status === 409
      ) {
        setError("Ten adres jest już używany przez inne konto.");
      } else {
        toast.add({ title: describeError(submitError), type: "error" });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Section
      title="Adres e-mail"
      description={`Obecny adres: ${user.email}. Służy do logowania.`}
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="settings-email">Nowy adres e-mail</FieldLabel>
            <Input
              id="settings-email"
              type="email"
              autoComplete="email"
              maxLength={EMAIL_MAX_LENGTH}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setError(undefined);
              }}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="settings-email-password">
              Obecne hasło
            </FieldLabel>
            <Input
              id="settings-email-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                setError(undefined);
              }}
            />
          </Field>
        </div>
        {error != null ? <FieldError>{error}</FieldError> : null}
        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting} disabled={!canSubmit}>
            Zmień adres
          </Button>
        </div>
      </form>
    </Section>
  );
}

export { EmailForm };
