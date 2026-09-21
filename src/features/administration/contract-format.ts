import { daysUntil } from './expiration-utils'

export function expirationLabel(endDate: string): string {
  const days = daysUntil(endDate)
  if (days < 0) return `Vencido hace ${Math.abs(days)} día${Math.abs(days) === 1 ? '' : 's'}`
  if (days === 0) return 'Vence hoy'
  return `Vence en ${days} día${days === 1 ? '' : 's'}`
}

export function adjustmentLabel(nextAdjustmentDate: string | undefined): string | null {
  if (!nextAdjustmentDate) return null
  const days = daysUntil(nextAdjustmentDate)
  if (days < 0) return `Ajuste vencido hace ${Math.abs(days)} día${Math.abs(days) === 1 ? '' : 's'}`
  if (days === 0) return 'Ajusta hoy'
  return `Ajusta en ${days} día${days === 1 ? '' : 's'}`
}
