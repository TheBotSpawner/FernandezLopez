import { CONTACTS } from './contacts'
import { OPPORTUNITIES } from './opportunities'
import { BRANCH_IDS } from './organization'
import { PROPERTIES } from './properties'
import type { Visit, VisitOutcome } from '@/types/visit'
import type { VisitStatus } from '@/types/dashboard'

function isoAt(daysFromToday: number, hour: number, minute = 0): string {
  const date = new Date(2026, 8, 21, hour, minute, 0)
  date.setDate(date.getDate() + daysFromToday)
  return date.toISOString().slice(0, 19)
}

function addMinutesIso(iso: string, minutes: number): string {
  const date = new Date(iso)
  date.setMinutes(date.getMinutes() + minutes)
  return date.toISOString().slice(0, 19)
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

const OUTCOMES: VisitOutcome[] = ['Interesado', 'Quiere reservar', 'No interesado', 'Reprogramar']

// Hand-crafted visits tying the demo scenarios together — see
// docs/modules/commercial.md.
const SCENARIO_VISITS: Visit[] = [
  {
    id: 'visit-juan-monroe',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.coghlan,
    contactId: 'contact-juan',
    opportunityId: 'opp-b-juan',
    propertyId: 'prop-1',
    assignedUserId: 'user-nicolas',
    startAt: isoAt(0, 10, 0),
    endAt: addMinutesIso(isoAt(0, 10, 0), 30),
    status: 'Confirmada',
    createdAt: isoAt(-3, 9, 0),
    updatedAt: isoAt(-1, 9, 0),
  },
  {
    id: 'visit-lucia-congreso',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.coghlan,
    contactId: 'contact-lucia',
    opportunityId: 'opp-a-lucia',
    propertyId: 'prop-3',
    assignedUserId: 'user-nicolas',
    startAt: isoAt(1, 15, 30),
    endAt: addMinutesIso(isoAt(1, 15, 30), 30),
    status: 'Programada',
    notes: 'Segunda visita, quieren ver la propiedad de día.',
    createdAt: isoAt(-2, 11, 0),
    updatedAt: isoAt(-1, 11, 0),
  },
  {
    id: 'visit-lucia-cabildo',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.belgrano,
    contactId: 'contact-lucia',
    opportunityId: 'opp-a-lucia',
    propertyId: 'prop-2',
    assignedUserId: 'user-nicolas',
    startAt: isoAt(-10, 11, 0),
    endAt: addMinutesIso(isoAt(-10, 11, 0), 30),
    status: 'Realizada',
    outcome: 'Interesado',
    notes: 'Les gustó pero prefieren algo con más ambientes.',
    createdAt: isoAt(-14, 9, 0),
    updatedAt: isoAt(-10, 12, 0),
  },
  {
    id: 'visit-julieta-sucre',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.belgrano,
    contactId: 'contact-julieta',
    opportunityId: 'opp-e-julieta',
    propertyId: 'prop-4',
    assignedUserId: 'user-nicolas',
    startAt: isoAt(-8, 16, 0),
    endAt: addMinutesIso(isoAt(-8, 16, 0), 30),
    status: 'Realizada',
    outcome: 'Quiere reservar',
    createdAt: isoAt(-12, 9, 0),
    updatedAt: isoAt(-8, 17, 0),
  },
  {
    id: 'visit-paula-reprogramada',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.coghlan,
    contactId: 'contact-paula',
    opportunityId: 'opp-g-paula',
    propertyId: 'prop-3',
    assignedUserId: 'user-nicolas',
    startAt: isoAt(-6, 12, 0),
    endAt: addMinutesIso(isoAt(-6, 12, 0), 30),
    status: 'Reprogramada',
    notes: 'El contacto pidió cambiar el horario, todavía sin nueva fecha.',
    createdAt: isoAt(-8, 9, 0),
    updatedAt: isoAt(-6, 12, 0),
  },
  {
    id: 'visit-sofia-cabildo',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.belgrano,
    contactId: 'contact-alberto',
    opportunityId: undefined,
    propertyId: 'prop-2',
    assignedUserId: 'user-lucia',
    startAt: isoAt(2, 9, 0),
    endAt: addMinutesIso(isoAt(2, 9, 0), 30),
    status: 'Programada',
    createdAt: isoAt(-1, 9, 0),
    updatedAt: isoAt(-1, 9, 0),
  },
  {
    id: 'visit-sucre-cancelada',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.belgrano,
    contactId: 'contact-sebastian',
    opportunityId: 'opp-f-sebastian',
    propertyId: 'prop-4',
    assignedUserId: 'user-nicolas',
    startAt: isoAt(-15, 17, 0),
    endAt: addMinutesIso(isoAt(-15, 17, 0), 30),
    status: 'Cancelada',
    createdAt: isoAt(-17, 9, 0),
    updatedAt: isoAt(-16, 9, 0),
  },
]

const rentableGeneratedProperties = PROPERTIES.filter((p) => p.id.startsWith('prop-gen-'))
const generatedContacts = CONTACTS.filter((c) => c.id.startsWith('contact-gen-'))
const generatedOpportunities = OPPORTUNITIES.filter((o) => o.id.startsWith('opp-gen-'))
const AGENTS = ['user-nicolas', 'user-martin', 'user-camila', 'user-lucia']

function generateVisit(index: number, rng: () => number): Visit {
  const property = pick(rentableGeneratedProperties, rng)
  const opportunity = rng() < 0.6 ? pick(generatedOpportunities, rng) : undefined
  const contact = opportunity ? CONTACTS.find((c) => c.id === opportunity.contactId) : pick(generatedContacts, rng)
  const dayOffset = randInt(-14, 10, rng)
  const isPast = dayOffset < 0
  const startAt = isoAt(dayOffset, randInt(9, 18, rng), pick([0, 30] as const, rng))

  let status: VisitStatus
  let outcome: VisitOutcome | undefined
  if (isPast) {
    status = rng() < 0.85 ? 'Realizada' : 'Cancelada'
    if (status === 'Realizada') outcome = pick(OUTCOMES, rng)
  } else {
    status = pick(['Programada', 'Confirmada'] as const, rng)
  }

  return {
    id: `visit-gen-${index}`,
    organizationId: 'org-fl',
    branchId: property.branchId,
    contactId: contact?.id ?? generatedContacts[0].id,
    opportunityId: opportunity?.id,
    propertyId: property.id,
    assignedUserId: opportunity?.assignedUserId ?? pick(AGENTS, rng),
    startAt,
    endAt: addMinutesIso(startAt, 30),
    status,
    outcome,
    createdAt: isoAt(dayOffset - randInt(2, 6, rng), 9, 0),
    updatedAt: isoAt(Math.min(dayOffset, 0), 9, 0),
  }
}

const rng = mulberry32(20260924)
const GENERATED_VISITS = Array.from({ length: 18 }, (_, i) => generateVisit(i + 1, rng))

export const VISITS: Visit[] = [...SCENARIO_VISITS, ...GENERATED_VISITS]
