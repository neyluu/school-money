import * as React from "react"
import { Link, useNavigate, useSearchParams } from "react-router"
import { AuthLayout, AuthLogo } from "@/components/auth-layout"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/toast"
import { useAutofilled } from "@/hooks/use-autofilled"
import { ROLE_PARAM, withRole } from "@/lib/account-role"
import { ApiError } from "@/lib/api-client"
import { login } from "@/lib/auth"
import { EMAIL_MAX_LENGTH } from "@/lib/input-rules"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type LoginErrors = {
  email?: string
  password?: string
}

function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [email, setEmail] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [rememberMe, setRememberMe] = React.useState(false)
  const [errors, setErrors] = React.useState<LoginErrors>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const formRef = React.useRef<HTMLFormElement>(null)
  const isAutofilled = useAutofilled(formRef)
  const hasValidEmail = EMAIL_PATTERN.test(email.trim())
  const isUntouched = email === "" && password === ""
  const canSubmit =
    (hasValidEmail && password !== "") || (isAutofilled && isUntouched)

  const registerPath = withRole("/register", searchParams.get(ROLE_PARAM))

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    const nextErrors: LoginErrors = {}
    if (email.trim() === "") {
      nextErrors.email = "Podaj adres e-mail."
    } else if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = "Podaj poprawny adres e-mail."
    }
    if (password === "") {
      nextErrors.password = "Podaj hasło."
    }
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length > 0) {
      return
    }

    setIsSubmitting(true)
    try {
      await login(email.trim(), password, rememberMe)
      toast.add({
        title: "Zalogowano pomyślnie.",
        type: "success",
      })
      navigate("/dashboard", { replace: true })
    } catch (error) {
      if (error instanceof ApiError && error.status === 400) {
        const fieldErrors: LoginErrors = {}
        if (error.fieldErrors?.email != null) {
          fieldErrors.email = "Podaj poprawny adres e-mail."
        }
        if (error.fieldErrors?.password != null) {
          fieldErrors.password = "Podaj hasło."
        }
        if (Object.keys(fieldErrors).length > 0) {
          setErrors(fieldErrors)
          return
        }
      }
      toast.add({
        title: loginErrorTitle(error),
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
        <h1 className="text-3xl font-normal">Zaloguj się</h1>
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          noValidate
          className="flex flex-col gap-5"
        >
          <Field data-invalid={errors.email != null}>
            <FieldLabel htmlFor="login-email">E-mail</FieldLabel>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="anna@example.com"
              maxLength={EMAIL_MAX_LENGTH}
              value={email}
              onChange={(event) => {
                setEmail(event.target.value)
                setErrors((prev) => ({ ...prev, email: undefined }))
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
          <Field data-invalid={errors.password != null}>
            <FieldLabel htmlFor="login-password">Hasło</FieldLabel>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value)
                setErrors((prev) => ({ ...prev, password: undefined }))
              }}
              aria-invalid={errors.password != null}
            />
            {errors.password != null ? (
              <FieldError>{errors.password}</FieldError>
            ) : null}
          </Field>
          <div className="flex items-center justify-between gap-2">
            <Field orientation="horizontal">
              <Checkbox
                id="login-remember"
                checked={rememberMe}
                onCheckedChange={setRememberMe}
                className="cursor-pointer"
              />
              <FieldLabel htmlFor="login-remember">
                Zapamiętaj mnie
              </FieldLabel>
            </Field>
          </div>
          <Button
            type="submit"
            size="lg"
            loading={isSubmitting}
            disabled={!canSubmit}
            className="w-full bg-foreground text-background hover:bg-foreground/90 cursor-pointer"
          >
            Zaloguj się
          </Button>
        </form>
        <p className="text-sm text-muted-foreground">
          Nie masz konta?{" "}
          <Link
            to={registerPath}
            className="text-primary underline-offset-4 hover:underline"
          >
            Zarejestruj się
          </Link>
        </p>
      </div>
    </AuthLayout>
  )
}

function loginErrorTitle(error: unknown): string {
  if (error instanceof ApiError && error.status === 401) {
    return "Nieprawidłowy e-mail lub hasło."
  }
  if (error instanceof ApiError && error.status === 403) {
    return "Twoje konto jest zablokowane. Skontaktuj się z administratorem."
  }
  if (error instanceof ApiError && error.status === 0) {
    return "Brak połączenia z serwerem. Spróbuj ponownie."
  }
  return "Wystąpił nieoczekiwany błąd. Spróbuj ponownie później."
}

export { LoginPage }
