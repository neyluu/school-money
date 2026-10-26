const AMOUNT_PATTERN = /^\d+(\.\d{1,2})?$/

function parseAmount(value: string): number | null {
  const normalized = value.trim().replace(",", ".")
  if (!AMOUNT_PATTERN.test(normalized)) {
    return null
  }

  const amount = Number(normalized)
  return amount > 0 ? amount : null
}

export { parseAmount }
