import { TrendingUp } from 'lucide-react'
import { formatARS, formatDateOnly } from '@/lib/format'
import { ADJUSTMENT_METHOD_LABELS } from '../contract-labels'
import { adjustmentLabel } from '../contract-format'
import { simulateNextRent } from '../adjustment-utils'
import type { AdjustmentMethod } from '@/types/rental-contract'

export function AdjustmentPreview({
  currentRent,
  method,
  nextAdjustmentDate,
}: {
  currentRent: number
  method: AdjustmentMethod
  nextAdjustmentDate: string | undefined
}) {
  if (!nextAdjustmentDate) return null

  const simulated = simulateNextRent(currentRent, method)
  const label = adjustmentLabel(nextAdjustmentDate)

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-info/40 bg-info/10 px-3 py-2.5 text-sm">
      <div className="flex items-center gap-2 font-medium text-info">
        <TrendingUp className="size-4 shrink-0" />
        Próximo ajuste por {ADJUSTMENT_METHOD_LABELS[method]} {formatDateOnly(nextAdjustmentDate)}
        {label && ` · ${label}`}
      </div>
      {simulated && (
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          <span>
            Variación simulada: +{(simulated.variationPct * 100).toFixed(1)}% · Alquiler estimado{' '}
            <span className="font-medium text-foreground">{formatARS(simulated.nextAmount)}</span>
          </span>
          <span className="italic">Estimación para demo — no refleja un índice oficial.</span>
        </div>
      )}
    </div>
  )
}
