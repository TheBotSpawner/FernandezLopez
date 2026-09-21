import { MessageCircle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { propertyFeatures, propertyPriceLines, propertyTitle } from '../property-format'
import { PROPERTY_TYPE_LABELS } from '../property-labels'
import { OperationBadge, PropertyStatusBadge } from './PropertyBadges'
import type { Property } from '@/types/property'

export function PropertyCard({ property }: { property: Property }) {
  const priceLines = propertyPriceLines(property)
  const features = propertyFeatures(property)

  return (
    <Link
      to={`/properties/${property.id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border transition-colors hover:border-primary/40"
    >
      <div className="relative aspect-4/3 overflow-hidden bg-muted">
        <img
          src={property.images[0]}
          alt={propertyTitle(property)}
          loading="lazy"
          className="size-full object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute top-2 left-2 flex gap-1.5">
          <PropertyStatusBadge status={property.status} />
        </div>
        <div className="absolute top-2 right-2 flex gap-1.5">
          {property.operationTypes.map((operation) => (
            <OperationBadge key={operation} operation={operation} />
          ))}
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <p className="truncate text-sm font-medium text-foreground">{propertyTitle(property)}</p>
        <p className="truncate text-xs text-muted-foreground">
          {property.neighborhood} · {PROPERTY_TYPE_LABELS[property.propertyType]}
        </p>
        {features.length > 0 && (
          <p className="truncate text-xs text-muted-foreground">{features.join(' · ')}</p>
        )}
        <div className="mt-auto flex flex-col gap-0.5 pt-1.5">
          {priceLines.map((line) => (
            <span key={line.label} className="text-sm font-semibold text-foreground">
              {line.value}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] text-muted-foreground">{property.referenceCode}</span>
          {property.interest.inquiries > 0 && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <MessageCircle className="size-3.5" />
              {property.interest.inquiries}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
