import * as React from "react";
import { Section } from "@/components/section";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { updateProfile } from "@/lib/account";
import type { AuthUser } from "@/lib/auth";
import { setCurrentUser } from "@/lib/current-user";
import { describeError } from "@/lib/error-messages";

const MAX_NAME_LENGTH = 100;

function ProfileForm({ user }: { user: AuthUser }) {
  const [firstName, setFirstName] = React.useState(user.firstName);
  const [lastName, setLastName] = React.useState(user.lastName);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const canSubmit =
    firstName.trim() !== "" &&
    lastName.trim() !== "" &&
    (firstName.trim() !== user.firstName || lastName.trim() !== user.lastName);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    try {
      setCurrentUser(await updateProfile(firstName.trim(), lastName.trim()));
      toast.add({ title: "Dane zostały zapisane.", type: "success" });
    } catch (error) {
      toast.add({ title: describeError(error), type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Section title="Dane osobowe">
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field>
            <FieldLabel htmlFor="settings-first-name">Imię</FieldLabel>
            <Input
              id="settings-first-name"
              autoComplete="given-name"
              maxLength={MAX_NAME_LENGTH}
              value={firstName}
              onChange={(event) => setFirstName(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="settings-last-name">Nazwisko</FieldLabel>
            <Input
              id="settings-last-name"
              autoComplete="family-name"
              maxLength={MAX_NAME_LENGTH}
              value={lastName}
              onChange={(event) => setLastName(event.target.value)}
            />
          </Field>
        </div>
        <div className="flex justify-end">
          <Button type="submit" loading={isSubmitting} disabled={!canSubmit}>
            Zapisz dane
          </Button>
        </div>
      </form>
    </Section>
  );
}

export { ProfileForm };
