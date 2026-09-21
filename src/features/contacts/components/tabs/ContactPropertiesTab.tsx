import { Home } from 'lucide-react'
import { EmptyState } from '@/components/feedback/EmptyState'
import { PropertyCard } from '@/features/properties/components/PropertyCard'
import type { Property } from '@/types/property'

export function ContactPropertiesTab({ properties }: { properties: Property[] }) {
  if (properties.length === 0) {
    return <EmptyState icon={Home} message="No hay propiedades relacionadas con este contacto todavía." />
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
