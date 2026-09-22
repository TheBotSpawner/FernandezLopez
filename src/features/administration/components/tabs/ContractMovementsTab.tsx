import { useMemo, useState } from 'react'
import { EmptyState } from '@/components/feedback/EmptyState'
import { cn } from '@/lib/utils'
import { formatARS, formatShortDate } from '@/lib/format'
import { buildContractMovements } from '../../movement-derivations'
import type { ContractMovement, MovementType } from '@/types/contract-account'

type FilterKey = 'all' | 'charges' | 'payments' | 'adjustments' | 'receipts'

const FILTERS: { key: FilterKey; label: string; types?: MovementType[] }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'charges', label: 'Cargos', types: ['CHARGE_CREATED'] },
  { key: 'payments', label: 'Pagos', types: ['PAYMENT_RECEIVED', 'PAYMENT_APPLIED'] },
  { key: 'adjustments', label: 'Ajustes', types: ['CREDIT_APPLIED'] },
  { key: 'receipts', label: 'Recibos', types: ['RECEIPT_ISSUED', 'SETTLEMENT_CREATED'] },
]

function amountPrefix(movement: ContractMovement): string {
  if (movement.direction === 'DEBIT') return '+ '
  if (movement.direction === 'CREDIT') return '- '
  return ''
}

export function ContractMovementsTab({ contractId, refreshToken }: { contractId: string; refreshToken?: number }) {
  const [filter, setFilter] = useState<FilterKey>('all')
  const movements = useMemo(() => buildContractMovements(contractId), [contractId, refreshToken])

  const activeTypes = FILTERS.find((f) => f.key === filter)?.types
  const filtered = activeTypes ? movements.filter((m) => activeTypes.includes(m.type)) : movements

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map((option) => (
          <button
            key={option.key}
            type="button"
            aria-pressed={filter === option.key}
            onClick={() => setFilter(option.key)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
              filter === option.key
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState message="No hay movimientos registrados." />
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {filtered.map((movement) => (
            <li key={movement.id} className="flex items-center justify-between gap-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{movement.description}</p>
                <p className="text-xs text-muted-foreground">{formatShortDate(movement.date)}</p>
              </div>
              <span
                className={cn(
                  'shrink-0 text-sm font-medium',
                  movement.direction === 'DEBIT' && 'text-danger',
                  movement.direction === 'CREDIT' && 'text-success',
                  movement.direction === 'NEUTRAL' && 'text-muted-foreground',
                )}
              >
                {amountPrefix(movement)}
                {formatARS(movement.amount)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
