import { RENTAL_CONTRACTS } from './rental-contracts'
import { OBLIGATION_TYPE_LABELS } from '@/features/administration/account-labels'
import type { ChargeType, ContractCharge } from '@/types/contract-account'
import type { ContractObligation, RentalContract } from '@/types/rental-contract'

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

function seedFrom(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return hash
}

function randInt(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function roundAmount(value: number): number {
  return Math.round(value / 100) * 100
}

/** Demo periods this prototype seeds charge history for — see docs/prototype-scope.md. */
export const SEEDED_PERIODS = ['2026-05', '2026-06', '2026-07', '2026-08', '2026-09']

const AMOUNT_RANGES: Partial<Record<ChargeType, [number, number]>> = {
  EXPENSES: [80000, 140000],
  ABL: [15000, 30000],
  AYSA: [12000, 25000],
  ELECTRICITY: [25000, 50000],
  GAS: [8000, 20000],
}

function periodBounds(period: string): { start: string; end: string } {
  const [year, month] = period.split('-').map(Number)
  const lastDay = new Date(year, month, 0).getDate()
  return { start: `${period}-01`, end: `${period}-${String(lastDay).padStart(2, '0')}` }
}

function contractActiveDuring(contract: RentalContract, period: string): boolean {
  if (contract.status === 'DRAFT' || contract.status === 'UPCOMING') return false
  const { start, end } = periodBounds(period)
  return contract.startDate <= end && contract.endDate >= start
}

function chargeDescription(type: ChargeType, obligation: ContractObligation | undefined): string {
  if (obligation?.provider) return obligation.provider
  return OBLIGATION_TYPE_LABELS[type as keyof typeof OBLIGATION_TYPE_LABELS] ?? type
}

function buildChargesForContract(contract: RentalContract): ContractCharge[] {
  const charges: ContractCharge[] = []
  const rng = mulberry32(seedFrom(contract.id))

  for (const period of SEEDED_PERIODS) {
    if (!contractActiveDuring(contract, period)) continue
    const dueDate = `${period}-10`
    const now = contract.updatedAt

    for (const obligation of contract.obligations) {
      if (!obligation.enabled || obligation.type === 'OTHER') continue

      const type: ChargeType = obligation.type
      const amount =
        type === 'RENT'
          ? contract.currentRent
          : roundAmount(randInt(...(AMOUNT_RANGES[type] ?? [10000, 20000]), rng))

      charges.push({
        id: `charge-${contract.id}-${period}-${type.toLowerCase()}`,
        contractId: contract.id,
        period,
        type,
        description: chargeDescription(type, obligation),
        provider: obligation.provider,
        amount,
        paidAmount: 0,
        dueDate: type === 'RENT' ? `${period}-05` : dueDate,
        status: 'PENDING',
        responsibility: obligation.responsibility,
        source: 'RECURRING',
        createdAt: now,
        updatedAt: now,
      })
    }
  }

  return charges
}

export const CONTRACT_CHARGES: ContractCharge[] = RENTAL_CONTRACTS.flatMap(buildChargesForContract)
