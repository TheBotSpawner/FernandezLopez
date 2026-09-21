import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatTime } from '@/lib/format'
import { findContactSync } from '@/services/contact-service'
import { VISIT_STATUS_TONES } from '../visit-labels'
import type { Visit } from '@/types/visit'

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MAX_VISIBLE_PER_DAY = 3

export function VisitCalendarView({
  visits,
  month,
  onMonthChange,
  onSelectVisit,
}: {
  visits: Visit[]
  month: Date
  onMonthChange: (month: Date) => void
  onSelectVisit: (visit: Visit) => void
}) {
  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(month), { weekStartsOn: 1 })
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" onClick={() => onMonthChange(subMonths(month, 1))} aria-label="Mes anterior">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onMonthChange(new Date())}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={() => onMonthChange(addMonths(month, 1))} aria-label="Mes siguiente">
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <span className="text-sm font-medium text-foreground capitalize">{format(month, 'MMMM yyyy', { locale: es })}</span>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border border-border bg-border text-xs">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="bg-muted/50 px-2 py-1.5 text-center font-medium text-muted-foreground">
            {label}
          </div>
        ))}
        {days.map((day) => {
          const dayVisits = visits
            .filter((visit) => isSameDay(new Date(visit.startAt), day))
            .sort((a, b) => a.startAt.localeCompare(b.startAt))
          const overflow = dayVisits.length - MAX_VISIBLE_PER_DAY

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'flex min-h-24 flex-col gap-1 bg-card p-1.5 sm:min-h-28',
                !isSameMonth(day, month) && 'bg-muted/20 text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'self-start rounded-full px-1.5 text-[11px] font-medium',
                  isToday(day) && 'bg-primary text-primary-foreground',
                )}
              >
                {format(day, 'd')}
              </span>
              <div className="flex flex-col gap-0.5">
                {dayVisits.slice(0, MAX_VISIBLE_PER_DAY).map((visit) => (
                  <button
                    key={visit.id}
                    type="button"
                    onClick={() => onSelectVisit(visit)}
                    className={cn(
                      'truncate rounded px-1 py-0.5 text-left text-[11px] font-medium hover:opacity-80',
                      VISIT_STATUS_TONES[visit.status] === 'danger' && 'bg-danger/15 text-danger',
                      VISIT_STATUS_TONES[visit.status] === 'success' && 'bg-success/15 text-success',
                      VISIT_STATUS_TONES[visit.status] === 'warning' && 'bg-warning/15 text-warning',
                      VISIT_STATUS_TONES[visit.status] === 'info' && 'bg-info/15 text-info',
                      VISIT_STATUS_TONES[visit.status] === 'muted' && 'bg-muted text-muted-foreground',
                    )}
                  >
                    {formatTime(visit.startAt)} {findContactSync(visit.contactId)?.fullName ?? 'Visita'}
                  </button>
                ))}
                {overflow > 0 && <span className="px-1 text-[11px] text-muted-foreground">+{overflow} más</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
