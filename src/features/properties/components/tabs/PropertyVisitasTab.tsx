import { CalendarX } from 'lucide-react'
import { EmptyState } from '@/components/feedback/EmptyState'
import { VisitListItem } from '@/features/visits/components/VisitListItem'
import { findContactSync } from '@/services/contact-service'
import { getDemoUsers } from '@/services/user-service'
import type { Visit } from '@/types/visit'

export function PropertyVisitasTab({ visits }: { visits: Visit[] }) {
  const users = getDemoUsers()

  if (visits.length === 0) {
    return <EmptyState icon={CalendarX} message="Todavía no hay visitas registradas para esta propiedad." />
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {visits.map((visit) => {
        const contact = findContactSync(visit.contactId)
        const agent = users.find((u) => u.id === visit.assignedUserId)
        return (
          <li key={visit.id}>
            <VisitListItem visit={visit} primaryLabel={contact?.fullName ?? 'Contacto'} secondaryLabel={agent?.name ?? '—'} />
          </li>
        )
      })}
    </ul>
  )
}
