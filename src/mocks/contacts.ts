import { BRANCH_IDS } from './organization'
import { PROPERTY_OWNERS } from './property-owners'
import { USERS } from './users'
import type { Contact, ContactRole } from '@/types/contact'

function isoDaysAgo(days: number): string {
  const date = new Date(2026, 8, 21)
  date.setDate(date.getDate() - days)
  return date.toISOString()
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

const FIRST_NAMES = [
  'Sofía', 'Mateo', 'Valentina', 'Tomás', 'Camila', 'Lucas', 'Martina', 'Joaquín', 'Catalina', 'Benjamín',
  'Julieta', 'Santiago', 'Agustina', 'Nicolás', 'Emilia', 'Facundo', 'Victoria', 'Bautista', 'Delfina', 'Ignacio',
  'Renata', 'Tobías', 'Mía', 'Lautaro', 'Guadalupe', 'Franco', 'Alma', 'Juan', 'Pilar', 'Ramiro',
  'Antonella', 'Gonzalo', 'Milagros', 'Federico', 'Rocío', 'Matías', 'Abril', 'Máximo', 'Constanza', 'Bruno',
]

const LAST_NAMES = [
  'García', 'Fernández', 'Rodríguez', 'López', 'Martínez', 'Pérez', 'Gómez', 'Díaz', 'Álvarez', 'Romero',
  'Sosa', 'Torres', 'Ruiz', 'Ramírez', 'Flores', 'Acosta', 'Benítez', 'Medina', 'Herrera', 'Suárez',
  'Aguirre', 'Molina', 'Ortiz', 'Silva', 'Núñez', 'Rojas', 'Vega', 'Peralta', 'Cabrera', 'Ibarra',
  'Duarte', 'Bianchi', 'Ferreyra', 'Marín', 'Coria', 'Melo', 'Vidal', 'Otero', 'Quiroga', 'Roldán',
]

const ROLE_WEIGHTS: [ContactRole[], number][] = [
  [['prospect'], 26],
  [['tenant'], 14],
  [['buyer'], 18],
  [['owner'], 12],
  [['seller'], 8],
  [['buyer', 'prospect'], 8],
  [['tenant', 'prospect'], 6],
  [['owner', 'seller'], 8],
]

function weightedPick<T>(weights: [T, number][], rng: () => number): T {
  const total = weights.reduce((sum, [, weight]) => sum + weight, 0)
  let roll = rng() * total
  for (const [value, weight] of weights) {
    roll -= weight
    if (roll <= 0) return value
  }
  return weights[0][0]
}

const AGENT_WEIGHTS: [string, number][] = [
  ['user-nicolas', 35],
  ['user-martin', 25],
  ['user-camila', 20],
  ['user-lucia', 20],
]

const SOURCES = ['Portal inmobiliario', 'Referido', 'Cartel en vía pública', 'Instagram', 'Búsqueda directa']

function generateContact(index: number, rng: () => number): Contact {
  const firstName = pick(FIRST_NAMES, rng)
  const lastName = pick(LAST_NAMES, rng)
  const roles = weightedPick(ROLE_WEIGHTS, rng)
  const branchId = rng() < 0.55 ? BRANCH_IDS.coghlan : BRANCH_IDS.belgrano
  const createdAt = isoDaysAgo(randInt(1, 280, rng))
  const lastActivityAt = isoDaysAgo(randInt(0, 30, rng))

  return {
    id: `contact-gen-${index}`,
    organizationId: 'org-fl',
    branchId,
    fullName: `${firstName} ${lastName}`,
    phone: `+54 11 5${randInt(100, 999, rng)}-${randInt(1000, 9999, rng)}`,
    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@mail.com`,
    roles,
    assignedUserId: weightedPick(AGENT_WEIGHTS, rng),
    source: pick(SOURCES, rng),
    lastActivityAt,
    createdAt,
    updatedAt: lastActivityAt,
  }
}

// Hand-crafted scenarios used across the Contacts/Opportunities/Visits demo
// flows — see docs/modules/commercial.md for the full narrative.
const SCENARIO_CONTACTS: Contact[] = [
  {
    id: 'contact-lucia',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.coghlan,
    fullName: 'Lucía Rodríguez',
    phone: '+54 11 5234-1001',
    email: 'lucia.rodriguez@mail.com',
    roles: ['buyer'],
    assignedUserId: 'user-nicolas',
    source: 'Portal inmobiliario',
    notes: 'Busca departamento de 3 ambientes para mudarse con su pareja a fin de año.',
    lastActivityAt: isoDaysAgo(1),
    createdAt: isoDaysAgo(45),
    updatedAt: isoDaysAgo(1),
  },
  {
    id: 'contact-juan',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.coghlan,
    fullName: 'Juan Pérez',
    phone: '+54 11 5234-1002',
    email: 'juan.perez@mail.com',
    roles: ['prospect'],
    assignedUserId: 'user-nicolas',
    source: 'Referido',
    notes: 'Quiere alquilar cerca de la estación Coghlan, se muda por trabajo.',
    lastActivityAt: isoDaysAgo(0),
    createdAt: isoDaysAgo(20),
    updatedAt: isoDaysAgo(0),
  },
  {
    id: 'contact-maria',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.coghlan,
    fullName: 'María González',
    phone: '+54 11 4555-2301',
    email: 'maria.gonzalez@mail.com',
    roles: ['owner', 'seller'],
    assignedUserId: 'user-martin',
    source: 'Referido',
    notes: 'Heredó una propiedad familiar y quiere venderla. Pidió tasación.',
    lastActivityAt: isoDaysAgo(3),
    createdAt: isoDaysAgo(30),
    updatedAt: isoDaysAgo(3),
  },
  {
    id: 'contact-alberto',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.belgrano,
    fullName: 'Alberto Peralta',
    phone: '+54 11 4555-2320',
    email: 'alberto.peralta@mail.com',
    roles: ['owner'],
    assignedUserId: 'user-lucia',
    source: 'Cartel en vía pública',
    notes: 'Quiere poner en alquiler un departamento que le quedó vacío.',
    lastActivityAt: isoDaysAgo(5),
    createdAt: isoDaysAgo(60),
    updatedAt: isoDaysAgo(5),
  },
  {
    id: 'contact-julieta',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.belgrano,
    fullName: 'Julieta Marín',
    phone: '+54 11 5234-1005',
    email: 'julieta.marin@mail.com',
    roles: ['tenant'],
    assignedUserId: 'user-nicolas',
    source: 'Portal inmobiliario',
    notes: 'Cerró el alquiler de un monoambiente en Belgrano.',
    lastActivityAt: isoDaysAgo(6),
    createdAt: isoDaysAgo(70),
    updatedAt: isoDaysAgo(6),
  },
  {
    id: 'contact-sebastian',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.coghlan,
    fullName: 'Sebastián Roldán',
    phone: '+54 11 5234-1006',
    email: 'sebastian.roldan@mail.com',
    roles: ['prospect', 'buyer'],
    assignedUserId: 'user-nicolas',
    source: 'Instagram',
    notes: 'El presupuesto no le alcanzó para lo que buscaba en la zona.',
    lastActivityAt: isoDaysAgo(18),
    createdAt: isoDaysAgo(90),
    updatedAt: isoDaysAgo(18),
  },
  {
    id: 'contact-paula',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.coghlan,
    fullName: 'Paula Ibarra',
    phone: '+54 11 5234-1007',
    email: 'paula.ibarra@mail.com',
    roles: ['buyer'],
    assignedUserId: 'user-nicolas',
    source: 'Búsqueda directa',
    notes: 'En negociación, faltaba coordinar una contraoferta.',
    lastActivityAt: isoDaysAgo(9),
    createdAt: isoDaysAgo(50),
    updatedAt: isoDaysAgo(9),
  },
]

// One Contact per property owner (so "Propietario" on a property links to a real
// contact) — owner-1/María González already exists above as contact-maria.
const ownerRng = mulberry32(20260923)
const OWNER_CONTACTS: Contact[] = PROPERTY_OWNERS.filter((owner) => owner.id !== 'owner-1').map((owner, i) => {
  const [firstName] = owner.name.split(' ')
  return {
    id: `contact-${owner.id}`,
    organizationId: 'org-fl',
    branchId: i % 2 === 0 ? BRANCH_IDS.coghlan : BRANCH_IDS.belgrano,
    fullName: owner.name,
    phone: owner.phone,
    email: `${firstName.toLowerCase()}.${owner.id}@mail.com`,
    roles: ['owner'] as ContactRole[],
    assignedUserId: weightedPick(AGENT_WEIGHTS, ownerRng),
    source: 'Cartera de propietarios',
    lastActivityAt: isoDaysAgo(randInt(5, 60, ownerRng)),
    createdAt: isoDaysAgo(randInt(90, 400, ownerRng)),
    updatedAt: isoDaysAgo(randInt(5, 60, ownerRng)),
  }
})

const rng = mulberry32(20260922)
const GENERATED_CONTACTS = Array.from({ length: 93 }, (_, i) => generateContact(i + 1, rng))

export const CONTACTS: Contact[] = [...SCENARIO_CONTACTS, ...OWNER_CONTACTS, ...GENERATED_CONTACTS]

export function findContactByPhone(phone: string): Contact | undefined {
  return CONTACTS.find((contact) => contact.phone === phone)
}

export function getUserForContact(assignedUserId: string) {
  return USERS.find((user) => user.id === assignedUserId)
}
