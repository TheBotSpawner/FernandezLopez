import { Skeleton } from '@/components/ui/skeleton'
import type { OpportunityStageSummary } from '@/types/dashboard'

export function OpportunitySummary({
  stages,
  loading,
}: {
  stages: OpportunityStageSummary[] | null
  loading: boolean
}) {
  if (loading || !stages) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-6 w-full" />
        ))}
      </div>
    )
  }

  const max = Math.max(...stages.map((stage) => stage.count), 1)

  return (
    <div className="flex flex-col gap-3">
      {stages.map((stage) => (
        <div key={stage.stage} className="flex items-center gap-3">
          <span className="w-40 shrink-0 truncate text-sm text-muted-foreground">{stage.stage}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${(stage.count / max) * 100}%` }} />
          </div>
          <span className="w-6 shrink-0 text-right text-sm font-medium text-foreground">{stage.count}</span>
        </div>
      ))}
    </div>
  )
}
