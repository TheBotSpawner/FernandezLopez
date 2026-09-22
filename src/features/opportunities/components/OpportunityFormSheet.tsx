import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useToast } from '@/app/toast-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { BRANCHES } from '@/mocks/organization'
import { findContactSync, getContacts } from '@/services/contact-service'
import { createOpportunity } from '@/services/opportunity-service'
import { getPropertyTypes } from '@/services/property-service'
import { getDemoUsers } from '@/services/user-service'
import { isOwnerOpportunity } from '@/types/opportunity'
import type { Contact } from '@/types/contact'
import type { Opportunity, OpportunityType } from '@/types/opportunity'
import type { PropertyType } from '@/types/property'
import { OPPORTUNITY_TYPE_LABELS } from '../opportunity-labels'
import { PROPERTY_TYPE_LABELS } from '@/features/properties/property-labels'

const NEIGHBORHOODS = ['Coghlan', 'Belgrano', 'Villa Urquiza', 'Saavedra', 'Núñez', 'Colegiales', 'Villa Ortúzar']

const opportunitySchema = z
  .object({
    contactId: z.string().min(1, 'Elegí un contacto'),
    type: z.enum(['RENT_SEARCH', 'BUY_SEARCH', 'OWNER_RENT', 'OWNER_SELL']),
    assignedUserId: z.string().min(1, 'Elegí un responsable'),
    branchId: z.string().min(1, 'Elegí una sede'),
    budgetMin: z.string().optional(),
    budgetMax: z.string().optional(),
    currency: z.enum(['ARS', 'USD']).optional(),
    preferredNeighborhoods: z.array(z.string()).optional(),
    propertyTypes: z.array(z.string()).optional(),
    rooms: z.string().optional(),
    ownerPropertyAddress: z.string().optional(),
    notes: z.string().optional(),
    nextActionAt: z.string().optional(),
    nextActionLabel: z.string().optional(),
  })
  .refine((data) => !isOwnerOpportunity(data.type) || Boolean(data.ownerPropertyAddress), {
    message: 'Ingresá la dirección de la propiedad',
    path: ['ownerPropertyAddress'],
  })

type OpportunityFormValues = z.infer<typeof opportunitySchema>

interface OpportunityFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contactId?: string
  onSaved: (opportunity: Opportunity) => void
}

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

export function OpportunityFormSheet({ open, onOpenChange, contactId, onSaved }: OpportunityFormSheetProps) {
  const { showToast } = useToast()
  const users = getDemoUsers()
  const propertyTypes = getPropertyTypes()
  const lockedContact = contactId ? findContactSync(contactId) : undefined

  const [contactSearch, setContactSearch] = useState('')
  const [contactResults, setContactResults] = useState<Contact[]>([])

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      contactId: contactId ?? '',
      type: 'BUY_SEARCH',
      assignedUserId: users[0]?.id ?? '',
      branchId: BRANCHES[0]?.id ?? '',
      currency: 'USD',
      preferredNeighborhoods: [],
      propertyTypes: [],
    },
  })

  useEffect(() => {
    if (!open) return
    reset({
      contactId: contactId ?? '',
      type: 'BUY_SEARCH',
      assignedUserId: users[0]?.id ?? '',
      branchId: BRANCHES[0]?.id ?? '',
      currency: 'USD',
      preferredNeighborhoods: [],
      propertyTypes: [],
    })
    setContactSearch('')
    setContactResults([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, contactId])

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

  const type = watch('type')
  const owner = isOwnerOpportunity(type)
  const selectedContactId = watch('contactId')
  const selectedContact = selectedContactId ? findContactSync(selectedContactId) : undefined

  async function onSubmit(values: OpportunityFormValues) {
    const opportunity = await createOpportunity({
      contactId: values.contactId,
      assignedUserId: values.assignedUserId,
      branchId: values.branchId,
      type: values.type,
      budgetMin: values.budgetMin ? Number(values.budgetMin) : undefined,
      budgetMax: values.budgetMax ? Number(values.budgetMax) : undefined,
      currency: owner ? undefined : values.currency,
      preferredNeighborhoods: owner ? undefined : values.preferredNeighborhoods,
      propertyTypes: owner ? undefined : (values.propertyTypes as PropertyType[] | undefined),
      rooms: values.rooms ? Number(values.rooms) : undefined,
      ownerPropertyAddress: owner ? values.ownerPropertyAddress : undefined,
      notes: values.notes,
      nextActionAt: values.nextActionAt,
      nextActionLabel: values.nextActionLabel,
    })
    showToast('Oportunidad creada')
    onSaved(opportunity)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0">
        <SheetHeader>
          <SheetTitle>Nueva oportunidad</SheetTitle>
        </SheetHeader>

        <form
          id="opportunity-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-2"
        >
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
                        <button
                          type="button"
                          className="text-xs text-primary hover:underline"
                          onClick={() => field.onChange('')}
                        >
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

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Tipo</span>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{(value: string) => OPPORTUNITY_TYPE_LABELS[value as OpportunityType]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(OPPORTUNITY_TYPE_LABELS) as OpportunityType[]).map((option) => (
                      <SelectItem key={option} value={option}>
                        {OPPORTUNITY_TYPE_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {owner ? (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="ownerPropertyAddress" className="text-sm font-medium text-foreground">
                Dirección de la propiedad
              </label>
              <Input id="ownerPropertyAddress" {...register('ownerPropertyAddress')} placeholder="Av. Rivadavia 5200" />
              {errors.ownerPropertyAddress && <p className="text-xs text-danger">{errors.ownerPropertyAddress.message}</p>}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label htmlFor="budgetMin" className="text-sm font-medium text-foreground">
                    Presupuesto mín.
                  </label>
                  <Input id="budgetMin" type="number" {...register('budgetMin')} />
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <label htmlFor="budgetMax" className="text-sm font-medium text-foreground">
                    Presupuesto máx.
                  </label>
                  <Input id="budgetMax" type="number" {...register('budgetMax')} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Moneda</span>
                <Controller
                  control={control}
                  name="currency"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue>{(value: string) => value}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="ARS">ARS</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Barrios preferidos</span>
                <Controller
                  control={control}
                  name="preferredNeighborhoods"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-1.5">
                      {NEIGHBORHOODS.map((neighborhood) => {
                        const active = (field.value ?? []).includes(neighborhood)
                        return (
                          <button
                            key={neighborhood}
                            type="button"
                            aria-pressed={active}
                            onClick={() => field.onChange(toggleValue(field.value ?? [], neighborhood))}
                            className={cn(
                              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                              active
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                            )}
                          >
                            {neighborhood}
                          </button>
                        )
                      })}
                    </div>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-foreground">Tipo de propiedad</span>
                <Controller
                  control={control}
                  name="propertyTypes"
                  render={({ field }) => (
                    <div className="flex flex-wrap gap-1.5">
                      {propertyTypes.map((propertyType) => {
                        const active = (field.value ?? []).includes(propertyType)
                        return (
                          <button
                            key={propertyType}
                            type="button"
                            aria-pressed={active}
                            onClick={() => field.onChange(toggleValue(field.value ?? [], propertyType))}
                            className={cn(
                              'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                              active
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                            )}
                          >
                            {PROPERTY_TYPE_LABELS[propertyType]}
                          </button>
                        )
                      })}
                    </div>
                  )}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="rooms" className="text-sm font-medium text-foreground">
                  Ambientes
                </label>
                <Input id="rooms" type="number" {...register('rooms')} />
              </div>
            </>
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

          <div className="flex items-center gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="nextActionAt" className="text-sm font-medium text-foreground">
                Próxima acción — fecha
              </label>
              <Input id="nextActionAt" type="date" {...register('nextActionAt')} />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="nextActionLabel" className="text-sm font-medium text-foreground">
                Descripción
              </label>
              <Input id="nextActionLabel" maxLength={24} {...register('nextActionLabel')} placeholder="Llamar al contacto" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="opp-notes" className="text-sm font-medium text-foreground">
              Notas
            </label>
            <textarea
              id="opp-notes"
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
          <Button form="opportunity-form" type="submit" className="flex-1" disabled={isSubmitting}>
            Crear oportunidad
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
