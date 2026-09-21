import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useToast } from '@/app/toast-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { propertyTitle } from '@/features/properties/property-format'
import { BRANCHES } from '@/mocks/organization'
import { findContactSync, getContacts } from '@/services/contact-service'
import { getOpportunitiesByContact } from '@/services/opportunity-service'
import { OPPORTUNITY_TYPE_LABELS } from '@/features/opportunities/opportunity-labels'
import { findPropertySync, getProperties } from '@/services/property-service'
import { getDemoUsers } from '@/services/user-service'
import { createVisit, hasConflict } from '@/services/visit-service'
import type { Contact } from '@/types/contact'
import type { Opportunity } from '@/types/opportunity'
import type { Property } from '@/types/property'
import type { Visit } from '@/types/visit'

const visitSchema = z.object({
  contactId: z.string().min(1, 'Elegí un contacto'),
  opportunityId: z.string().optional(),
  propertyId: z.string().min(1, 'Elegí una propiedad'),
  assignedUserId: z.string().min(1, 'Elegí un responsable'),
  branchId: z.string().min(1, 'Elegí una sede'),
  date: z.string().min(1, 'Elegí una fecha'),
  time: z.string().min(1, 'Elegí un horario'),
  notes: z.string().optional(),
})

type VisitFormValues = z.infer<typeof visitSchema>

interface VisitFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactId?: string
  opportunityId?: string
  propertyId?: string
  onSaved: (visit: Visit) => void
}

export function VisitFormSheet({ open, onOpenChange, contactId, opportunityId, propertyId, onSaved }: VisitFormSheetProps) {
  const { showToast } = useToast()
  const users = getDemoUsers()
  const lockedContact = contactId ? findContactSync(contactId) : undefined
  const lockedProperty = propertyId ? findPropertySync(propertyId) : undefined

  const [contactSearch, setContactSearch] = useState('')
  const [contactResults, setContactResults] = useState<Contact[]>([])
  const [propertySearch, setPropertySearch] = useState('')
  const [propertyResults, setPropertyResults] = useState<Property[]>([])
  const [contactOpportunities, setContactOpportunities] = useState<Opportunity[]>([])

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<VisitFormValues>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      contactId: contactId ?? '',
      opportunityId: opportunityId ?? '',
      propertyId: propertyId ?? '',
      assignedUserId: lockedContact?.assignedUserId ?? users[0]?.id ?? '',
      branchId: lockedContact?.branchId ?? BRANCHES[0]?.id ?? '',
      time: '10:00',
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      contactId: contactId ?? '',
      opportunityId: opportunityId ?? '',
      propertyId: propertyId ?? '',
      assignedUserId: lockedContact?.assignedUserId ?? users[0]?.id ?? '',
      branchId: lockedContact?.branchId ?? BRANCHES[0]?.id ?? '',
      time: '10:00',
    })
    setContactSearch('')
    setContactResults([])
    setPropertySearch('')
    setPropertyResults([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contactId, opportunityId, propertyId])

  const selectedContactId = watch('contactId')
  const selectedContact = selectedContactId ? findContactSync(selectedContactId) : undefined
  const selectedPropertyId = watch('propertyId')
  const selectedProperty = selectedPropertyId ? (lockedProperty ?? findPropertySync(selectedPropertyId)) : undefined
  const selectedAssignedUserId = watch('assignedUserId')
  const date = watch('date')
  const time = watch('time')

  useEffect(() => {
    if (!contactSearch || lockedContact) {
      setContactResults([])
      return
    }
    let cancelled = false
    getContacts({ search: contactSearch }).then((result) => {
      if (!cancelled) setContactResults(result.slice(0, 6))
    })
    return () => {
      cancelled = true
    }
  }, [contactSearch, lockedContact])

  useEffect(() => {
    if (!propertySearch || lockedProperty) {
      setPropertyResults([])
      return
    }
    let cancelled = false
    getProperties({ search: propertySearch }).then((result) => {
      if (!cancelled) setPropertyResults(result.slice(0, 6))
    })
    return () => {
      cancelled = true
    }
  }, [propertySearch, lockedProperty])

  useEffect(() => {
    setContactOpportunities(selectedContactId ? getOpportunitiesByContact(selectedContactId) : [])
  }, [selectedContactId])

  const startAt = date && time ? new Date(`${date}T${time}`).toISOString() : null
  const endAt = startAt ? new Date(new Date(startAt).getTime() + 45 * 60_000).toISOString() : null
  const conflict = Boolean(startAt && endAt && selectedAssignedUserId && hasConflict(selectedAssignedUserId, startAt, endAt))

  async function onSubmit(values: VisitFormValues) {
    const start = new Date(`${values.date}T${values.time}`).toISOString()
    const end = new Date(new Date(start).getTime() + 45 * 60_000).toISOString()
    const visit = await createVisit({
      contactId: values.contactId,
      opportunityId: values.opportunityId || undefined,
      propertyId: values.propertyId,
      assignedUserId: values.assignedUserId,
      branchId: values.branchId,
      startAt: start,
      endAt: end,
      notes: values.notes,
    })
    showToast('Visita agendada')
    onSaved(visit)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0">
        <SheetHeader>
          <SheetTitle>Agendar visita</SheetTitle>
        </SheetHeader>

        <form id="visit-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Contacto</span>
            {lockedContact ? (
              <p className="rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-sm text-foreground">
                {lockedContact.fullName}
              </p>
            ) : (
              <Controller
                control={control}
                name="contactId"
                render={({ field }) => (
                  <div className="flex flex-col gap-1.5">
                    {selectedContact ? (
                      <div className="flex items-center justify-between rounded-lg border border-border px-2.5 py-1.5 text-sm">
                        <span className="text-foreground">{selectedContact.fullName}</span>
                        <button type="button" className="text-xs text-primary hover:underline" onClick={() => field.onChange('')}>
                          Cambiar
                        </button>
                      </div>
                    ) : (
                      <>
                        <Input
                          value={contactSearch}
                          onChange={(event) => setContactSearch(event.target.value)}
                          placeholder="Buscar contacto..."
                        />
                        {contactResults.length > 0 && (
                          <div className="flex flex-col overflow-hidden rounded-lg border border-border">
                            {contactResults.map((result) => (
                              <button
                                key={result.id}
                                type="button"
                                onClick={() => {
                                  field.onChange(result.id)
                                  setContactSearch('')
                                }}
                                className="px-2.5 py-1.5 text-left text-sm hover:bg-muted"
                              >
                                {result.fullName}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              />
            )}
            {errors.contactId && <p className="text-xs text-danger">{errors.contactId.message}</p>}
          </div>

          {!opportunityId && contactOpportunities.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Oportunidad (opcional)</span>
              <Controller
                control={control}
                name="opportunityId"
                render={({ field }) => (
                  <Select value={field.value || 'none'} onValueChange={(value) => field.onChange(value === 'none' ? '' : value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string) => {
                          if (value === 'none' || !value) return 'Sin oportunidad'
                          const opportunity = contactOpportunities.find((o) => o.id === value)
                          return opportunity ? `${OPPORTUNITY_TYPE_LABELS[opportunity.type]} · ${opportunity.stage}` : value
                        }}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin oportunidad</SelectItem>
                      {contactOpportunities.map((opportunity) => (
                        <SelectItem key={opportunity.id} value={opportunity.id}>
                          {OPPORTUNITY_TYPE_LABELS[opportunity.type]} · {opportunity.stage}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Propiedad</span>
            {lockedProperty ? (
              <p className="rounded-lg border border-border bg-muted/50 px-2.5 py-1.5 text-sm text-foreground">
                {propertyTitle(lockedProperty)}
              </p>
            ) : (
              <Controller
                control={control}
                name="propertyId"
                render={({ field }) => (
                  <div className="flex flex-col gap-1.5">
                    {selectedProperty ? (
                      <div className="flex items-center justify-between rounded-lg border border-border px-2.5 py-1.5 text-sm">
                        <span className="text-foreground">{propertyTitle(selectedProperty)}</span>
                        <button type="button" className="text-xs text-primary hover:underline" onClick={() => field.onChange('')}>
                          Cambiar
                        </button>
                      </div>
                    ) : (
                      <>
                        <Input
                          value={propertySearch}
                          onChange={(event) => setPropertySearch(event.target.value)}
                          placeholder="Buscar propiedad..."
                        />
                        {propertyResults.length > 0 && (
                          <div className="flex flex-col overflow-hidden rounded-lg border border-border">
                            {propertyResults.map((result) => (
                              <button
                                key={result.id}
                                type="button"
                                onClick={() => {
                                  field.onChange(result.id)
                                  setPropertySearch('')
                                }}
                                className="px-2.5 py-1.5 text-left text-sm hover:bg-muted"
                              >
                                {propertyTitle(result)}
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              />
            )}
            {errors.propertyId && <p className="text-xs text-danger">{errors.propertyId.message}</p>}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="visit-date" className="text-sm font-medium text-foreground">
                Fecha
              </label>
              <Input id="visit-date" type="date" {...register('date')} />
              {errors.date && <p className="text-xs text-danger">{errors.date.message}</p>}
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="visit-time" className="text-sm font-medium text-foreground">
                Horario
              </label>
              <Input id="visit-time" type="time" {...register('time')} />
              {errors.time && <p className="text-xs text-danger">{errors.time.message}</p>}
            </div>
          </div>

          {conflict && (
            <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-2.5 py-1.5 text-xs text-warning">
              <AlertTriangle className="size-3.5 shrink-0" />
              El responsable ya tiene otra visita agendada en ese horario.
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Responsable</span>
            <Controller
              control={control}
              name="assignedUserId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{(value: string) => users.find((u) => u.id === value)?.name ?? value}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Sede</span>
            <Controller
              control={control}
              name="branchId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{(value: string) => BRANCHES.find((b) => b.id === value)?.name ?? value}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {BRANCHES.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="visit-notes" className="text-sm font-medium text-foreground">
              Notas
            </label>
            <textarea
              id="visit-notes"
              {...register('notes')}
              rows={3}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>
        </form>

        <SheetFooter className="flex-row">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button form="visit-form" type="submit" className="flex-1" disabled={isSubmitting}>
            Agendar visita
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
