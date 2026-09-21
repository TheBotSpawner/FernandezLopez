import { formatShortDate } from '@/lib/format'
import type { PropertyHistoryEvent } from '../../property-detail-derivations'

export function PropertyHistorialTab({ events }: { events: PropertyHistoryEvent[] }) {
  return (
    <ol className="flex flex-col gap-4">
      {events.map((event, index) => (
        <li key={event.id} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span className="size-2 shrink-0 rounded-full bg-primary" />
            {index < events.length - 1 && <span className="w-px flex-1 bg-border" />}
          </div>
          <div className="pb-4">
            <p className="text-sm font-medium text-foreground">{event.label}</p>
            <p className="text-xs text-muted-foreground">{formatShortDate(event.date)}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
