import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api-client";

type ClassFormValues = {
  name: string;
  school: string;
  city: string;
};

type ClassFormErrors = Partial<Record<keyof ClassFormValues, string>>;

const LIMITS: Record<keyof ClassFormValues, number> = {
  name: 100,
  school: 200,
  city: 100,
};

const LABELS: Record<keyof ClassFormValues, string> = {
  name: "nazwę klasy",
  school: "nazwę szkoły",
  city: "miasto",
};

const PLACEHOLDERS: Record<keyof ClassFormValues, string> = {
  name: "np. 3B",
  school: "np. Szkoła Podstawowa nr 12",
  city: "np. Łódź",
};

const FIELD_LABELS: Record<keyof ClassFormValues, string> = {
  name: "Nazwa klasy",
  school: "Szkoła",
  city: "Miasto",
};

const FIELDS = Object.keys(LIMITS) as (keyof ClassFormValues)[];

function validateClassForm(values: ClassFormValues): ClassFormErrors {
  const errors: ClassFormErrors = {};
  for (const key of FIELDS) {
    const length = values[key].trim().length;
    if (length === 0) {
      errors[key] = `Podaj ${LABELS[key]}.`;
    } else if (length > LIMITS[key]) {
      errors[key] = `Maksymalnie ${LIMITS[key]} znaków.`;
    }
  }
  return errors;
}

function classFieldErrorsFrom(error: unknown): ClassFormErrors | null {
  if (
    error instanceof ApiError &&
    error.status === 400 &&
    error.fieldErrors != null
  ) {
    return {
      name: error.fieldErrors.name,
      school: error.fieldErrors.school,
      city: error.fieldErrors.city,
    };
  }
  return null;
}

function ClassFormFields({
  idPrefix,
  values,
  errors,
  onChange,
}: {
  idPrefix: string;
  values: ClassFormValues;
  errors: ClassFormErrors;
  onChange: (field: keyof ClassFormValues, value: string) => void;
}) {
  return (
    <>
      {FIELDS.map((key) => (
        <Field key={key} data-invalid={errors[key] != null}>
          <FieldLabel htmlFor={`${idPrefix}-${key}`}>
            {FIELD_LABELS[key]}
          </FieldLabel>
          <Input
            id={`${idPrefix}-${key}`}
            value={values[key]}
            onChange={(event) => onChange(key, event.target.value)}
            placeholder={PLACEHOLDERS[key]}
            autoComplete="off"
            maxLength={LIMITS[key]}
            aria-invalid={errors[key] != null}
          />
          {errors[key] != null ? <FieldError>{errors[key]}</FieldError> : null}
        </Field>
      ))}
    </>
  );
}

export { ClassFormFields, classFieldErrorsFrom, validateClassForm };
export type { ClassFormErrors, ClassFormValues };
