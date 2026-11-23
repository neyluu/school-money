import { formatIban, normalizeIban } from "@/lib/iban";

export type InputMask = (value: string) => string | null;

const ACCESS_CODE_LENGTH = 8;
const IBAN_DIGITS = 26;
const EMAIL_MAX_LENGTH = 255;
const PASSWORD_MAX_BYTES = 72;
const MAX_DATE = "9999-12-31";
const DAY_MS = 24 * 60 * 60 * 1000;

function createAmountMask(integerDigits: number): InputMask {
  const pattern = new RegExp(`^(\\d{1,${integerDigits}}(,\\d{0,2})?)?$`);

  return (value) => {
    let amount = value.replace(/\s/g, "").replace(".", ",");
    if (amount.startsWith(",")) {
      amount = `0${amount}`;
    }
    return pattern.test(amount) ? amount : null;
  };
}

const maskAmount = createAmountMask(10);
const maskFundraisingAmount = createAmountMask(8);

function maskIban(value: string): string | null {
  let iban = normalizeIban(value.replace(/-/g, "")).replace(/^PLPL/, "PL");
  if (/^\d/.test(iban)) {
    iban = `PL${iban}`;
  }

  const isPrefix = iban === "" || iban === "P";
  const isPartialIban = new RegExp(`^PL\\d{0,${IBAN_DIGITS}}$`).test(iban);
  return isPrefix || isPartialIban ? formatIban(iban) : null;
}

function maskAccessCode(value: string): string | null {
  const code = value.replace(/[\s-]/g, "").toUpperCase();
  return code.length <= ACCESS_CODE_LENGTH && /^[A-Z0-9]*$/.test(code)
    ? code
    : null;
}

function maskPassword(value: string): string | null {
  return new TextEncoder().encode(value).length <= PASSWORD_MAX_BYTES
    ? value
    : null;
}

function getLocalToday(): string {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function getUtcToday(): string {
  return new Date().toISOString().slice(0, 10);
}

function shiftDay(date: string, days: number): string {
  return new Date(Date.parse(date) + days * DAY_MS).toISOString().slice(0, 10);
}

function getLatestPastDate(): string {
  const [earlier] = [getLocalToday(), getUtcToday()].sort();
  return shiftDay(earlier, -1);
}

function getEarliestFutureDate(): string {
  const [, later] = [getLocalToday(), getUtcToday()].sort();
  return shiftDay(later, 1);
}

function isDateInRange(value: string, min: string, max: string): boolean {
  return value.length === 10 && value >= min && value <= max;
}

function isChildOldEnough(value: string, years: number): boolean {
  const birthYear = new Date(value).getFullYear();
  const currentYear = new Date().getFullYear();

  return currentYear - birthYear >= years;
}

function getDateRangeError(
  value: string,
  min: string,
  max: string,
  message: string,
): string | undefined {
  const isStillTypingYear = value < "1000";
  return !isStillTypingYear && !isDateInRange(value, min, max)
    ? message
    : undefined;
}

export {
  ACCESS_CODE_LENGTH,
  EMAIL_MAX_LENGTH,
  getDateRangeError,
  getEarliestFutureDate,
  getLatestPastDate,
  IBAN_DIGITS,
  isDateInRange,
  isChildOldEnough,
  maskAccessCode,
  maskAmount,
  maskFundraisingAmount,
  maskIban,
  maskPassword,
  MAX_DATE,
};
