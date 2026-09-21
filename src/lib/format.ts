import { format, isToday, isTomorrow } from 'date-fns'
import { es } from 'date-fns/locale'

const numberFormatter = new Intl.NumberFormat('es-AR')

export function formatARS(value: number): string {
  return `$ ${numberFormatter.format(value)}`
}

export function formatUSD(value: number): string {
  return `USD ${numberFormatter.format(value)}`
}

export function formatPrice(value: number, currency: 'ARS' | 'USD'): string {
  return currency === 'USD' ? formatUSD(value) : formatARS(value)
}

export function formatShortDate(iso: string): string {
  return format(new Date(iso), 'd MMM', { locale: es })
}

/**
 * For plain `YYYY-MM-DD` calendar dates (e.g. rental contract start/end
 * dates) — parses Y/M/D components directly rather than `new Date(dateOnly)`,
 * which treats a date-only string as UTC midnight and can display the wrong
 * day depending on the browser's timezone offset.
 */
export function formatDateOnly(dateOnly: string, pattern = 'd MMM yyyy'): string {
  const [year, month, day] = dateOnly.split('-').map(Number)
  return format(new Date(year, month - 1, day), pattern, { locale: es })
}

export function formatTime(iso: string): string {
  return format(new Date(iso), 'HH:mm')
}

export function formatVisitDay(iso: string): string {
  const date = new Date(iso)
  if (isToday(date)) return 'Hoy'
  if (isTomorrow(date)) return 'Mañana'
  return format(date, "d 'de' MMMM", { locale: es })
}
