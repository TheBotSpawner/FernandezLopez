import { FileText, Mail, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSession } from '@/app/session-context'
import { formatARS, formatDateOnly, formatShortDate, formatVisitDay } from '@/lib/format'
import { getUserForContact } from '@/mocks/contacts'
import { ADJUSTMENT_METHOD_LABELS } from '@/features/administration/contract-labels'
import { ContractStatusBadge } from '@/features/administration/components/ContractStatusBadge'
import { findPropertySync } from '@/services/property-service'
import { getContractsByContact } from '@/services/rental-contract-service'
import { getOverdueAmount } from '@/services/contract-charge-service'
import { getCreditBalance } from '@/services/payment-service'
import { propertyTitle } from '@/features/properties/property-format'
import type { Contact } from '@/types/contact'

export function ContactResumenTab({ contact }: { contact: Contact }) {
  const { user } = useSession()
  const agent = getUserForContact(contact.assignedUserId)
  const contracts = getContractsByContact(contact.id)
  // Agents don't get organization-wide rental financial totals surfaced from a contact page.
  const showBalance = user.role !== 'AGENT'

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-4 lg:col-span-2">
        <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Phone className="size-4 text-muted-foreground" />
            {contact.phone}
          </div>
          <div className="flex items-center gap-2 text-sm text-foreground">
            <Mail className="size-4 text-muted-foreground" />
            {contact.email}
          </div>
        </div>

        {contact.notes && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-foreground">Notas</h3>
            <p className="text-sm text-muted-foreground">{contact.notes}</p>
          </div>
        )}

        {contracts.length > 0 && (
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-foreground">Contratos de alquiler</h3>
            <div className="flex flex-col gap-2">
              {contracts.map((contract) => {
                const property = findPropertySync(contract.propertyId)
                const role = contract.tenantIds.includes(contact.id) ? 'Inquilino' : 'Propietario'
                const debt = showBalance ? getOverdueAmount(contract.id) : 0
                const credit = showBalance ? getCreditBalance(contract.id) : 0
                return (
                  <Link
                    key={contract.id}
                    to={`/administration/contracts/${contract.id}`}
                    className="flex items-center gap-3 rounded-lg border border-border p-3 hover:border-primary/40"
                  >
                    <FileText className="size-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground hover:underline">
                        {property ? propertyTitle(property) : contract.contractNumber}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {role} · {formatARS(contract.currentRent)} · {ADJUSTMENT_METHOD_LABELS[contract.adjustmentMethod]} · vence{' '}
                        {formatDateOnly(contract.endDate)}
                      </p>
                      {showBalance && (debt > 0 || credit > 0) && (
                        <p className={`text-xs font-medium ${debt > 0 ? 'text-danger' : 'text-info'}`}>
                          {debt > 0 ? `Debe ${formatARS(debt)}` : `Saldo a favor ${formatARS(credit)}`}
                        </p>
                      )}
                    </div>
                    <ContractStatusBadge status={contract.status} />
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
        <div>
          <p className="text-xs text-muted-foreground">Responsable</p>
          <p className="text-sm font-medium text-foreground">{agent?.name ?? '—'}</p>
        </div>
        {contact.source && (
          <div>
            <p className="text-xs text-muted-foreground">Origen</p>
            <p className="text-sm font-medium text-foreground">{contact.source}</p>
          </div>
        )}
        <div>
          <p className="text-xs text-muted-foreground">Última actividad</p>
          <p className="text-sm font-medium text-foreground">{formatVisitDay(contact.lastActivityAt)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Contacto desde</p>
          <p className="text-sm font-medium text-foreground">{formatShortDate(contact.createdAt)}</p>
        </div>
      </div>
    </div>
  )
}
