import { ArrowLeft, Ban, Calendar, Handshake, Pencil, SearchX } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getPropertyOwners } from '@/services/property-service'
import { OperationBadge, PropertyStatusBadge } from './components/PropertyBadges'
import { PropertyGallery } from './components/PropertyGallery'
import { PropertyComercialTab } from './components/tabs/PropertyComercialTab'
import { PropertyDocumentosTab } from './components/tabs/PropertyDocumentosTab'
import { PropertyHistorialTab } from './components/tabs/PropertyHistorialTab'
import { PropertyResumenTab } from './components/tabs/PropertyResumenTab'
import { PropertyVisitasTab } from './components/tabs/PropertyVisitasTab'
import { propertyPriceLines, propertyTitle } from './property-format'
import { buildPropertyDocuments, buildPropertyHistory } from './property-detail-derivations'
import { PROPERTY_TYPE_LABELS } from './property-labels'
import { usePropertyDetail } from './use-property-detail'

export function PropertyDetailPage({ propertyId }: { propertyId: string | undefined }) {
  const { property, opportunities, visits, activeContract, loading, notFound } = usePropertyDetail(propertyId)

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="aspect-16/9 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    )
  }

  if (notFound || !property) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <SearchX className="size-6" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Propiedad no encontrada</h1>
            <p className="text-sm text-muted-foreground">
              La propiedad que buscás no existe o fue eliminada del portfolio.
            </p>
            <Button nativeButton={false} render={<Link to="/properties" />}>
              Volver a propiedades
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const owners = getPropertyOwners(property.ownerIds)
  const documents = buildPropertyDocuments(property)
  const history = buildPropertyHistory(property)
  const priceLines = propertyPriceLines(property)

  return (
    <div className="flex flex-col gap-4">
      <Link to="/properties" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Volver a propiedades
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-foreground">{propertyTitle(property)}</h1>
            <PropertyStatusBadge status={property.status} />
            {property.operationTypes.map((operation) => (
              <OperationBadge key={operation} operation={operation} />
            ))}
          </div>
          <p className="text-sm text-muted-foreground">
            {property.neighborhood} · {PROPERTY_TYPE_LABELS[property.propertyType]} · {property.referenceCode}
          </p>
        </div>
        <div className="flex flex-col gap-0.5 sm:text-right">
          {priceLines.map((line) => (
            <span key={line.label} className="text-lg font-semibold text-foreground">
              {line.value}
            </span>
          ))}
        </div>
      </div>

      <PropertyGallery images={property.images} title={propertyTitle(property)} />

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" size="sm" disabled title="Disponible en un próximo milestone" className="gap-1.5">
          <Pencil className="size-4" />
          Editar
        </Button>
        <Button variant="outline" size="sm" disabled title="Disponible en un próximo milestone" className="gap-1.5">
          <Calendar className="size-4" />
          Registrar visita
        </Button>
        <Button variant="outline" size="sm" disabled title="Disponible en un próximo milestone" className="gap-1.5">
          <Handshake className="size-4" />
          Crear oportunidad
        </Button>
        <Button variant="outline" size="sm" disabled title="Disponible en un próximo milestone" className="gap-1.5">
          <Ban className="size-4" />
          Cambiar estado
        </Button>
      </div>

      <Tabs defaultValue="resumen">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="comercial">Comercial</TabsTrigger>
          <TabsTrigger value="visitas">Visitas</TabsTrigger>
          <TabsTrigger value="documentos">Documentos</TabsTrigger>
          <TabsTrigger value="historial">Historial</TabsTrigger>
        </TabsList>
        <TabsContent value="resumen" className="pt-4">
          <PropertyResumenTab property={property} owners={owners} activeContract={activeContract} />
        </TabsContent>
        <TabsContent value="comercial" className="pt-4">
          <PropertyComercialTab opportunities={opportunities} />
        </TabsContent>
        <TabsContent value="visitas" className="pt-4">
          <PropertyVisitasTab visits={visits} />
        </TabsContent>
        <TabsContent value="documentos" className="pt-4">
          <PropertyDocumentosTab documents={documents} />
        </TabsContent>
        <TabsContent value="historial" className="pt-4">
          <PropertyHistorialTab events={history} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
