import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { formatARS } from '@/lib/format'
import { propertyTitle } from '@/features/properties/property-format'
import { findContactSync } from '@/services/contact-service'
import { findPropertySync } from '@/services/property-service'
import { findContractSync } from '@/services/rental-contract-service'
import { SETTLEMENT_STATUS_LABELS, SETTLEMENT_STATUS_TONES } from './account-labels'
import { currentPeriod, formatPeriodLabel, shiftPeriod } from './account-utils'
import { SettlementFormSheet } from './components/SettlementFormSheet'
import { useSettlementList } from './use-settlement-list'
import type { SettlementStatus } from '@/types/contract-account'

const STATUS_OPTIONS: SettlementStatus[] = ['DRAFT', 'READY', 'PAID']
const PERIOD_OPTIONS = Array.from({ length: 5 }).map((_, i) => shiftPeriod(currentPeriod(), -4 + i))

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function SettlementsPage() {
  const { filters, setFilters, settlements, loading, activeFilterCount, clearFilters, refetch } = useSettlementList()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Liquidaciones</h1>
          <p className="text-sm text-muted-foreground">Liquidaciones a propietarios.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-1.5 self-start">
          <Plus className="size-4" />
          Nueva liquidación
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex max-w-full overflow-x-auto rounded-lg border border-border p-0.5">
          <button
            type="button"
            aria-pressed={filters.period === 'all'}
            onClick={() => setFilters((prev) => ({ ...prev, period: 'all' }))}
            className={cn(
              'shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
              filters.period === 'all' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            Todos los meses
          </button>
          {PERIOD_OPTIONS.map((period) => (
            <button
              key={period}
              type="button"
              aria-pressed={filters.period === period}
              onClick={() => setFilters((prev) => ({ ...prev, period }))}
              className={cn(
                'shrink-0 rounded-md px-2.5 py-1.5 text-sm font-medium whitespace-nowrap capitalize transition-colors',
                filters.period === period ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {formatPeriodLabel(period).split(' ')[0]}
            </button>
          ))}
        </div>

        {STATUS_OPTIONS.map((status) => {
          const active = filters.status.includes(status)
          return (
            <button
              key={status}
              type="button"
              aria-pressed={active}
              onClick={() => setFilters((prev) => ({ ...prev, status: toggleValue(prev.status, status) }))}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                active
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              {SETTLEMENT_STATUS_LABELS[status]}
            </button>
          )
        })}

        {activeFilterCount > 0 && (
          <button type="button" onClick={clearFilters} className="text-sm font-medium text-primary hover:underline">
            Limpiar filtros
            <Badge className="ml-1.5 px-1.5">{activeFilterCount}</Badge>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : settlements.length === 0 ? (
        <EmptyState message="No hay liquidaciones para este período." />
      ) : (
        <>
          <div className="flex flex-col gap-2 md:hidden">
            {settlements.map((settlement) => {
              const contract = findContractSync(settlement.contractId)
              const property = contract ? findPropertySync(contract.propertyId) : undefined
              const owner = findContactSync(settlement.ownerIds[0])
              return (
                <Link
                  key={settlement.id}
                  to={`/administration/settlements/${settlement.id}`}
                  className="flex flex-col gap-1.5 rounded-lg border border-border p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">{property ? propertyTitle(property) : '—'}</span>
                    <StatusBadge tone={SETTLEMENT_STATUS_TONES[settlement.status]}>
                      {SETTLEMENT_STATUS_LABELS[settlement.status]}
                    </StatusBadge>
                  </div>
                  <p className="text-xs text-muted-foreground capitalize">
                    {owner?.fullName ?? '—'} · {formatPeriodLabel(settlement.period)}
                  </p>
                  <p className="text-sm font-semibold text-foreground">Neto {formatARS(settlement.netAmount)}</p>
                </Link>
              )
            })}
          </div>

          <div className="hidden overflow-hidden rounded-lg border border-border md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
                <th className="px-3 py-2 font-medium">Período</th>
                <th className="px-3 py-2 font-medium">Propiedad</th>
                <th className="px-3 py-2 font-medium">Propietario</th>
                <th className="px-3 py-2 font-medium">Cobrado</th>
                <th className="px-3 py-2 font-medium">Honorarios / descuentos</th>
                <th className="px-3 py-2 font-medium">Neto</th>
                <th className="px-3 py-2 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {settlements.map((settlement) => {
                const contract = findContractSync(settlement.contractId)
                const property = contract ? findPropertySync(contract.propertyId) : undefined
                const owner = findContactSync(settlement.ownerIds[0])
                const deductionsTotal =
                  settlement.administrationFee + settlement.deductions.reduce((sum, d) => sum + d.amount, 0)
                return (
                  <tr key={settlement.id} className="transition-colors hover:bg-muted/50">
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground capitalize">
                      {formatPeriodLabel(settlement.period)}
                    </td>
                    <td className="px-3 py-2">
                      <Link to={`/administration/settlements/${settlement.id}`} className="font-medium text-foreground hover:underline">
                        {property ? propertyTitle(property) : '—'}
                      </Link>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{owner?.fullName ?? '—'}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-foreground">{formatARS(settlement.grossCollected)}</td>
                    <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">-{formatARS(deductionsTotal)}</td>
                    <td className="px-3 py-2 font-medium whitespace-nowrap text-foreground">{formatARS(settlement.netAmount)}</td>
                    <td className="px-3 py-2">
                      <StatusBadge tone={SETTLEMENT_STATUS_TONES[settlement.status]}>
                        {SETTLEMENT_STATUS_LABELS[settlement.status]}
                      </StatusBadge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          </div>
        </>
      )}

      <SettlementFormSheet open={createOpen} onOpenChange={setCreateOpen} onSaved={refetch} />
    </div>
  )
}
