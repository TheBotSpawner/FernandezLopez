import { ArrowLeft, Building2, SearchX } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatARS, formatDateOnly } from '@/lib/format'
import { propertyTitle } from '@/features/properties/property-format'
import { BRANCHES } from '@/mocks/organization'
import { buildContractDocuments, buildContractHistory } from './contract-detail-derivations'
import { ADJUSTMENT_METHOD_LABELS } from './contract-labels'
import { AdjustmentPreview } from './components/AdjustmentPreview'
import { ContractDocumentsTab } from './components/tabs/ContractDocumentsTab'
import { ContractHistoryTab } from './components/tabs/ContractHistoryTab'
import { ContractAccountTab } from './components/tabs/ContractAccountTab'
import { ContractMovementsTab } from './components/tabs/ContractMovementsTab'
import { ContractObligationsTab } from './components/tabs/ContractObligationsTab'
import { ContractResumenTab } from './components/tabs/ContractResumenTab'
import { ContractStatusBadge } from './components/ContractStatusBadge'
import { ExpirationAlert } from './components/ExpirationAlert'
import { useContractDetail } from './use-contract-detail'

export function ContractDetailPage({ contractId }: { contractId: string | undefined }) {
  const { contract, property, tenants, owners, loading, notFound } = useContractDetail(contractId)
  const [accountRefreshToken, setAccountRefreshToken] = useState(0)

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (notFound || !contract) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <SearchX className="size-6" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Contrato no encontrado</h1>
            <p className="text-sm text-muted-foreground">Este contrato no existe o fue eliminado.</p>
            <Button nativeButton={false} render={<Link to="/administration/contracts" />}>
              Volver a contratos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const branch = BRANCHES.find((b) => b.id === contract.branchId)
  const documents = buildContractDocuments(contract)
  const history = buildContractHistory(contract)

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/administration/contracts"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a contratos
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-foreground">{property ? propertyTitle(property) : 'Contrato'}</h1>
            <ContractStatusBadge status={contract.status} />
          </div>
          <p className="text-sm text-muted-foreground">
            {property?.neighborhood ?? '—'} · {branch?.name ?? '—'} · {contract.contractNumber}
          </p>
        </div>
        {property && (
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link to={`/properties/${property.id}`} state={{ from: 'contract', contractId: contract.id }} />}
            className="gap-1.5"
          >
            <Building2 className="size-4" />
            Ver propiedad
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Alquiler actual</p>
          <p className="text-lg font-semibold text-foreground">{formatARS(contract.currentRent)}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Próximo ajuste</p>
          <p className="text-lg font-semibold text-foreground">
            {contract.nextAdjustmentDate ? formatDateOnly(contract.nextAdjustmentDate) : '—'}
          </p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Índice</p>
          <p className="text-lg font-semibold text-foreground">{ADJUSTMENT_METHOD_LABELS[contract.adjustmentMethod]}</p>
        </div>
        <div className="rounded-lg border border-border p-3">
          <p className="text-xs text-muted-foreground">Finalización</p>
          <p className="text-lg font-semibold text-foreground">{formatDateOnly(contract.endDate)}</p>
        </div>
      </div>

      <ExpirationAlert endDate={contract.endDate} />
      {contract.status === 'ACTIVE' && (
        <AdjustmentPreview
          currentRent={contract.currentRent}
          method={contract.adjustmentMethod}
          nextAdjustmentDate={contract.nextAdjustmentDate}
        />
      )}

      <Tabs defaultValue="resumen">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="conceptos">Conceptos</TabsTrigger>
          <TabsTrigger value="cuenta">Cuenta mensual</TabsTrigger>
          <TabsTrigger value="movimientos">Movimientos</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="resumen" className="pt-4">
          <ContractResumenTab contract={contract} property={property} tenants={tenants} owners={owners} />
        </TabsContent>
        <TabsContent value="conceptos" className="pt-4">
          <ContractObligationsTab contractId={contract.id} obligations={contract.obligations} />
        </TabsContent>
        <TabsContent value="cuenta" className="pt-4">
          <ContractAccountTab contractId={contract.id} onChanged={() => setAccountRefreshToken((t) => t + 1)} />
        </TabsContent>
        <TabsContent value="movimientos" className="pt-4">
          <ContractMovementsTab contractId={contract.id} refreshToken={accountRefreshToken} />
        </TabsContent>
        <TabsContent value="documentos" className="pt-4">
          <ContractDocumentsTab documents={documents} />
        </TabsContent>
        <TabsContent value="historial" className="pt-4">
          <ContractHistoryTab events={history} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
