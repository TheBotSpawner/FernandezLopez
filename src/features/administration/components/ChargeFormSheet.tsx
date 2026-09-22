import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { useToast } from '@/app/toast-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { CHARGE_TYPE_LABELS, PAYMENT_METHOD_LABELS, RESPONSIBILITY_LABELS } from '../account-labels'
import { remainingAmount } from '../account-utils'
import { createCharge, updateCharge } from '@/services/contract-charge-service'
import { createPayment, findPaymentForCharge, revertChargePayment, updatePaymentDetails } from '@/services/payment-service'
import type { ChargeType, ContractCharge } from '@/types/contract-account'
import type { PaymentMethod } from '@/types/contract-account'
import type { ObligationResponsibility } from '@/types/rental-contract'

const chargeSchema = z
  .object({
    type: z.enum(['RENT', 'EXPENSES', 'ABL', 'AYSA', 'ELECTRICITY', 'GAS', 'INTEREST', 'OTHER']),
    description: z.string().min(1, 'Ingresá una descripción'),
    provider: z.string().optional(),
    amount: z.string().min(1, 'Ingresá un importe'),
    dueDate: z.string().min(1, 'Elegí un vencimiento'),
    responsibility: z.enum(['TENANT', 'OWNER', 'BY_CONTRACT']).optional(),
    paid: z.boolean().optional(),
    paymentDate: z.string().optional(),
    paymentMethod: z.enum(['TRANSFER', 'CASH', 'DEPOSIT', 'OTHER']).optional(),
  })
  .refine((data) => !data.paid || Boolean(data.paymentDate), {
    message: 'Elegí la fecha de pago',
    path: ['paymentDate'],
  })

type ChargeFormValues = z.infer<typeof chargeSchema>

// 'OTHER' first and set as the default — a manual "Agregar cargo" is
// rarely rent (already auto-generated). Also keeps the default value near
// the top of the list: Base UI's Select aligns the *selected* item with the
// trigger when opening, so defaulting to the last item in a long list (as
// this did before reordering) made the popup try to open far above the
// trigger and get clamped against the viewport edge — the "se va para
// arriba" bug.
const TYPE_OPTIONS: ChargeType[] = ['OTHER', 'INTEREST', 'RENT', 'EXPENSES', 'ABL', 'AYSA', 'ELECTRICITY', 'GAS']

export function ChargeFormSheet({
  open,
  onOpenChange,
  contractId,
  period,
  charge,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  contractId: string
  period: string
  charge?: ContractCharge | null
  onSaved: () => void
}) {
  const { showToast } = useToast()
  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ChargeFormValues>({
    resolver: zodResolver(chargeSchema),
    defaultValues: {
      type: 'OTHER',
      description: '',
      amount: '',
      dueDate: `${period}-10`,
      responsibility: 'TENANT',
      paid: false,
      paymentMethod: 'TRANSFER',
    },
  })

  useEffect(() => {
    if (!open) return
    if (charge) {
      const isPaid = charge.status === 'PAID'
      const existingPayment = isPaid ? findPaymentForCharge(charge.id) : undefined
      reset({
        type: charge.type,
        description: charge.description,
        provider: charge.provider ?? '',
        amount: String(charge.amount),
        dueDate: charge.dueDate,
        responsibility: charge.responsibility ?? 'TENANT',
        paid: isPaid,
        paymentDate: existingPayment?.date ?? new Date().toISOString().slice(0, 10),
        paymentMethod: existingPayment?.method ?? 'TRANSFER',
      })
    } else {
      reset({
        type: 'OTHER',
        description: '',
        amount: '',
        dueDate: `${period}-10`,
        responsibility: 'TENANT',
        paid: false,
        paymentDate: new Date().toISOString().slice(0, 10),
        paymentMethod: 'TRANSFER',
      })
    }
  }, [open, charge, period, reset])

  const type = watch('type')
  const paid = watch('paid')

  async function onSubmit(values: ChargeFormValues) {
    const input = {
      contractId,
      period,
      type: values.type,
      description: values.description,
      provider: values.provider || undefined,
      amount: Number(values.amount),
      dueDate: values.dueDate,
      responsibility: values.responsibility as ObligationResponsibility | undefined,
    }
    if (charge) {
      const updated = await updateCharge(charge.id, input)
      const wasPaid = charge.status === 'PAID'
      const method = (values.paymentMethod as PaymentMethod) ?? 'TRANSFER'
      if (values.paid && !wasPaid) {
        const amountDue = remainingAmount(updated)
        if (amountDue > 0 && values.paymentDate) {
          await createPayment({
            contractId,
            date: values.paymentDate,
            amount: amountDue,
            method,
            allocations: [{ chargeId: updated.id, amount: amountDue }],
          })
        }
        showToast('Cargo actualizado y marcado como pagado')
      } else if (!values.paid && wasPaid) {
        await revertChargePayment(charge.id)
        showToast('Cargo actualizado y marcado como pendiente')
      } else if (values.paid && wasPaid && values.paymentDate) {
        const existing = findPaymentForCharge(charge.id)
        if (existing && (existing.date !== values.paymentDate || existing.method !== method)) {
          await updatePaymentDetails(existing.id, values.paymentDate, method)
        }
        showToast('Cargo actualizado')
      } else {
        showToast('Cargo actualizado')
      }
    } else {
      const created = await createCharge(input)
      if (values.paid && values.paymentDate) {
        await createPayment({
          contractId,
          date: values.paymentDate,
          amount: created.amount,
          method: (values.paymentMethod as PaymentMethod) ?? 'TRANSFER',
          allocations: [{ chargeId: created.id, amount: created.amount }],
        })
        showToast('Cargo agregado y pago registrado')
      } else {
        showToast('Cargo agregado')
      }
    }
    onSaved()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0">
        <SheetHeader>
          <SheetTitle>{charge ? 'Editar cargo' : 'Agregar cargo'}</SheetTitle>
        </SheetHeader>

        <form id="charge-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Tipo</span>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value)
                    if (!watch('description')) setValue('description', CHARGE_TYPE_LABELS[value as ChargeType])
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue>{(value: string) => CHARGE_TYPE_LABELS[value as ChargeType]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {CHARGE_TYPE_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="charge-description" className="text-sm font-medium text-foreground">
              Descripción
            </label>
            <Input id="charge-description" {...register('description')} />
            {errors.description && <p className="text-xs text-danger">{errors.description.message}</p>}
          </div>

          {(type === 'ELECTRICITY' || type === 'GAS') && (
            <div className="flex flex-col gap-1.5">
              <label htmlFor="charge-provider" className="text-sm font-medium text-foreground">
                Proveedor
              </label>
              <Input id="charge-provider" {...register('provider')} placeholder={type === 'GAS' ? 'Metrogas' : 'Edenor / Edesur'} />
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="charge-amount" className="text-sm font-medium text-foreground">
                Importe
              </label>
              <Input id="charge-amount" type="number" {...register('amount')} />
              {errors.amount && <p className="text-xs text-danger">{errors.amount.message}</p>}
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="charge-due" className="text-sm font-medium text-foreground">
                Vencimiento
              </label>
              <Input id="charge-due" type="date" {...register('dueDate')} />
              {errors.dueDate && <p className="text-xs text-danger">{errors.dueDate.message}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Responsable</span>
            <Controller
              control={control}
              name="responsibility"
              render={({ field }) => (
                <Select value={field.value ?? 'TENANT'} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full">
                    <SelectValue>{(value: string) => RESPONSIBILITY_LABELS[value as ObligationResponsibility]}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {(['TENANT', 'OWNER', 'BY_CONTRACT'] as ObligationResponsibility[]).map((option) => (
                      <SelectItem key={option} value={option}>
                        {RESPONSIBILITY_LABELS[option]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-border p-3">
            <Controller
              control={control}
              name="paid"
              render={({ field }) => (
                <button
                  type="button"
                  aria-pressed={field.value}
                  onClick={() => field.onChange(!field.value)}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-1 text-sm font-medium transition-colors',
                    field.value ? 'text-primary' : 'text-foreground',
                  )}
                >
                  ¿Ya fue pagado?
                  <span className={cn('size-4 shrink-0 rounded border', field.value ? 'border-primary bg-primary' : 'border-border')} />
                </button>
              )}
            />
            {paid && (
              <div className="flex items-center gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <label htmlFor="charge-payment-date" className="text-sm font-medium text-foreground">
                    Fecha de pago
                  </label>
                  <Input id="charge-payment-date" type="date" {...register('paymentDate')} />
                  {errors.paymentDate && <p className="text-xs text-danger">{errors.paymentDate.message}</p>}
                </div>
                <div className="flex flex-1 flex-col gap-1.5">
                  <span className="text-sm font-medium text-foreground">Medio de pago</span>
                  <Controller
                    control={control}
                    name="paymentMethod"
                    render={({ field }) => (
                      <Select value={field.value ?? 'TRANSFER'} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue>{(value: string) => PAYMENT_METHOD_LABELS[value as PaymentMethod]}</SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {(['TRANSFER', 'CASH', 'DEPOSIT', 'OTHER'] as PaymentMethod[]).map((option) => (
                            <SelectItem key={option} value={option}>
                              {PAYMENT_METHOD_LABELS[option]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
            )}
          </div>
        </form>

        <SheetFooter className="flex-row">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button form="charge-form" type="submit" className="flex-1" disabled={isSubmitting}>
            {charge ? 'Guardar cambios' : paid ? 'Agregar y registrar pago' : 'Agregar cargo'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
