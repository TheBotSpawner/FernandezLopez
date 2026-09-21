import { AlertTriangle, CalendarClock } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '@/app/session-context'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { formatARS, formatDateOnly } from '@/lib/format'
import { cn } from '@/lib/utils'
import { propertyTitle } from '@/features/properties/property-format'
import { findContactSync } from '@/services/contact-service'
import { findPropertySync } from '@/services/property-service'
import { getContracts } from '@/services/rental-contract-service'
import { daysUntil, expirationSeverity } from './expiration-utils'
import { expirationLabel } from './contract-format'
import type { RentalContract } from '@/types/rental-contract'

const GROUPS = [
  { key: 'within30', label: 'Próximos 30 días' },
  { key: 'within60', label: '31–60 días' },
  { key: 'within90', label: '61–90 días' },
  { key: 'expired', label: 'Vencidos' },
] as const

function groupOf(contract: RentalContract): (typeof GROUPS)[number]['key'] | null {
  const severity = expirationSeverity(contract.endDate)
  if (severity === 'normal') return null
  return severity
}

export function ExpirationsPage() {
  const { user, branchScope } = useSession()
  const effectiveBranch = user.role === 'ADMIN' || user.role === 'MANAGER' ? branchScope : user.branchId
  const [contracts, setContracts] = useState<RentalContract[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getContracts({ branchId: effectiveBranch, status: ['ACTIVE'] }).then((result) => {
      if (!cancelled) {
        setContracts(result)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [effectiveBranch])

  const grouped = GROUPS.map((group) => ({
    ...group,
    contracts: contracts.filter((c) => groupOf(c) === group.key).sort((a, b) => daysUntil(a.endDate) - daysUntil(b.endDate)),
  }))

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Vencimientos</h1>
        <p className="text-sm text-muted-foreground">Contratos próximos a vencer o ya vencidos.</p>
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : grouped.every((g) => g.contracts.length === 0) ? (
        <EmptyState icon={CalendarClock} message="No hay contratos próximos a vencer." />
      ) : (
        <div className="flex flex-col gap-6">
          {grouped.map(
            (group) =>
              group.contracts.length > 0 && (
                <div key={group.key} className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-medium text-foreground">{group.label}</h2>
                    <span className="text-xs text-muted-foreground">{group.contracts.length}</span>
                  </div>
                  <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
                    {group.contracts.map((contract) => {
                      const property = findPropertySync(contract.propertyId)
                      const tenant = findContactSync(contract.tenantIds[0])
                      return (
                        <Link
                          key={contract.id}
                          to={`/administration/contracts/${contract.id}`}
                          className="flex flex-col gap-1 p-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium text-foreground">{property ? propertyTitle(property) : '—'}</span>
                            <span className="text-xs text-muted-foreground">{tenant?.fullName ?? 'Sin inquilino'}</span>
                          </div>
                          <div className="flex items-center gap-4 sm:text-right">
                            <span className="text-sm font-medium text-foreground">{formatARS(contract.currentRent)}</span>
                            <div className="flex flex-col">
                              <span className="text-xs text-muted-foreground">{formatDateOnly(contract.endDate)}</span>
                              <span className={cn('flex items-center gap-1 text-xs font-medium', group.key !== 'within90' && 'text-danger')}>
                                {(group.key === 'within30' || group.key === 'expired') && <AlertTriangle className="size-3.5" />}
                                {expirationLabel(contract.endDate)}
                              </span>
                            </div>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              ),
          )}
        </div>
      )}
    </div>
  )
}
