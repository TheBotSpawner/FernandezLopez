import { ArrowLeft, SearchX } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '@/app/toast-context'
import logo from '@/assets/fernandez-lopez-logo-800x800.png'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { formatARS } from '@/lib/format'
import { propertyTitle } from '@/features/properties/property-format'
import { ORGANIZATION } from '@/mocks/organization'
import { findContactSync } from '@/services/contact-service'
import { findPropertySync } from '@/services/property-service'
import { findContractSync } from '@/services/rental-contract-service'
import { getSettlementById, updateSettlement } from '@/services/owner-settlement-service'
import { SETTLEMENT_STATUS_LABELS, SETTLEMENT_STATUS_TONES } from './account-labels'
import { formatPeriodLabel } from './account-utils'
import type { OwnerSettlement, SettlementStatus } from '@/types/contract-account'

const STATUS_OPTIONS: SettlementStatus[] = ['DRAFT', 'READY', 'PAID']

export function SettlementDetailPage({ settlementId }: { settlementId: string | undefined }) {
  const { showToast } = useToast()
  const [settlement, setSettlement] = useState<OwnerSettlement | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!settlementId) {
      setLoading(false)
      setNotFound(true)
      return
    }
    setLoading(true)
    getSettlementById(settlementId).then((result) => {
      setSettlement(result)
      setNotFound(!result)
      setLoading(false)
    })
  }, [settlementId])

  async function changeStatus(status: SettlementStatus) {
    if (!settlement) return
    const updated = await updateSettlement(settlement.id, { status })
    setSettlement(updated)
    showToast('Estado actualizado')
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (notFound || !settlement) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <SearchX className="size-6" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Liquidación no encontrada</h1>
            <p className="text-sm text-muted-foreground">Esta liquidación no existe o fue eliminada.</p>
            <Button nativeButton={false} render={<Link to="/administration/settlements" />}>
              Volver a liquidaciones
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const contract = findContractSync(settlement.contractId)
  const property = contract ? findPropertySync(contract.propertyId) : undefined
  const owners = settlement.ownerIds.map((id) => findContactSync(id)).filter((c): c is NonNullable<typeof c> => Boolean(c))

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between print:hidden">
        <Link
          to="/administration/settlements"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver a liquidaciones
        </Link>
        <Select value={settlement.status} onValueChange={(v) => changeStatus(v as SettlementStatus)}>
          <SelectTrigger className="w-36">
            <SelectValue>{(v: string) => SETTLEMENT_STATUS_LABELS[v as SettlementStatus]}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((status) => (
              <SelectItem key={status} value={status}>
                {SETTLEMENT_STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-6 rounded-lg border border-border bg-card p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <img src={logo} alt="" className="size-10 shrink-0" />
            <span className="truncate text-lg font-semibold text-foreground">{ORGANIZATION.name}</span>
          </div>
          <div className="shrink-0">
            <StatusBadge tone={SETTLEMENT_STATUS_TONES[settlement.status]}>{SETTLEMENT_STATUS_LABELS[settlement.status]}</StatusBadge>
          </div>
        </div>

        <div>
          <h1 className="text-xl font-semibold text-foreground">Liquidación al propietario</h1>
          <p className="text-sm text-muted-foreground capitalize">{formatPeriodLabel(settlement.period)}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">{owners.length > 1 ? 'Propietarios' : 'Propietario'}</p>
            <p className="font-medium text-foreground">{owners.map((o) => o.fullName).join(', ') || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Propiedad</p>
            <p className="font-medium text-foreground">{property ? propertyTitle(property) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Contrato</p>
            <p className="font-medium text-foreground">{contract?.contractNumber ?? '—'}</p>
          </div>
        </div>

        <div className="flex flex-col divide-y divide-border rounded-lg border border-border text-sm">
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-foreground">Alquiler cobrado</span>
            <span className="font-medium text-foreground">{formatARS(settlement.grossCollected)}</span>
          </div>
          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-foreground">
              Honorarios {settlement.feeType === 'PERCENTAGE' ? `(${settlement.feeValue}%)` : ''}
            </span>
            <span className="font-medium text-danger">-{formatARS(settlement.administrationFee)}</span>
          </div>
          {settlement.deductions.map((deduction, index) => (
            <div key={index} className="flex items-center justify-between px-3 py-2">
              <span className="text-foreground">{deduction.description}</span>
              <span className="font-medium text-danger">-{formatARS(deduction.amount)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="font-semibold text-foreground">Neto propietario</span>
            <span className="text-lg font-semibold text-foreground">{formatARS(settlement.netAmount)}</span>
          </div>
        </div>

        {settlement.notes && <p className="text-xs text-muted-foreground">{settlement.notes}</p>}

        <p className="text-xs text-muted-foreground italic">
          Regla de honorarios provisoria para el prototipo — pendiente de validar con Fernández López.
        </p>
      </div>
    </div>
  )
}
