import { StatusBadge } from '@/components/data-display/StatusBadge'
import { formatTime, formatVisitDay } from '@/lib/format'
import { VISIT_STATUS_TONES } from '../visit-labels'
import type { Visit } from '@/types/visit'

interface VisitListItemProps {
  visit: Visit
  primaryLabel: string
  secondaryLabel: string
  onClick?: () => void
}

export function VisitListItem({ visit, primaryLabel, secondaryLabel, onClick }: VisitListItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 rounded-lg py-2.5 text-left transition-colors hover:bg-muted disabled:pointer-events-none"
      disabled={!onClick}
    >
      <div className="flex w-16 shrink-0 flex-col text-center">
        <span className="text-sm font-semibold text-foreground">{formatTime(visit.startAt)}</span>
        <span className="text-[11px] text-muted-foreground">{formatVisitDay(visit.startAt)}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{primaryLabel}</p>
        <p className="truncate text-xs text-muted-foreground">
          {secondaryLabel}
          {visit.outcome ? ` · ${visit.outcome}` : ''}
        </p>
      </div>
      <StatusBadge tone={VISIT_STATUS_TONES[visit.status]}>{visit.status}</StatusBadge>
    </button>
  )
}
