import { RENTAL_CONTRACTS, SCENARIO_CONTRACT_BY_LETTER } from './rental-contracts'
import { SEEDED_CHARGES } from './payments'
import type { OwnerSettlement, SettlementStatus } from '@/types/contract-account'

function mulberry32(seed: number) {
  let state = seed
  return function random() {
    state |= 0
    state = (state + 0x6d2b79f5) | 0
    let t = Math.imul(state ^ (state >>> 15), 1 | state)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function roundAmount(value: number): number {
  return Math.round(value / 10) * 10
}

const FEE_PERCENTAGE = 5
const PERIODS = ['2026-07', '2026-08', '2026-09']
const STATUS_BY_PERIOD: Record<string, SettlementStatus> = {
  '2026-07': 'PAID',
  '2026-08': 'PAID',
  '2026-09': 'READY',
}

function collectedRent(contractId: string, period: string): number {
  return SEEDED_CHARGES.filter((c) => c.contractId === contractId && c.period === period && c.type === 'RENT').reduce(
    (sum, c) => sum + c.paidAmount,
    0,
  )
}

function buildSettlement(contractId: string, ownerIds: string[], period: string, rng: () => number, status?: SettlementStatus): OwnerSettlement | null {
  const grossCollected = collectedRent(contractId, period)
  if (grossCollected <= 0) return null

  const administrationFee = roundAmount(grossCollected * (FEE_PERCENTAGE / 100))
  const hasRepair = rng() < 0.2
  const deductions = hasRepair ? [{ description: 'Reparación', amount: roundAmount(grossCollected * 0.03) }] : []
  const netAmount = grossCollected - administrationFee - deductions.reduce((sum, d) => sum + d.amount, 0)
  const now = new Date(`${period}-28T12:00:00`).toISOString()

  return {
    id: `settlement-${contractId}-${period}`,
    contractId,
    ownerIds,
    period,
    grossCollected,
    feeType: 'PERCENTAGE',
    feeValue: FEE_PERCENTAGE,
    administrationFee,
    deductions,
    netAmount,
    status: status ?? STATUS_BY_PERIOD[period] ?? 'DRAFT',
    createdAt: now,
    updatedAt: now,
  }
}

const rng = mulberry32(20261010)
const eligibleContracts = RENTAL_CONTRACTS.filter((c) => c.status === 'ACTIVE' && c.ownerIds.length > 0)
const sample = [
  ...Object.values(SCENARIO_CONTRACT_BY_LETTER),
  ...eligibleContracts.filter((c) => !Object.values(SCENARIO_CONTRACT_BY_LETTER).some((s) => s.id === c.id)).slice(0, 20),
]

export const OWNER_SETTLEMENTS: OwnerSettlement[] = sample
  .flatMap((contract) => PERIODS.map((period) => buildSettlement(contract.id, contract.ownerIds, period, rng)))
  .filter((settlement): settlement is OwnerSettlement => Boolean(settlement))

// One explicit DRAFT for the "create a new settlement" demo path.
{
  const contract = SCENARIO_CONTRACT_BY_LETTER.C
  const draft = buildSettlement(contract.id, contract.ownerIds, '2026-09', rng, 'DRAFT')
  if (draft && !OWNER_SETTLEMENTS.some((s) => s.id === draft.id)) OWNER_SETTLEMENTS.push(draft)
}
