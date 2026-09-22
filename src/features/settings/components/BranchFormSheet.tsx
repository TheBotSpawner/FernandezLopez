import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { useToast } from '@/app/toast-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { createBranch, updateBranch } from '@/services/organization-service'
import type { Branch } from '@/types/session'

const schema = z.object({
  name: z.string().min(1, 'Ingresá un nombre'),
  address: z.string().optional(),
  phone: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

export function BranchFormSheet({
  open,
  onOpenChange,
  branch,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  branch?: Branch | null
  onSaved: (branch: Branch) => void
}) {
  const { showToast } = useToast()
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { name: '', address: '', phone: '' } })

  useEffect(() => {
    if (!open) return
    reset({ name: branch?.name ?? '', address: branch?.address ?? '', phone: branch?.phone ?? '' })
  }, [open, branch, reset])

  async function onSubmit(values: FormValues) {
    const saved = branch ? await updateBranch(branch.id, values) : await createBranch(values)
    onSaved(saved)
    showToast(branch ? 'Sede actualizada' : 'Sede creada')
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0">
        <SheetHeader>
          <SheetTitle>{branch ? 'Editar sede' : 'Nueva sede'}</SheetTitle>
        </SheetHeader>
        <form id="branch-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="branch-name" className="text-sm font-medium text-foreground">
              Nombre
            </label>
            <Input id="branch-name" {...register('name')} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="branch-address" className="text-sm font-medium text-foreground">
              Dirección
            </label>
            <Input id="branch-address" {...register('address')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="branch-phone" className="text-sm font-medium text-foreground">
              Teléfono
            </label>
            <Input id="branch-phone" {...register('phone')} />
          </div>
        </form>
        <SheetFooter className="flex-row">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button form="branch-form" type="submit" className="flex-1" disabled={isSubmitting}>
            {branch ? 'Guardar cambios' : 'Crear sede'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
