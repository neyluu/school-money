import { MaskedInput } from "@/components/masked-input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { maskPassword } from "@/lib/input-rules";

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 72;
const PASSWORD_MISMATCH = "Hasła muszą być takie same.";
const PASSWORD_INVALID = "Hasło nie spełnia wymagań.";

type NewPasswordFieldsProps = {
  idPrefix: string;
  passwordLabel: string;
  confirmLabel: string;
  password: string;
  confirm: string;
  onPasswordChange: (value: string) => void;
  onConfirmChange: (value: string) => void;
  passwordError?: string;
  confirmError?: string;
};

function NewPasswordFields({
  idPrefix,
  passwordLabel,
  confirmLabel,
  password,
  confirm,
  onPasswordChange,
  onConfirmChange,
  passwordError,
  confirmError,
}: NewPasswordFieldsProps) {
  const confirmMessage =
    confirm !== "" && confirm.length >= password.length && confirm !== password
      ? PASSWORD_MISMATCH
      : confirmError;

  return (
    <>
      <Field data-invalid={passwordError != null}>
        <FieldLabel htmlFor={`${idPrefix}-password`}>
          {passwordLabel}
        </FieldLabel>
        <MaskedInput
          id={`${idPrefix}-password`}
          type="password"
          autoComplete="new-password"
          placeholder={`Min. ${MIN_PASSWORD_LENGTH} znaków`}
          value={password}
          mask={maskPassword}
          onValueChange={onPasswordChange}
          aria-invalid={passwordError != null}
        />
        {passwordError != null ? (
          <FieldError>{passwordError}</FieldError>
        ) : (
          <FieldDescription className="text-xs">
            Od {MIN_PASSWORD_LENGTH} do {MAX_PASSWORD_LENGTH} znaków. Użyj liter
            a–z i A–Z, cyfr, spacji lub symboli, np. ! @ # $.
          </FieldDescription>
        )}
      </Field>
      <Field data-invalid={confirmMessage != null}>
        <FieldLabel htmlFor={`${idPrefix}-confirm`}>{confirmLabel}</FieldLabel>
        <MaskedInput
          id={`${idPrefix}-confirm`}
          type="password"
          autoComplete="new-password"
          value={confirm}
          mask={maskPassword}
          onValueChange={onConfirmChange}
          aria-invalid={confirmMessage != null}
        />
        {confirmMessage != null ? (
          <FieldError>{confirmMessage}</FieldError>
        ) : null}
      </Field>
    </>
  );
}

export {
  MAX_PASSWORD_LENGTH,
  MIN_PASSWORD_LENGTH,
  NewPasswordFields,
  PASSWORD_INVALID,
  PASSWORD_MISMATCH,
};
