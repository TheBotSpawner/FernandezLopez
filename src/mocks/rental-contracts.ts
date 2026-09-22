import { CONTACTS, findContactByPhone } from './contacts'
import { PROPERTIES } from './properties'
import { PROPERTY_OWNERS } from './property-owners'
import { ADJUSTMENT_FREQUENCY_MONTHS } from '@/types/rental-contract'
import type {
  AdjustmentFrequency,
  AdjustmentMethod,
  ContractObligation,
  ContractStatus,
  GuaranteeType,
  RentalContract,
} from '@/types/rental-contract'
import type { Property } from '@/types/property'

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

function pick<T>(items: readonly T[], rng: () => number): T {
  return items[Math.floor(rng() * items.length)]
}

function pickUnique<T>(items: readonly T[], count: number, rng: () => number): T[] {
  const pool = [...items]
  const result: T[] = []
  for (let i = 0; i < count && pool.length > 0; i++) {
    const index = Math.floor(rng() * pool.length)
    result.push(pool[index])
    pool.splice(index, 1)
  }
  return result
}

function randInt(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min
}

function randFloat(min: number, max: number, rng: () => number): number {
  return min + rng() * (max - min)
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

/** Day-offset from the demo's fixed "today" (2026-09-21) as a plain YYYY-MM-DD calendar date. */
function dateAt(daysFromToday: number): string {
  const d = new Date(2026, 8, 21)
  d.setDate(d.getDate() + daysFromToday)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function isoAt(daysFromToday: number): string {
  const d = new Date(2026, 8, 21, 10, 0, 0)
  d.setDate(d.getDate() + daysFromToday)
  return d.toISOString()
}

function roundRent(value: number): number {
  return Math.round(value / 10) * 10
}

let contractSeq = 0
function nextContractNumber(): string {
  contractSeq += 1
  return `CTR-2026-${String(contractSeq).padStart(3, '0')}`
}

const RENT_ELIGIBLE = PROPERTIES.filter((property) => property.operationTypes.includes('rent'))

/** Resolves a property's owner pool ids to the matching Contact records created in Milestone 3. */
function ownerContactIds(property: Property): string[] {
  return property.ownerIds
    .map((id) => PROPERTY_OWNERS.find((owner) => owner.id === id))
    .filter((owner): owner is (typeof PROPERTY_OWNERS)[number] => Boolean(owner))
    .map((owner) => findContactByPhone(owner.phone)?.id)
    .filter((id): id is string => Boolean(id))
}

const TENANT_POOL = CONTACTS.filter((contact) => contact.roles.includes('tenant') || contact.roles.includes('prospect'))

const FREQUENCY_BY_METHOD: Record<AdjustmentMethod, AdjustmentFrequency> = {
  IPC: 'QUARTERLY',
  ICL: 'SEMIANNUAL',
  MANUAL: 'ANNUAL',
  OTHER: 'CUSTOM',
}

const METHOD_WEIGHTS: [AdjustmentMethod, number][] = [
  ['IPC', 55],
  ['ICL', 30],
  ['MANUAL', 10],
  ['OTHER', 5],
]

const GUARANTEE_WEIGHTS: [GuaranteeType, number][] = [
  ['OWNER_GUARANTEE', 30],
  ['INSURANCE', 30],
  ['PAYSLIP', 20],
  ['GUARANTOR', 15],
  ['OTHER', 5],
]

/** Deterministic per-contract obligation mix — see docs/data-model.md#contractobligation. */
function generateObligations(rng: () => number): ContractObligation[] {
  const electricityEnabled = rng() < 0.9
  const gasEnabled = rng() < 0.75
  return [
    { type: 'RENT', enabled: true, responsibility: 'TENANT' },
    { type: 'EXPENSES', enabled: rng() < 0.7, responsibility: 'TENANT' },
    { type: 'ABL', enabled: rng() < 0.6, responsibility: 'TENANT' },
    { type: 'AYSA', enabled: rng() < 0.6, responsibility: 'TENANT' },
    {
      type: 'ELECTRICITY',
      enabled: electricityEnabled,
      responsibility: 'TENANT',
      provider: electricityEnabled ? pick(['Edenor', 'Edesur'], rng) : undefined,
    },
    { type: 'GAS', enabled: gasEnabled, responsibility: 'TENANT', provider: gasEnabled ? 'Metrogas' : undefined },
    { type: 'OTHER', enabled: false },
  ]
}

function buildContract(params: {
  property: Property
  status: ContractStatus
  startDate: string
  endDate: string
  tenantIds: string[]
  adjustmentMethod?: AdjustmentMethod
  nextAdjustmentDate?: string
  lastAdjustmentDate?: string
  rentOverride?: number
  notes?: string
  createdDaysAgo?: number
  obligationsOverride?: ContractObligation[]
}): RentalContract {
  const { property } = params
  const rng = mulberry32(property.id.length * 7919 + contractSeq * 13)
  const method = params.adjustmentMethod ?? weightedPick(METHOD_WEIGHTS, rng)
  const frequency = FREQUENCY_BY_METHOD[method]
  const currentRent = roundRent(params.rentOverride ?? property.rentalPrice ?? randInt(300000, 900000, rng))
  const initialRent = roundRent(currentRent * randFloat(0.72, 0.94, rng))
  const now = isoAt(0)
  const contractNumber = nextContractNumber()

  return {
    id: `contract-${contractNumber.toLowerCase().replace(/-/g, '_')}`,
    organizationId: 'org-fl',
    branchId: property.branchId,
    contractNumber,
    propertyId: property.id,
    tenantIds: params.tenantIds,
    ownerIds: ownerContactIds(property),
    startDate: params.startDate,
    endDate: params.endDate,
    initialRent,
    currentRent,
    currency: 'ARS',
    adjustmentMethod: method,
    adjustmentFrequency: frequency,
    lastAdjustmentDate: params.lastAdjustmentDate,
    nextAdjustmentDate: params.nextAdjustmentDate,
    deposit: currentRent,
    guaranteeType: weightedPick(GUARANTEE_WEIGHTS, rng),
    obligations: params.obligationsOverride ?? generateObligations(rng),
    status: params.status,
    notes: params.notes,
    createdAt: isoAt(params.createdDaysAgo ?? -30),
    updatedAt: now,
  }
}

function tenantsFor(count: number, rng: () => number): string[] {
  return pickUnique(TENANT_POOL, count, rng).map((contact) => contact.id)
}

// ---------------------------------------------------------------------------
// Curated demo scenarios (A–J from the Milestone 4 spec) — see
// docs/modules/contracts.md and docs/prototype-scope.md.
// ---------------------------------------------------------------------------

const scenarioRng = mulberry32(20260925)
const used = new Set<string>()

function takeProperty(predicate?: (p: Property) => boolean): Property {
  const candidates = RENT_ELIGIBLE.filter((p) => !used.has(p.id) && (!predicate || predicate(p)))
  const property = candidates[0] ?? RENT_ELIGIBLE.find((p) => !used.has(p.id))!
  used.add(property.id)
  return property
}

const SCENARIO_CONTRACTS: RentalContract[] = []
/** Named references so mocks/contract-charges.ts and mocks/payments.ts can target specific scenarios by letter. */
const SCENARIO_CONTRACT_BY_LETTER: Record<string, RentalContract> = {}

// A — Healthy active contract: no imminent expiration, no immediate adjustment.
// Also Milestone 5 scenario J — Edenor contract, full obligation set.
{
  const property = takeProperty((p) => p.id === 'prop-1')
  const contract = buildContract({
    property,
    status: 'ACTIVE',
    startDate: dateAt(-380),
    endDate: dateAt(400),
    tenantIds: ['contact-juan'],
    adjustmentMethod: 'IPC',
    lastAdjustmentDate: dateAt(-70),
    nextAdjustmentDate: dateAt(110),
    createdDaysAgo: -380,
    obligationsOverride: [
      { type: 'RENT', enabled: true, responsibility: 'TENANT' },
      { type: 'EXPENSES', enabled: true, responsibility: 'TENANT' },
      { type: 'ABL', enabled: true, responsibility: 'TENANT' },
      { type: 'AYSA', enabled: true, responsibility: 'TENANT' },
      { type: 'ELECTRICITY', enabled: true, responsibility: 'TENANT', provider: 'Edenor' },
      { type: 'GAS', enabled: true, responsibility: 'TENANT', provider: 'Metrogas' },
      { type: 'OTHER', enabled: false },
    ],
  })
  SCENARIO_CONTRACTS.push(contract)
  SCENARIO_CONTRACT_BY_LETTER.A = contract
}

// B — Upcoming IPC adjustment within ~20 days.
// Also Milestone 5 scenarios K — Edesur contract, and L — no gas.
{
  const property = takeProperty((p) => p.id === 'prop-4')
  const contract = buildContract({
    property,
    status: 'ACTIVE',
    startDate: dateAt(-200),
    endDate: dateAt(500),
    tenantIds: ['contact-julieta'],
    adjustmentMethod: 'IPC',
    lastAdjustmentDate: dateAt(-71),
    nextAdjustmentDate: dateAt(20),
    createdDaysAgo: -200,
    obligationsOverride: [
      { type: 'RENT', enabled: true, responsibility: 'TENANT' },
      { type: 'EXPENSES', enabled: true, responsibility: 'TENANT' },
      { type: 'ABL', enabled: true, responsibility: 'TENANT' },
      { type: 'AYSA', enabled: false },
      { type: 'ELECTRICITY', enabled: true, responsibility: 'TENANT', provider: 'Edesur' },
      { type: 'GAS', enabled: false },
      { type: 'OTHER', enabled: false },
    ],
  })
  SCENARIO_CONTRACTS.push(contract)
  SCENARIO_CONTRACT_BY_LETTER.B = contract
}

// C — Upcoming ICL adjustment within ~40 days.
// Also Milestone 5 scenario I — some services don't apply (ABL/expensas
// waived, AYSA billed to the owner instead of the tenant).
{
  const property = takeProperty()
  const contract = buildContract({
    property,
    status: 'ACTIVE',
    startDate: dateAt(-150),
    endDate: dateAt(430),
    tenantIds: ['contact-sebastian'],
    adjustmentMethod: 'ICL',
    lastAdjustmentDate: dateAt(-150),
    nextAdjustmentDate: dateAt(40),
    createdDaysAgo: -150,
    obligationsOverride: [
      { type: 'RENT', enabled: true, responsibility: 'TENANT' },
      { type: 'EXPENSES', enabled: false },
      { type: 'ABL', enabled: false },
      { type: 'AYSA', enabled: true, responsibility: 'OWNER' },
      { type: 'ELECTRICITY', enabled: true, responsibility: 'TENANT', provider: 'Edenor' },
      { type: 'GAS', enabled: false },
      { type: 'OTHER', enabled: false },
    ],
  })
  SCENARIO_CONTRACTS.push(contract)
  SCENARIO_CONTRACT_BY_LETTER.C = contract
}

// D — Expiring urgently (~20 days). Also Milestone 5 scenario A — fully paid contract.
{
  const property = takeProperty()
  const contract = buildContract({
    property,
    status: 'ACTIVE',
    startDate: dateAt(-700),
    endDate: dateAt(20),
    tenantIds: tenantsFor(1, scenarioRng),
    adjustmentMethod: 'IPC',
    lastAdjustmentDate: dateAt(-60),
    nextAdjustmentDate: dateAt(110),
    createdDaysAgo: -700,
  })
  SCENARIO_CONTRACTS.push(contract)
  SCENARIO_CONTRACT_BY_LETTER.D = contract
}

// E — Expiring in the warning window (~70 days). Also Milestone 5 scenario B — ABL unpaid (needs ABL enabled).
{
  const property = takeProperty()
  const contract = buildContract({
    property,
    status: 'ACTIVE',
    startDate: dateAt(-660),
    endDate: dateAt(70),
    tenantIds: tenantsFor(1, scenarioRng),
    adjustmentMethod: 'ICL',
    lastAdjustmentDate: dateAt(-45),
    nextAdjustmentDate: dateAt(135),
    createdDaysAgo: -660,
    obligationsOverride: [
      { type: 'RENT', enabled: true, responsibility: 'TENANT' },
      { type: 'EXPENSES', enabled: true, responsibility: 'TENANT' },
      { type: 'ABL', enabled: true, responsibility: 'TENANT' },
      { type: 'AYSA', enabled: true, responsibility: 'TENANT' },
      { type: 'ELECTRICITY', enabled: true, responsibility: 'TENANT', provider: 'Edenor' },
      { type: 'GAS', enabled: false },
      { type: 'OTHER', enabled: false },
    ],
  })
  SCENARIO_CONTRACTS.push(contract)
  SCENARIO_CONTRACT_BY_LETTER.E = contract
}

// F — Expired contract.
{
  const property = takeProperty()
  SCENARIO_CONTRACTS.push(
    buildContract({
      property,
      status: 'EXPIRED',
      startDate: dateAt(-760),
      endDate: dateAt(-35),
      tenantIds: tenantsFor(1, scenarioRng),
      adjustmentMethod: 'IPC',
      lastAdjustmentDate: dateAt(-125),
      createdDaysAgo: -760,
    }),
  )
}

// G — Manual/custom adjustment. Also Milestone 5 scenario D — multiple outstanding concepts (needs several enabled).
{
  const property = takeProperty()
  const contract = buildContract({
    property,
    status: 'ACTIVE',
    startDate: dateAt(-300),
    endDate: dateAt(420),
    tenantIds: tenantsFor(1, scenarioRng),
    adjustmentMethod: 'MANUAL',
    lastAdjustmentDate: dateAt(-120),
    nextAdjustmentDate: dateAt(245),
    notes: 'Ajuste acordado directamente entre las partes, sin índice fijo.',
    createdDaysAgo: -300,
    obligationsOverride: [
      { type: 'RENT', enabled: true, responsibility: 'TENANT' },
      { type: 'EXPENSES', enabled: true, responsibility: 'TENANT' },
      { type: 'ABL', enabled: true, responsibility: 'TENANT' },
      { type: 'AYSA', enabled: true, responsibility: 'TENANT' },
      { type: 'ELECTRICITY', enabled: true, responsibility: 'TENANT', provider: 'Edesur' },
      { type: 'GAS', enabled: true, responsibility: 'TENANT', provider: 'Metrogas' },
      { type: 'OTHER', enabled: false },
    ],
  })
  SCENARIO_CONTRACTS.push(contract)
  SCENARIO_CONTRACT_BY_LETTER.G = contract
}

// H — Multiple tenants. Also Milestone 5 scenario E — partial payment.
{
  const property = takeProperty()
  const contract = buildContract({
    property,
    status: 'ACTIVE',
    startDate: dateAt(-90),
    endDate: dateAt(630),
    tenantIds: tenantsFor(2, scenarioRng),
    adjustmentMethod: 'IPC',
    lastAdjustmentDate: dateAt(-90),
    nextAdjustmentDate: dateAt(0),
    createdDaysAgo: -90,
  })
  SCENARIO_CONTRACTS.push(contract)
  SCENARIO_CONTRACT_BY_LETTER.H = contract
}

// I — Multiple owners. Also Milestone 5 scenario F — previous-month debt carried forward.
{
  const property = takeProperty((p) => ownerContactIds(p).length > 1)
  const contract = buildContract({
    property,
    status: 'ACTIVE',
    startDate: dateAt(-500),
    endDate: dateAt(230),
    tenantIds: tenantsFor(1, scenarioRng),
    adjustmentMethod: 'ICL',
    lastAdjustmentDate: dateAt(-140),
    nextAdjustmentDate: dateAt(220),
    createdDaysAgo: -500,
  })
  SCENARIO_CONTRACTS.push(contract)
  SCENARIO_CONTRACT_BY_LETTER.I = contract
}

// J — Reference contract for Milestone 5's debt/payment scenarios.
// Also Milestone 5 scenario G — credit balance (overpayment).
{
  const property = takeProperty()
  const contract = buildContract({
    property,
    status: 'ACTIVE',
    startDate: dateAt(-120),
    endDate: dateAt(600),
    tenantIds: tenantsFor(1, scenarioRng),
    adjustmentMethod: 'IPC',
    lastAdjustmentDate: dateAt(-30),
    nextAdjustmentDate: dateAt(60),
    notes: 'Contrato de referencia para la cuenta mensual y pagos del próximo milestone.',
    createdDaysAgo: -120,
  })
  SCENARIO_CONTRACTS.push(contract)
  SCENARIO_CONTRACT_BY_LETTER.J = contract
}

// Extra curated variety: one DRAFT, one UPCOMING, one TERMINATED.
{
  const property = takeProperty()
  SCENARIO_CONTRACTS.push(
    buildContract({
      property,
      status: 'DRAFT',
      startDate: dateAt(25),
      endDate: dateAt(755),
      tenantIds: tenantsFor(1, scenarioRng),
      adjustmentMethod: 'IPC',
      createdDaysAgo: -2,
    }),
  )
}
{
  const property = takeProperty()
  SCENARIO_CONTRACTS.push(
    buildContract({
      property,
      status: 'UPCOMING',
      startDate: dateAt(12),
      endDate: dateAt(742),
      tenantIds: tenantsFor(1, scenarioRng),
      adjustmentMethod: 'IPC',
      nextAdjustmentDate: dateAt(103),
      createdDaysAgo: -10,
    }),
  )
}
{
  const property = takeProperty()
  SCENARIO_CONTRACTS.push(
    buildContract({
      property,
      status: 'TERMINATED',
      startDate: dateAt(-400),
      endDate: dateAt(250),
      tenantIds: tenantsFor(1, scenarioRng),
      adjustmentMethod: 'ICL',
      lastAdjustmentDate: dateAt(-200),
      notes: 'Rescindido antes de término por mudanza del inquilino.',
      createdDaysAgo: -400,
    }),
  )
}

// ---------------------------------------------------------------------------
// Programmatically generated contracts — one primary contract per remaining
// rent-eligible property, plus renewal-history contracts on a subset of
// properties to reach the ~100–105 target from the Milestone 4 spec.
// ---------------------------------------------------------------------------

const STATUS_WEIGHTS: [ContractStatus, number][] = [
  ['ACTIVE', 78],
  ['EXPIRED', 9],
  ['UPCOMING', 8],
  ['TERMINATED', 3],
  ['DRAFT', 2],
]

const END_DAYS_WEIGHTS: [number, number][] = [
  [20, 5],
  [45, 5],
  [75, 5],
  [180, 25],
  [400, 35],
  [700, 25],
]

const genRng = mulberry32(20260926)
const GENERATED_CONTRACTS: RentalContract[] = []

const remainingProperties = RENT_ELIGIBLE.filter((p) => !used.has(p.id))

for (const property of remainingProperties) {
  const status = weightedPick(STATUS_WEIGHTS, genRng)
  const tenantCount = genRng() < 0.12 ? 2 : 1
  const tenantIds = tenantsFor(tenantCount, genRng)
  const method = weightedPick(METHOD_WEIGHTS, genRng)
  const frequencyMonths = ADJUSTMENT_FREQUENCY_MONTHS[FREQUENCY_BY_METHOD[method]] ?? 6

  let startDate: string
  let endDate: string
  let nextAdjustmentDate: string | undefined
  let lastAdjustmentDate: string | undefined

  if (status === 'UPCOMING') {
    startDate = dateAt(randInt(5, 35, genRng))
    endDate = dateAt(randInt(400, 800, genRng))
    nextAdjustmentDate = dateAt(frequencyMonths * 30 + randInt(5, 35, genRng))
  } else if (status === 'DRAFT') {
    startDate = dateAt(randInt(10, 60, genRng))
    endDate = dateAt(randInt(400, 800, genRng))
  } else if (status === 'EXPIRED') {
    const endOffset = -randInt(1, 220, genRng)
    endDate = dateAt(endOffset)
    startDate = dateAt(endOffset - randInt(360, 900, genRng))
    lastAdjustmentDate = dateAt(endOffset - randInt(30, 150, genRng))
  } else if (status === 'TERMINATED') {
    const endOffset = randInt(30, 300, genRng)
    startDate = dateAt(-randInt(200, 600, genRng))
    endDate = dateAt(endOffset)
    lastAdjustmentDate = dateAt(-randInt(30, 150, genRng))
  } else {
    const endOffset = weightedPick(END_DAYS_WEIGHTS, genRng)
    endDate = dateAt(endOffset)
    startDate = dateAt(endOffset - randInt(360, 900, genRng))
    lastAdjustmentDate = dateAt(-randInt(10, 150, genRng))
    nextAdjustmentDate = dateAt(randInt(-10, frequencyMonths * 30, genRng))
  }

  GENERATED_CONTRACTS.push(
    buildContract({
      property,
      status,
      startDate,
      endDate,
      tenantIds,
      adjustmentMethod: method,
      lastAdjustmentDate,
      nextAdjustmentDate,
      createdDaysAgo: -randInt(30, 400, genRng),
    }),
  )
}

// Renewal-history: a second, older (expired) contract for ~30 properties that
// already have a primary contract — realistic multi-tenant history per unit.
const historyCandidates = [...SCENARIO_CONTRACTS, ...GENERATED_CONTRACTS]
const historyTargetCount = Math.max(0, 103 - historyCandidates.length)
const historyRng = mulberry32(20260927)
const historySourceIds = pickUnique(
  historyCandidates.map((c) => c.propertyId),
  historyTargetCount,
  historyRng,
)

const HISTORY_CONTRACTS: RentalContract[] = historySourceIds.map((propertyId) => {
  const property = PROPERTIES.find((p) => p.id === propertyId)!
  const endOffset = -randInt(220, 500, historyRng)
  const startDate = dateAt(endOffset - randInt(360, 700, historyRng))
  const endDate = dateAt(endOffset)
  return buildContract({
    property,
    status: 'EXPIRED',
    startDate,
    endDate,
    tenantIds: tenantsFor(1, historyRng),
    adjustmentMethod: weightedPick(METHOD_WEIGHTS, historyRng),
    lastAdjustmentDate: dateAt(endOffset - randInt(30, 150, historyRng)),
    rentOverride: (property.rentalPrice ?? 500000) * randFloat(0.55, 0.8, historyRng),
    createdDaysAgo: endOffset - randInt(360, 700, historyRng),
  })
})

export const RENTAL_CONTRACTS: RentalContract[] = [...SCENARIO_CONTRACTS, ...GENERATED_CONTRACTS, ...HISTORY_CONTRACTS]

/**
 * Milestone 5 curated account scenarios (A–L), reusing the Milestone 4
 * contract scenarios above by letter — see docs/modules/contracts.md.
 */
export { SCENARIO_CONTRACT_BY_LETTER }
