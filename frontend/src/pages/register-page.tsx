import * as React from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import { AuthLayout, AuthLogo } from "@/components/auth-layout";
import { MaskedInput } from "@/components/masked-input";
import {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  NewPasswordFields,
  PASSWORD_INVALID,
  PASSWORD_MISMATCH,
} from "@/components/new-password-fields";
import { SegmentedControl } from "@/components/segmented-control";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/toast";
import { useAuth } from "@/hooks/use-auth";
import { ROLE_PARAM, parseRole } from "@/lib/account-role";
import type { AccountRole } from "@/lib/account-role";
import { ApiError } from "@/lib/api-client";
import { register } from "@/lib/auth";
import { saveIntendedRole } from "@/lib/auth-store";
import { EMAIL_MAX_LENGTH } from "@/lib/input-rules";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const ONBOARDING_PARAM = "onboarding";

const ROLE_HINTS: Record<AccountRole, string> = {
  parent: "Po założeniu konta dodasz dziecko do klasy kodem od skarbnika.",
  treasurer:
    "Po założeniu konta utworzysz klasę i dostaniesz kod dostępu dla rodziców.",
};

const AFTER_REGISTER_PATH: Record<AccountRole, string> = {
  parent: "/dashboard",
  treasurer: `/dashboard?${ONBOARDING_PARAM}=treasurer`,
};

type RegisterErrors = {
  fullName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

function splitName(value: string): { firstName: string; lastName: string } {
  const parts = value.trim().split(/\s+/);

  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  };
}

function maskFullName(value: string): string | null {
  const { firstName, lastName } = splitName(value);

  return firstName.length <= MAX_NAME_LENGTH &&
    lastName.length <= MAX_NAME_LENGTH
    ? value
    : null;
}

function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { refreshUser } = useAuth();

  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [errors, setErrors] = React.useState<RegisterErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const role = parseRole(searchParams.get(ROLE_PARAM));
  const loginPath = `/login?${ROLE_PARAM}=${role}`;

  const hasFullName = splitName(fullName).lastName !== "";
  const hasValidEmail = EMAIL_PATTERN.test(email.trim());

  function clearError(field: keyof RegisterErrors) {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function handleRoleChange(nextRole: AccountRole) {
    setSearchParams({ [ROLE_PARAM]: nextRole }, { replace: true });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const nextErrors: RegisterErrors = {};
    const { lastName } = splitName(fullName);

    if (lastName === "") {
      nextErrors.fullName = "Podaj imię i nazwisko.";
    }

    if (email.trim() === "") {
      nextErrors.email = "Podaj adres e-mail.";
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Podaj poprawny adres e-mail.";
    }

    if (password === "") {
      nextErrors.password = "Podaj hasło.";
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = "Hasło musi mieć min. 8 znaków.";
    } else if (password.length > MAX_PASSWORD_LENGTH) {
      nextErrors.password = "Hasło może mieć maks. 72 znaki.";
    }

    if (confirmPassword === "") {
      nextErrors.confirmPassword = "Powtórz hasło.";
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = PASSWORD_MISMATCH;
    }

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      const { firstName, lastName: splitLastName } = splitName(fullName);

      saveIntendedRole(role);

      await register({
        firstName,
        lastName: splitLastName,
        email: email.trim(),
        password,
      });

      await refreshUser();

      toast.add({
        title: "Konto zostało utworzone.",
        type: "success",
      });

      navigate(AFTER_REGISTER_PATH[role], { replace: true });
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErrors((prev) => ({
          ...prev,
          email: "Ten adres e-mail jest już zajęty.",
        }));
        return;
      }

      if (error instanceof ApiError && error.status === 400) {
        const fieldErrors: RegisterErrors = {};

        if (error.fieldErrors?.email != null) {
          fieldErrors.email = "Podaj poprawny adres e-mail.";
        }

        if (error.fieldErrors?.password != null) {
          fieldErrors.password = PASSWORD_INVALID;
        }

        if (
          error.fieldErrors?.firstName != null ||
          error.fieldErrors?.lastName != null
        ) {
          fieldErrors.fullName = "Podaj imię i nazwisko.";
        }

        if (Object.keys(fieldErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...fieldErrors }));
          return;
        }
      }

      toast.add({
        title: registerErrorTitle(error),
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-6">
        <AuthLogo />

        <h1 className="text-3xl font-normal">Załóż konto</h1>

        <SegmentedControl<AccountRole>
          aria-label="Typ konta"
          options={[
            { value: "parent", label: "Rodzic" },
            { value: "treasurer", label: "Skarbnik klasy" },
          ]}
          value={role}
          onChange={handleRoleChange}
        />

        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5"
        >
          <Field data-invalid={errors.fullName != null}>
            <FieldLabel htmlFor="register-fullname">Imię i nazwisko</FieldLabel>

            <MaskedInput
              id="register-fullname"
              type="text"
              autoComplete="name"
              placeholder="Anna Kowalska"
              value={fullName}
              mask={maskFullName}
              onValueChange={(value) => {
                setFullName(value);
                clearError("fullName");
              }}
              aria-invalid={errors.fullName != null}
            />

            {errors.fullName != null ? (
              <FieldError>{errors.fullName}</FieldError>
            ) : fullName !== "" && !hasFullName ? (
              <FieldDescription className="text-xs">
                Wpisz imię i nazwisko, oddzielone spacją.
              </FieldDescription>
            ) : null}
          </Field>

          <Field data-invalid={errors.email != null}>
            <FieldLabel htmlFor="register-email">E-mail</FieldLabel>

            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="anna@example.com"
              maxLength={EMAIL_MAX_LENGTH}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                clearError("email");
              }}
              aria-invalid={errors.email != null}
            />

            {errors.email != null ? (
              <FieldError>{errors.email}</FieldError>
            ) : email !== "" && !hasValidEmail ? (
              <FieldDescription className="text-xs">
                Wpisz pełny adres, np. anna@example.com.
              </FieldDescription>
            ) : null}
          </Field>

          <NewPasswordFields
            idPrefix="register"
            passwordLabel="Hasło"
            confirmLabel="Powtórz hasło"
            password={password}
            confirm={confirmPassword}
            onPasswordChange={(value) => {
              setPassword(value);
              clearError("password");
            }}
            onConfirmChange={(value) => {
              setConfirmPassword(value);
              clearError("confirmPassword");
            }}
            passwordError={errors.password}
            confirmError={errors.confirmPassword}
          />

          <p className="text-sm text-muted-foreground">{ROLE_HINTS[role]}</p>

          <Button
            type="submit"
            size="lg"
            loading={isSubmitting}
            className="w-full bg-foreground text-background hover:bg-foreground/90"
          >
            Utwórz konto
          </Button>
        </form>

        <p className="text-sm text-muted-foreground">
          Masz konto?{" "}
          <Link
            to={loginPath}
            className="text-primary underline-offset-4 hover:underline"
          >
            Zaloguj się
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

function registerErrorTitle(error: unknown): string {
  if (error instanceof ApiError && error.status === 0) {
    return "Brak połączenia z serwerem. Spróbuj ponownie.";
  }

  return "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później.";
}

export { RegisterPage };