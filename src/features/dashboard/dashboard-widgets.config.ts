import type { MetricKey } from '@/types/dashboard'
import type { UserRole } from '@/types/session'

// Which dashboard sections/metrics each role sees. Data scoping (branch,
// own-vs-org, attention categories) happens in the service layer — this
// config only controls UI composition. See docs/modules/dashboard.md#role-aware-dashboard.
export interface DashboardWidgetConfig {
  metrics: MetricKey[]
  showBranchSelector: boolean
  showChart: boolean
  showOpportunitySummary: boolean
  showAttention: boolean
  showVisits: boolean
  showPortfolio: boolean
  showHighInterestProperties: boolean
}

const ORG_WIDE_CONFIG: DashboardWidgetConfig = {
  metrics: ['contactosNuevos', 'propiedadesIngresadas', 'alquileresAdministrados', 'operacionesConcretadas'],
  showBranchSelector: true,
  showChart: true,
  showOpportunitySummary: true,
  showAttention: true,
  showVisits: true,
  showPortfolio: true,
  showHighInterestProperties: true,
}

const CONFIG_BY_ROLE: Record<UserRole, DashboardWidgetConfig> = {
  ADMIN: ORG_WIDE_CONFIG,
  MANAGER: ORG_WIDE_CONFIG,
  ADMINISTRATION: {
    metrics: ['alquileresAdministrados'],
    showBranchSelector: false,
    showChart: false,
    showOpportunitySummary: false,
    showAttention: true,
    showVisits: false,
    showPortfolio: false,
    showHighInterestProperties: false,
  },
  AGENT: {
    metrics: ['contactosNuevos', 'operacionesConcretadas'],
    showBranchSelector: false,
    showChart: true,
    showOpportunitySummary: true,
    showAttention: true,
    showVisits: true,
    showPortfolio: false,
    showHighInterestProperties: true,
  },
}

export function getDashboardWidgetConfig(role: UserRole): DashboardWidgetConfig {
  return CONFIG_BY_ROLE[role]
}
