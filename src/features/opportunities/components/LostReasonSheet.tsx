import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import type { LostReason } from '@/types/opportunity'

const REASONS: LostReason[] = [
  'No responde',
  'No encontró propiedad',
  'Presupuesto insuficiente',
  'Eligió otra inmobiliaria',
  'Postergó decisión',
  'Otro',
]

export function LostReasonSheet({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason: LostReason) => void
}) {
  const [reason, setReason] = useState<LostReason>('No responde')

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Marcar como perdida</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-2 px-4">
          <span className="text-sm font-medium text-foreground">Motivo</span>
          <Select value={reason} onValueChange={(value) => setReason(value as LostReason)}>
            <SelectTrigger className="w-full">
              <SelectValue>{(value: string) => value}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {REASONS.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <SheetFooter className="flex-row">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => {
              onConfirm(reason)
              onOpenChange(false)
            }}
          >
            Confirmar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
