import { OPPORTUNITIES } from '@/mocks/opportunities'
import { loadOrSeed, persist } from '@/lib/local-store'
import { recordActivity } from './activity-service'
import { getProperties, primaryPrice } from './property-service'
import type { LostReason, Opportunity, OpportunityInput, OpportunityQuery, OpportunityStage } from '@/types/opportunity'
import { stagesFor } from '@/types/opportunity'
import type { Property } from '@/types/property'

const KEY = 'fl.crm.opportunities'

let opportunities: Opportunity[] = loadOrSeed(KEY, OPPORTUNITIES)

function save() {
  persist(KEY, opportunities)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function matchesQuery(opportunity: Opportunity, query: OpportunityQuery): boolean {
  if (query.branchId && query.branchId !== 'all' && opportunity.branchId !== query.branchId) return false
  if (query.assignedUserId && opportunity.assignedUserId !== query.assignedUserId) return false
  if (query.type && query.type !== 'all' && opportunity.type !== query.type) return false
  if (query.stage?.length && !query.stage.includes(opportunity.stage)) return false
  if (query.overdueOnly) {
    if (!opportunity.nextActionAt || new Date(opportunity.nextActionAt) > new Date()) return false
  }
  if (query.search) {
    const needle = query.search.toLowerCase()
    const haystack = `${opportunity.notes ?? ''} ${opportunity.ownerPropertyAddress ?? ''}`.toLowerCase()
    if (!haystack.includes(needle)) return false
  }
  return true
}

export async function getOpportunities(query: OpportunityQuery = {}): Promise<Opportunity[]> {
  await delay(200)
  return opportunities
    .filter((opportunity) => matchesQuery(opportunity, query))
    .sort((a, b) => b.lastActivityAt.localeCompare(a.lastActivityAt))
}

export async function getOpportunityById(id: string): Promise<Opportunity | null> {
  await delay(150)
  return opportunities.find((opportunity) => opportunity.id === id) ?? null
}

export function getOpportunitiesByContact(contactId: string): Opportunity[] {
  return opportunities.filter((opportunity) => opportunity.contactId === contactId).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export function getOpportunitiesByProperty(propertyId: string): Opportunity[] {
  return opportunities.filter((opportunity) => opportunity.linkedPropertyIds.includes(propertyId))
}

/** Synchronous lookup for cross-referencing (e.g. advancing stage from a visit outcome) without an async round-trip. */
export function findOpportunitySync(id: string): Opportunity | undefined {
  return opportunities.find((opportunity) => opportunity.id === id)
}

export async function createOpportunity(input: OpportunityInput): Promise<Opportunity> {
  await delay(200)
  const now = new Date().toISOString()
  const opportunity: Opportunity = {
    id: `opp-${Date.now()}`,
    organizationId: 'org-fl',
    linkedPropertyIds: [],
    stage: stagesFor(input.type)[0],
    ...input,
    lastActivityAt: now,
    createdAt: now,
    updatedAt: now,
  }
  opportunities = [opportunity, ...opportunities]
  save()
  return opportunity
}

export async function changeStage(id: string, stage: OpportunityStage, lostReason?: LostReason): Promise<Opportunity> {
  await delay(150)
  const now = new Date().toISOString()
  opportunities = opportunities.map((opportunity) =>
    opportunity.id === id
      ? { ...opportunity, stage, lostReason: stage === 'Perdida' ? lostReason : undefined, updatedAt: now, lastActivityAt: now }
      : opportunity,
  )
  const updated = opportunities.find((opportunity) => opportunity.id === id)!
  save()
  recordActivity('opportunity', id, `Etapa actualizada a ${stage}`)
  recordActivity('contact', updated.contactId, `Oportunidad actualizada a ${stage}`)
  return updated
}

export async function linkProperty(id: string, propertyId: string): Promise<Opportunity> {
  await delay(150)
  const now = new Date().toISOString()
  opportunities = opportunities.map((opportunity) =>
    opportunity.id === id && !opportunity.linkedPropertyIds.includes(propertyId)
      ? { ...opportunity, linkedPropertyIds: [...opportunity.linkedPropertyIds, propertyId], updatedAt: now, lastActivityAt: now }
      : opportunity,
  )
  const updated = opportunities.find((opportunity) => opportunity.id === id)!
  save()
  return updated
}

export async function unlinkProperty(id: string, propertyId: string): Promise<Opportunity> {
  await delay(150)
  opportunities = opportunities.map((opportunity) =>
    opportunity.id === id
      ? { ...opportunity, linkedPropertyIds: opportunity.linkedPropertyIds.filter((linked) => linked !== propertyId) }
      : opportunity,
  )
  const updated = opportunities.find((opportunity) => opportunity.id === id)!
  save()
  return updated
}

export async function updateNextAction(id: string, nextActionAt: string | undefined, nextActionLabel: string | undefined): Promise<Opportunity> {
  await delay(150)
  const now = new Date().toISOString()
  opportunities = opportunities.map((opportunity) =>
    opportunity.id === id ? { ...opportunity, nextActionAt, nextActionLabel, updatedAt: now } : opportunity,
  )
  const updated = opportunities.find((opportunity) => opportunity.id === id)!
  save()
  return updated
}

export interface CompatibleProperty {
  property: Property
  reasons: string[]
}

/** A deliberately simple, explainable matching heuristic — not a recommendation engine. */
export async function getCompatibleProperties(opportunity: Opportunity): Promise<CompatibleProperty[]> {
  const operation = opportunity.type === 'RENT_SEARCH' ? 'rent' : opportunity.type === 'BUY_SEARCH' ? 'sale' : null
  if (!operation) return []

  const candidates = await getProperties({ operation, branchId: 'all' })
  const results: CompatibleProperty[] = []

  for (const property of candidates) {
    const reasons: string[] = []
    const price = primaryPrice(property, operation)
    if (
      price != null &&
      (opportunity.budgetMin == null || price >= opportunity.budgetMin) &&
      (opportunity.budgetMax == null || price <= opportunity.budgetMax)
    ) {
      reasons.push('Dentro del presupuesto')
    }
    if (opportunity.preferredNeighborhoods?.includes(property.neighborhood)) reasons.push('Zona preferida')
    if (opportunity.propertyTypes?.includes(property.propertyType)) reasons.push('Tipo de propiedad')
    if (opportunity.rooms && property.rooms >= opportunity.rooms) reasons.push(`${property.rooms} ambientes`)

    if (reasons.length > 0) results.push({ property, reasons })
  }

  return results.sort((a, b) => b.reasons.length - a.reasons.length).slice(0, 6)
}
