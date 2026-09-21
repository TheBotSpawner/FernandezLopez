import { FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatARS, formatDateOnly, formatPrice } from '@/lib/format'
import { ADJUSTMENT_METHOD_LABELS, CONTRACT_STATUS_TONES } from '@/features/administration/contract-labels'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { PropertyMap } from '../PropertyMap'
import { PropertyOwnerCard } from '../PropertyOwnerCard'
import type { Property, PropertyOwner } from '@/types/property'
import type { RentalContract } from '@/types/rental-contract'

interface SummaryField {
  label: string
  value: string
}

function summaryFields(property: Property): SummaryField[] {
  const fields: SummaryField[] = []
  if (property.rooms > 0) fields.push({ label: 'Ambientes', value: String(property.rooms) })
  if (property.bedrooms > 0) fields.push({ label: 'Dormitorios', value: String(property.bedrooms) })
  if (property.bathrooms > 0) fields.push({ label: 'Baños', value: String(property.bathrooms) })
  if (property.surface > 0) fields.push({ label: 'Superficie', value: `${property.surface} m²` })
  if (property.coveredSurface) fields.push({ label: 'Superficie cubierta', value: `${property.coveredSurface} m²` })
  if (property.parkingSpaces) fields.push({ label: 'Cochera', value: String(property.parkingSpaces) })
  if (property.floor) fields.push({ label: 'Piso', value: property.floor })
  return fields
}

export function PropertyResumenTab({
  property,
  owners,
  activeContract,
}: {
  property: Property
  owners: PropertyOwner[]
  activeContract?: RentalContract | null
}) {
  const fields = summaryFields(property)

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-foreground">Descripción</h3>
          <p className="text-sm text-muted-foreground">{property.description}</p>
        </div>

        {fields.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-foreground">Datos de la propiedad</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {fields.map((field) => (
                <div key={field.label} className="rounded-lg bg-muted/50 p-3">
                  <p className="text-sm font-semibold text-foreground">{field.value}</p>
                  <p className="text-xs text-muted-foreground">{field.label}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-foreground">Ubicación</h3>
          <p className="text-sm text-muted-foreground">
            {property.address}
            {property.floor ? ` · ${property.floor}` : ''} · {property.neighborhood}, {property.city}
          </p>
          <PropertyMap properties={[property]} height="280px" />
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {activeContract && (
          <Link
            to={`/administration/contracts/${activeContract.id}`}
            className="flex flex-col gap-2 rounded-lg border border-border p-4 hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <FileText className="size-4" />
                Contrato de alquiler
              </h3>
              <StatusBadge tone={CONTRACT_STATUS_TONES[activeContract.status]}>Activo</StatusBadge>
            </div>
            <p className="text-sm text-muted-foreground">
              {formatARS(activeContract.currentRent)} /mes · {ADJUSTMENT_METHOD_LABELS[activeContract.adjustmentMethod]}
            </p>
            <p className="text-xs text-muted-foreground">Vence el {formatDateOnly(activeContract.endDate)}</p>
          </Link>
        )}
        <div className="rounded-lg border border-border p-4">
          <PropertyOwnerCard owners={owners} />
        </div>
        <div className="rounded-lg border border-border p-4">
          <h3 className="mb-2 text-sm font-medium text-foreground">Operación</h3>
          <div className="flex flex-col gap-1">
            {property.operationTypes.includes('sale') && property.salePrice && (
              <p className="text-sm text-muted-foreground">Venta: {formatPrice(property.salePrice, 'USD')}</p>
            )}
            {property.operationTypes.includes('rent') && property.rentalPrice && (
              <p className="text-sm text-muted-foreground">Alquiler: {formatPrice(property.rentalPrice, 'ARS')} /mes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
