import type { OperationType, Property, PropertyStatus, PropertyType } from '@/types/property'
import { BRANCH_IDS } from './organization'
import { PROPERTY_OWNERS } from './property-owners'

export interface NeighborhoodInfo {
  name: string
  branchId: string
  lat: number
  lng: number
}

// Approximate real Buenos Aires coordinates — for a plausible map spread, not
// surveyed precision.
export const NEIGHBORHOODS: NeighborhoodInfo[] = [
  { name: 'Coghlan', branchId: BRANCH_IDS.coghlan, lat: -34.5647, lng: -58.4746 },
  { name: 'Belgrano', branchId: BRANCH_IDS.belgrano, lat: -34.5627, lng: -58.456 },
  { name: 'Villa Urquiza', branchId: BRANCH_IDS.coghlan, lat: -34.575, lng: -58.49 },
  { name: 'Saavedra', branchId: BRANCH_IDS.coghlan, lat: -34.547, lng: -58.487 },
  { name: 'Núñez', branchId: BRANCH_IDS.belgrano, lat: -34.545, lng: -58.465 },
  { name: 'Colegiales', branchId: BRANCH_IDS.belgrano, lat: -34.574, lng: -58.449 },
  { name: 'Villa Ortúzar', branchId: BRANCH_IDS.coghlan, lat: -34.585, lng: -58.47 },
]

const STREETS = [
  'Monroe', 'Av. Cabildo', 'Av. Congreso', 'Sucre', 'Av. Elcano', 'Olazábal',
  'Av. de los Incas', 'Zapiola', 'Manuela Pedraza', 'Av. Triunvirato',
  'Av. Álvarez Thomas', 'Av. Forest', 'Delgado', 'Freire', 'Vuelta de Obligado',
  'Av. Melián', 'Ceretti', 'Av. Constituyentes', 'Holmberg', 'Roosevelt',
  'Blanco Encalada', 'Juramento', 'Echeverría', 'La Pampa', 'Amenábar', "O'Higgins",
]

const EXTERIOR_IMAGES = [
  '/properties/monroe-2450/pexels-alexander-f-ungerer-157458816-27683986.jpg',
  '/properties/cabildo-3120/pexels-taiyesalawu-38040969.jpg',
  '/properties/congreso-2890/pexels-alexander-f-ungerer-157458816-28463539.jpg',
  '/properties/congreso-2890/pexels-jack-stapleton-2076734-3702948.jpg',
  '/properties/sucre-1450/pexels-alexander-f-ungerer-157458816-30673275.jpg',
  '/properties/sucre-1450/pexels-naufarialiysx-9602644.jpg',
]

const INTERIOR_IMAGES = [
  '/properties/monroe-2450/pexels-alexander-f-ungerer-157458816-26859478.jpg',
  '/properties/monroe-2450/pexels-alexander-f-ungerer-157458816-32696578.jpg',
  '/properties/monroe-2450/pexels-alexander-f-ungerer-157458816-35843912.jpg',
  '/properties/cabildo-3120/pexels-alexander-f-ungerer-157458816-34446592.jpg',
  '/properties/congreso-2890/pexels-alexander-f-ungerer-157458816-28906766.jpg',
  '/properties/congreso-2890/pexels-alexander-f-ungerer-157458816-30673279.jpg',
  '/properties/sucre-1450/pexels-mahmoud-zakariya-2154822140-34281363.jpg',
]

const AGENTS = ['Nicolás Paz', 'Sofía Duarte', 'Bruno Castex']

const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'departamento',
  house: 'casa',
  ph: 'PH',
  commercial: 'local',
  office: 'oficina',
  parking: 'cochera',
  land: 'terreno',
  other: 'propiedad',
}

const TYPE_WEIGHTS: [PropertyType, number][] = [
  ['apartment', 45], ['house', 18], ['ph', 14], ['office', 8], ['commercial', 7],
  ['parking', 5], ['land', 3],
]

const STATUS_WEIGHTS: [PropertyStatus, number][] = [
  ['available', 45], ['reserved', 10], ['rented', 18], ['sold', 12], ['paused', 8], ['valuation', 7],
]

const DESCRIPTION_TEMPLATES = [
  'Luminoso {type} en {neighborhood}, a metros de avenidas principales y transporte público.',
  '{type} en muy buen estado general, ideal para quienes buscan tranquilidad en {neighborhood}.',
  'Excelente {type} con buena orientación, en una de las zonas más buscadas de {neighborhood}.',
  '{type} a reciclar con gran potencial, ubicado en pleno corazón de {neighborhood}.',
  'Amplio {type}, apto profesional, cerca de comercios y espacios verdes de {neighborhood}.',
]

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

function isoDaysAgo(days: number): string {
  const date = new Date(2026, 8, 21)
  date.setDate(date.getDate() - days)
  return date.toISOString()
}

function buildOperationTypes(propertyType: PropertyType, rng: () => number): OperationType[] {
  if (propertyType === 'land') return ['sale']
  const roll = rng()
  if (roll < 0.4) return ['rent']
  if (roll < 0.85) return ['sale']
  return ['sale', 'rent']
}

function priceRangeFor(propertyType: PropertyType) {
  switch (propertyType) {
    case 'house':
      return { sale: [150000, 450000], rent: [500000, 1400000] }
    case 'ph':
      return { sale: [100000, 260000], rent: [350000, 800000] }
    case 'office':
    case 'commercial':
      return { sale: [60000, 300000], rent: [300000, 1100000] }
    case 'parking':
      return { sale: [15000, 35000], rent: [60000, 120000] }
    case 'land':
      return { sale: [80000, 400000], rent: [80000, 400000] }
    default:
      return { sale: [70000, 220000], rent: [250000, 900000] }
  }
}

function roundPrice(value: number): number {
  return Math.round(value / 1000) * 1000
}

function buildRoomProfile(propertyType: PropertyType, rng: () => number) {
  switch (propertyType) {
    case 'house':
      return { rooms: randInt(4, 7, rng), bedrooms: randInt(3, 5, rng), bathrooms: randInt(2, 3, rng), surface: randInt(120, 320, rng) }
    case 'ph':
      return { rooms: randInt(3, 5, rng), bedrooms: randInt(2, 3, rng), bathrooms: randInt(1, 2, rng), surface: randInt(60, 160, rng) }
    case 'office':
    case 'commercial':
      return { rooms: randInt(1, 3, rng), bedrooms: 0, bathrooms: 1, surface: randInt(40, 150, rng) }
    case 'parking':
      return { rooms: 0, bedrooms: 0, bathrooms: 0, surface: randInt(12, 20, rng) }
    case 'land':
      return { rooms: 0, bedrooms: 0, bathrooms: 0, surface: randInt(200, 900, rng) }
    default:
      return { rooms: randInt(1, 4, rng), bedrooms: randInt(0, 3, rng), bathrooms: randInt(1, 2, rng), surface: randInt(35, 110, rng) }
  }
}

function buildImages(propertyType: PropertyType, rng: () => number): string[] {
  const cover = pick(EXTERIOR_IMAGES, rng)
  if (propertyType === 'land' || propertyType === 'parking') return [cover]
  return [cover, pick(INTERIOR_IMAGES, rng), pick(INTERIOR_IMAGES, rng)]
}

function generateProperty(index: number, rng: () => number): Property {
  const propertyType = weightedPick(TYPE_WEIGHTS, rng)
  const status = weightedPick(STATUS_WEIGHTS, rng)
  const operationTypes = buildOperationTypes(propertyType, rng)
  const neighborhood = pick(NEIGHBORHOODS, rng)
  const { rooms, bedrooms, bathrooms, surface } = buildRoomProfile(propertyType, rng)
  const range = priceRangeFor(propertyType)

  const createdAt = isoDaysAgo(randInt(15, 320, rng))
  const updatedAt = randInt(0, 1, rng) === 1 ? isoDaysAgo(randInt(0, 14, rng)) : createdAt

  const inquiries = randInt(0, 22, rng)
  const ownerCount = rng() < 0.15 ? 2 : 1
  const ownerIds = Array.from({ length: ownerCount }, () => pick(PROPERTY_OWNERS, rng).id).filter(
    (id, i, arr) => arr.indexOf(id) === i,
  )

  const typeLabel = PROPERTY_TYPE_LABELS[propertyType]
  const description = pick(DESCRIPTION_TEMPLATES, rng)
    .replace('{type}', typeLabel)
    .replace('{neighborhood}', neighborhood.name)

  return {
    id: `prop-gen-${index}`,
    organizationId: 'org-fl',
    branchId: neighborhood.branchId,
    referenceCode: `FL-${1000 + index}`,
    address: `${pick(STREETS, rng)} ${randInt(1000, 6800, rng)}`,
    floor: rooms > 0 && propertyType !== 'house' && rng() < 0.5 ? `${randInt(1, 12, rng)}°${pick(['A', 'B', 'C', 'D'], rng)}` : undefined,
    neighborhood: neighborhood.name,
    city: 'Ciudad Autónoma de Buenos Aires',
    latitude: neighborhood.lat + (rng() - 0.5) * 0.012,
    longitude: neighborhood.lng + (rng() - 0.5) * 0.012,
    propertyType,
    operationTypes,
    status,
    salePrice: operationTypes.includes('sale') ? roundPrice(randInt(range.sale[0], range.sale[1], rng)) : undefined,
    rentalPrice: operationTypes.includes('rent') ? roundPrice(randInt(range.rent[0], range.rent[1], rng)) : undefined,
    rooms,
    bedrooms,
    bathrooms,
    surface,
    coveredSurface: rooms > 0 ? Math.round(surface * 0.85) : undefined,
    parkingSpaces: propertyType === 'house' && rng() < 0.6 ? 1 : undefined,
    featured: false,
    description,
    images: buildImages(propertyType, rng),
    ownerIds,
    interest: {
      inquiries,
      activeOpportunities: randInt(0, Math.min(4, inquiries), rng),
      visitsThisMonth: randInt(0, 5, rng),
      lastInquiryAt: inquiries > 0 ? isoDaysAgo(randInt(0, 30, rng)) : undefined,
      assignedAgentName: pick(AGENTS, rng),
    },
    createdAt,
    updatedAt,
  }
}

// Rental-only property pool for Milestone 4 (Administración): the 24
// existing properties with operationTypes including 'rent' aren't enough to
// back a ~100-contract managed-rental book without unrealistic
// multi-contract-per-property stacking, so this additively extends the
// portfolio — see docs/modules/properties.md.
const RENTAL_TYPE_WEIGHTS: [PropertyType, number][] = [
  ['apartment', 55], ['house', 12], ['ph', 12], ['commercial', 8], ['office', 8], ['parking', 5],
]

function generateRentalProperty(index: number, rng: () => number): Property {
  const propertyType = weightedPick(RENTAL_TYPE_WEIGHTS, rng)
  const occupied = rng() < 0.8
  const status: PropertyStatus = occupied ? 'rented' : 'available'
  const operationTypes: OperationType[] = rng() < 0.12 ? ['sale', 'rent'] : ['rent']
  const neighborhood = pick(NEIGHBORHOODS, rng)
  const { rooms, bedrooms, bathrooms, surface } = buildRoomProfile(propertyType, rng)
  const range = priceRangeFor(propertyType)

  const createdAt = isoDaysAgo(randInt(60, 900, rng))
  const updatedAt = randInt(0, 1, rng) === 1 ? isoDaysAgo(randInt(0, 30, rng)) : createdAt
  const inquiries = randInt(0, 6, rng)
  const ownerCount = rng() < 0.15 ? 2 : 1
  const ownerIds = Array.from({ length: ownerCount }, () => pick(PROPERTY_OWNERS, rng).id).filter(
    (id, i, arr) => arr.indexOf(id) === i,
  )

  const typeLabel = PROPERTY_TYPE_LABELS[propertyType]
  const description = pick(DESCRIPTION_TEMPLATES, rng)
    .replace('{type}', typeLabel)
    .replace('{neighborhood}', neighborhood.name)

  return {
    id: `prop-rental-${index}`,
    organizationId: 'org-fl',
    branchId: neighborhood.branchId,
    referenceCode: `FL-${3000 + index}`,
    address: `${pick(STREETS, rng)} ${randInt(1000, 6800, rng)}`,
    floor: rooms > 0 && propertyType !== 'house' && rng() < 0.5 ? `${randInt(1, 12, rng)}°${pick(['A', 'B', 'C', 'D'], rng)}` : undefined,
    neighborhood: neighborhood.name,
    city: 'Ciudad Autónoma de Buenos Aires',
    latitude: neighborhood.lat + (rng() - 0.5) * 0.012,
    longitude: neighborhood.lng + (rng() - 0.5) * 0.012,
    propertyType,
    operationTypes,
    status,
    salePrice: operationTypes.includes('sale') ? roundPrice(randInt(range.sale[0], range.sale[1], rng)) : undefined,
    rentalPrice: roundPrice(randInt(range.rent[0], range.rent[1], rng)),
    rooms,
    bedrooms,
    bathrooms,
    surface,
    coveredSurface: rooms > 0 ? Math.round(surface * 0.85) : undefined,
    parkingSpaces: propertyType === 'house' && rng() < 0.6 ? 1 : undefined,
    featured: false,
    description,
    images: buildImages(propertyType, rng),
    ownerIds,
    interest: {
      inquiries,
      activeOpportunities: 0,
      visitsThisMonth: randInt(0, 1, rng),
      lastInquiryAt: inquiries > 0 ? isoDaysAgo(randInt(10, 90, rng)) : undefined,
      assignedAgentName: pick(AGENTS, rng),
    },
    createdAt,
    updatedAt,
  }
}

// Four real, curated listings (matching the dashboard's high-interest
// previews) with their full photo sets — kept stable rather than generated.
const FEATURED_PROPERTIES: Property[] = [
  {
    id: 'prop-1',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.coghlan,
    referenceCode: 'FL-1001',
    address: 'Monroe 2450',
    floor: '4°A',
    neighborhood: 'Coghlan',
    city: 'Ciudad Autónoma de Buenos Aires',
    latitude: -34.5651,
    longitude: -58.4739,
    propertyType: 'apartment',
    operationTypes: ['rent'],
    status: 'available',
    rentalPrice: 650000,
    rooms: 3,
    bedrooms: 2,
    bathrooms: 1,
    surface: 68,
    coveredSurface: 62,
    featured: true,
    description: 'Departamento luminoso a metros de la estación Coghlan, con placards en ambas habitaciones y balcón.',
    images: [
      '/properties/monroe-2450/pexels-alexander-f-ungerer-157458816-27683986.jpg',
      '/properties/monroe-2450/pexels-alexander-f-ungerer-157458816-26859478.jpg',
      '/properties/monroe-2450/pexels-alexander-f-ungerer-157458816-32696578.jpg',
      '/properties/monroe-2450/pexels-alexander-f-ungerer-157458816-35843912.jpg',
    ],
    ownerIds: ['owner-1'],
    interest: {
      inquiries: 14,
      activeOpportunities: 3,
      visitsThisMonth: 4,
      lastInquiryAt: isoDaysAgo(1),
      assignedAgentName: 'Nicolás Paz',
    },
    createdAt: isoDaysAgo(96),
    updatedAt: isoDaysAgo(3),
  },
  {
    id: 'prop-2',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.belgrano,
    referenceCode: 'FL-1002',
    address: 'Av. Cabildo 3120',
    floor: '2°B',
    neighborhood: 'Belgrano',
    city: 'Ciudad Autónoma de Buenos Aires',
    latitude: -34.5619,
    longitude: -58.4571,
    propertyType: 'apartment',
    operationTypes: ['sale'],
    status: 'available',
    salePrice: 185000,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    surface: 45,
    coveredSurface: 42,
    featured: true,
    description: 'Monoambiente amplio sobre Av. Cabildo, a pasos del subte D y de los principales centros comerciales de Belgrano.',
    images: [
      '/properties/cabildo-3120/pexels-taiyesalawu-38040969.jpg',
      '/properties/cabildo-3120/pexels-alexander-f-ungerer-157458816-34446592.jpg',
    ],
    ownerIds: ['owner-2'],
    interest: {
      inquiries: 9,
      activeOpportunities: 2,
      visitsThisMonth: 2,
      lastInquiryAt: isoDaysAgo(2),
      assignedAgentName: 'Sofía Duarte',
    },
    createdAt: isoDaysAgo(58),
    updatedAt: isoDaysAgo(5),
  },
  {
    id: 'prop-3',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.coghlan,
    referenceCode: 'FL-1003',
    address: 'Av. Congreso 2890',
    neighborhood: 'Coghlan',
    city: 'Ciudad Autónoma de Buenos Aires',
    latitude: -34.5636,
    longitude: -58.4762,
    propertyType: 'ph',
    operationTypes: ['sale'],
    status: 'reserved',
    salePrice: 145000,
    rooms: 4,
    bedrooms: 3,
    bathrooms: 2,
    surface: 98,
    coveredSurface: 90,
    featured: true,
    description: 'PH de dos plantas con patio propio, a reciclar, en una de las zonas más tranquilas de Coghlan.',
    images: [
      '/properties/congreso-2890/pexels-alexander-f-ungerer-157458816-28463539.jpg',
      '/properties/congreso-2890/pexels-jack-stapleton-2076734-3702948.jpg',
      '/properties/congreso-2890/pexels-alexander-f-ungerer-157458816-28906766.jpg',
      '/properties/congreso-2890/pexels-alexander-f-ungerer-157458816-30673279.jpg',
    ],
    ownerIds: ['owner-3', 'owner-4'],
    interest: {
      inquiries: 7,
      activeOpportunities: 1,
      visitsThisMonth: 1,
      lastInquiryAt: isoDaysAgo(6),
      assignedAgentName: 'Nicolás Paz',
    },
    createdAt: isoDaysAgo(140),
    updatedAt: isoDaysAgo(9),
  },
  {
    id: 'prop-4',
    organizationId: 'org-fl',
    branchId: BRANCH_IDS.belgrano,
    referenceCode: 'FL-1004',
    address: 'Sucre 1450',
    neighborhood: 'Belgrano',
    city: 'Ciudad Autónoma de Buenos Aires',
    latitude: -34.5601,
    longitude: -58.4522,
    propertyType: 'apartment',
    operationTypes: ['rent'],
    status: 'available',
    rentalPrice: 480000,
    rooms: 2,
    bedrooms: 1,
    bathrooms: 1,
    surface: 40,
    coveredSurface: 38,
    featured: true,
    description: 'Departamento a estrenar con amenities, cerca de las Barrancas de Belgrano y de la Av. Libertador.',
    images: [
      '/properties/sucre-1450/pexels-naufarialiysx-9602644.jpg',
      '/properties/sucre-1450/pexels-alexander-f-ungerer-157458816-30673275.jpg',
      '/properties/sucre-1450/pexels-mahmoud-zakariya-2154822140-34281363.jpg',
    ],
    ownerIds: ['owner-5'],
    interest: {
      inquiries: 6,
      activeOpportunities: 1,
      visitsThisMonth: 2,
      lastInquiryAt: isoDaysAgo(4),
      assignedAgentName: 'Sofía Duarte',
    },
    createdAt: isoDaysAgo(41),
    updatedAt: isoDaysAgo(1),
  },
]

const rng = mulberry32(20260921)
const GENERATED_PROPERTIES = Array.from({ length: 41 }, (_, i) => generateProperty(i + 5, rng))

const rentalRng = mulberry32(20260924)
const RENTAL_ONLY_PROPERTIES = Array.from({ length: 50 }, (_, i) => generateRentalProperty(i + 1, rentalRng))

export const PROPERTIES: Property[] = [...FEATURED_PROPERTIES, ...GENERATED_PROPERTIES, ...RENTAL_ONLY_PROPERTIES]
