import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import type { ReportPeriod } from '@/types/report'

export const REPORT_PERIOD_LABELS: Record<ReportPeriod, string> = {
  'this-month': 'Este mes',
  'last-month': 'Mes anterior',
  'last-3-months': 'Últimos 3 meses',
  'last-6-months': 'Últimos 6 meses',
  'this-year': 'Este año',
}

export const REPORT_PERIODS: ReportPeriod[] = ['this-month', 'last-month', 'last-3-months', 'last-6-months', 'this-year']

/** `month` is `YYYY-MM` — parsed via local Y/M components, same rule as the dashboard's contact-trend chart. */
export function monthLabel(month: string): string {
  const [year, monthNumber] = month.split('-').map(Number)
  return format(new Date(year, monthNumber - 1, 1), 'MMM', { locale: es })
}
