import { Home } from 'lucide-react'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { PropertyCard } from './PropertyCard'
import type { Property } from '@/types/property'

export function PropertyCardGrid({
  properties,
  loading,
  onClearFilters,
}: {
  properties: Property[]
  loading: boolean
  onClearFilters?: () => void
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-4/3 w-full" />
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="rounded-lg border border-border py-10">
        <EmptyState icon={Home} message="No encontramos propiedades con estos filtros." />
        {onClearFilters && (
          <div className="flex justify-center">
            <button type="button" onClick={onClearFilters} className="text-sm font-medium text-primary hover:underline">
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  )
}
