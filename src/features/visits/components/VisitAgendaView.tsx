import { isSameDay } from 'date-fns'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Button } from '@/components/ui/button'
import { propertyTitle } from '@/features/properties/property-format'
import { findContactSync } from '@/services/contact-service'
import { findPropertySync } from '@/services/property-service'
import { getDemoUsers } from '@/services/user-service'
import { VisitListItem } from './VisitListItem'
import type { Visit } from '@/types/visit'

export function VisitAgendaView({
  visits,
  loading,
  selectedDate,
  onSelectedDateChange,
  onSelectVisit,
}: {
  visits: Visit[]
  loading: boolean
  selectedDate: Date
  onSelectedDateChange: (date: Date) => void
  onSelectVisit: (visit: Visit) => void
}) {
  const users = getDemoUsers()
  const dayVisits = visits
    .filter((visit) => isSameDay(new Date(visit.startAt), selectedDate))
    .sort((a, b) => a.startAt.localeCompare(b.startAt))

  function shiftDay(delta: number) {
    const next = new Date(selectedDate)
    next.setDate(next.getDate() + delta)
    onSelectedDateChange(next)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="icon" onClick={() => shiftDay(-1)} aria-label="Día anterior">
            <ChevronLeft className="size-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => onSelectedDateChange(new Date())}>
            Hoy
          </Button>
          <Button variant="outline" size="icon" onClick={() => shiftDay(1)} aria-label="Día siguiente">
            <ChevronRight className="size-4" />
          </Button>
        </div>
        <span className="text-sm font-medium text-foreground capitalize">
          {format(selectedDate, "EEEE d 'de' MMMM", { locale: es })}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10 text-muted-foreground">
          <Loader2 className="size-5 animate-spin" />
        </div>
      ) : dayVisits.length === 0 ? (
        <EmptyState message="No hay visitas agendadas para este día." />
      ) : (
        <ul className="flex flex-col divide-y divide-border">
          {dayVisits.map((visit) => {
            const property = findPropertySync(visit.propertyId)
            const contact = findContactSync(visit.contactId)
            const agent = users.find((u) => u.id === visit.assignedUserId)
            return (
              <li key={visit.id}>
                <VisitListItem
                  visit={visit}
                  primaryLabel={property ? propertyTitle(property) : 'Propiedad'}
                  secondaryLabel={`${contact?.fullName ?? 'Contacto'} · ${agent?.name ?? '—'}`}
                  onClick={() => onSelectVisit(visit)}
                />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
