import { MetricCard, MetricCardSkeleton } from '@/components/data-display/MetricCard'
import type { DashboardMetric, MetricKey } from '@/types/dashboard'
import { METRIC_DEFINITIONS } from '../metric-definitions'

interface MetricsGridProps {
  keys: MetricKey[]
  metrics: DashboardMetric[] | null
  loading: boolean
}

export function MetricsGrid({ keys, metrics, loading }: MetricsGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
      {keys.map((key) => {
        if (loading || !metrics) return <MetricCardSkeleton key={key} />
        const metric = metrics.find((candidate) => candidate.key === key)
        if (!metric) return null
        const definition = METRIC_DEFINITIONS[key]
        return (
          <MetricCard
            key={key}
            label={definition.label}
            unit={definition.unit}
            icon={definition.icon}
            value={metric.value}
            trend={metric.trend}
          />
        )
      })}
    </div>
  )
}
