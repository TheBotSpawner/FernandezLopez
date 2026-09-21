import { Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatARS, formatDateOnly } from '@/lib/format'
import { OperationBadge, PropertyStatusBadge } from '@/features/properties/components/PropertyBadges'
import { propertyTitle } from '@/features/properties/property-format'
import { PROPERTY_TYPE_LABELS } from '@/features/properties/property-labels'
import { ADJUSTMENT_FREQUENCY_LABELS, ADJUSTMENT_METHOD_LABELS, GUARANTEE_TYPE_LABELS } from '../../contract-labels'
import type { Contact } from '@/types/contact'
import type { Property } from '@/types/property'
import type { RentalContract } from '@/types/rental-contract'

function ContactRow({ contact }: { contact: Contact }) {
  return (
    <Link to={`/contacts/${contact.id}`} className="flex flex-col gap-1 rounded-lg border border-border p-3 hover:border-primary/40">
      <span className="text-sm font-medium text-foreground hover:underline">{contact.fullName}</span>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Phone className="size-3.5" />
        {contact.phone}
      </span>
      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Mail className="size-3.5" />
        {contact.email}
      </span>
    </Link>
  )
}

export function ContractResumenTab({
  contract,
  property,
  tenants,
  owners,
}: {
  contract: RentalContract
  property: Property | null
  tenants: Contact[]
  owners: Contact[]
}) {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Fecha de inicio</p>
          <p className="text-sm font-medium text-foreground">{formatDateOnly(contract.startDate)}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Fecha de finalización</p>
          <p className="text-sm font-medium text-foreground">{formatDateOnly(contract.endDate)}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Alquiler inicial</p>
          <p className="text-sm font-medium text-foreground">{formatARS(contract.initialRent)}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Alquiler actual</p>
          <p className="text-sm font-medium text-foreground">{formatARS(contract.currentRent)}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Ajuste</p>
          <p className="text-sm font-medium text-foreground">
            {ADJUSTMENT_METHOD_LABELS[contract.adjustmentMethod]} · {ADJUSTMENT_FREQUENCY_LABELS[contract.adjustmentFrequency]}
          </p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Próximo ajuste</p>
          <p className="text-sm font-medium text-foreground">
            {contract.nextAdjustmentDate ? formatDateOnly(contract.nextAdjustmentDate) : 'Sin programar'}
          </p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Depósito</p>
          <p className="text-sm font-medium text-foreground">{contract.deposit ? formatARS(contract.deposit) : '—'}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Garantía</p>
          <p className="text-sm font-medium text-foreground">
            {contract.guaranteeType ? GUARANTEE_TYPE_LABELS[contract.guaranteeType] : '—'}
          </p>
        </div>
      </div>

      {contract.notes && (
        <div className="flex flex-col gap-1">
          <h3 className="text-sm font-medium text-foreground">Notas</h3>
          <p className="text-sm text-muted-foreground">{contract.notes}</p>
        </div>
      )}

      {property && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-foreground">Propiedad</h3>
          <Link
            to={`/properties/${property.id}`}
            className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-primary/40"
          >
            <img src={property.images[0]} alt="" className="size-14 shrink-0 rounded-md object-cover" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-foreground hover:underline">{propertyTitle(property)}</p>
              <p className="truncate text-xs text-muted-foreground">
                {property.neighborhood} · {PROPERTY_TYPE_LABELS[property.propertyType]}
              </p>
              <div className="mt-1 flex gap-1.5">
                <PropertyStatusBadge status={property.status} />
                {property.operationTypes.map((operation) => (
                  <OperationBadge key={operation} operation={operation} />
                ))}
              </div>
            </div>
          </Link>
        </div>
      )}

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-foreground">{tenants.length > 1 ? 'Inquilinos' : 'Inquilino'}</h3>
        {tenants.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin inquilino asignado.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {tenants.map((tenant) => (
              <ContactRow key={tenant.id} contact={tenant} />
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <h3 className="text-sm font-medium text-foreground">{owners.length > 1 ? 'Propietarios' : 'Propietario'}</h3>
        {owners.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin propietario vinculado.</p>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {owners.map((owner) => (
              <ContactRow key={owner.id} contact={owner} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
