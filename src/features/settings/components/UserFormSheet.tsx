import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useToast } from '@/app/toast-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { createUser, updateUser } from '@/services/user-service'
import { ROLE_LABELS } from '../settings-labels'
import type { Branch, User, UserRole } from '@/types/session'

const schema = z.object({
  name: z.string().min(1, 'Ingresá un nombre'),
  email: z.string().email('Email inválido'),
  role: z.enum(['ADMIN', 'MANAGER', 'ADMINISTRATION', 'AGENT']),
  branchId: z.string().min(1, 'Elegí una sede'),
})

type FormValues = z.infer<typeof schema>

const ROLES: UserRole[] = ['ADMIN', 'MANAGER', 'ADMINISTRATION', 'AGENT']

export function UserFormSheet({
  open,
  onOpenChange,
  user,
  branches,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  user?: User | null
  branches: Branch[]
  onSaved: (user: User) => void
}) {
  const { showToast } = useToast()
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', role: 'AGENT', branchId: branches[0]?.id ?? '' },
  })

  useEffect(() => {
    if (!open) return
    reset({
      name: user?.name ?? '',
      email: user?.email ?? '',
      role: user?.role ?? 'AGENT',
      branchId: user?.branchId ?? branches[0]?.id ?? '',
    })
  }, [open, user, branches, reset])

  async function onSubmit(values: FormValues) {
    const saved = user ? await updateUser(user.id, values) : await createUser(values)
    onSaved(saved)
    showToast(user ? 'Usuario actualizado' : 'Usuario creado')
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0">
        <SheetHeader>
          <SheetTitle>{user ? 'Editar usuario' : 'Nuevo usuario'}</SheetTitle>
        </SheetHeader>
        <form id="user-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="user-name" className="text-sm font-medium text-foreground">
              Nombre
            </label>
            <Input id="user-name" {...register('name')} />
            {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="user-email" className="text-sm font-medium text-foreground">
              Email
            </label>
            <Input id="user-email" type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Rol</span>
            <Controller
              control={control}
              name="role"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{(v: string) => ROLE_LABELS[v as UserRole]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Sede principal</span>
            <Controller
              control={control}
              name="branchId"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sede">
                      {(v: string) => branches.find((b) => b.id === v)?.name ?? v}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((branch) => (
                      <SelectItem key={branch.id} value={branch.id}>
                        {branch.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.branchId && <p className="text-xs text-danger">{errors.branchId.message}</p>}
          </div>
        </form>
        <SheetFooter className="flex-row">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button form="user-form" type="submit" className="flex-1" disabled={isSubmitting}>
            {user ? 'Guardar cambios' : 'Crear usuario'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
