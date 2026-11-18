const IBAN_PATTERN = /^PL\d{26}$/

function normalizeIban(value: string): string {
  return value.replace(/\s+/g, "").toUpperCase()
}

function formatIban(value: string): string {
  return normalizeIban(value).replace(/(.{4})/g, "$1 ").trim()
}

function isIbanValid(value: string): boolean {
  return IBAN_PATTERN.test(normalizeIban(value))
}

export { formatIban, isIbanValid, normalizeIban }
