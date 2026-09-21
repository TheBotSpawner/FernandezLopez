import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { formatTime, formatVisitDay } from '@/lib/format'
import type { UpcomingVisit } from '@/types/dashboard'

export function UpcomingVisits({ visits, loading }: { visits: UpcomingVisit[] | null; loading: boolean }) {
  if (loading || !visits) {
    return (
      <div className="flex flex-col gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (visits.length === 0) {
    return <EmptyState message="No hay visitas próximas." />
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {visits.map((visit) => (
        <li key={visit.id} className="flex items-center gap-3 py-2.5 first:pt-0 last:pb-0">
          <div className="flex w-14 shrink-0 flex-col text-center">
            <span className="text-sm font-semibold text-foreground">{formatTime(visit.dateTime)}</span>
            <span className="text-[11px] text-muted-foreground">{formatVisitDay(visit.dateTime)}</span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">{visit.propertyAddress}</p>
            <p className="truncate text-xs text-muted-foreground">
              {visit.contactName} · {visit.agentName}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
