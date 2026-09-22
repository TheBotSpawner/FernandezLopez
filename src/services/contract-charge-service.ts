import { SEEDED_CHARGES } from '@/mocks/payments'
import { loadOrSeed, persist } from '@/lib/local-store'
import { effectiveChargeStatus, remainingAmount } from '@/features/administration/account-utils'
import { CHARGE_TYPE_LABELS } from '@/features/administration/account-labels'
import { findContractSync } from '@/services/rental-contract-service'
import type { ContractCharge, ContractChargeInput } from '@/types/contract-account'

const KEY = 'fl.administration.charges'

let charges: ContractCharge[] = loadOrSeed(KEY, SEEDED_CHARGES)

function save() {
  persist(KEY, charges)
}

export function getChargesByContract(contractId: string): ContractCharge[] {
  return charges.filter((charge) => charge.contractId === contractId).sort((a, b) => a.dueDate.localeCompare(b.dueDate))
}

export function getChargesByContractAndPeriod(contractId: string, period: string): ContractCharge[] {
  return getChargesByContract(contractId).filter((charge) => charge.period === period)
}

export function getPeriodsForContract(contractId: string): string[] {
  return Array.from(new Set(charges.filter((c) => c.contractId === contractId).map((c) => c.period))).sort()
}

export function findChargeSync(id: string): ContractCharge | undefined {
  return charges.find((charge) => charge.id === id)
}

export function getAllCharges(): ContractCharge[] {
  return charges
}

/** Contract ids with at least one overdue (unpaid, past due date) charge. */
export function getDebtorContractIds(): Set<string> {
  return new Set(charges.filter((charge) => effectiveChargeStatus(charge) === 'OVERDUE').map((charge) => charge.contractId))
}

/** Total overdue amount outstanding for a single contract — used for the "Debe $X" list indicator. */
export function getOverdueAmount(contractId: string): number {
  return charges
    .filter((charge) => charge.contractId === contractId && effectiveChargeStatus(charge) === 'OVERDUE')
    .reduce((sum, charge) => sum + remainingAmount(charge), 0)
}

/**
 * Auto-generates one recurring charge per enabled obligation not already
 * present for that period — RENT gets its known amount, everything else is
 * seeded at `amount: 0` ("Monto pendiente" in the UI) since the real figure
 * isn't known until the provider's bill/receipt arrives. Skips types that
 * already have a charge for the period, so it's safe to call repeatedly.
 */
export async function generatePeriodCharges(contractId: string, period: string): Promise<ContractCharge[]> {
  const contract = findContractSync(contractId)
  if (!contract) return []

  const existingTypes = new Set(getChargesByContractAndPeriod(contractId, period).map((c) => c.type))
  const now = new Date().toISOString()
  const created: ContractCharge[] = []

  contract.obligations.forEach((obligation, index) => {
    if (!obligation.enabled || existingTypes.has(obligation.type)) return
    const isRent = obligation.type === 'RENT'
    created.push({
      id: `charge-${Date.now()}-${index}`,
      contractId,
      period,
      type: obligation.type,
      description: obligation.provider || CHARGE_TYPE_LABELS[obligation.type],
      provider: obligation.provider,
      amount: isRent ? contract.currentRent : 0,
      paidAmount: 0,
      dueDate: isRent ? `${period}-05` : `${period}-10`,
      status: 'PENDING',
      responsibility: obligation.responsibility,
      source: 'RECURRING',
      createdAt: now,
      updatedAt: now,
    })
  })

  charges = [...charges, ...created]
  save()
  return created
}

export async function createCharge(input: ContractChargeInput): Promise<ContractCharge> {
  const now = new Date().toISOString()
  const charge: ContractCharge = {
    id: `charge-${Date.now()}`,
    paidAmount: 0,
    status: 'PENDING',
    source: 'MANUAL',
    ...input,
    createdAt: now,
    updatedAt: now,
  }
  charges = [...charges, charge]
  save()
  return charge
}

export async function updateCharge(id: string, input: Partial<ContractChargeInput>): Promise<ContractCharge> {
  const now = new Date().toISOString()
  charges = charges.map((charge) => (charge.id === id ? { ...charge, ...input, updatedAt: now } : charge))
  save()
  return charges.find((charge) => charge.id === id)!
}

/** Removes a charge from the monthly account. Any payments/receipts already tied to it stay as history. */
export async function deleteCharge(id: string): Promise<void> {
  charges = charges.filter((charge) => charge.id !== id)
  save()
}

/** Applies a payment allocation, updating `paidAmount`/`status` — mutated here so `payment-service.ts` stays a thin orchestrator. */
export function applyChargeAllocation(chargeId: string, amount: number, updatedAt: string): ContractCharge | undefined {
  const charge = charges.find((c) => c.id === chargeId)
  if (!charge) return undefined
  const paidAmount = Math.min(charge.amount, charge.paidAmount + amount)
  const updated: ContractCharge = { ...charge, paidAmount, status: paidAmount >= charge.amount ? 'PAID' : 'PARTIAL', updatedAt }
  charges = charges.map((c) => (c.id === chargeId ? updated : c))
  save()
  return updated
}

/** Reverts a charge to unpaid — used when un-marking a charge as Pagado from the edit form. */
export function resetChargeToPending(chargeId: string, updatedAt: string): void {
  charges = charges.map((c) => (c.id === chargeId ? { ...c, paidAmount: 0, status: 'PENDING', updatedAt } : c))
  save()
}
