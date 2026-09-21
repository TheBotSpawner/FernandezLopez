import { CalendarClock } from 'lucide-react'
import { EmptyState } from '@/components/feedback/EmptyState'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatShortDate, formatTime } from '@/lib/format'
import { propertyTitle } from '@/features/properties/property-format'
import { findContactSync } from '@/services/contact-service'
import { findPropertySync } from '@/services/property-service'
import { getDemoUsers } from '@/services/user-service'
import { VISIT_STATUS_TONES } from '../visit-labels'
import type { Visit } from '@/types/visit'

export function VisitListTable({
  visits,
  loading,
  onSelectVisit,
}: {
  visits: Visit[]
  loading: boolean
  onSelectVisit: (visit: Visit) => void
}) {
  const users = getDemoUsers()

  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    )
  }

  if (visits.length === 0) {
    return <EmptyState icon={CalendarClock} message="No hay visitas con estos filtros." />
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
            <th className="px-3 py-2 font-medium">Fecha</th>
            <th className="px-3 py-2 font-medium">Contacto</th>
            <th className="px-3 py-2 font-medium">Propiedad</th>
            <th className="px-3 py-2 font-medium">Responsable</th>
            <th className="px-3 py-2 font-medium">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {visits.map((visit) => {
            const contact = findContactSync(visit.contactId)
            const property = findPropertySync(visit.propertyId)
            const agent = users.find((u) => u.id === visit.assignedUserId)
            return (
              <tr
                key={visit.id}
                onClick={() => onSelectVisit(visit)}
                className="cursor-pointer transition-colors hover:bg-muted/50"
              >
                <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                  {formatShortDate(visit.startAt)} · {formatTime(visit.startAt)}
                </td>
                <td className="px-3 py-2 font-medium text-foreground">{contact?.fullName ?? '—'}</td>
                <td className="px-3 py-2 text-muted-foreground">{property ? propertyTitle(property) : '—'}</td>
                <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{agent?.name ?? '—'}</td>
                <td className="px-3 py-2">
                  <StatusBadge tone={VISIT_STATUS_TONES[visit.status]}>{visit.status}</StatusBadge>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
