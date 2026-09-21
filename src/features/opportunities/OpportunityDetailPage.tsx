import { ArrowLeft, Link2, SearchX } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '@/app/toast-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PropertyCard } from '@/features/properties/components/PropertyCard'
import { formatShortDate } from '@/lib/format'
import { getUserForContact } from '@/mocks/contacts'
import { BRANCHES } from '@/mocks/organization'
import { findContactSync } from '@/services/contact-service'
import { changeStage, linkProperty, unlinkProperty } from '@/services/opportunity-service'
import { isOwnerOpportunity, stagesFor } from '@/types/opportunity'
import type { LostReason, OpportunityStage } from '@/types/opportunity'
import { CompatiblePropertiesList } from './components/CompatiblePropertiesList'
import { LinkPropertySheet } from './components/LinkPropertySheet'
import { LostReasonSheet } from './components/LostReasonSheet'
import { OpportunityStageBadge } from './components/OpportunityStageBadge'
import { opportunityBudgetLine, opportunityZoneLine } from './opportunity-format'
import { OPPORTUNITY_TYPE_LABELS } from './opportunity-labels'
import { buildOpportunityTimeline } from './opportunity-activity'
import { useOpportunityDetail } from './use-opportunity-detail'
import { VisitListItem } from '@/features/visits/components/VisitListItem'
import { propertyTitle } from '@/features/properties/property-format'

export function OpportunityDetailPage({ opportunityId }: { opportunityId: string | undefined }) {
  const { showToast } = useToast()
  const { opportunity, linkedProperties, compatibleProperties, visits, loading, notFound, refetch } =
    useOpportunityDetail(opportunityId)
  const [linkSheetOpen, setLinkSheetOpen] = useState(false)
  const [lostSheetOpen, setLostSheetOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (notFound || !opportunity) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <SearchX className="size-6" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Oportunidad no encontrada</h1>
            <p className="text-sm text-muted-foreground">Esta oportunidad no existe o fue eliminada.</p>
            <Button nativeButton={false} render={<Link to="/commercial/opportunities" />}>
              Volver a oportunidades
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const contact = findContactSync(opportunity.contactId)
  const agent = getUserForContact(opportunity.assignedUserId)
  const branch = BRANCHES.find((b) => b.id === opportunity.branchId)
  const owner = isOwnerOpportunity(opportunity.type)
  const timeline = buildOpportunityTimeline(opportunity, visits)

  async function handleStageChange(stage: OpportunityStage) {
    if (stage === 'Perdida') {
      setLostSheetOpen(true)
      return
    }
    await changeStage(opportunity!.id, stage)
    showToast(stage === 'Cerrada' ? 'Oportunidad cerrada' : 'Etapa actualizada')
    refetch()
  }

  async function confirmLost(reason: LostReason) {
    await changeStage(opportunity!.id, 'Perdida', reason)
    showToast('Oportunidad marcada como perdida')
    refetch()
  }

  async function handleLink(propertyId: string) {
    await linkProperty(opportunity!.id, propertyId)
    showToast('Propiedad vinculada')
    refetch()
  }

  async function handleUnlink(propertyId: string) {
    await unlinkProperty(opportunity!.id, propertyId)
    refetch()
  }

  return (
    <div className="flex flex-col gap-4">
      <Link
        to="/commercial/opportunities"
        className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver a oportunidades
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-foreground">
              {contact ? (
                <Link to={`/contacts/${contact.id}`} className="hover:underline">
                  {contact.fullName}
                </Link>
              ) : (
                'Contacto'
              )}
            </h1>
            <OpportunityStageBadge stage={opportunity.stage} />
          </div>
          <p className="text-sm text-muted-foreground">
            {OPPORTUNITY_TYPE_LABELS[opportunity.type]} · {agent?.name ?? '—'} · {branch?.name ?? '—'} · Creada el{' '}
            {formatShortDate(opportunity.createdAt)}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-sm font-medium text-foreground outline-none hover:bg-muted">
            Cambiar etapa
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuRadioGroup value={opportunity.stage} onValueChange={(value) => handleStageChange(value as OpportunityStage)}>
              {stagesFor(opportunity.type).map((stage) => (
                <DropdownMenuRadioItem key={stage} value={stage}>
                  {stage}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Tabs defaultValue="resumen">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="visitas">Visitas</TabsTrigger>
          <TabsTrigger value="actividad">Actividad</TabsTrigger>
        </TabsList>

        <TabsContent value="resumen" className="flex flex-col gap-6 pt-4">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-2 lg:col-span-2">
              <h3 className="text-sm font-medium text-foreground">{owner ? 'Intención' : 'Búsqueda'}</h3>
              {owner ? (
                <p className="text-sm text-muted-foreground">{opportunity.ownerPropertyAddress ?? 'Sin dirección registrada.'}</p>
              ) : (
                <div className="flex flex-col gap-1 text-sm text-muted-foreground">
                  {opportunityBudgetLine(opportunity) && <p>Presupuesto: {opportunityBudgetLine(opportunity)}</p>}
                  {opportunityZoneLine(opportunity) && <p>Zona preferida: {opportunityZoneLine(opportunity)}</p>}
                  {opportunity.rooms && <p>Ambientes: {opportunity.rooms}</p>}
                </div>
              )}
              {opportunity.notes && <p className="text-sm text-muted-foreground">{opportunity.notes}</p>}
              {opportunity.lostReason && <p className="text-sm text-danger">Motivo de pérdida: {opportunity.lostReason}</p>}
            </div>
            <div className="rounded-lg border border-border p-4">
              <p className="text-xs text-muted-foreground">Próxima acción</p>
              <p className="text-sm font-medium text-foreground">
                {opportunity.nextActionLabel ?? 'Sin próxima acción'}
                {opportunity.nextActionAt && ` · ${formatShortDate(opportunity.nextActionAt)}`}
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">Propiedades vinculadas</h3>
              <Button variant="outline" size="sm" onClick={() => setLinkSheetOpen(true)} className="gap-1.5">
                <Link2 className="size-4" />
                Vincular propiedad
              </Button>
            </div>
            {linkedProperties.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay propiedades vinculadas.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                {linkedProperties.map((property) => (
                  <div key={property.id} className="flex flex-col gap-1.5">
                    <PropertyCard property={property} />
                    <button
                      type="button"
                      onClick={() => handleUnlink(property.id)}
                      className="text-xs text-muted-foreground hover:text-danger"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {!owner && (
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-foreground">Propiedades compatibles</h3>
              <CompatiblePropertiesList compatible={compatibleProperties} onLink={handleLink} />
            </div>
          )}
        </TabsContent>

        <TabsContent value="visitas" className="pt-4">
          {visits.length === 0 ? (
            <p className="text-sm text-muted-foreground">Todavía no hay visitas para esta oportunidad.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {visits.map((visit) => {
                const property = linkedProperties.find((p) => p.id === visit.propertyId)
                return (
                  <li key={visit.id}>
                    <VisitListItem
                      visit={visit}
                      primaryLabel={property ? propertyTitle(property) : 'Propiedad'}
                      secondaryLabel={getUserForContact(visit.assignedUserId)?.name ?? '—'}
                    />
                  </li>
                )
              })}
            </ul>
          )}
        </TabsContent>

        <TabsContent value="actividad" className="pt-4">
          <ol className="flex flex-col gap-4">
            {timeline.map((event, index) => (
              <li key={event.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="size-2 shrink-0 rounded-full bg-primary" />
                  {index < timeline.length - 1 && <span className="w-px flex-1 bg-border" />}
                </div>
                <div className="pb-4">
                  <p className="text-sm font-medium text-foreground">{event.label}</p>
                  <p className="text-xs text-muted-foreground">{formatShortDate(event.date)}</p>
                </div>
              </li>
            ))}
          </ol>
        </TabsContent>
      </Tabs>

      <LinkPropertySheet
        open={linkSheetOpen}
        onOpenChange={setLinkSheetOpen}
        excludeIds={opportunity.linkedPropertyIds}
        onSelect={handleLink}
      />
      <LostReasonSheet open={lostSheetOpen} onOpenChange={setLostSheetOpen} onConfirm={confirmLost} />
    </div>
  )
}
