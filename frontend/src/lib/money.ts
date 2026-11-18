const formatter = new Intl.NumberFormat("pl-PL", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatMoney(amount: number, currency = "zł"): string {
  return `${formatter.format(amount)} ${currency}`
}

export { formatMoney }
