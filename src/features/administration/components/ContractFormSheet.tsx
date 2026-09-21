import { zodResolver } from '@hookform/resolvers/zod'
import { AlertTriangle, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useToast } from '@/app/toast-context'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { propertyTitle } from '@/features/properties/property-format'
import { BRANCHES } from '@/mocks/organization'
import { findContactByPhone, findContactSync, getContacts } from '@/services/contact-service'
import { getProperties, getPropertyOwners } from '@/services/property-service'
import { createContract } from '@/services/rental-contract-service'
import { ADJUSTMENT_FREQUENCY_LABELS, ADJUSTMENT_METHOD_LABELS, GUARANTEE_TYPE_LABELS } from '../contract-labels'
import type { Contact } from '@/types/contact'
import type { Property } from '@/types/property'
import type { AdjustmentFrequency, AdjustmentMethod, GuaranteeType, RentalContract } from '@/types/rental-contract'

const contractSchema = z
  .object({
    propertyId: z.string().min(1, 'Elegí una propiedad'),
    branchId: z.string().min(1),
    tenantIds: z.array(z.string()).min(1, 'Elegí al menos un inquilino'),
    ownerIds: z.array(z.string()).min(1, 'Elegí al menos un propietario'),
    startDate: z.string().min(1, 'Elegí una fecha de inicio'),
    endDate: z.string().min(1, 'Elegí una fecha de finalización'),
    initialRent: z.string().min(1, 'Ingresá el monto inicial'),
    currentRent: z.string().min(1, 'Ingresá el alquiler actual'),
    currency: z.enum(['ARS', 'USD']),
    adjustmentMethod: z.enum(['IPC', 'ICL', 'MANUAL', 'OTHER']),
    adjustmentFrequency: z.enum(['QUARTERLY', 'FOUR_MONTHLY', 'SEMIANNUAL', 'ANNUAL', 'CUSTOM']),
    nextAdjustmentDate: z.string().optional(),
    deposit: z.string().optional(),
    guaranteeType: z.enum(['OWNER_GUARANTEE', 'INSURANCE', 'PAYSLIP', 'GUARANTOR', 'OTHER']).optional(),
    notes: z.string().optional(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: 'Debe ser posterior a la fecha de inicio',
    path: ['endDate'],
  })

export type ContractFormValues = z.infer<typeof contractSchema>
export type ContractFieldConfidence = Partial<Record<'adjustmentMethod' | 'deposit' | 'guaranteeType', 'medium'>>

const DEFAULT_VALUES: ContractFormValues = {
  propertyId: '',
  branchId: BRANCHES[0]?.id ?? '',
  tenantIds: [],
  ownerIds: [],
  startDate: '',
  endDate: '',
  initialRent: '',
  currentRent: '',
  currency: 'ARS',
  adjustmentMethod: 'IPC',
  adjustmentFrequency: 'QUARTERLY',
  nextAdjustmentDate: '',
  deposit: '',
  guaranteeType: undefined,
  notes: '',
}

interface ContractFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: (contract: RentalContract) => void
  title?: string
  reviewMode?: boolean
  reviewFieldConfidence?: ContractFieldConfidence
  defaultValues?: Partial<ContractFormValues>
}

function ContactPicker({
  label,
  selectedIds,
  onChange,
  placeholder,
}: {
  label: string
  selectedIds: string[]
  onChange: (ids: string[]) => void
  placeholder: string
}) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Contact[]>([])

  useEffect(() => {
    if (!search) {
      setResults([])
      return
    }
    let cancelled = false
    getContacts({ search }).then((result) => {
      if (!cancelled) setResults(result.filter((c) => !selectedIds.includes(c.id)).slice(0, 6))
    })
    return () => {
      cancelled = true
    }
  }, [search, selectedIds])

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm font-medium text-foreground">{label}</span>
      {selectedIds.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedIds.map((id) => (
            <SelectedContactChip key={id} contactId={id} onRemove={() => onChange(selectedIds.filter((s) => s !== id))} />
          ))}
        </div>
      )}
      <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={placeholder} />
      {results.length > 0 && (
        <div className="flex flex-col overflow-hidden rounded-lg border border-border">
          {results.map((contact) => (
            <button
              key={contact.id}
              type="button"
              onClick={() => {
                onChange([...selectedIds, contact.id])
                setSearch('')
              }}
              className="px-2.5 py-1.5 text-left text-sm hover:bg-muted"
            >
              {contact.fullName}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function SelectedContactChip({ contactId, onRemove }: { contactId: string; onRemove: () => void }) {
  const contact = findContactSync(contactId)

  return (
    <Badge variant="outline" className="gap-1 pr-1">
      {contact?.fullName ?? '…'}
      <button type="button" onClick={onRemove} className="rounded-full p-0.5 hover:bg-muted">
        <X className="size-3" />
      </button>
    </Badge>
  )
}

export function ContractFormSheet({
  open,
  onOpenChange,
  onSaved,
  title = 'Nuevo contrato',
  reviewMode = false,
  reviewFieldConfidence = {},
  defaultValues,
}: ContractFormSheetProps) {
  const { showToast } = useToast()
  const [propertySearch, setPropertySearch] = useState('')
  const [propertyResults, setPropertyResults] = useState<Property[]>([])
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: { ...DEFAULT_VALUES, ...defaultValues },
  })

  useEffect(() => {
    if (!open) return
    reset({ ...DEFAULT_VALUES, ...defaultValues })
    setPropertySearch('')
    setPropertyResults([])
    if (defaultValues?.propertyId) {
      getProperties({}).then((all) => setSelectedProperty(all.find((p) => p.id === defaultValues.propertyId) ?? null))
    } else {
      setSelectedProperty(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  useEffect(() => {
    if (!propertySearch) {
      setPropertyResults([])
      return
    }
    let cancelled = false
    getProperties({ search: propertySearch, operation: 'rent' }).then((result) => {
      if (!cancelled) setPropertyResults(result.slice(0, 6))
    })
    return () => {
      cancelled = true
    }
  }, [propertySearch])

  const ownerIds = watch('ownerIds')

  async function selectProperty(property: Property) {
    setSelectedProperty(property)
    setValue('propertyId', property.id)
    setValue('branchId', property.branchId)
    setPropertySearch('')
    setPropertyResults([])
    if (property.rentalPrice) {
      setValue('currentRent', String(property.rentalPrice))
      if (!watch('initialRent')) setValue('initialRent', String(property.rentalPrice))
      if (!watch('deposit')) setValue('deposit', String(property.rentalPrice))
    }
    if (ownerIds.length === 0) {
      const owners = getPropertyOwners(property.ownerIds)
      const ownerContactIds = owners.map((owner) => findContactByPhone(owner.phone)?.id).filter((id): id is string => Boolean(id))
      if (ownerContactIds.length > 0) setValue('ownerIds', ownerContactIds)
    }
  }

  async function onSubmit(values: ContractFormValues) {
    const contract = await createContract({
      propertyId: values.propertyId,
      branchId: values.branchId,
      tenantIds: values.tenantIds,
      ownerIds: values.ownerIds,
      startDate: values.startDate,
      endDate: values.endDate,
      initialRent: Number(values.initialRent),
      currentRent: Number(values.currentRent),
      currency: values.currency,
      adjustmentMethod: values.adjustmentMethod,
      adjustmentFrequency: values.adjustmentFrequency,
      nextAdjustmentDate: values.nextAdjustmentDate || undefined,
      deposit: values.deposit ? Number(values.deposit) : undefined,
      guaranteeType: values.guaranteeType,
      notes: values.notes,
    })
    showToast('Contrato creado')
    onSaved(contract)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <form id="contract-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-2">
          {reviewMode && (
            <div className="flex items-center gap-2 rounded-lg border border-warning/40 bg-warning/10 px-3 py-2 text-sm text-warning">
              <AlertTriangle className="size-4 shrink-0" />
              Revisá los datos antes de confirmar.
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Propiedad</span>
            {selectedProperty ? (
              <div className="flex items-center justify-between rounded-lg border border-border px-2.5 py-1.5 text-sm">
                <span className="text-foreground">{propertyTitle(selectedProperty)}</span>
                <button
                  type="button"
                  className="text-xs text-primary hover:underline"
                  onClick={() => {
                    setSelectedProperty(null)
                    setValue('propertyId', '')
                  }}
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <>
                <Input
                  value={propertySearch}
                  onChange={(event) => setPropertySearch(event.target.value)}
                  placeholder="Buscar propiedad en alquiler..."
                />
                {propertyResults.length > 0 && (
                  <div className="flex flex-col overflow-hidden rounded-lg border border-border">
                    {propertyResults.map((property) => (
                      <button
                        key={property.id}
                        type="button"
                        onClick={() => selectProperty(property)}
                        className="flex items-center gap-2.5 px-2.5 py-1.5 text-left text-sm hover:bg-muted"
                      >
                        <img src={property.images[0]} alt="" className="size-8 shrink-0 rounded object-cover" />
                        {propertyTitle(property)}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
            {errors.propertyId && <p className="text-xs text-danger">{errors.propertyId.message}</p>}
          </div>

          <Controller
            control={control}
            name="tenantIds"
            render={({ field }) => (
              <ContactPicker label="Inquilino(s)" selectedIds={field.value} onChange={field.onChange} placeholder="Buscar contacto..." />
            )}
          />
          {errors.tenantIds && <p className="-mt-2 text-xs text-danger">{errors.tenantIds.message}</p>}

          <Controller
            control={control}
            name="ownerIds"
            render={({ field }) => (
              <ContactPicker label="Propietario(s)" selectedIds={field.value} onChange={field.onChange} placeholder="Buscar contacto..." />
            )}
          />
          {errors.ownerIds && <p className="-mt-2 text-xs text-danger">{errors.ownerIds.message}</p>}

          <div className="flex items-center gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="startDate" className="text-sm font-medium text-foreground">
                Fecha de inicio
              </label>
              <Input id="startDate" type="date" {...register('startDate')} />
              {errors.startDate && <p className="text-xs text-danger">{errors.startDate.message}</p>}
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="endDate" className="text-sm font-medium text-foreground">
                Fecha de finalización
              </label>
              <Input id="endDate" type="date" {...register('endDate')} />
              {errors.endDate && <p className="text-xs text-danger">{errors.endDate.message}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="initialRent" className="text-sm font-medium text-foreground">
                Monto inicial
              </label>
              <Input id="initialRent" type="number" {...register('initialRent')} />
              {errors.initialRent && <p className="text-xs text-danger">{errors.initialRent.message}</p>}
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="currentRent" className="text-sm font-medium text-foreground">
                Alquiler actual
              </label>
              <Input id="currentRent" type="number" {...register('currentRent')} />
              {errors.currentRent && <p className="text-xs text-danger">{errors.currentRent.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Moneda</span>
              <Controller
                control={control}
                name="currency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-24">
                      <SelectValue>{(value: string) => value}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ARS">ARS</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                Método de ajuste
                {reviewFieldConfidence.adjustmentMethod === 'medium' && (
                  <Badge variant="outline" className="text-[10px] text-warning">
                    Confianza media
                  </Badge>
                )}
              </span>
              <Controller
                control={control}
                name="adjustmentMethod"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue>{(value: string) => ADJUSTMENT_METHOD_LABELS[value as AdjustmentMethod]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ADJUSTMENT_METHOD_LABELS) as AdjustmentMethod[]).map((method) => (
                        <SelectItem key={method} value={method}>
                          {ADJUSTMENT_METHOD_LABELS[method]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Periodicidad</span>
              <Controller
                control={control}
                name="adjustmentFrequency"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue>{(value: string) => ADJUSTMENT_FREQUENCY_LABELS[value as AdjustmentFrequency]}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(ADJUSTMENT_FREQUENCY_LABELS) as AdjustmentFrequency[]).map((freq) => (
                        <SelectItem key={freq} value={freq}>
                          {ADJUSTMENT_FREQUENCY_LABELS[freq]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="nextAdjustmentDate" className="text-sm font-medium text-foreground">
              Próximo ajuste (opcional)
            </label>
            <Input id="nextAdjustmentDate" type="date" {...register('nextAdjustmentDate')} />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="deposit" className="text-sm font-medium text-foreground">
                Depósito
              </label>
              <Input id="deposit" type="number" {...register('deposit')} />
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                Garantía
                {reviewFieldConfidence.guaranteeType === 'medium' && (
                  <Badge variant="outline" className="text-[10px] text-warning">
                    Confianza media
                  </Badge>
                )}
              </span>
              <Controller
                control={control}
                name="guaranteeType"
                render={({ field }) => (
                  <Select value={field.value ?? 'none'} onValueChange={(value) => field.onChange(value === 'none' ? undefined : value)}>
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        {(value: string) => (value === 'none' || !value ? 'Sin especificar' : GUARANTEE_TYPE_LABELS[value as GuaranteeType])}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin especificar</SelectItem>
                      {(Object.keys(GUARANTEE_TYPE_LABELS) as GuaranteeType[]).map((type) => (
                        <SelectItem key={type} value={type}>
                          {GUARANTEE_TYPE_LABELS[type]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="contract-notes" className="text-sm font-medium text-foreground">
              Notas {reviewMode && '(detectadas)'}
            </label>
            <textarea
              id="contract-notes"
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
          <Button form="contract-form" type="submit" className="flex-1" disabled={isSubmitting}>
            {reviewMode ? 'Confirmar y crear' : 'Crear contrato'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
