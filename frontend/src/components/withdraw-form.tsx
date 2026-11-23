import * as React from "react";
import { useNavigate } from "react-router";
import { ArrowUpRight } from "lucide-react";
import { MaskedInput } from "@/components/masked-input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { useAsyncData } from "@/hooks/use-async-data";
import { ApiError } from "@/lib/api-client";
import { parseAmount } from "@/lib/amount";
import { describeError } from "@/lib/error-messages";
import { formatIban, isIbanValid } from "@/lib/iban";
import { IBAN_DIGITS, maskAmount, maskIban } from "@/lib/input-rules";
import { formatMoney } from "@/lib/money";
import { addSavedAccount, getSavedAccounts } from "@/lib/saved-accounts";
import type { SavedAccount } from "@/lib/saved-accounts";
import { withdraw } from "@/lib/wallet";

const MAX_RECIPIENT_NAME_LENGTH = 100;
const NEW_RECIPIENT = "new";
const NEW_RECIPIENT_LABEL = "Nowy odbiorca";

type WithdrawErrors = {
  recipientName?: string;
  iban?: string;
  amount?: string;
};

function mapServerErrors(error: unknown): WithdrawErrors | null {
  if (!(error instanceof ApiError)) {
    return null;
  }
  if (error.status === 422) {
    return { amount: "Kwota przekracza dostępne środki." };
  }
  if (error.status !== 400) {
    return null;
  }

  const fieldErrors = error.fieldErrors;
  if (fieldErrors == null) {
    return { iban: "Wypłata jest możliwa tylko na rachunek zewnętrzny." };
  }

  const mapped: WithdrawErrors = {};
  if (fieldErrors.recipientName != null) {
    mapped.recipientName = "Podaj poprawną nazwę odbiorcy.";
  }
  if (fieldErrors.iban != null) {
    mapped.iban = "Podaj numer w formacie PL oraz 26 cyfr.";
  }
  if (fieldErrors.amount != null) {
    mapped.amount = "Podaj poprawną kwotę, np. 50,00.";
  }
  return Object.keys(mapped).length > 0 ? mapped : null;
}

function WithdrawForm({
  balance,
  onCompleted,
  onCancel,
}: {
  balance: number;
  onCompleted: () => void;
  onCancel?: () => void;
}) {
  const navigate = useNavigate();
  const { data: saved, reload: reloadSaved } = useAsyncData(getSavedAccounts);
  const savedAccounts: SavedAccount[] = saved ?? [];

  const [choice, setChoice] = React.useState<string>(NEW_RECIPIENT);
  const [recipientName, setRecipientName] = React.useState("");
  const [iban, setIban] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [rememberAccount, setRememberAccount] = React.useState(false);
  const [errors, setErrors] = React.useState<WithdrawErrors>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const isNew = choice === NEW_RECIPIENT;
  const hasFunds = balance > 0;
  const parsed = parseAmount(amount);
  const amountError =
    parsed != null && parsed > balance
      ? `Możesz wypłacić najwyżej ${formatMoney(balance)}.`
      : errors.amount;
  const ibanDigits = iban.replace(/\D/g, "").length;
  const canSubmit =
    recipientName.trim() !== "" &&
    isIbanValid(iban) &&
    parsed != null &&
    parsed <= balance;

  const selectItems = [
    { value: NEW_RECIPIENT, label: NEW_RECIPIENT_LABEL },
    ...savedAccounts.map((account) => ({
      value: String(account.id),
      label: `${account.recipientName} · ${formatIban(account.iban)}`,
    })),
  ];

  function clearError(field: keyof WithdrawErrors) {
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  function handleChoiceChange(value: string | null) {
    if (value == null) {
      return;
    }
    setChoice(value);
    setErrors({});
    const account = savedAccounts.find((item) => String(item.id) === value);
    if (account != null) {
      setRecipientName(account.recipientName);
      setIban(formatIban(account.iban));
    } else {
      setRecipientName("");
      setIban("");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    const nextErrors: WithdrawErrors = {};
    const parsedAmount = parseAmount(amount);

    if (recipientName.trim() === "") {
      nextErrors.recipientName = "Podaj nazwę odbiorcy.";
    } else if (recipientName.trim().length > MAX_RECIPIENT_NAME_LENGTH) {
      nextErrors.recipientName = "Nazwa odbiorcy może mieć maks. 100 znaków.";
    }
    if (!isIbanValid(iban)) {
      nextErrors.iban = "Podaj numer w formacie PL oraz 26 cyfr.";
    }
    if (parsedAmount == null) {
      nextErrors.amount = "Podaj poprawną kwotę, np. 50,00.";
    } else if (parsedAmount > balance) {
      nextErrors.amount = "Kwota przekracza dostępne środki.";
    }
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || parsedAmount == null) {
      return;
    }

    setIsSubmitting(true);
    try {
      await withdraw({ recipientName, iban, amount: parsedAmount });

      if (isNew && rememberAccount) {
        try {
          await addSavedAccount({ recipientName, iban });
          await reloadSaved();
        } catch {
          toast.add({
            title: "Przelew wykonany, ale nie udało się zapisać rachunku.",
            type: "error",
          });
        }
      }

      toast.add({
        title: "Wypłata została zlecona.",
        type: "success",
      });
      setRecipientName("");
      setIban("");
      setAmount("");
      setRememberAccount(false);
      setChoice(NEW_RECIPIENT);
      onCompleted();
    } catch (submitError) {
      if (submitError instanceof ApiError && submitError.status === 401) {
        navigate("/login", { replace: true });
        return;
      }
      const serverErrors = mapServerErrors(submitError);
      if (serverErrors != null) {
        setErrors(serverErrors);
        return;
      }
      toast.add({
        title: describeError(submitError),
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {savedAccounts.length > 0 ? (
        <Field>
          <FieldLabel htmlFor="withdraw-saved">Odbiorca</FieldLabel>
          <Select
            items={selectItems}
            value={choice}
            onValueChange={handleChoiceChange}
          >
            <SelectTrigger
              id="withdraw-saved"
              className="w-full cursor-pointer"
            >
              <SelectValue placeholder="Wybierz odbiorcę" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={NEW_RECIPIENT} className="cursor-pointer">
                {NEW_RECIPIENT_LABEL}
              </SelectItem>
              {savedAccounts.map((account) => (
                <SelectItem
                  key={account.id}
                  value={String(account.id)}
                  className="cursor-pointer"
                >
                  {account.recipientName} · {formatIban(account.iban)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
      ) : null}

      <Field data-invalid={errors.recipientName != null}>
        <FieldLabel htmlFor="withdraw-recipient">Nazwa odbiorcy</FieldLabel>
        <Input
          id="withdraw-recipient"
          type="text"
          autoComplete="off"
          placeholder="Jan Kowalski"
          maxLength={MAX_RECIPIENT_NAME_LENGTH}
          value={recipientName}
          disabled={!isNew}
          onChange={(event) => {
            setRecipientName(event.target.value);
            clearError("recipientName");
          }}
          aria-invalid={errors.recipientName != null}
        />
        {errors.recipientName != null ? (
          <FieldError>{errors.recipientName}</FieldError>
        ) : null}
      </Field>
      <Field data-invalid={errors.iban != null}>
        <FieldLabel htmlFor="withdraw-iban">
          Rachunek docelowy (IBAN)
        </FieldLabel>
        <MaskedInput
          id="withdraw-iban"
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          placeholder="PL…"
          value={iban}
          disabled={!isNew}
          mask={maskIban}
          onValueChange={(value) => {
            setIban(value);
            clearError("iban");
          }}
          aria-invalid={errors.iban != null}
        />
        {errors.iban != null ? (
          <FieldError>{errors.iban}</FieldError>
        ) : isNew && iban !== "" && ibanDigits < IBAN_DIGITS ? (
          <FieldDescription className="text-xs">
            Wpisano {ibanDigits} z {IBAN_DIGITS} cyfr.
          </FieldDescription>
        ) : null}
      </Field>
      {isNew ? (
        <label className="flex items-center gap-2 text-sm">
          <Checkbox
            checked={rememberAccount}
            onCheckedChange={setRememberAccount}
          />
          Zapamiętaj ten rachunek
        </label>
      ) : null}
      <Field data-invalid={amountError != null}>
        <FieldLabel htmlFor="withdraw-amount">Kwota</FieldLabel>
        <MaskedInput
          id="withdraw-amount"
          type="text"
          inputMode="decimal"
          autoComplete="off"
          placeholder="0,00 zł"
          value={amount}
          disabled={!hasFunds}
          mask={maskAmount}
          onValueChange={(value) => {
            setAmount(value);
            clearError("amount");
          }}
          aria-invalid={amountError != null}
        />
        {!hasFunds ? (
          <FieldDescription className="text-xs">
            Brak środków do wypłaty.
          </FieldDescription>
        ) : amountError != null ? (
          <FieldError>{amountError}</FieldError>
        ) : null}
      </Field>
      <div className="flex justify-end gap-2">
        {onCancel != null ? (
          <Button type="button" variant="outline" onClick={onCancel}>
            Anuluj
          </Button>
        ) : null}
        <Button
          type="submit"
          variant="outline"
          loading={isSubmitting}
          disabled={!canSubmit}
          className="flex-1"
        >
          <ArrowUpRight />
          Wypłać
        </Button>
      </div>
    </form>
  );
}

export { WithdrawForm };
