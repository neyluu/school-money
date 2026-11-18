const DAY_MS = 24 * 60 * 60 * 1000

function daysUntil(isoDate: string): number {
  const now = new Date()
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  const target = new Date(`${isoDate}T00:00:00Z`).getTime()
  return Math.round((target - today) / DAY_MS)
}

function formatDaysLeft(days: number): string {
  if (days < 0) return "Po terminie"
  if (days === 0) return "Dziś"
  if (days === 1) return "1 dzień"
  return `${days} dni`
}

export { daysUntil, formatDaysLeft }
