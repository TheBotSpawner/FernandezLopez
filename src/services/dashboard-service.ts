import { METRICS_MOCK } from '@/mocks/dashboard'
import { BRANCH_IDS } from '@/mocks/organization'
import { PROPERTIES } from '@/mocks/properties'
import { isAdjustmentUpcoming } from '@/features/administration/adjustment-utils'
import { expirationSeverity } from '@/features/administration/expiration-utils'
import { getContacts } from '@/services/contact-service'
import { getDebtorContractIds } from '@/services/contract-charge-service'
import { getOpportunities, getOpportunitiesByProperty } from '@/services/opportunity-service'
import { getPortfolioSummary } from '@/services/property-service'
import { getContracts } from '@/services/rental-contract-service'
import { getDemoUsers } from '@/services/user-service'
import { getVisits, getVisitsByProperty } from '@/services/visit-service'
import { DEMAND_STAGES } from '@/types/opportunity'
import type { RentalContract } from '@/types/rental-contract'
import type {
  AttentionCategory,
  AttentionItem,
  ContactTrendPoint,
  DashboardData,
  DashboardMetric,
  DashboardPropertyPreview,
  DashboardScope,
  MetricKey,
  OpportunityStageSummary,
  UpcomingVisit,
} from '@/types/dashboard'
import type { UserRole } from '@/types/session'

// Which attention categories each role is expected to act on — see
// docs/modules/dashboard.md#role-aware-dashboard.
const ROLE_ATTENTION_CATEGORIES: Record<UserRole, AttentionCategory[]> = {
  ADMIN: ['contact', 'opportunity', 'reservation', 'contract-expiration', 'rent-adjustment'],
  MANAGER: ['contact', 'opportunity', 'reservation', 'contract-expiration', 'rent-adjustment'],
  ADMINISTRATION: ['contract-expiration', 'rent-adjustment'],
  AGENT: ['contact', 'opportunity', 'reservation'],
}

const STALE_CONTACT_DAYS = 3
const STALE_OPPORTUNITY_DAYS = 7
const OPEN_DEMAND_STAGES = DEMAND_STAGES.filter((stage) => stage !== 'Cerrada' && stage !== 'Perdida')

function scopeForRole(role: UserRole): 'own' | 'org' {
  return role === 'AGENT' ? 'own' : 'org'
}

function branchIdsForScope(scope: DashboardScope): string[] {
  return scope.branchId === 'all' ? [BRANCH_IDS.coghlan, BRANCH_IDS.belgrano] : [scope.branchId]
}

function daysAgo(iso: string): number {
  return (Date.now() - new Date(iso).getTime()) / 86_400_000
}

function isSameMonth(iso: string, reference: Date): boolean {
  return iso.slice(0, 7) === reference.toISOString().slice(0, 7)
}

export async function getDashboardData(scope: DashboardScope): Promise<DashboardData> {
  const branchIds = branchIdsForScope(scope)
  const itemScope = scopeForRole(scope.role)
  const now = new Date()

  const [allContacts, allOpportunities, allVisits, allContracts, portfolio] = await Promise.all([
    getContacts({}),
    getOpportunities({}),
    getVisits({}),
    getContracts({}),
    getPortfolioSummary(scope.branchId),
  ])

  const contacts = allContacts.filter((contact) => branchIds.includes(contact.branchId))
  const opportunities = allOpportunities.filter((opportunity) => branchIds.includes(opportunity.branchId))
  const visits = allVisits.filter((visit) => branchIds.includes(visit.branchId))
  const contracts = allContracts.filter((contract) => branchIds.includes(contract.branchId))

  const ownContacts = itemScope === 'own' ? contacts.filter((c) => c.assignedUserId === scope.userId) : contacts
  const ownOpportunities = itemScope === 'own' ? opportunities.filter((o) => o.assignedUserId === scope.userId) : opportunities

  const metrics: DashboardMetric[] = (Object.keys(METRICS_MOCK) as MetricKey[]).map((key) => {
    const trend = METRICS_MOCK[key].trend
    if (key === 'contactosNuevos') {
      return { key, value: ownContacts.filter((c) => isSameMonth(c.createdAt, now)).length, trend }
    }
    if (key === 'operacionesConcretadas') {
      return {
        key,
        value: ownOpportunities.filter((o) => o.stage === 'Cerrada' && isSameMonth(o.updatedAt, now)).length,
        trend,
      }
    }
    if (key === 'propiedadesIngresadas') {
      const branchProperties = PROPERTIES.filter((p) => branchIds.includes(p.branchId))
      return { key, value: branchProperties.filter((p) => isSameMonth(p.createdAt, now)).length, trend }
    }
    // alquileresAdministrados: active managed rental contracts. Trend label stays static (see Milestone 3 note above).
    return { key, value: contracts.filter((c) => c.status === 'ACTIVE').length, trend }
  })

  const MONTHS = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return d.toISOString().slice(0, 7)
  })
  const contactTrend: ContactTrendPoint[] = MONTHS.map((month) => ({
    month,
    count: contacts.filter((c) => c.createdAt.slice(0, 7) === month).length,
  }))

  const demandOpportunities = opportunities.filter((o) => o.type === 'RENT_SEARCH' || o.type === 'BUY_SEARCH')
  const opportunityStages: OpportunityStageSummary[] = OPEN_DEMAND_STAGES.map((stage) => ({
    stage,
    count: demandOpportunities.filter((o) => o.stage === stage).length,
  }))

  const attentionItems = buildAttentionItems(scope, branchIds, contacts, opportunities, contracts)

  const upcomingVisits: UpcomingVisit[] = visits
    .filter((v) => new Date(v.startAt) >= now && v.status !== 'Cancelada' && v.status !== 'Realizada')
    .filter((v) => (itemScope === 'own' ? v.assignedUserId === scope.userId : true))
    .sort((a, b) => a.startAt.localeCompare(b.startAt))
    .slice(0, 6)
    .map((visit) => {
      const property = PROPERTIES.find((p) => p.id === visit.propertyId)
      const contact = contacts.find((c) => c.id === visit.contactId) ?? allContacts.find((c) => c.id === visit.contactId)
      const agent = getDemoUsers().find((u) => u.id === visit.assignedUserId)
      return {
        id: visit.id,
        dateTime: visit.startAt,
        propertyAddress: property ? (property.floor ? `${property.address} · ${property.floor}` : property.address) : '—',
        neighborhood: property?.neighborhood ?? '—',
        contactName: contact?.fullName ?? '—',
        agentId: visit.assignedUserId,
        agentName: agent?.name ?? '—',
        status: visit.status,
        branchId: visit.branchId,
      }
    })

  const highInterestProperties = buildMostActiveProperties(branchIds)

  return {
    metrics,
    contactTrend,
    opportunityStages,
    attentionItems,
    upcomingVisits,
    portfolio,
    highInterestProperties,
  }
}

function buildAttentionItems(
  scope: DashboardScope,
  branchIds: string[],
  contacts: Awaited<ReturnType<typeof getContacts>>,
  opportunities: Awaited<ReturnType<typeof getOpportunities>>,
  contracts: RentalContract[],
): AttentionItem[] {
  const allowedCategories = ROLE_ATTENTION_CATEGORIES[scope.role]
  const items: AttentionItem[] = []
  const users = getDemoUsers()

  if (allowedCategories.includes('contact')) {
    for (const branchId of branchIds) {
      const staleInBranch = contacts.filter((c) => c.branchId === branchId && daysAgo(c.lastActivityAt) > STALE_CONTACT_DAYS)
      if (staleInBranch.length > 0) {
        items.push({
          id: `attn-contact-${branchId}`,
          category: 'contact',
          severity: 'warning',
          message: `${staleInBranch.length} contacto${staleInBranch.length === 1 ? '' : 's'} esperando respuesta`,
          branchId,
        })
      }
      for (const agent of users.filter((u) => u.role === 'AGENT' && u.branchId === branchId)) {
        const own = staleInBranch.filter((c) => c.assignedUserId === agent.id)
        if (own.length > 0) {
          items.push({
            id: `attn-contact-${branchId}-${agent.id}`,
            category: 'contact',
            severity: 'warning',
            message: `${own.length} contacto${own.length === 1 ? '' : 's'} esperando tu respuesta`,
            branchId,
            assignedUserId: agent.id,
          })
        }
      }
    }
  }

  if (allowedCategories.includes('opportunity')) {
    const openOpportunities = opportunities.filter((o) => o.stage !== 'Cerrada' && o.stage !== 'Perdida')
    for (const branchId of branchIds) {
      const staleInBranch = openOpportunities.filter(
        (o) => o.branchId === branchId && daysAgo(o.lastActivityAt) > STALE_OPPORTUNITY_DAYS,
      )
      if (staleInBranch.length > 0) {
        items.push({
          id: `attn-opportunity-${branchId}`,
          category: 'opportunity',
          severity: 'warning',
          message: `${staleInBranch.length} oportunidad${staleInBranch.length === 1 ? '' : 'es'} sin actividad hace ${STALE_OPPORTUNITY_DAYS} días`,
          branchId,
        })
      }
      for (const agent of users.filter((u) => u.role === 'AGENT' && u.branchId === branchId)) {
        const own = staleInBranch.filter((o) => o.assignedUserId === agent.id)
        if (own.length > 0) {
          items.push({
            id: `attn-opportunity-${branchId}-${agent.id}`,
            category: 'opportunity',
            severity: 'warning',
            message: `${own.length} oportunidad${own.length === 1 ? '' : 'es'} tuya${own.length === 1 ? '' : 's'} sin actividad hace ${STALE_OPPORTUNITY_DAYS} días`,
            branchId,
            assignedUserId: agent.id,
          })
        }
      }
    }
  }

  if (allowedCategories.includes('reservation')) {
    for (const branchId of branchIds) {
      const reservations = opportunities.filter((o) => o.branchId === branchId && o.stage === 'Reserva')
      if (reservations.length > 0) {
        items.push({
          id: `attn-reservation-${branchId}`,
          category: 'reservation',
          severity: 'danger',
          message: `${reservations.length} reserva${reservations.length === 1 ? '' : 's'} en curso`,
          branchId,
        })
      }
    }
  }

  if (allowedCategories.includes('contract-expiration')) {
    const debtorIds = getDebtorContractIds()
    for (const branchId of branchIds) {
      const active = contracts.filter((c) => c.branchId === branchId && c.status === 'ACTIVE')
      const expiring = active.filter((c) => expirationSeverity(c.endDate) !== 'normal').length
      if (expiring > 0) {
        items.push({
          id: `attn-contract-expiration-${branchId}`,
          category: 'contract-expiration',
          severity: 'danger',
          message: `${expiring} contrato${expiring === 1 ? '' : 's'} vence${expiring === 1 ? '' : 'n'} en los próximos 90 días`,
          branchId,
        })
      }
      const withDebt = active.filter((c) => debtorIds.has(c.id)).length
      if (withDebt > 0) {
        items.push({
          id: `attn-contract-debt-${branchId}`,
          category: 'contract-expiration',
          severity: 'danger',
          message: `${withDebt} contrato${withDebt === 1 ? '' : 's'} con deuda`,
          branchId,
        })
      }
    }
  }

  if (allowedCategories.includes('rent-adjustment')) {
    for (const branchId of branchIds) {
      const active = contracts.filter((c) => c.branchId === branchId && c.status === 'ACTIVE')
      const upcoming = active.filter((c) => isAdjustmentUpcoming(c.nextAdjustmentDate, 30)).length
      if (upcoming > 0) {
        items.push({
          id: `attn-rent-adjustment-${branchId}`,
          category: 'rent-adjustment',
          severity: 'info',
          message: `${upcoming} alquiler${upcoming === 1 ? '' : 'es'} tiene${upcoming === 1 ? '' : 'n'} ajuste próximo`,
          branchId,
        })
      }
    }
  }

  return items
}

function buildMostActiveProperties(branchIds: string[]): DashboardPropertyPreview[] {
  const scoped = PROPERTIES.filter((property) => branchIds.includes(property.branchId))
  const ranked = scoped
    .map((property) => ({
      property,
      opportunityCount: getOpportunitiesByProperty(property.id).length,
      visitCount: getVisitsByProperty(property.id).length,
    }))
    .filter(({ opportunityCount, visitCount }) => opportunityCount + visitCount > 0)
    .sort((a, b) => b.opportunityCount + b.visitCount - (a.opportunityCount + a.visitCount))
    .slice(0, 4)

  return ranked.map(({ property, opportunityCount, visitCount }) => ({
    id: property.id,
    address: property.floor ? `${property.address} · ${property.floor}` : property.address,
    neighborhood: property.neighborhood,
    operationType: property.operationTypes.includes('rent') ? 'rent' : 'sale',
    price: (property.operationTypes.includes('rent') ? property.rentalPrice : property.salePrice) ?? 0,
    currency: property.operationTypes.includes('rent') ? 'ARS' : 'USD',
    activityLabel: `${opportunityCount} oportunidad${opportunityCount === 1 ? '' : 'es'} · ${visitCount} visita${visitCount === 1 ? '' : 's'}`,
    branchId: property.branchId,
    imageUrl: property.images[0],
  }))
}
