/**
 * Every seed date is an offset from the moment the seed is first built
 * (first visit or "Restaurar datos de demostración"), so the demo always
 * looks current: visits today, contacts this month, etc.
 */
export function demoDate(daysFromToday: number, hour = 0, minute = 0): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysFromToday, hour, minute, 0)
}

/** Days elapsed in the current month (0 on the 1st) — lets seeds place records "this month" on any date. */
export const DAYS_INTO_MONTH = new Date().getDate() - 1
