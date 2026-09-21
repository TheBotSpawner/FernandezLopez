import type { MetricKey } from '@/types/dashboard'

import { BRANCH_IDS } from './organization'

interface MetricMock {
  valueByBranch: Record<string, number>
  trend: { direction: 'up' | 'down'; label: string }
}

// All four metric values are computed from real CRM/rental-contract data in
// dashboard-service.ts as of Milestone 4; `valueByBranch` here is unused and
// kept only because the trend labels live on the same record shape. Trend
// labels stay static for every metric — see docs/modules/dashboard.md.
export const METRICS_MOCK: Record<MetricKey, MetricMock> = {
  contactosNuevos: {
    valueByBranch: { [BRANCH_IDS.coghlan]: 17, [BRANCH_IDS.belgrano]: 11 },
    trend: { direction: 'up', label: '+12% vs. mes anterior' },
  },
  propiedadesIngresadas: {
    valueByBranch: { [BRANCH_IDS.coghlan]: 6, [BRANCH_IDS.belgrano]: 3 },
    trend: { direction: 'up', label: '+3 vs. mes anterior' },
  },
  alquileresAdministrados: {
    valueByBranch: { [BRANCH_IDS.coghlan]: 61, [BRANCH_IDS.belgrano]: 42 },
    trend: { direction: 'up', label: '+2 vs. mes anterior' },
  },
  operacionesConcretadas: {
    valueByBranch: { [BRANCH_IDS.coghlan]: 4, [BRANCH_IDS.belgrano]: 2 },
    trend: { direction: 'down', label: '-1 vs. mes anterior' },
  },
}
