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
import { cn } from '@/lib/utils'
import { BRANCHES } from '@/mocks/organization'
import { createContact, findDuplicateContact, updateContact } from '@/services/contact-service'
import { getDemoUsers } from '@/services/user-service'
import type { Contact, ContactInput, ContactRole } from '@/types/contact'
import { CONTACT_ROLE_LABELS, CONTACT_ROLE_ORDER } from '../contact-labels'

const contactSchema = z.object({
  fullName: z.string().min(2, 'Ingresá un nombre completo'),
  phone: z.string().min(6, 'Ingresá un teléfono válido'),
  email: z.string().email('Ingresá un email válido'),
  roles: z.array(z.enum(['prospect', 'tenant', 'buyer', 'owner', 'seller'])).min(1, 'Elegí al menos un rol'),
  assignedUserId: z.string().min(1, 'Elegí un responsable'),
  branchId: z.string().min(1, 'Elegí una sede'),
  notes: z.string().optional(),
})

type ContactFormValues = z.infer<typeof contactSchema>

interface ContactFormSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  contact?: Contact
  onSaved: (contact: Contact) => void
}

export function ContactFormSheet({ open, onOpenChange, contact, onSaved }: ContactFormSheetProps) {
  const { showToast } = useToast()
  const users = getDemoUsers()
  const isEdit = Boolean(contact)

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: '',
      phone: '',
      email: '',
      roles: [],
      assignedUserId: users[0]?.id ?? '',
      branchId: BRANCHES[0]?.id ?? '',
      notes: '',
    },
  })

  useEffect(() => {
    if (!open) return
    reset(
      contact
        ? {
            fullName: contact.fullName,
            phone: contact.phone,
            email: contact.email,
            roles: contact.roles,
            assignedUserId: contact.assignedUserId,
            branchId: contact.branchId,
            notes: contact.notes ?? '',
          }
        : {
            fullName: '',
            phone: '',
            email: '',
            roles: [],
            assignedUserId: users[0]?.id ?? '',
            branchId: BRANCHES[0]?.id ?? '',
            notes: '',
          },
    )
  }, [open, contact, reset, users])

  const phone = watch('phone')
  const email = watch('email')
  const [duplicate, setDuplicate] = useState<Contact | null>(null)

  useEffect(() => {
    if (!phone && !email) {
      setDuplicate(null)
      return
    }
    setDuplicate(findDuplicateContact(phone, email, contact?.id))
  }, [phone, email, contact?.id])

  async function onSubmit(values: ContactFormValues) {
    const input: ContactInput = { ...values }
    const saved = isEdit && contact ? await updateContact(contact.id, input) : await createContact(input)
    showToast(isEdit ? 'Contacto actualizado' : 'Contacto creado')
    onSaved(saved)
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Editar contacto' : 'Nuevo contacto'}</SheetTitle>
        </SheetHeader>

        <form
          id="contact-form"
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-2"
        >
          <div className="flex flex-col gap-1.5">
            <label htmlFor="fullName" className="text-sm font-medium text-foreground">
              Nombre completo
            </label>
            <Input id="fullName" {...register('fullName')} />
            {errors.fullName && <p className="text-xs text-danger">{errors.fullName.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="phone" className="text-sm font-medium text-foreground">
              Teléfono
            </label>
            <Input id="phone" {...register('phone')} placeholder="+54 11 5555-1234" />
            {errors.phone && <p className="text-xs text-danger">{errors.phone.message}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input id="email" type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>

          {duplicate && (
            <div className="flex items-start gap-2 rounded-lg border border-warning/40 bg-warning/10 p-2.5 text-xs text-foreground">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-warning" />
              <span>
                Ya existe un contacto con este teléfono o email: <strong>{duplicate.fullName}</strong>. Podés continuar igual.
              </span>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Roles</span>
            <Controller
              control={control}
              name="roles"
              render={({ field }) => (
                <div className="flex flex-wrap gap-1.5">
                  {CONTACT_ROLE_ORDER.map((role) => {
                    const active = field.value.includes(role)
                    return (
                      <button
                        key={role}
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          field.onChange(
                            active ? field.value.filter((r: ContactRole) => r !== role) : [...field.value, role],
                          )
                        }
                        className={cn(
                          'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                          active
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                        )}
                      >
                        {CONTACT_ROLE_LABELS[role]}
                      </button>
                    )
                  })}
                </div>
              )}
            />
            {errors.roles && <p className="text-xs text-danger">{errors.roles.message}</p>}
          </div>

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
            <label htmlFor="notes" className="text-sm font-medium text-foreground">
              Notas iniciales
            </label>
            <textarea
              id="notes"
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
          <Button form="contact-form" type="submit" className="flex-1" disabled={isSubmitting}>
            {isEdit ? 'Guardar cambios' : 'Crear contacto'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
