import { ArrowLeft, Calendar, Handshake, Pencil, SearchX } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '@/app/session-context'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OpportunityFormSheet } from '@/features/opportunities/components/OpportunityFormSheet'
import { VisitFormSheet } from '@/features/visits/components/VisitFormSheet'
import { getUserForContact } from '@/mocks/contacts'
import { buildContactTimeline } from './contact-activity'
import { ContactRoleBadges } from './components/ContactRoleBadges'
import { ContactFormSheet } from './components/ContactFormSheet'
import { ContactActivityTab } from './components/tabs/ContactActivityTab'
import { ContactNotesTab } from './components/tabs/ContactNotesTab'
import { ContactOpportunitiesTab } from './components/tabs/ContactOpportunitiesTab'
import { ContactPropertiesTab } from './components/tabs/ContactPropertiesTab'
import { ContactResumenTab } from './components/tabs/ContactResumenTab'
import { ContactVisitsTab } from './components/tabs/ContactVisitsTab'
import { useContactDetail } from './use-contact-detail'

export function ContactDetailPage({ contactId }: { contactId: string | undefined }) {
  const { user } = useSession()
  const { contact, opportunities, visits, relatedProperties, notes, loading, notFound, refetch } = useContactDetail(contactId)
  const [editOpen, setEditOpen] = useState(false)
  const [newOpportunityOpen, setNewOpportunityOpen] = useState(false)
  const [newVisitOpen, setNewVisitOpen] = useState(false)

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (notFound || !contact) {
    return (
      <div className="flex min-h-[60svh] items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <SearchX className="size-6" />
            </div>
            <h1 className="text-lg font-semibold text-foreground">Contacto no encontrado</h1>
            <p className="text-sm text-muted-foreground">Este contacto no existe o fue eliminado.</p>
            <Button nativeButton={false} render={<Link to="/contacts" />}>
              Volver a contactos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const agent = getUserForContact(contact.assignedUserId)
  const timeline = buildContactTimeline(contact, opportunities, visits, notes)
  const relatedPropertyList = Object.values(relatedProperties)

  return (
    <div className="flex flex-col gap-4">
      <Link to="/contacts" className="flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" />
        Volver a contactos
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold text-foreground">{contact.fullName}</h1>
          </div>
          <ContactRoleBadges roles={contact.roles} />
          <p className="text-sm text-muted-foreground">Responsable: {agent?.name ?? '—'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="gap-1.5">
            <Pencil className="size-4" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setNewOpportunityOpen(true)} className="gap-1.5">
            <Handshake className="size-4" />
            Nueva oportunidad
          </Button>
          <Button variant="outline" size="sm" onClick={() => setNewVisitOpen(true)} className="gap-1.5">
            <Calendar className="size-4" />
            Agendar visita
          </Button>
        </div>
      </div>

      <Tabs defaultValue="resumen">
        <TabsList>
          <TabsTrigger value="resumen">Resumen</TabsTrigger>
          <TabsTrigger value="oportunidades">Oportunidades</TabsTrigger>
          <TabsTrigger value="visitas">Visitas</TabsTrigger>
          <TabsTrigger value="propiedades">Propiedades</TabsTrigger>
          <TabsTrigger value="actividad">Actividad</TabsTrigger>
          <TabsTrigger value="notas">Notas</TabsTrigger>
        </TabsList>
        <TabsContent value="resumen" className="pt-4">
          <ContactResumenTab contact={contact} />
        </TabsContent>
        <TabsContent value="oportunidades" className="pt-4">
          <ContactOpportunitiesTab opportunities={opportunities} />
        </TabsContent>
        <TabsContent value="visitas" className="pt-4">
          <ContactVisitsTab visits={visits} relatedProperties={relatedProperties} />
        </TabsContent>
        <TabsContent value="propiedades" className="pt-4">
          <ContactPropertiesTab properties={relatedPropertyList} />
        </TabsContent>
        <TabsContent value="actividad" className="pt-4">
          <ContactActivityTab events={timeline} />
        </TabsContent>
        <TabsContent value="notas" className="pt-4">
          <ContactNotesTab contactId={contact.id} authorUserId={user.id} notes={notes} onAdded={refetch} />
        </TabsContent>
      </Tabs>

      <ContactFormSheet open={editOpen} onOpenChange={setEditOpen} contact={contact} onSaved={refetch} />
      <OpportunityFormSheet
        open={newOpportunityOpen}
        onOpenChange={setNewOpportunityOpen}
        contactId={contact.id}
        onSaved={refetch}
      />
      <VisitFormSheet open={newVisitOpen} onOpenChange={setNewVisitOpen} contactId={contact.id} onSaved={refetch} />
    </div>
  )
}
