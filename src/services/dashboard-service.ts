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
const NEW_LEAD_DAYS = 30
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
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

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

  const attentionItems = buildAttentionItems(scope, ownContacts, ownOpportunities, contracts)

  const upcomingVisits: UpcomingVisit[] = visits
    // Whole of today's agenda (not just what's still ahead), then the coming days.
    .filter((v) => new Date(v.startAt) >= startOfToday && v.status !== 'Cancelada' && v.status !== 'Realizada')
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

function plural(count: number, singular: string, pluralForm: string): string {
  return count === 1 ? singular : pluralForm
}

/**
 * One item per category, aggregated over the selected branch scope — agents
 * receive data already narrowed to their own contacts/opportunities, so the
 * same item reads "tu respuesta" for them instead of a second, overlapping row.
 */
function buildAttentionItems(
  scope: DashboardScope,
  contacts: Awaited<ReturnType<typeof getContacts>>,
  opportunities: Awaited<ReturnType<typeof getOpportunities>>,
  contracts: RentalContract[],
): AttentionItem[] {
  const allowedCategories = ROLE_ATTENTION_CATEGORIES[scope.role]
  const own = scopeForRole(scope.role) === 'own'
  const items: AttentionItem[] = []
  const add = (id: string, category: AttentionCategory, severity: AttentionItem['severity'], count: number, message: string) => {
    if (count > 0 && allowedCategories.includes(category)) {
      items.push({ id, category, severity, message: `${count} ${message}`, branchId: scope.branchId })
    }
  }

  // A recent lead (created in the last 30 days) nobody has followed up with in 3+ days.
  const waiting = contacts.filter(
    (c) => daysAgo(c.createdAt) <= NEW_LEAD_DAYS && daysAgo(c.lastActivityAt) > STALE_CONTACT_DAYS,
  ).length
  add('attn-contact', 'contact', 'warning', waiting, `${plural(waiting, 'contacto', 'contactos')} esperando ${own ? 'tu ' : ''}respuesta`)

  const openOpportunities = opportunities.filter((o) => o.stage !== 'Cerrada' && o.stage !== 'Perdida')
  const stale = openOpportunities.filter((o) => daysAgo(o.lastActivityAt) > STALE_OPPORTUNITY_DAYS).length
  add(
    'attn-opportunity',
    'opportunity',
    'warning',
    stale,
    `${plural(stale, 'oportunidad', 'oportunidades')} sin actividad hace ${STALE_OPPORTUNITY_DAYS} días`,
  )

  const reservations = opportunities.filter((o) => o.stage === 'Reserva').length
  add('attn-reservation', 'reservation', 'danger', reservations, `${plural(reservations, 'reserva', 'reservas')} en curso`)

  const active = contracts.filter((c) => c.status === 'ACTIVE')
  const expiring = active.filter((c) => expirationSeverity(c.endDate) !== 'normal').length
  add(
    'attn-contract-expiration',
    'contract-expiration',
    'danger',
    expiring,
    `${plural(expiring, 'contrato vence', 'contratos vencen')} en los próximos 90 días`,
  )

  const debtorIds = getDebtorContractIds()
  const withDebt = active.filter((c) => debtorIds.has(c.id)).length
  add('attn-contract-debt', 'contract-expiration', 'danger', withDebt, `${plural(withDebt, 'contrato', 'contratos')} con deuda`)

  const adjusting = active.filter((c) => isAdjustmentUpcoming(c.nextAdjustmentDate, 30)).length
  add(
    'attn-rent-adjustment',
    'rent-adjustment',
    'info',
    adjusting,
    `${plural(adjusting, 'alquiler tiene', 'alquileres tienen')} ajuste próximo`,
  )

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
