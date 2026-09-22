import { Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useToast } from '@/app/toast-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { formatARS } from '@/lib/format'
import { propertyTitle } from '@/features/properties/property-format'
import { findPropertySync } from '@/services/property-service'
import { getChargesByContract } from '@/services/contract-charge-service'
import { getContracts } from '@/services/rental-contract-service'
import { createSettlement } from '@/services/owner-settlement-service'
import { currentPeriod, formatPeriodLabel, shiftPeriod } from '../account-utils'
import type { RentalContract } from '@/types/rental-contract'

const PERIOD_OPTIONS = Array.from({ length: 5 }).map((_, i) => shiftPeriod(currentPeriod(), -4 + i))

export function SettlementFormSheet({
  open,
  onOpenChange,
  onSaved,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved: () => void
}) {
  const { showToast } = useToast()
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<RentalContract[]>([])
  const [contract, setContract] = useState<RentalContract | null>(null)
  const [period, setPeriod] = useState(currentPeriod())
  const [grossCollected, setGrossCollected] = useState('')
  const [feeType, setFeeType] = useState<'PERCENTAGE' | 'FIXED'>('PERCENTAGE')
  const [feeValue, setFeeValue] = useState('5')
  const [deductions, setDeductions] = useState<{ description: string; amount: string }[]>([])
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setSearch('')
    setResults([])
    setContract(null)
    setPeriod(currentPeriod())
    setGrossCollected('')
    setFeeType('PERCENTAGE')
    setFeeValue('5')
    setDeductions([])
    setNotes('')
  }, [open])

  useEffect(() => {
    if (!search || contract) {
      setResults([])
      return
    }
    let cancelled = false
    getContracts({ search }).then((result) => {
      if (!cancelled) setResults(result.slice(0, 6))
    })
    return () => {
      cancelled = true
    }
  }, [search, contract])

  useEffect(() => {
    if (!contract) return
    const rentCollected = getChargesByContract(contract.id)
      .filter((c) => c.period === period && c.type === 'RENT')
      .reduce((sum, c) => sum + c.paidAmount, 0)
    setGrossCollected(String(rentCollected))
  }, [contract, period])

  const gross = Number(grossCollected) || 0
  const fee = feeType === 'PERCENTAGE' ? Math.round((gross * (Number(feeValue) || 0)) / 100) : Number(feeValue) || 0
  const deductionsTotal = deductions.reduce((sum, d) => sum + (Number(d.amount) || 0), 0)
  const net = gross - fee - deductionsTotal

  function addDeduction() {
    setDeductions((prev) => [...prev, { description: '', amount: '' }])
  }

  function updateDeduction(index: number, patch: Partial<{ description: string; amount: string }>) {
    setDeductions((prev) => prev.map((d, i) => (i === index ? { ...d, ...patch } : d)))
  }

  function removeDeduction(index: number) {
    setDeductions((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleSubmit() {
    if (!contract || gross <= 0) return
    setSubmitting(true)
    await createSettlement({
      contractId: contract.id,
      ownerIds: contract.ownerIds,
      period,
      grossCollected: gross,
      feeType,
      feeValue: Number(feeValue) || 0,
      deductions: deductions.filter((d) => d.description && Number(d.amount) > 0).map((d) => ({ description: d.description, amount: Number(d.amount) })),
      notes: notes || undefined,
    })
    setSubmitting(false)
    showToast('Liquidación creada')
    onSaved()
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0">
        <SheetHeader>
          <SheetTitle>Nueva liquidación</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-2">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Contrato</span>
            {contract ? (
              <div className="flex items-center justify-between rounded-lg border border-border px-2.5 py-1.5 text-sm">
                <span className="text-foreground">
                  {(() => {
                    const property = findPropertySync(contract.propertyId)
                    return property ? propertyTitle(property) : contract.contractNumber
                  })()}
                </span>
                <button type="button" className="text-xs text-primary hover:underline" onClick={() => setContract(null)}>
                  Cambiar
                </button>
              </div>
            ) : (
              <>
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar contrato por dirección o inquilino..." />
                {results.length > 0 && (
                  <div className="flex flex-col overflow-hidden rounded-lg border border-border">
                    {results.map((result) => {
                      const property = findPropertySync(result.propertyId)
                      return (
                        <button
                          key={result.id}
                          type="button"
                          onClick={() => {
                            setContract(result)
                            setSearch('')
                          }}
                          className="px-2.5 py-1.5 text-left text-sm hover:bg-muted"
                        >
                          {property ? propertyTitle(property) : result.contractNumber}
                        </button>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">Período</span>
            <Select value={period} onValueChange={(v) => setPeriod(v as string)}>
              <SelectTrigger className="w-full">
                <SelectValue>{(value: string) => formatPeriodLabel(value)}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PERIOD_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {formatPeriodLabel(option)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="settlement-gross" className="text-sm font-medium text-foreground">
              Alquiler cobrado
            </label>
            <Input id="settlement-gross" type="number" value={grossCollected} onChange={(e) => setGrossCollected(e.target.value)} />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex flex-1 flex-col gap-1.5">
              <span className="text-sm font-medium text-foreground">Honorarios</span>
              <Select value={feeType} onValueChange={(v) => setFeeType(v as 'PERCENTAGE' | 'FIXED')}>
                <SelectTrigger className="w-full">
                  <SelectValue>{(v: string) => (v === 'PERCENTAGE' ? 'Porcentaje' : 'Monto fijo')}</SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERCENTAGE">Porcentaje</SelectItem>
                  <SelectItem value="FIXED">Monto fijo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-1 flex-col gap-1.5">
              <label htmlFor="settlement-fee" className="text-sm font-medium text-foreground">
                {feeType === 'PERCENTAGE' ? '% honorarios' : 'Monto ($)'}
              </label>
              <Input id="settlement-fee" type="number" value={feeValue} onChange={(e) => setFeeValue(e.target.value)} />
            </div>
          </div>
          <p className="-mt-2 text-xs text-muted-foreground">
            Regla de honorarios provisoria para el prototipo — pendiente de validar con Fernández López.
          </p>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Descuentos</span>
              <Button variant="outline" size="sm" onClick={addDeduction} className="gap-1.5">
                <Plus className="size-3.5" />
                Agregar
              </Button>
            </div>
            {deductions.map((deduction, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Descripción"
                  value={deduction.description}
                  onChange={(e) => updateDeduction(index, { description: e.target.value })}
                  className="flex-1"
                />
                <Input
                  type="number"
                  placeholder="Importe"
                  value={deduction.amount}
                  onChange={(e) => updateDeduction(index, { amount: e.target.value })}
                  className="w-28"
                />
                <button type="button" onClick={() => removeDeduction(index)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted">
                  <X className="size-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="settlement-notes" className="text-sm font-medium text-foreground">
              Notas
            </label>
            <textarea
              id="settlement-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            />
          </div>

          {gross > 0 && (
            <div className="flex flex-col gap-1 rounded-lg bg-muted/50 p-3 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Alquiler cobrado</span>
                <span>{formatARS(gross)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Honorarios</span>
                <span>-{formatARS(fee)}</span>
              </div>
              {deductionsTotal > 0 && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Descuentos</span>
                  <span>-{formatARS(deductionsTotal)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-1 font-semibold text-foreground">
                <span>Neto propietario</span>
                <span>{formatARS(net)}</span>
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="flex-row">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={!contract || gross <= 0 || submitting}>
            Crear liquidación
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
