import type { UserRole } from './session'

export type MetricKey =
  | 'contactosNuevos'
  | 'propiedadesIngresadas'
  | 'alquileresAdministrados'
  | 'operacionesConcretadas'

export interface DashboardMetric {
  key: MetricKey
  value: number
  trend?: {
    direction: 'up' | 'down'
    label: string
  }
}

export interface ContactTrendPoint {
  /** ISO month, e.g. "2026-04" */
  month: string
  count: number
}

export type OpportunityStage =
  | 'Nueva'
  | 'Contactado'
  | 'Propiedades seleccionadas'
  | 'Visita'
  | 'Negociación'
  | 'Reserva'

export interface OpportunityStageSummary {
  stage: OpportunityStage
  count: number
}

export type AttentionCategory =
  | 'contact'
  | 'opportunity'
  | 'reservation'
  | 'contract-expiration'
  | 'rent-adjustment'

export type AttentionSeverity = 'info' | 'warning' | 'danger'

export interface AttentionItem {
  id: string
  category: AttentionCategory
  message: string
  severity: AttentionSeverity
  branchId: string
  /** Present when the item belongs to a specific agent/user rather than the org. */
  assignedUserId?: string
}

export type VisitStatus = 'Programada' | 'Confirmada' | 'Realizada' | 'Cancelada' | 'Reprogramada'

export interface UpcomingVisit {
  id: string
  dateTime: string
  propertyAddress: string
  neighborhood: string
  contactName: string
  agentId: string
  agentName: string
  status: VisitStatus
  branchId: string
}

export interface PortfolioSummary {
  forRent: number
  forSale: number
  reserved: number
  underValuation: number
}

export interface DashboardPropertyPreview {
  id: string
  address: string
  neighborhood: string
  operationType: 'sale' | 'rent'
  price: number
  currency: 'ARS' | 'USD'
  activityLabel: string
  branchId: string
  imageUrl: string
}

export interface DashboardScope {
  branchId: string | 'all'
  role: UserRole
  userId: string
}

export interface DashboardData {
  metrics: DashboardMetric[]
  contactTrend: ContactTrendPoint[]
  opportunityStages: OpportunityStageSummary[]
  attentionItems: AttentionItem[]
  upcomingVisits: UpcomingVisit[]
  portfolio: PortfolioSummary
  highInterestProperties: DashboardPropertyPreview[]
}
