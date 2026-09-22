import { AlertTriangle, FileText } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge, type StatusTone } from '@/components/data-display/StatusBadge'
import { formatARS, formatDateOnly } from '@/lib/format'
import { cn } from '@/lib/utils'
import { propertyTitle } from '@/features/properties/property-format'
import { findContactSync } from '@/services/contact-service'
import { findPropertySync } from '@/services/property-service'
import { getOverdueAmount } from '@/services/contract-charge-service'
import { getCreditBalance } from '@/services/payment-service'
import { ADJUSTMENT_METHOD_LABELS } from '../contract-labels'
import { adjustmentLabel, expirationLabel } from '../contract-format'
import { expirationSeverity } from '../expiration-utils'
import { ContractStatusBadge } from './ContractStatusBadge'
import type { RentalContract } from '@/types/rental-contract'

function ContractRow({ contractId, children }: { contractId: string; children: ReactNode }) {
  const navigate = useNavigate()
  return (
    <tr
      onClick={() => navigate(`/administration/contracts/${contractId}`)}
      className="cursor-pointer transition-colors hover:bg-muted/50"
    >
      {children}
    </tr>
  )
}

function financialStatus(contractId: string): { label: string; tone: StatusTone } {
  const debt = getOverdueAmount(contractId)
  if (debt > 0) return { label: `Debe ${formatARS(debt)}`, tone: 'danger' }
  const credit = getCreditBalance(contractId)
  if (credit > 0) return { label: `Saldo a favor ${formatARS(credit)}`, tone: 'info' }
  return { label: 'Al día', tone: 'success' }
}

export function ContractListView({ contracts, loading }: { contracts: RentalContract[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    )
  }

  if (contracts.length === 0) {
    return <EmptyState icon={FileText} message="No hay contratos con estos filtros." />
  }

  return (
    <>
      <div className="flex flex-col gap-2 md:hidden">
        {contracts.map((contract) => {
          const property = findPropertySync(contract.propertyId)
          const tenant = findContactSync(contract.tenantIds[0])
          const severity = expirationSeverity(contract.endDate)
          return (
            <Link
              key={contract.id}
              to={`/administration/contracts/${contract.id}`}
              className="flex flex-col gap-1.5 rounded-lg border border-border p-3"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{property ? propertyTitle(property) : '—'}</span>
                <ContractStatusBadge status={contract.status} />
              </div>
              <p className="text-xs text-muted-foreground">
                {tenant?.fullName ?? 'Sin inquilino'}
                {contract.tenantIds.length > 1 && ` +${contract.tenantIds.length - 1}`}
              </p>
              <p className="text-sm font-semibold text-foreground">{formatARS(contract.currentRent)}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  Próximo ajuste{' '}
                  {contract.nextAdjustmentDate
                    ? `${formatDateOnly(contract.nextAdjustmentDate)} · ${ADJUSTMENT_METHOD_LABELS[contract.adjustmentMethod]}`
                    : '—'}
                </span>
              </div>
              <div className={cn('flex items-center gap-1 text-xs', severity !== 'normal' && 'font-medium text-danger')}>
                {(severity === 'within30' || severity === 'expired') && <AlertTriangle className="size-3.5" />}
                {expirationLabel(contract.endDate)}
              </div>
              <StatusBadge tone={financialStatus(contract.id).tone} className="self-start">
                {financialStatus(contract.id).label}
              </StatusBadge>
            </Link>
          )
        })}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Propiedad</th>
              <th className="px-3 py-2 font-medium">Inquilino</th>
              <th className="px-3 py-2 font-medium">Alquiler actual</th>
              <th className="px-3 py-2 font-medium">Próximo ajuste</th>
              <th className="px-3 py-2 font-medium">Vencimiento</th>
              <th className="px-3 py-2 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {contracts.map((contract) => {
              const property = findPropertySync(contract.propertyId)
              const tenant = findContactSync(contract.tenantIds[0])
              const severity = expirationSeverity(contract.endDate)
              const adjLabel = adjustmentLabel(contract.nextAdjustmentDate)
              const financial = financialStatus(contract.id)
              return (
                <ContractRow key={contract.id} contractId={contract.id}>
                  <td className="px-3 py-2">
                    <Link
                      to={`/administration/contracts/${contract.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium text-foreground hover:underline"
                    >
                      {property ? propertyTitle(property) : '—'}
                    </Link>
                    <p className="text-xs text-muted-foreground">{contract.contractNumber}</p>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {tenant?.fullName ?? 'Sin inquilino'}
                    {contract.tenantIds.length > 1 && ` +${contract.tenantIds.length - 1}`}
                  </td>
                  <td className="px-3 py-2 font-medium whitespace-nowrap text-foreground">{formatARS(contract.currentRent)}</td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">
                    {contract.nextAdjustmentDate ? (
                      <>
                        {formatDateOnly(contract.nextAdjustmentDate)} · {ADJUSTMENT_METHOD_LABELS[contract.adjustmentMethod]}
                        {adjLabel && <span className="block text-xs">{adjLabel}</span>}
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    <span className={cn(severity !== 'normal' && 'font-medium text-danger', 'flex items-center gap-1')}>
                      {(severity === 'within30' || severity === 'expired') && <AlertTriangle className="size-3.5" />}
                      {formatDateOnly(contract.endDate)}
                    </span>
                    <span className="text-xs text-muted-foreground">{expirationLabel(contract.endDate)}</span>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex max-w-36 flex-wrap items-start gap-1">
                      <ContractStatusBadge status={contract.status} />
                      <StatusBadge tone={financial.tone}>{financial.label}</StatusBadge>
                    </div>
                  </td>
                </ContractRow>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
