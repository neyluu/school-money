import * as React from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { AuthLayout, AuthLogo } from "@/components/auth-layout"
import { SegmentedControl } from "@/components/segmented-control"
import { Button } from "@/components/ui/button"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { ApiError } from "@/lib/api-client"
import { lookupClass, register } from "@/lib/auth"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD_LENGTH = 8
const MAX_PASSWORD_LENGTH = 72

type Role = "parent" | "treasurer"

type RegisterErrors = {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  classCode?: string
}

function splitName(value: string): { firstName: string; lastName: string } {
  const parts = value.trim().split(/\s+/)
  return {
    firstName: parts[0] ?? "",
    lastName: parts.slice(1).join(" "),
  }
}

function RegisterPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const initialCode = searchParams.get("code") ?? ""

  const [role, setRole] = React.useState<Role>("parent")
  const [fullName, setFullName] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [confirmPassword, setConfirmPassword] = React.useState("")
  const [classCode, setClassCode] = React.useState(initialCode)
  const [errors, setErrors] = React.useState<RegisterErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const isParent = initialCode !== "" ? true : role === "parent"

  function handleRoleChange(nextRole: Role) {
    setRole(nextRole)
    setErrors((prev) => ({ ...prev, classCode: undefined }))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const nextErrors: RegisterErrors = {}
    const { lastName } = splitName(fullName)
    if (lastName === "") {
      nextErrors.fullName = "Podaj imię i nazwisko."
    }
    if (email.trim() === "") {
      nextErrors.email = "Podaj adres e-mail."
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Podaj poprawny adres e-mail."
    }
    if (password === "") {
      nextErrors.password = "Podaj hasło."
    } else if (password.length < MIN_PASSWORD_LENGTH) {
      nextErrors.password = "Hasło musi mieć min. 8 znaków."
    } else if (password.length > MAX_PASSWORD_LENGTH) {
      nextErrors.password = "Hasło może mieć maks. 72 znaki."
    }
    if (confirmPassword === "") {
      nextErrors.confirmPassword = "Powtórz hasło."
    } else if (confirmPassword !== password) {
      nextErrors.confirmPassword = "Hasła muszą być takie same."
    }
    if (isParent && classCode.trim() === "") {
      nextErrors.classCode = "Podaj kod dostępu do klasy."
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    try {
      if (isParent) {
        try {
          await lookupClass(classCode.trim())
        } catch (lookupError) {
          if (
            lookupError instanceof ApiError &&
            lookupError.status === 404
          ) {
            setErrors((prev) => ({
              ...prev,
              classCode:
                "Nie znaleziono klasy o tym kodzie. Poproś Skarbnika o nowy.",
            }))
            return
          }
          throw lookupError
        }
      }

      const { firstName, lastName: splitLastName } = splitName(fullName)
      await register({
        firstName,
        lastName: splitLastName,
        email: email.trim(),
        password,
      })
      toast.add({
        title: "Konto zostało utworzone.",
        type: "success",
      })
      navigate("/", { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        setErrors((prev) => ({
          ...prev,
          email: "Ten adres e-mail jest już zajęty.",
        }))
        return
      }
      if (error instanceof ApiError && error.status === 400) {
        const fieldErrors: RegisterErrors = {}
        if (error.fieldErrors?.email != null) {
          fieldErrors.email = "Podaj poprawny adres e-mail."
        }
        if (error.fieldErrors?.password != null) {
          fieldErrors.password = "Hasło musi mieć min. 8 znaków."
        }
        if (
          error.fieldErrors?.firstName != null ||
          error.fieldErrors?.lastName != null
        ) {
          fieldErrors.fullName = "Podaj imię i nazwisko."
        }
        if (Object.keys(fieldErrors).length > 0) {
          setErrors((prev) => ({ ...prev, ...fieldErrors }))
          return
        }
      }
      toast.add({
        title: registerErrorTitle(error),
        type: "error",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-6">
        <AuthLogo />
        <h1 className="text-3xl font-bold">Załóż konto</h1>
        <SegmentedControl<Role>
          options={[
            { value: "parent", label: "Rodzic" },
            { value: "treasurer", label: "Skarbnik klasy" },
          ]}
          value={isParent ? "parent" : "treasurer"}
          onChange={handleRoleChange}
        />
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5"
        >
          <Field data-invalid={errors.fullName != null}>
            <FieldLabel htmlFor="register-fullname">
              Imię i nazwisko
            </FieldLabel>
            <Input
              id="register-fullname"
              type="text"
              autoComplete="name"
              placeholder="Anna Kowalska"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              aria-invalid={errors.fullName != null}
            />
            {errors.fullName != null ? (
              <FieldError>{errors.fullName}</FieldError>
            ) : null}
          </Field>
          <Field data-invalid={errors.email != null}>
            <FieldLabel htmlFor="register-email">E-mail</FieldLabel>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              placeholder="anna@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              aria-invalid={errors.email != null}
            />
            {errors.email != null ? (
              <FieldError>{errors.email}</FieldError>
            ) : null}
          </Field>
          <Field data-invalid={errors.password != null}>
            <FieldLabel htmlFor="register-password">Hasło</FieldLabel>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 znaków"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              aria-invalid={errors.password != null}
            />
            {errors.password != null ? (
              <FieldError>{errors.password}</FieldError>
            ) : null}
          </Field>
          <Field data-invalid={errors.confirmPassword != null}>
            <FieldLabel htmlFor="register-confirm">
              Powtórz hasło
            </FieldLabel>
            <Input
              id="register-confirm"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              aria-invalid={errors.confirmPassword != null}
            />
            {errors.confirmPassword != null ? (
              <FieldError>{errors.confirmPassword}</FieldError>
            ) : null}
          </Field>
          {isParent ? (
            <Field data-invalid={errors.classCode != null}>
              <FieldLabel htmlFor="register-code">
                Mam kod dostępu do klasy
              </FieldLabel>
              <Input
                id="register-code"
                type="text"
                autoComplete="off"
                placeholder="np. 3B-X7KQ2"
                value={classCode}
                onChange={(event) => setClassCode(event.target.value)}
                aria-invalid={errors.classCode != null}
              />
              {errors.classCode != null ? (
                <FieldError>{errors.classCode}</FieldError>
              ) : null}
            </Field>
          ) : null}
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
            to="/login"
            className="text-primary underline-offset-4 hover:underline"
          >
            Zaloguj się
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

function registerErrorTitle(error: unknown): string {
  if (error instanceof ApiError && error.status === 0) {
    return "Brak połączenia z serwerem. Spróbuj ponownie."
  }
  return "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później."
}

export { RegisterPage }
