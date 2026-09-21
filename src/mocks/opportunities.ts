import { CONTACTS } from './contacts'
import { BRANCH_IDS } from './organization'
import { PROPERTIES } from './properties'
import type { Opportunity, OpportunityType } from '@/types/opportunity'
import { DEMAND_STAGES, OWNER_STAGES, isOwnerOpportunity } from '@/types/opportunity'

function isoDaysAgo(days: number): string {
  const date = new Date(2026, 8, 21)
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

function isoDaysFromNow(days: number): string {
  return isoDaysAgo(-days)
}

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

function randInt(min: number, max: number, rng: () => number): number {
  return Math.floor(rng() * (max - min + 1)) + min
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

const lucyMatches = PROPERTIES.filter(
  (p) =>
    p.operationTypes.includes('sale') &&
    ['Coghlan', 'Belgrano'].includes(p.neighborhood) &&
    (p.propertyType === 'apartment' || p.propertyType === 'ph') &&
    (p.salePrice ?? 0) >= 130000 &&
    (p.salePrice ?? 0) <= 200000,
).map((p) => p.id)

const juanMatches = PROPERTIES.filter(
  (p) =>
    p.operationTypes.includes('rent') &&
    ['Villa Urquiza', 'Coghlan'].includes(p.neighborhood) &&
    p.propertyType === 'apartment',
).map((p) => p.id)

// The 7 required demo scenarios — see docs/modules/commercial.md.
const SCENARIO_OPPORTUNITIES: Opportunity[] = [
  {
    id: 'opp-a-lucia',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.coghlan,
    contactId: 'contact-lucia',
    assignedUserId: 'user-nicolas',
    type: 'BUY_SEARCH',
    stage: 'Visita',
    budgetMin: 140000,
    budgetMax: 190000,
    currency: 'USD',
    preferredNeighborhoods: ['Coghlan', 'Belgrano'],
    propertyTypes: ['apartment', 'ph'],
    rooms: 3,
    linkedPropertyIds: Array.from(new Set(['prop-3', ...lucyMatches])).slice(0, 3),
    notes: 'Ya vieron 2 propiedades, la de Av. Congreso les gustó mucho.',
    nextActionAt: isoDaysFromNow(1),
    nextActionLabel: 'Confirmar visita a Av. Congreso 2890',
    lastActivityAt: isoDaysAgo(1),
    createdAt: isoDaysAgo(30),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: 'opp-b-juan',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.coghlan,
    contactId: 'contact-juan',
    assignedUserId: 'user-nicolas',
    type: 'RENT_SEARCH',
    stage: 'Propiedades seleccionadas',
    budgetMax: 750000,
    currency: 'ARS',
    preferredNeighborhoods: ['Villa Urquiza', 'Coghlan'],
    propertyTypes: ['apartment'],
    rooms: 2,
    linkedPropertyIds: Array.from(new Set(['prop-1', ...juanMatches])).slice(0, 3),
    notes: 'Se muda por trabajo, necesita entrar antes de fin de mes.',
    nextActionAt: isoDaysFromNow(0),
    nextActionLabel: 'Confirmar visita a Monroe 2450',
    lastActivityAt: isoDaysAgo(0),
    createdAt: isoDaysAgo(14),
    updatedAt: isoDaysAgo(0),
  },
  {
    id: 'opp-c-maria',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.coghlan,
    contactId: 'contact-maria',
    assignedUserId: 'user-martin',
    type: 'OWNER_SELL',
    stage: 'Tasación',
    ownerPropertyAddress: 'Av. Rivadavia 5200',
    linkedPropertyIds: [],
    notes: 'Propiedad heredada, todavía sin publicar. Se coordinó tasación.',
    nextActionAt: isoDaysFromNow(2),
    nextActionLabel: 'Enviar informe de tasación',
    lastActivityAt: isoDaysAgo(3),
    createdAt: isoDaysAgo(20),
    updatedAt: isoDaysAgo(3),
  },
  {
    id: 'opp-d-alberto',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.belgrano,
    contactId: 'contact-alberto',
    assignedUserId: 'user-lucia',
    type: 'OWNER_RENT',
    stage: 'Captación',
    ownerPropertyAddress: 'Blanco Encalada 1800',
    linkedPropertyIds: [],
    notes: 'Departamento vacío, falta sacar fotos para publicar.',
    nextActionAt: isoDaysFromNow(3),
    nextActionLabel: 'Sacar fotos para publicar',
    lastActivityAt: isoDaysAgo(5),
    createdAt: isoDaysAgo(35),
    updatedAt: isoDaysAgo(5),
  },
  {
    id: 'opp-e-julieta',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.belgrano,
    contactId: 'contact-julieta',
    assignedUserId: 'user-nicolas',
    type: 'RENT_SEARCH',
    stage: 'Cerrada',
    budgetMax: 500000,
    currency: 'ARS',
    preferredNeighborhoods: ['Belgrano'],
    propertyTypes: ['apartment'],
    rooms: 1,
    linkedPropertyIds: ['prop-4'],
    notes: 'Firmó el contrato de alquiler de Sucre 1450.',
    lastActivityAt: isoDaysAgo(6),
    createdAt: isoDaysAgo(55),
    updatedAt: isoDaysAgo(6),
  },
  {
    id: 'opp-f-sebastian',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.coghlan,
    contactId: 'contact-sebastian',
    assignedUserId: 'user-nicolas',
    type: 'BUY_SEARCH',
    stage: 'Perdida',
    budgetMax: 90000,
    currency: 'USD',
    preferredNeighborhoods: ['Coghlan'],
    propertyTypes: ['apartment'],
    rooms: 2,
    linkedPropertyIds: [],
    lostReason: 'Presupuesto insuficiente',
    notes: 'No encontramos nada en su rango de precio en la zona que buscaba.',
    lastActivityAt: isoDaysAgo(18),
    createdAt: isoDaysAgo(70),
    updatedAt: isoDaysAgo(18),
  },
  {
    id: 'opp-g-paula',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.coghlan,
    contactId: 'contact-paula',
    assignedUserId: 'user-nicolas',
    type: 'BUY_SEARCH',
    stage: 'Negociación',
    budgetMin: 120000,
    budgetMax: 160000,
    currency: 'USD',
    preferredNeighborhoods: ['Coghlan', 'Villa Urquiza'],
    propertyTypes: ['apartment', 'ph'],
    rooms: 3,
    linkedPropertyIds: [],
    notes: 'Hizo una contraoferta, falta que el propietario responda.',
    nextActionAt: isoDaysAgo(2),
    nextActionLabel: 'Hacer seguimiento de la contraoferta',
    lastActivityAt: isoDaysAgo(9),
    createdAt: isoDaysAgo(50),
    updatedAt: isoDaysAgo(9),
  },
]

const TYPE_WEIGHTS: [OpportunityType, number][] = [
  ['RENT_SEARCH', 35],
  ['BUY_SEARCH', 35],
  ['OWNER_RENT', 15],
  ['OWNER_SELL', 15],
]

const STAGE_WEIGHTS_DEMAND: [number, number][] = [
  [0, 20], [1, 18], [2, 14], [3, 12], [4, 10], [5, 6], [6, 12], [7, 8],
]
const STAGE_WEIGHTS_OWNER: [number, number][] = [
  [0, 22], [1, 18], [2, 16], [3, 14], [4, 8], [5, 12], [6, 10],
]

function weightedIndex(weights: [number, number][], rng: () => number): number {
  const total = weights.reduce((sum, [, w]) => sum + w, 0)
  let roll = rng() * total
  for (const [index, weight] of weights) {
    roll -= weight
    if (roll <= 0) return index
  }
  return weights[0][0]
}

const NEIGHBORHOOD_POOL = ['Coghlan', 'Belgrano', 'Villa Urquiza', 'Saavedra', 'Núñez', 'Colegiales', 'Villa Ortúzar']
const AGENTS = ['user-nicolas', 'user-martin', 'user-camila', 'user-lucia']
const generatedContacts = CONTACTS.filter((c) => c.id.startsWith('contact-gen-'))

function generateOpportunity(index: number, rng: () => number): Opportunity {
  const resolvedType = weightedPick(TYPE_WEIGHTS, rng)
  const owner = isOwnerOpportunity(resolvedType)
  const stages = owner ? OWNER_STAGES : DEMAND_STAGES
  const stageIndex = weightedIndex(owner ? STAGE_WEIGHTS_OWNER : STAGE_WEIGHTS_DEMAND, rng)
  const stage = stages[stageIndex]
  const contact = pick(generatedContacts, rng)
  const branchId = contact?.branchId ?? BRANCH_IDS.coghlan
  const createdAt = isoDaysAgo(randInt(2, 200, rng))
  const lastActivityAt = isoDaysAgo(randInt(0, 25, rng))
  const isTerminal = stage === 'Cerrada' || stage === 'Perdida'

  const base: Opportunity = {
    id: `opp-gen-${index}`,
    organizationId: 'org-fl',
    branchId,
    contactId: contact?.id ?? 'contact-gen-1',
    assignedUserId: pick(AGENTS, rng),
    type: resolvedType,
    stage,
    linkedPropertyIds: [],
    lastActivityAt,
    createdAt,
    updatedAt: lastActivityAt,
  }

  if (owner) {
    base.ownerPropertyAddress = `${pick(['Av. Cabildo', 'Monroe', 'Sucre', 'Delgado', 'Zapiola', 'Freire'], rng)} ${randInt(1000, 6500, rng)}`
  } else {
    base.budgetMin = resolvedType === 'RENT_SEARCH' ? undefined : randInt(70, 220, rng) * 1000
    base.budgetMax =
      resolvedType === 'RENT_SEARCH'
        ? randInt(300, 1100, rng) * 1000
        : (base.budgetMin ?? 100000) + randInt(20, 60, rng) * 1000
    base.currency = resolvedType === 'RENT_SEARCH' ? 'ARS' : 'USD'
    base.preferredNeighborhoods = [pick(NEIGHBORHOOD_POOL, rng)]
    base.propertyTypes = [pick(['apartment', 'house', 'ph'] as const, rng)]
    base.rooms = randInt(1, 4, rng)
  }

  if (!isTerminal) {
    const overdue = rng() < 0.15
    base.nextActionAt = overdue ? isoDaysAgo(randInt(1, 5, rng)) : isoDaysFromNow(randInt(0, 7, rng))
    base.nextActionLabel = pick(
      ['Llamar al contacto', 'Enviar propiedades', 'Confirmar visita', 'Hacer seguimiento de reserva'],
      rng,
    )
  } else if (stage === 'Perdida') {
    base.lostReason = pick(
      ['No responde', 'No encontró propiedad', 'Presupuesto insuficiente', 'Eligió otra inmobiliaria', 'Postergó decisión', 'Otro'],
      rng,
    )
  }

  return base
}

const rng = mulberry32(20260923)
const GENERATED_OPPORTUNITIES = Array.from({ length: 28 }, (_, i) => generateOpportunity(i + 1, rng))

export const OPPORTUNITIES: Opportunity[] = [...SCENARIO_OPPORTUNITIES, ...GENERATED_OPPORTUNITIES]
