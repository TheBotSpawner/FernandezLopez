import { Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/feedback/EmptyState'
import { propertyPriceLines, propertyTitle } from '@/features/properties/property-format'
import type { CompatibleProperty } from '@/services/opportunity-service'

export function CompatiblePropertiesList({
  compatible,
  onLink,
}: {
  compatible: CompatibleProperty[]
  onLink: (propertyId: string) => void
}) {
  if (compatible.length === 0) {
    return <EmptyState icon={Sparkles} message="No encontramos propiedades compatibles con esta búsqueda todavía." />
  }

  return (
    <div className="flex flex-col gap-2">
      {compatible.map(({ property, reasons }) => (
        <div key={property.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
          <img src={property.images[0]} alt="" className="size-14 shrink-0 rounded-md object-cover" />
          <div className="min-w-0 flex-1">
            <Link to={`/properties/${property.id}`} className="truncate text-sm font-medium text-foreground hover:underline">
              {propertyTitle(property)}
            </Link>
            <p className="truncate text-xs text-muted-foreground">
              {propertyPriceLines(property)
                .map((line) => line.value)
                .join(' · ')}
            </p>
            <div className="mt-1 flex flex-wrap gap-1">
              {reasons.map((reason) => (
                <Badge key={reason} variant="outline" className="text-[10px]">
                  {reason}
                </Badge>
              ))}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={() => onLink(property.id)}>
            Vincular
          </Button>
        </div>
      ))}
    </div>
  )
}
