import type { ContractStatus, AdjustmentMethod } from './rental-contract'
import type { ContactTrendPoint } from './dashboard'
import type { PropertyStatus } from './property'
import type { UserRole } from './session'

export type ReportPeriod = 'this-month' | 'last-month' | 'last-3-months' | 'last-6-months' | 'this-year'

export interface ReportScope {
  branchId: string | 'all'
  role: UserRole
  userId: string
  period: ReportPeriod
  /** Filters commercial data to one agent's activity — ignored for AGENT (always forced to self). */
  assignedUserId?: string | 'all'
}

export interface CommercialReport {
  metrics: {
    newContacts: number
    opportunitiesCreated: number
    visitsCompleted: number
    operationsClosed: number
    pendingFollowUps: number
  }
  newContactsTrend: ContactTrendPoint[]
  visitsTrend: ContactTrendPoint[]
  opportunitiesByStage: { stage: string; count: number }[]
  /** operationsClosed / opportunitiesCreated — null when there's nothing to divide. */
  conversionRate: number | null
}

export interface PropertyReport {
  metrics: {
    active: number
    added: number
    forRent: number
    forSale: number
    reserved: number
    underValuation: number
  }
  byStatus: { status: PropertyStatus; label: string; count: number }[]
  byNeighborhood: { neighborhood: string; count: number }[]
  mostActive: { id: string; address: string; activityLabel: string }[]
}

export interface AdministrationReport {
  metrics: {
    activeContracts: number
    withDebt: number
    upcomingAdjustments: number
    expiringIn90: number
    /** Only present when the viewer can see financial totals (ADMINISTRATION/MANAGER/ADMIN). */
    pendingAmount?: number
  }
  byStatus: { status: ContractStatus; label: string; count: number }[]
  expirationBuckets: { label: string; count: number }[]
  adjustmentMethodBuckets: { method: AdjustmentMethod; label: string; count: number }[]
}
