import { CONTRACT_CHARGES } from './contract-charges'
import { RENTAL_CONTRACTS, SCENARIO_CONTRACT_BY_LETTER } from './rental-contracts'
import { CHARGE_TYPE_LABELS } from '@/features/administration/account-labels'
import { applyAllocationToCharge, computePaymentAllocations, currentPeriod } from '@/features/administration/account-utils'
import type { ContractCharge, Payment, PaymentMethod, Receipt } from '@/types/contract-account'
import type { RentalContract } from '@/types/rental-contract'

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

function pick<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)]
}

const METHODS: PaymentMethod[] = ['TRANSFER', 'CASH', 'DEPOSIT']

const chargesById = new Map<string, ContractCharge>(CONTRACT_CHARGES.map((c) => [c.id, { ...c }]))
const chargesByContract = new Map<string, ContractCharge[]>()
for (const charge of CONTRACT_CHARGES) {
  const list = chargesByContract.get(charge.contractId) ?? []
  list.push(charge)
  chargesByContract.set(charge.contractId, list)
}

const PAYMENTS: Payment[] = []
const RECEIPTS: Receipt[] = []
let paymentSeq = 0
let receiptSeq = 123

function paymentDateFor(charge: ContractCharge, offsetDays: number): string {
  const [year, month, day] = charge.dueDate.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  date.setDate(date.getDate() + offsetDays)
  return date.toISOString().slice(0, 10)
}

/**
 * Registers a payment against one or more charges, mutating `chargesById` the
 * same way the live `payment-service.ts` does (via `applyAllocationToCharge`)
 * and auto-generating the matching tenant receipt — see
 * docs/data-model.md#payment and #receipt.
 */
function registerPayment(params: {
  contractId: string
  date: string
  amount: number
  method: PaymentMethod
  notes?: string
  allocations: { chargeId: string; amount: number }[]
  isCreditApplication?: boolean
}): Payment {
  paymentSeq += 1
  const allocations = computePaymentAllocations(params.amount, params.allocations)
  const createdAt = new Date(`${params.date}T12:00:00`).toISOString()

  for (const allocation of allocations) {
    if (!allocation.chargeId || allocation.amount <= 0) continue
    const charge = chargesById.get(allocation.chargeId)
    if (!charge) continue
    chargesById.set(allocation.chargeId, applyAllocationToCharge(charge, allocation.amount, createdAt))
  }

  const payment: Payment = {
    id: `payment-${paymentSeq}`,
    contractId: params.contractId,
    date: params.date,
    amount: params.amount,
    method: params.method,
    notes: params.notes,
    allocations,
    isCreditApplication: params.isCreditApplication,
    createdAt,
  }
  PAYMENTS.push(payment)

  if (params.amount > 0 && !params.isCreditApplication) {
    const items = allocations
      .filter((a): a is { chargeId: string; amount: number } => Boolean(a.chargeId) && a.amount > 0)
      .map((a) => {
        const charge = chargesById.get(a.chargeId)!
        return { description: charge.description || CHARGE_TYPE_LABELS[charge.type], amount: a.amount }
      })
    if (items.length > 0) {
      receiptSeq += 1
      const firstCharge = chargesById.get(allocations.find((a) => a.chargeId)?.chargeId ?? '')
      RECEIPTS.push({
        id: `receipt-${receiptSeq}`,
        contractId: params.contractId,
        paymentId: payment.id,
        number: String(receiptSeq).padStart(6, '0'),
        date: params.date,
        period: firstCharge?.period ?? currentPeriod(),
        items,
        total: items.reduce((sum, item) => sum + item.amount, 0),
        paymentMethod: params.method,
        createdAt,
      })
    }
  }

  return payment
}

function payChargeFully(charge: ContractCharge, rng: () => number) {
  registerPayment({
    contractId: charge.contractId,
    date: paymentDateFor(charge, randOffset(rng)),
    amount: charge.amount,
    method: pick(METHODS, rng),
    allocations: [{ chargeId: charge.id, amount: charge.amount }],
  })
}

function randOffset(rng: () => number): number {
  return Math.floor(rng() * 8) - 2
}

// ---------------------------------------------------------------------------
// Curated account scenarios (Milestone 5 A–L) on top of the reused
// Milestone 4 contract scenarios — see docs/modules/contracts.md.
// ---------------------------------------------------------------------------

function chargeFor(contract: RentalContract, period: string, type: string): ContractCharge | undefined {
  return chargesByContract.get(contract.id)?.find((c) => c.period === period && c.type === type)
}

const CURRENT = currentPeriod()

// A — Fully paid contract (scenario D: pay every generated charge in full).
{
  const contract = SCENARIO_CONTRACT_BY_LETTER.D
  const rng = mulberry32(seedFrom(`${contract.id}-A`))
  for (const charge of chargesByContract.get(contract.id) ?? []) payChargeFully(charge, rng)
}

// B — ABL unpaid (scenario E): everything paid except September's ABL.
{
  const contract = SCENARIO_CONTRACT_BY_LETTER.E
  const rng = mulberry32(seedFrom(`${contract.id}-B`))
  for (const charge of chargesByContract.get(contract.id) ?? []) {
    if (charge.period === CURRENT && charge.type === 'ABL') continue
    payChargeFully(charge, rng)
  }
}

// C — Electricity unpaid (scenario B / Edesur contract): everything paid except September's electricity.
{
  const contract = SCENARIO_CONTRACT_BY_LETTER.B
  const rng = mulberry32(seedFrom(`${contract.id}-C`))
  for (const charge of chargesByContract.get(contract.id) ?? []) {
    if (charge.period === CURRENT && charge.type === 'ELECTRICITY') continue
    payChargeFully(charge, rng)
  }
}

// D — Multiple outstanding concepts (scenario G): leave several September charges unpaid.
{
  const contract = SCENARIO_CONTRACT_BY_LETTER.G
  const rng = mulberry32(seedFrom(`${contract.id}-D`))
  const unpaidTypes = new Set(['ABL', 'ELECTRICITY', 'AYSA'])
  for (const charge of chargesByContract.get(contract.id) ?? []) {
    if (charge.period === CURRENT && unpaidTypes.has(charge.type)) continue
    payChargeFully(charge, rng)
  }
}

// E — Partial payment (scenario H): September rent only partially paid.
{
  const contract = SCENARIO_CONTRACT_BY_LETTER.H
  const rng = mulberry32(seedFrom(`${contract.id}-E`))
  for (const charge of chargesByContract.get(contract.id) ?? []) {
    if (charge.period === CURRENT && charge.type === 'RENT') continue
    payChargeFully(charge, rng)
  }
  const rentCharge = chargeFor(contract, CURRENT, 'RENT')
  if (rentCharge) {
    const partial = Math.round((rentCharge.amount * 0.45) / 10) * 10
    registerPayment({
      contractId: contract.id,
      date: paymentDateFor(rentCharge, 3),
      amount: partial,
      method: 'CASH',
      allocations: [{ chargeId: rentCharge.id, amount: partial }],
    })
  }
}

// F — Previous-month debt carried forward (scenario I): August rent left unpaid, September paid.
{
  const contract = SCENARIO_CONTRACT_BY_LETTER.I
  const rng = mulberry32(seedFrom(`${contract.id}-F`))
  for (const charge of chargesByContract.get(contract.id) ?? []) {
    if (charge.period === '2026-08' && charge.type === 'RENT') continue
    payChargeFully(charge, rng)
  }
}

// G — Credit balance (scenario J): September rent overpaid, remainder becomes credit.
{
  const contract = SCENARIO_CONTRACT_BY_LETTER.J
  const rng = mulberry32(seedFrom(`${contract.id}-G`))
  for (const charge of chargesByContract.get(contract.id) ?? []) {
    if (charge.period === CURRENT && charge.type === 'RENT') continue
    payChargeFully(charge, rng)
  }
  const rentCharge = chargeFor(contract, CURRENT, 'RENT')
  if (rentCharge) {
    registerPayment({
      contractId: contract.id,
      date: paymentDateFor(rentCharge, 1),
      amount: rentCharge.amount + 24500,
      method: 'TRANSFER',
      notes: 'El inquilino transfirió de más por error.',
      allocations: [{ chargeId: rentCharge.id, amount: rentCharge.amount }],
    })
  }
}

// H — Interest/penalty (scenario A / Edenor contract): add a manual interest charge for late rent.
{
  const contract = SCENARIO_CONTRACT_BY_LETTER.A
  const rng = mulberry32(seedFrom(`${contract.id}-H`))
  for (const charge of chargesByContract.get(contract.id) ?? []) {
    if (charge.period === CURRENT && charge.type === 'RENT') continue
    payChargeFully(charge, rng)
  }
  const interestCharge: ContractCharge = {
    id: `charge-${contract.id}-${CURRENT}-interest`,
    contractId: contract.id,
    period: CURRENT,
    type: 'INTEREST',
    description: 'Interés por pago fuera de término',
    amount: 9800,
    paidAmount: 0,
    dueDate: `${CURRENT}-15`,
    status: 'PENDING',
    source: 'MANUAL',
    createdAt: new Date(`${CURRENT}-15T12:00:00`).toISOString(),
    updatedAt: new Date(`${CURRENT}-15T12:00:00`).toISOString(),
  }
  chargesById.set(interestCharge.id, interestCharge)
  const list = chargesByContract.get(contract.id) ?? []
  list.push(interestCharge)
  chargesByContract.set(contract.id, list)
  const rentCharge = chargeFor(contract, CURRENT, 'RENT')
  if (rentCharge) payChargeFully(rentCharge, rng)
}

// ---------------------------------------------------------------------------
// Bulk payments for every other contract with seeded charges — past periods
// mostly settled (a realistic account history), current period a mix of
// paid/partial/pending so filters and the overview have real variety.
// ---------------------------------------------------------------------------

const curatedContractIds = new Set(Object.values(SCENARIO_CONTRACT_BY_LETTER).map((c) => c.id))
const bulkRng = mulberry32(20261001)

// Decided per contract (not per charge) so debt doesn't compound across a
// contract's several concepts — otherwise a contract with 4+ enabled
// concepts would show "con deuda" almost by construction. Roughly matches a
// realistic portfolio: most accounts current, a minority genuinely behind.
type AccountProfile = 'current' | 'minorGap' | 'debtor'
const PROFILE_WEIGHTS: [AccountProfile, number][] = [
  ['current', 75],
  ['minorGap', 15],
  ['debtor', 10],
]

for (const contract of RENTAL_CONTRACTS) {
  if (curatedContractIds.has(contract.id)) continue
  const charges = chargesByContract.get(contract.id)
  if (!charges) continue

  const profile = weightedPick(PROFILE_WEIGHTS, bulkRng)
  const currentCharges = charges.filter((c) => c.period === CURRENT)
  const pastCharges = charges.filter((c) => c.period !== CURRENT)
  const skipIds = new Set<string>()

  if (profile === 'minorGap' && currentCharges.length > 0) {
    skipIds.add(pick(currentCharges, bulkRng).id)
  } else if (profile === 'debtor') {
    const unpaidCount = Math.min(currentCharges.length, randInt(1, 2, bulkRng))
    for (const charge of shuffle(currentCharges, bulkRng).slice(0, unpaidCount)) skipIds.add(charge.id)
    if (pastCharges.length > 0 && bulkRng() < 0.6) skipIds.add(pick(pastCharges, bulkRng).id)
  }

  for (const charge of charges) {
    if (skipIds.has(charge.id)) continue
    if (profile === 'debtor' && bulkRng() < 0.25) {
      const partial = Math.round((charge.amount * randFraction(bulkRng)) / 10) * 10
      if (partial > 0) {
        registerPayment({
          contractId: contract.id,
          date: paymentDateFor(charge, randOffset(bulkRng)),
          amount: partial,
          method: pick(METHODS, bulkRng),
          allocations: [{ chargeId: charge.id, amount: partial }],
        })
        continue
      }
    }
    payChargeFully(charge, bulkRng)
  }
}

function randInt(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function weightedPick<T>(weights: [T, number][], rng: () => number): T {
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = rng() * total
  for (const [value, weight] of weights) {
    roll -= weight
    if (roll <= 0) return value
  }
  return weights[0][0]
}

function randFraction(rng: () => number): number {
  return 0.3 + rng() * 0.4
}

export { PAYMENTS, RECEIPTS }
export const SEEDED_CHARGES: ContractCharge[] = Array.from(chargesById.values())
