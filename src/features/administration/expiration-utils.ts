export type ExpirationSeverity = 'normal' | 'within90' | 'within60' | 'within30' | 'expired'

/**
 * `dateIso` is a plain `YYYY-MM-DD` calendar date (matches `<input type="date">`
 * and the mock generator) — parsed as local Y/M/D components, never via
 * `new Date(dateIso)`, which treats a date-only string as UTC midnight and can
 * shift the result by a day depending on the browser's timezone offset (the
 * same class of bug fixed in the dashboard's contact-trend chart).
 */
export function daysUntil(dateIso: string, today: Date = new Date()): number {
  const [year, month, day] = dateIso.split('-').map(Number)
  const target = new Date(year, month - 1, day)
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((target.getTime() - from.getTime()) / 86_400_000)
}

/** Single source of truth for expiration severity bands — see docs/modules/contracts.md#expiration-alerts. */
export function expirationSeverity(endDate: string, today: Date = new Date()): ExpirationSeverity {
  const days = daysUntil(endDate, today)
  if (days < 0) return 'expired'
  if (days <= 30) return 'within30'
  if (days <= 60) return 'within60'
  if (days <= 90) return 'within90'
  return 'normal'
}
