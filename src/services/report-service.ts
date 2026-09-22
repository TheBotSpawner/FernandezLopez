import { expirationSeverity } from '@/features/administration/expiration-utils'
import { isAdjustmentUpcoming } from '@/features/administration/adjustment-utils'
import { getContacts } from '@/services/contact-service'
import { getDebtorContractIds, getOverdueAmount } from '@/services/contract-charge-service'
import { getOpportunities, getOpportunitiesByProperty } from '@/services/opportunity-service'
import { getProperties, getPortfolioSummary } from '@/services/property-service'
import { getContracts } from '@/services/rental-contract-service'
import { getVisits, getVisitsByProperty } from '@/services/visit-service'
import { DEMAND_STAGES, OWNER_STAGES } from '@/types/opportunity'
import type { ContractStatus, AdjustmentMethod } from '@/types/rental-contract'
import type { CommercialReport, PropertyReport, AdministrationReport, ReportScope } from '@/types/report'
import type { ContactTrendPoint } from '@/types/dashboard'
import type { PropertyStatus } from '@/types/property'

const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  available: 'Disponible',
  reserved: 'Reservada',
  rented: 'Alquilada',
  sold: 'Vendida',
  paused: 'Pausada',
  valuation: 'En tasación',
}

const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: 'Borrador',
  UPCOMING: 'Próximo',
  ACTIVE: 'Activo',
  EXPIRED: 'Vencido',
  TERMINATED: 'Finalizado',
}

const ADJUSTMENT_METHOD_LABELS: Record<AdjustmentMethod, string> = {
  IPC: 'IPC',
  ICL: 'ICL',
  MANUAL: 'Manual',
  OTHER: 'Otro',
}

function periodRange(period: ReportScope['period'], now = new Date()): { start: Date; end: Date; months: number } {
  const y = now.getFullYear()
  const m = now.getMonth()
  switch (period) {
    case 'last-month':
      return { start: new Date(y, m - 1, 1), end: new Date(y, m, 1), months: 1 }
    case 'last-3-months':
      return { start: new Date(y, m - 2, 1), end: new Date(y, m + 1, 1), months: 3 }
    case 'last-6-months':
      return { start: new Date(y, m - 5, 1), end: new Date(y, m + 1, 1), months: 6 }
    case 'this-year':
      return { start: new Date(y, 0, 1), end: new Date(y, m + 1, 1), months: m + 1 }
    case 'this-month':
    default:
      return { start: new Date(y, m, 1), end: new Date(y, m + 1, 1), months: 1 }
  }
}

function inRange(iso: string, range: { start: Date; end: Date }): boolean {
  const t = new Date(iso).getTime()
  return t >= range.start.getTime() && t < range.end.getTime()
}

function monthlyTrend(dates: string[], range: { start: Date; end: Date; months: number }): ContactTrendPoint[] {
  const months = Array.from({ length: range.months }).map((_, i) => {
    const d = new Date(range.start.getFullYear(), range.start.getMonth() + i, 1)
    return d.toISOString().slice(0, 7)
  })
  return months.map((month) => ({ month, count: dates.filter((iso) => iso.slice(0, 7) === month).length }))
}

function branchIdsForScope(scope: ReportScope, allBranchIds: string[]): string[] {
  return scope.branchId === 'all' ? allBranchIds : [scope.branchId]
}

export async function getCommercialReport(scope: ReportScope, allBranchIds: string[]): Promise<CommercialReport> {
  const range = periodRange(scope.period)
  const branchIds = branchIdsForScope(scope, allBranchIds)
  const isOwn = scope.role === 'AGENT'
  const assignedUserId = isOwn ? scope.userId : scope.assignedUserId && scope.assignedUserId !== 'all' ? scope.assignedUserId : undefined

  const [allContacts, allOpportunities, allVisits] = await Promise.all([getContacts({}), getOpportunities({}), getVisits({})])

  const contacts = allContacts.filter((c) => branchIds.includes(c.branchId) && (!assignedUserId || c.assignedUserId === assignedUserId))
  const opportunities = allOpportunities.filter(
    (o) => branchIds.includes(o.branchId) && (!assignedUserId || o.assignedUserId === assignedUserId),
  )
  const visits = allVisits.filter((v) => branchIds.includes(v.branchId) && (!assignedUserId || v.assignedUserId === assignedUserId))

  const newContacts = contacts.filter((c) => inRange(c.createdAt, range))
  const opportunitiesCreated = opportunities.filter((o) => inRange(o.createdAt, range))
  const visitsCompleted = visits.filter((v) => v.status === 'Realizada' && inRange(v.startAt, range))
  const operationsClosed = opportunities.filter((o) => o.stage === 'Cerrada' && inRange(o.updatedAt, range))
  const pendingFollowUps = opportunities.filter(
    (o) => o.stage !== 'Cerrada' && o.stage !== 'Perdida' && o.nextActionAt && new Date(o.nextActionAt) <= new Date(),
  )

  const demandStages = DEMAND_STAGES.filter((s) => s !== 'Cerrada' && s !== 'Perdida')
  const ownerOnlyStages = OWNER_STAGES.filter((s) => !(DEMAND_STAGES as string[]).includes(s) && s !== 'Cerrada' && s !== 'Perdida')
  const opportunitiesByStage = [...demandStages, ...ownerOnlyStages]
    .map((stage) => ({ stage, count: opportunitiesCreated.filter((o) => o.stage === stage).length }))
    .filter((row, i) => row.count > 0 || i < demandStages.length)

  return {
    metrics: {
      newContacts: newContacts.length,
      opportunitiesCreated: opportunitiesCreated.length,
      visitsCompleted: visitsCompleted.length,
      operationsClosed: operationsClosed.length,
      pendingFollowUps: pendingFollowUps.length,
    },
    newContactsTrend: monthlyTrend(newContacts.map((c) => c.createdAt), range),
    visitsTrend: monthlyTrend(visitsCompleted.map((v) => v.startAt), range),
    opportunitiesByStage,
    conversionRate: opportunitiesCreated.length > 0 ? operationsClosed.length / opportunitiesCreated.length : null,
  }
}

export async function getPropertyReport(scope: ReportScope): Promise<PropertyReport> {
  const range = periodRange(scope.period)
  const [properties, portfolio] = await Promise.all([
    getProperties({ branchId: scope.branchId }),
    getPortfolioSummary(scope.branchId),
  ])

  const byStatusMap = new Map<PropertyStatus, number>()
  const byNeighborhoodMap = new Map<string, number>()
  for (const property of properties) {
    byStatusMap.set(property.status, (byStatusMap.get(property.status) ?? 0) + 1)
    byNeighborhoodMap.set(property.neighborhood, (byNeighborhoodMap.get(property.neighborhood) ?? 0) + 1)
  }

  const byStatus = Array.from(byStatusMap.entries()).map(([status, count]) => ({
    status,
    label: PROPERTY_STATUS_LABELS[status],
    count,
  }))

  const byNeighborhood = Array.from(byNeighborhoodMap.entries())
    .map(([neighborhood, count]) => ({ neighborhood, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8)

  const mostActive = properties
    .map((property) => ({
      property,
      opportunityCount: getOpportunitiesByProperty(property.id).length,
      visitCount: getVisitsByProperty(property.id).length,
    }))
    .filter(({ opportunityCount, visitCount }) => opportunityCount + visitCount > 0)
    .sort((a, b) => b.opportunityCount + b.visitCount - (a.opportunityCount + a.visitCount))
    .slice(0, 5)
    .map(({ property, opportunityCount, visitCount }) => ({
      id: property.id,
      address: property.floor ? `${property.address} · ${property.floor}` : property.address,
      activityLabel: `${opportunityCount} oportunidad${opportunityCount === 1 ? '' : 'es'} · ${visitCount} visita${visitCount === 1 ? '' : 's'}`,
    }))

  return {
    metrics: {
      active: properties.filter((p) => p.status !== 'sold').length,
      added: properties.filter((p) => inRange(p.createdAt, range)).length,
      forRent: portfolio.forRent,
      forSale: portfolio.forSale,
      reserved: portfolio.reserved,
      underValuation: portfolio.underValuation,
    },
    byStatus,
    byNeighborhood,
    mostActive,
  }
}

export async function getAdministrationReport(scope: ReportScope, includeFinancials: boolean): Promise<AdministrationReport> {
  const allContracts = await getContracts({})
  const contracts = scope.branchId === 'all' ? allContracts : allContracts.filter((c) => c.branchId === scope.branchId)
  const active = contracts.filter((c) => c.status === 'ACTIVE')
  const debtorIds = getDebtorContractIds()

  const byStatusMap = new Map<ContractStatus, number>()
  for (const contract of contracts) byStatusMap.set(contract.status, (byStatusMap.get(contract.status) ?? 0) + 1)
  const byStatus = Array.from(byStatusMap.entries()).map(([status, count]) => ({
    status,
    label: CONTRACT_STATUS_LABELS[status],
    count,
  }))

  const expirationBuckets = [
    { label: '0–30 días', severity: 'within30' as const },
    { label: '31–60 días', severity: 'within60' as const },
    { label: '61–90 días', severity: 'within90' as const },
  ].map(({ label, severity }) => ({ label, count: active.filter((c) => expirationSeverity(c.endDate) === severity).length }))

  const withAdjustment = active.filter((c) => c.nextAdjustmentDate)
  const adjustmentMethodBuckets = (['IPC', 'ICL', 'MANUAL', 'OTHER'] as AdjustmentMethod[])
    .map((method) => ({ method, label: ADJUSTMENT_METHOD_LABELS[method], count: withAdjustment.filter((c) => c.adjustmentMethod === method).length }))
    .filter((row) => row.count > 0)

  return {
    metrics: {
      activeContracts: active.length,
      withDebt: active.filter((c) => debtorIds.has(c.id)).length,
      upcomingAdjustments: active.filter((c) => isAdjustmentUpcoming(c.nextAdjustmentDate, 30)).length,
      expiringIn90: active.filter((c) => expirationSeverity(c.endDate) !== 'normal').length,
      ...(includeFinancials ? { pendingAmount: active.reduce((sum, c) => sum + getOverdueAmount(c.id), 0) } : {}),
    },
    byStatus,
    expirationBuckets,
    adjustmentMethodBuckets,
  }
}
