import { VISITS } from '@/mocks/visits'
import { loadOrSeed, persist } from '@/lib/local-store'
import type { VisitStatus } from '@/types/dashboard'
import type { Visit, VisitInput, VisitOutcome, VisitQuery } from '@/types/visit'

const KEY = 'fl.crm.visits'

let visits: Visit[] = loadOrSeed(KEY, VISITS)

function save() {
  persist(KEY, visits)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function matchesQuery(visit: Visit, query: VisitQuery): boolean {
  if (query.branchId && query.branchId !== 'all' && visit.branchId !== query.branchId) return false
  if (query.assignedUserId && visit.assignedUserId !== query.assignedUserId) return false
  if (query.contactId && visit.contactId !== query.contactId) return false
  if (query.opportunityId && visit.opportunityId !== query.opportunityId) return false
  if (query.propertyId && visit.propertyId !== query.propertyId) return false
  if (query.status?.length && !query.status.includes(visit.status)) return false
  if (query.from && visit.startAt < query.from) return false
  if (query.to && visit.startAt > query.to) return false
  return true
}

export async function getVisits(query: VisitQuery = {}): Promise<Visit[]> {
  await delay(200)
  return visits.filter((visit) => matchesQuery(visit, query)).sort((a, b) => a.startAt.localeCompare(b.startAt))
}

export async function getVisitById(id: string): Promise<Visit | null> {
  await delay(120)
  return visits.find((visit) => visit.id === id) ?? null
}

export function getVisitsByProperty(propertyId: string): Visit[] {
  return visits.filter((visit) => visit.propertyId === propertyId).sort((a, b) => b.startAt.localeCompare(a.startAt))
}

export function getVisitsByContact(contactId: string): Visit[] {
  return visits.filter((visit) => visit.contactId === contactId).sort((a, b) => b.startAt.localeCompare(a.startAt))
}

export function getVisitsByOpportunity(opportunityId: string): Visit[] {
  return visits.filter((visit) => visit.opportunityId === opportunityId).sort((a, b) => b.startAt.localeCompare(a.startAt))
}

/** Simple overlap check for the same agent — a warning, not a hard scheduling constraint. */
export function hasConflict(assignedUserId: string, startAt: string, endAt: string, excludeId?: string): boolean {
  return visits.some(
    (visit) =>
      visit.id !== excludeId &&
      visit.assignedUserId === assignedUserId &&
      visit.status !== 'Cancelada' &&
      new Date(visit.startAt) < new Date(endAt) &&
      new Date(visit.endAt) > new Date(startAt),
  )
}

export async function createVisit(input: VisitInput): Promise<Visit> {
  await delay(200)
  const now = new Date().toISOString()
  const visit: Visit = {
    id: `visit-${Date.now()}`,
    organizationId: 'org-fl',
    status: 'Programada',
    ...input,
    createdAt: now,
    updatedAt: now,
  }
  visits = [visit, ...visits]
  save()
  return visit
}

export async function updateVisit(id: string, input: Partial<VisitInput & { status: VisitStatus }>): Promise<Visit> {
  await delay(180)
  visits = visits.map((visit) => (visit.id === id ? { ...visit, ...input, updatedAt: new Date().toISOString() } : visit))
  save()
  return visits.find((visit) => visit.id === id)!
}

export async function completeVisit(id: string, outcome: VisitOutcome, note?: string): Promise<Visit> {
  await delay(180)
  const now = new Date().toISOString()
  visits = visits.map((visit) =>
    visit.id === id ? { ...visit, status: 'Realizada' as VisitStatus, outcome, notes: note ?? visit.notes, updatedAt: now } : visit,
  )
  const updated = visits.find((visit) => visit.id === id)!
  save()
  return updated
}
