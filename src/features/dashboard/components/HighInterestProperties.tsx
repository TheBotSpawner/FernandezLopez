import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { formatPrice } from '@/lib/format'
import type { DashboardPropertyPreview } from '@/types/dashboard'

export function HighInterestProperties({
  properties,
  loading,
}: {
  properties: DashboardPropertyPreview[] | null
  loading: boolean
}) {
  if (loading || !properties) {
    return (
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    )
  }

  if (properties.length === 0) {
    return <EmptyState message="No hay propiedades destacadas todavía." />
  }

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {properties.map((property) => (
        <Link
          key={property.id}
          to="/properties"
          className="group flex flex-col overflow-hidden rounded-lg border border-border transition-colors hover:border-primary/40"
        >
          <div className="aspect-4/3 overflow-hidden bg-muted">
            <img
              src={property.imageUrl}
              alt={property.address}
              loading="lazy"
              className="size-full object-cover transition-transform group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col gap-1 p-3">
            <p className="truncate text-sm font-medium text-foreground">{property.address}</p>
            <p className="truncate text-xs text-muted-foreground">{property.neighborhood}</p>
            <span className="text-sm font-semibold text-foreground">
              {formatPrice(property.price, property.currency)}
              {property.operationType === 'rent' && (
                <span className="text-xs font-normal text-muted-foreground"> /mes</span>
              )}
            </span>
            <span className="text-xs text-muted-foreground">{property.activityLabel}</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
