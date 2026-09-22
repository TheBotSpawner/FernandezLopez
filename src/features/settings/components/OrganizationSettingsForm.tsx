import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useToast } from '@/app/toast-context'
import compactMark from '@/assets/fernandez-lopez-logo-800x800.png'
import fullLogo from '@/assets/fernandez-lopez-logo-tipografico.png'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SectionCard } from '@/components/data-display/SectionCard'
import { updateOrganization } from '@/services/organization-service'
import type { Organization } from '@/types/session'

const schema = z.object({
  name: z.string().min(1, 'Ingresá un nombre'),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  address: z.string().optional(),
  timezone: z.string().optional(),
  currency: z.enum(['ARS', 'USD']),
  cuit: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function OrganizationSettingsForm({
  organization,
  canEdit,
  onSaved,
}: {
  organization: Organization
  canEdit: boolean
  onSaved: (organization: Organization) => void
}) {
  const { showToast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: organization.name,
      phone: organization.phone ?? '',
      email: organization.email ?? '',
      address: organization.address ?? '',
      timezone: organization.timezone ?? '',
      currency: organization.currency ?? 'ARS',
      cuit: organization.cuit ?? '',
    },
  })

  useEffect(() => {
    reset({
      name: organization.name,
      phone: organization.phone ?? '',
      email: organization.email ?? '',
      address: organization.address ?? '',
      timezone: organization.timezone ?? '',
      currency: organization.currency ?? 'ARS',
      cuit: organization.cuit ?? '',
    })
  }, [organization, reset])

  async function onSubmit(values: FormValues) {
    const updated = await updateOrganization(values)
    onSaved(updated)
    showToast('Datos de la inmobiliaria actualizados')
  }

  return (
    <div className="flex flex-col gap-4">
      <SectionCard title="Marca">
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex flex-col items-center gap-2">
            <img src={compactMark} alt="Isotipo Fernández López" className="size-16 rounded-lg border border-border" />
            <span className="text-xs text-muted-foreground">Logo compacto</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <img src={fullLogo} alt="Fernández López & Asociados" className="h-16 rounded-lg border border-border bg-white p-2" />
            <span className="text-xs text-muted-foreground">Logo principal</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="size-16 rounded-lg border border-border bg-primary" />
            <span className="text-xs text-muted-foreground">Color principal</span>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Datos de la inmobiliaria">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="org-name" className="text-sm font-medium text-foreground">
                Nombre comercial
              </label>
              <Input id="org-name" disabled={!canEdit} {...register('name')} />
              {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="org-cuit" className="text-sm font-medium text-foreground">
                CUIT
              </label>
              <Input id="org-cuit" disabled={!canEdit} {...register('cuit')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="org-phone" className="text-sm font-medium text-foreground">
                Teléfono
              </label>
              <Input id="org-phone" disabled={!canEdit} {...register('phone')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="org-email" className="text-sm font-medium text-foreground">
                Email
              </label>
              <Input id="org-email" type="email" disabled={!canEdit} {...register('email')} />
              {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label htmlFor="org-address" className="text-sm font-medium text-foreground">
                Dirección principal
              </label>
              <Input id="org-address" disabled={!canEdit} {...register('address')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="org-timezone" className="text-sm font-medium text-foreground">
                Zona horaria
              </label>
              <Input id="org-timezone" disabled={!canEdit} {...register('timezone')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="org-currency" className="text-sm font-medium text-foreground">
                Moneda predeterminada
              </label>
              <select
                id="org-currency"
                disabled={!canEdit}
                {...register('currency')}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none disabled:opacity-50"
              >
                <option value="ARS">Pesos (ARS)</option>
                <option value="USD">Dólares (USD)</option>
              </select>
            </div>
          </div>
          {canEdit && (
            <Button type="submit" className="self-start" disabled={isSubmitting}>
              Guardar cambios
            </Button>
          )}
        </form>
      </SectionCard>
    </div>
  )
}
