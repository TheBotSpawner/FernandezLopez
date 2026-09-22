import { daysUntil } from './expiration-utils'
import type { ContractCharge, EffectiveChargeStatus, PaymentAllocation } from '@/types/contract-account'

/** `YYYY-MM` for the demo's fixed "today" (2026-09-21). */
export function currentPeriod(): string {
  return '2026-09'
}

export function shiftPeriod(period: string, delta: number): string {
  const [year, month] = period.split('-').map(Number)
  const date = new Date(year, month - 1 + delta, 1)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

const MONTH_LABELS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
]

export function formatPeriodLabel(period: string): string {
  const [year, month] = period.split('-').map(Number)
  return `${MONTH_LABELS[month - 1]} ${year}`
}

export function isPeriodBefore(a: string, b: string): boolean {
  return a < b
}

/**
 * A charge's stored `status` only ever ends up `PENDING`/`PARTIAL`/`PAID`
 * (set explicitly by payment-service); `OVERDUE` is a presentational
 * overlay computed here, not a 4th stored state to keep in sync.
 */
export function effectiveChargeStatus(charge: ContractCharge, today: Date = new Date()): EffectiveChargeStatus {
  if (charge.status === 'PAID') return 'PAID'
  return daysUntil(charge.dueDate, today) < 0 ? 'OVERDUE' : charge.status
}

export function remainingAmount(charge: ContractCharge): number {
  return Math.max(0, charge.amount - charge.paidAmount)
}

/**
 * Pure charge-mutation used by both `payment-service.ts` (live) and
 * `mocks/payments.ts` (seed data) so the two never drift apart.
 */
export function applyAllocationToCharge(charge: ContractCharge, amount: number, updatedAt: string): ContractCharge {
  const paidAmount = Math.min(charge.amount, charge.paidAmount + amount)
  return { ...charge, paidAmount, status: paidAmount >= charge.amount ? 'PAID' : 'PARTIAL', updatedAt }
}

/**
 * Turns explicit per-charge allocations into the full allocation list for a
 * payment: any amount not explicitly allocated (or, for a credit-application
 * payment, drawn from the credit pool) becomes a `chargeId: null` entry.
 * A contract's credit balance is simply the sum of all `null` allocations
 * across its payment history — no separate balance field to keep in sync.
 * Shared by `payment-service.ts` (live) and `mocks/payments.ts` (seed data).
 */
export function computePaymentAllocations(amount: number, explicitAllocations: { chargeId: string; amount: number }[]): PaymentAllocation[] {
  const allocations: PaymentAllocation[] = explicitAllocations.map((a) => ({ chargeId: a.chargeId, amount: a.amount }))
  const explicitSum = explicitAllocations.reduce((sum, a) => sum + a.amount, 0)
  const remainder = Math.round((amount - explicitSum) * 100) / 100
  if (remainder !== 0) allocations.push({ chargeId: null, amount: remainder })
  return allocations
}

export function creditBalance(payments: { allocations: PaymentAllocation[] }[]): number {
  return payments.reduce(
    (sum, payment) => sum + payment.allocations.filter((a) => a.chargeId === null).reduce((s, a) => s + a.amount, 0),
    0,
  )
}
