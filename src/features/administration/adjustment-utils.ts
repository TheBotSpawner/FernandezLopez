import { daysUntil } from './expiration-utils'
import type { AdjustmentMethod } from '@/types/rental-contract'

/**
 * Deterministic, clearly-labeled demo variation per method — never a real
 * INDEC/BCRA lookup. MANUAL/OTHER contracts have no automatic estimate: the
 * agency sets those amounts by hand.
 */
const SIMULATED_VARIATION: Partial<Record<AdjustmentMethod, number>> = {
  IPC: 0.099,
  ICL: 0.074,
}

export function daysUntilAdjustment(nextAdjustmentDate: string | undefined, today: Date = new Date()): number | null {
  if (!nextAdjustmentDate) return null
  return daysUntil(nextAdjustmentDate, today)
}

export function isAdjustmentUpcoming(nextAdjustmentDate: string | undefined, withinDays = 30, today: Date = new Date()): boolean {
  const days = daysUntilAdjustment(nextAdjustmentDate, today)
  return days != null && days >= 0 && days <= withinDays
}

export interface SimulatedAdjustment {
  variationPct: number
  nextAmount: number
}

/** Purely for visual demo purposes — see docs/modules/contracts.md#adjustment-methods. */
export function simulateNextRent(currentRent: number, method: AdjustmentMethod): SimulatedAdjustment | null {
  const variationPct = SIMULATED_VARIATION[method]
  if (variationPct == null) return null
  return { variationPct, nextAmount: Math.round((currentRent * (1 + variationPct)) / 10) * 10 }
}
