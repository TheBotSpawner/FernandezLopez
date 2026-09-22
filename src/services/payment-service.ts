import { PAYMENTS } from '@/mocks/payments'
import { loadOrSeed, persist } from '@/lib/local-store'
import { computePaymentAllocations, creditBalance } from '@/features/administration/account-utils'
import { CHARGE_TYPE_LABELS } from '@/features/administration/account-labels'
import { applyChargeAllocation, findChargeSync, getChargesByContractAndPeriod, resetChargeToPending } from '@/services/contract-charge-service'
import { createReceipt, removeReceiptsForPayments } from '@/services/receipt-service'
import type { Payment, PaymentInput, PaymentMethod, Receipt } from '@/types/contract-account'

const KEY = 'fl.administration.payments'

let payments: Payment[] = loadOrSeed(KEY, PAYMENTS)

function save() {
  persist(KEY, payments)
}

export function getPaymentsByContract(contractId: string): Payment[] {
  return payments.filter((payment) => payment.contractId === contractId).sort((a, b) => b.date.localeCompare(a.date))
}

export function findPaymentSync(id: string): Payment | undefined {
  return payments.find((payment) => payment.id === id)
}

export function getCreditBalance(contractId: string): number {
  return creditBalance(getPaymentsByContract(contractId))
}

/** Most recent real (non-credit-application) payment with a positive allocation to this charge. */
export function findPaymentForCharge(chargeId: string): Payment | undefined {
  return payments.find((p) => p.allocations.some((a) => a.chargeId === chargeId && a.amount > 0))
}

/** Corrects an already-registered payment's date/method — does not touch amounts or allocations. */
export async function updatePaymentDetails(paymentId: string, date: string, method: PaymentMethod): Promise<Payment | undefined> {
  payments = payments.map((p) => (p.id === paymentId ? { ...p, date, method } : p))
  save()
  return findPaymentSync(paymentId)
}

/**
 * Un-marks a paid charge back to Pendiente: strips this charge's allocation from
 * whichever payment(s) covered it, dropping the payment (and its receipt) entirely
 * when it existed only for this charge.
 * ponytail: a payment shared with other charges just loses this one allocation — its
 * receipt still lists the old line item. Not reconciled; upgrade if that mismatch matters.
 */
export async function revertChargePayment(chargeId: string): Promise<void> {
  const now = new Date().toISOString()
  const droppedPaymentIds: string[] = []
  payments = payments.flatMap((payment) => {
    if (!payment.allocations.some((a) => a.chargeId === chargeId)) return [payment]
    const remaining = payment.allocations.filter((a) => a.chargeId !== chargeId)
    if (remaining.length === 0 || remaining.every((a) => a.chargeId === null)) {
      droppedPaymentIds.push(payment.id)
      return []
    }
    return [{ ...payment, allocations: remaining }]
  })
  save()
  resetChargeToPending(chargeId, now)
  removeReceiptsForPayments(droppedPaymentIds)
}

async function registerPayment(input: PaymentInput, isCreditApplication: boolean): Promise<Payment> {
  const now = new Date().toISOString()
  const allocations = computePaymentAllocations(input.amount, input.allocations)

  for (const allocation of allocations) {
    if (!allocation.chargeId || allocation.amount <= 0) continue
    applyChargeAllocation(allocation.chargeId, allocation.amount, now)
  }

  const payment: Payment = {
    id: `payment-${Date.now()}`,
    contractId: input.contractId,
    date: input.date,
    amount: input.amount,
    method: input.method,
    notes: input.notes,
    allocations,
    isCreditApplication: isCreditApplication || undefined,
    createdAt: now,
  }
  payments = [payment, ...payments]
  save()

  if (input.amount > 0 && !isCreditApplication) {
    const items = allocations
      .filter((a): a is { chargeId: string; amount: number } => Boolean(a.chargeId) && a.amount > 0)
      .map((a) => {
        const charge = findChargeSync(a.chargeId)
        return { description: charge?.description ?? charge?.type ?? '', amount: a.amount }
      })
    if (items.length > 0) {
      const firstChargeId = allocations.find((a) => a.chargeId)?.chargeId
      const firstCharge = firstChargeId ? findChargeSync(firstChargeId) : undefined
      await createReceipt({
        contractId: input.contractId,
        paymentId: payment.id,
        period: firstCharge?.period ?? input.date.slice(0, 7),
        date: input.date,
        items,
        paymentMethod: input.method,
      })
    }
  }

  return payment
}

export async function createPayment(input: PaymentInput): Promise<Payment> {
  return registerPayment(input, false)
}

/**
 * Consolidated "recibo del mes" — one receipt listing every paid concept for the
 * period, regardless of how many separate payments covered them. Distinct from the
 * automatic per-payment receipt (`registerPayment`'s `createReceipt` call): that one
 * documents a single payment; this one documents the period as a whole.
 */
export async function createPeriodReceipt(contractId: string, period: string): Promise<Receipt | null> {
  const paidCharges = getChargesByContractAndPeriod(contractId, period).filter((charge) => charge.paidAmount > 0)
  if (paidCharges.length === 0) return null

  const chargeIds = new Set(paidCharges.map((charge) => charge.id))
  const methods = new Set(
    getPaymentsByContract(contractId)
      .filter((payment) => payment.allocations.some((a) => a.chargeId && chargeIds.has(a.chargeId) && a.amount > 0))
      .map((payment) => payment.method),
  )
  const method: PaymentMethod = methods.size === 1 ? [...methods][0]! : 'OTHER'

  return createReceipt({
    contractId,
    period,
    date: new Date().toISOString().slice(0, 10),
    items: paidCharges.map((charge) => ({ description: charge.description || CHARGE_TYPE_LABELS[charge.type], amount: charge.paidAmount })),
    paymentMethod: method,
  })
}

/** Zero-cash payment that moves money from the contract's credit pool into a specific charge. */
export async function applyCreditToCharge(contractId: string, chargeId: string, amount: number): Promise<Payment> {
  return registerPayment(
    {
      contractId,
      date: new Date().toISOString().slice(0, 10),
      amount: 0,
      method: 'OTHER',
      notes: 'Aplicación de saldo a favor.',
      allocations: [{ chargeId, amount }],
    },
    true,
  )
}
