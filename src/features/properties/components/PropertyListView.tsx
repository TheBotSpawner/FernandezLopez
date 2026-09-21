import { Home } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { formatShortDate } from '@/lib/format'
import { propertyPriceLines, propertyTitle } from '../property-format'
import { PROPERTY_TYPE_LABELS } from '../property-labels'
import { OperationBadge, PropertyStatusBadge } from './PropertyBadges'
import { PropertyCardGrid } from './PropertyCardGrid'
import type { Property } from '@/types/property'

export function PropertyListView({
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
      <div className="hidden flex-col gap-2 md:flex">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
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
    <>
      {/* Mobile falls back to cards — a squeezed table is not usable at that width. */}
      <div className="md:hidden">
        <PropertyCardGrid properties={properties} loading={false} onClearFilters={onClearFilters} />
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Propiedad</th>
              <th className="px-3 py-2 font-medium">Barrio</th>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium">Operación</th>
              <th className="px-3 py-2 font-medium">Precio</th>
              <th className="px-3 py-2 font-medium">Estado</th>
              <th className="px-3 py-2 font-medium">Actualizado</th>
              <th className="px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {properties.map((property) => (
              <tr key={property.id} className="transition-colors hover:bg-muted/50">
                <td className="px-3 py-2">
                  <Link to={`/properties/${property.id}`} className="flex items-center gap-2.5">
                    <img
                      src={property.images[0]}
                      alt=""
                      className="size-10 shrink-0 rounded-md object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-foreground">{propertyTitle(property)}</p>
                      <p className="text-xs text-muted-foreground">{property.referenceCode}</p>
                    </div>
                  </Link>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{property.neighborhood}</td>
                <td className="px-3 py-2 text-muted-foreground">{PROPERTY_TYPE_LABELS[property.propertyType]}</td>
                <td className="px-3 py-2">
                  <div className="flex gap-1">
                    {property.operationTypes.map((operation) => (
                      <OperationBadge key={operation} operation={operation} />
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-foreground">
                  {propertyPriceLines(property)
                    .map((line) => line.value)
                    .join(' · ')}
                </td>
                <td className="px-3 py-2">
                  <PropertyStatusBadge status={property.status} />
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                  {formatShortDate(property.updatedAt)}
                </td>
                <td className="px-3 py-2 text-right">
                  <Link to={`/properties/${property.id}`} className="text-sm font-medium text-primary hover:underline">
                    Ver
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
