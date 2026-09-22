import { ArrowLeft, Printer, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import logo from '@/assets/fernandez-lopez-logo-800x800.png'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { formatARS, formatDateOnly } from '@/lib/format'
import { propertyTitle } from '@/features/properties/property-format'
import { ORGANIZATION } from '@/mocks/organization'
import { findContactSync } from '@/services/contact-service'
import { findPropertySync } from '@/services/property-service'
import { findContractSync } from '@/services/rental-contract-service'
import { findReceiptSync } from '@/services/receipt-service'
import { PAYMENT_METHOD_LABELS } from './account-labels'
import { formatPeriodLabel } from './account-utils'

export function ReceiptPage({ contractId, receiptId }: { contractId: string | undefined; receiptId: string | undefined }) {
  const receipt = receiptId ? findReceiptSync(receiptId) : undefined
  const contract = contractId ? findContractSync(contractId) : undefined

  if (!receipt || !contract || receipt.contractId !== contractId) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <SearchX className="size-6" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Recibo no encontrado</h1>
            <p className="text-sm text-muted-foreground">Este recibo no existe o fue eliminado.</p>
            <Button nativeButton={false} render={<Link to={`/administration/contracts/${contractId ?? ''}`} />}>
              Volver al contrato
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const property = findPropertySync(contract.propertyId)
  const tenants = contract.tenantIds.map((id) => findContactSync(id)).filter((c): c is NonNullable<typeof c> => Boolean(c))

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center justify-between print:hidden">
        <Link
          to={`/administration/contracts/${contract.id}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Volver al contrato
        </Link>
        <Button size="sm" onClick={() => window.print()} className="gap-1.5">
          <Printer className="size-4" />
          Imprimir
        </Button>
      </div>

      <div className="flex flex-col gap-6 rounded-lg border border-border bg-card p-8 print:border-none print:p-0">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <img src={logo} alt="" className="size-10 shrink-0" />
            <span className="truncate text-lg font-semibold text-foreground">{ORGANIZATION.name}</span>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm font-semibold whitespace-nowrap text-foreground">RECIBO Nº {receipt.number}</p>
            <p className="text-xs whitespace-nowrap text-muted-foreground">{formatDateOnly(receipt.date)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Propiedad</p>
            <p className="font-medium text-foreground">{property ? propertyTitle(property) : '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{tenants.length > 1 ? 'Inquilinos' : 'Inquilino'}</p>
            <p className="font-medium text-foreground">{tenants.map((t) => t.fullName).join(', ') || '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Contrato</p>
            <p className="font-medium text-foreground">{contract.contractNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Período</p>
            <p className="font-medium text-foreground capitalize">{formatPeriodLabel(receipt.period)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-muted-foreground">Conceptos abonados</p>
          <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
            {receipt.items.map((item, index) => (
              <div key={index} className="flex items-center justify-between px-3 py-2 text-sm">
                <span className="text-foreground">{item.description}</span>
                <span className="font-medium text-foreground">{formatARS(item.amount)}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-between border-t border-border pt-2">
            <span className="text-sm font-semibold text-foreground">TOTAL</span>
            <span className="text-lg font-semibold text-foreground">{formatARS(receipt.total)}</span>
          </div>
        </div>

        <div className="text-sm">
          <p className="text-xs text-muted-foreground">Medio de pago</p>
          <p className="font-medium text-foreground">{PAYMENT_METHOD_LABELS[receipt.paymentMethod]}</p>
        </div>

        {receipt.notes && <p className="text-xs text-muted-foreground">{receipt.notes}</p>}
      </div>
    </div>
  )
}
