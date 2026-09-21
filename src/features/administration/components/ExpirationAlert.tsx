import { AlertTriangle, CalendarClock, Info } from 'lucide-react'
import { cn } from '@/lib/utils'
import { daysUntil, expirationSeverity } from '../expiration-utils'

const SEVERITY_STYLES = {
  normal: null,
  within90: 'border-info/40 bg-info/10 text-info',
  within60: 'border-warning/40 bg-warning/10 text-warning',
  within30: 'border-danger/40 bg-danger/10 text-danger',
  expired: 'border-danger/40 bg-danger/10 text-danger',
} as const

export function ExpirationAlert({ endDate }: { endDate: string }) {
  const severity = expirationSeverity(endDate)
  const className = SEVERITY_STYLES[severity]
  if (!className) return null

  const days = daysUntil(endDate)
  const Icon = severity === 'expired' || severity === 'within30' ? AlertTriangle : severity === 'within60' ? CalendarClock : Info

  return (
    <div className={cn('flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium', className)}>
      <Icon className="size-4 shrink-0" />
      {severity === 'expired' ? `Este contrato venció hace ${Math.abs(days)} días.` : `Este contrato vence dentro de ${days} días.`}
    </div>
  )
}
