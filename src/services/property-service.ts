import { NEIGHBORHOODS, PROPERTIES } from '@/mocks/properties'
import { getPropertyOwners as getOwnersByIds } from '@/mocks/property-owners'
import type { PortfolioSummary } from '@/types/dashboard'
import type { OperationType, Property, PropertyOwner, PropertyQuery, PropertySort, PropertyType } from '@/types/property'

const PROPERTY_TYPE_ORDER: PropertyType[] = ['apartment', 'house', 'ph', 'office', 'commercial', 'parking', 'land']

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

/** The price relevant to a given operation focus — used for filtering, sorting, and display. */
export function primaryPrice(property: Property, operation?: PropertyQuery['operation']): number | null {
  if (operation === 'rent') return property.rentalPrice ?? null
  if (operation === 'sale') return property.salePrice ?? null
  return property.salePrice ?? property.rentalPrice ?? null
}

function matchesQuery(property: Property, query: PropertyQuery): boolean {
  if (query.branchId && query.branchId !== 'all' && property.branchId !== query.branchId) return false
  if (query.operation && query.operation !== 'all' && !property.operationTypes.includes(query.operation as OperationType)) {
    return false
  }
  if (query.status?.length && !query.status.includes(property.status)) return false
  if (query.propertyType?.length && !query.propertyType.includes(property.propertyType)) return false
  if (query.neighborhoods?.length && !query.neighborhoods.includes(property.neighborhood)) return false

  if (query.search) {
    const needle = normalize(query.search)
    const haystack = normalize(`${property.address} ${property.floor ?? ''} ${property.neighborhood} ${property.referenceCode}`)
    if (!haystack.includes(needle)) return false
  }

  const price = primaryPrice(property, query.operation)
  if (query.minPrice != null && (price == null || price < query.minPrice)) return false
  if (query.maxPrice != null && (price == null || price > query.maxPrice)) return false

  return true
}

function sortProperties(list: Property[], sort: PropertySort = 'recent', operation?: PropertyQuery['operation']): Property[] {
  const sorted = [...list]
  switch (sort) {
    case 'price-asc':
      sorted.sort((a, b) => (primaryPrice(a, operation) ?? 0) - (primaryPrice(b, operation) ?? 0))
      break
    case 'price-desc':
      sorted.sort((a, b) => (primaryPrice(b, operation) ?? 0) - (primaryPrice(a, operation) ?? 0))
      break
    case 'interest':
      sorted.sort((a, b) => b.interest.inquiries - a.interest.inquiries)
      break
    default:
      sorted.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  }
  return sorted
}

export async function getProperties(query: PropertyQuery = {}): Promise<Property[]> {
  await delay(200)
  const filtered = PROPERTIES.filter((property) => matchesQuery(property, query))
  return sortProperties(filtered, query.sort, query.operation)
}

export async function getPropertyById(id: string): Promise<Property | null> {
  await delay(150)
  return PROPERTIES.find((property) => property.id === id) ?? null
}

/** Synchronous lookup for cross-referencing (e.g. showing a property's address on an opportunity/visit card) without an async round-trip. */
export function findPropertySync(id: string): Property | undefined {
  return PROPERTIES.find((property) => property.id === id)
}

export async function getPortfolioSummary(branchId: string | 'all'): Promise<PortfolioSummary> {
  const scoped = branchId === 'all' ? PROPERTIES : PROPERTIES.filter((property) => property.branchId === branchId)
  return {
    forRent: scoped.filter((property) => property.operationTypes.includes('rent')).length,
    forSale: scoped.filter((property) => property.operationTypes.includes('sale')).length,
    reserved: scoped.filter((property) => property.status === 'reserved').length,
    underValuation: scoped.filter((property) => property.status === 'valuation').length,
  }
}

export function getNeighborhoods(): string[] {
  return NEIGHBORHOODS.map((neighborhood) => neighborhood.name)
}

export function getPropertyTypes(): PropertyType[] {
  return PROPERTY_TYPE_ORDER
}

export function getPropertyOwners(ownerIds: string[]): PropertyOwner[] {
  return getOwnersByIds(ownerIds)
}
