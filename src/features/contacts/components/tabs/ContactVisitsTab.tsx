import { CalendarX } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/feedback/EmptyState'
import { VisitListItem } from '@/features/visits/components/VisitListItem'
import { getUserForContact } from '@/mocks/contacts'
import { propertyTitle } from '@/features/properties/property-format'
import type { Property } from '@/types/property'
import type { Visit } from '@/types/visit'

export function ContactVisitsTab({ visits, relatedProperties }: { visits: Visit[]; relatedProperties: Record<string, Property> }) {
  const navigate = useNavigate()

  if (visits.length === 0) {
    return <EmptyState icon={CalendarX} message="Este contacto todavía no tiene visitas." />
  }

  return (
    <ul className="flex flex-col divide-y divide-border">
      {visits.map((visit) => {
        const property = relatedProperties[visit.propertyId]
        const agent = getUserForContact(visit.assignedUserId)
        return (
          <li key={visit.id}>
            <VisitListItem
              visit={visit}
              primaryLabel={property ? propertyTitle(property) : 'Propiedad no disponible'}
              secondaryLabel={agent?.name ?? '—'}
              onClick={property ? () => navigate(`/properties/${property.id}`) : undefined}
            />
          </li>
        )
      })}
    </ul>
  )
}
