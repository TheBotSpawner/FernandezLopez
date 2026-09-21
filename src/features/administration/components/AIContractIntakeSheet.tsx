import { Loader2, UploadCloud } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { findContactByPhone, getContacts } from '@/services/contact-service'
import { getContractsByProperty } from '@/services/rental-contract-service'
import { getProperties, getPropertyOwners } from '@/services/property-service'
import type { ContractFieldConfidence, ContractFormValues } from './ContractFormSheet'

type Step = 'select' | 'analyzing'

interface AIContractIntakeSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAnalyzed: (values: Partial<ContractFormValues>, confidence: ContractFieldConfidence) => void
}

function todayPlus(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Deterministic mock "extraction" — picks a vacant rent-eligible property and a tenant contact. No real OCR/AI. */
async function buildDetectedContract(): Promise<{ values: Partial<ContractFormValues>; confidence: ContractFieldConfidence }> {
  const properties = await getProperties({ operation: 'rent' })
  const vacant = properties.find((p) =>
    getContractsByProperty(p.id).every((c) => c.status === 'EXPIRED' || c.status === 'TERMINATED'),
  )
  const property = vacant ?? properties[0]

  const owners = getPropertyOwners(property.ownerIds)
  const ownerIds = owners.map((owner) => findContactByPhone(owner.phone)?.id).filter((id): id is string => Boolean(id))

  const tenantCandidates = await getContacts({ roles: ['tenant'] })
  const fallback = tenantCandidates.length ? tenantCandidates : await getContacts({})
  const tenant = fallback[0]

  const rent = property.rentalPrice ?? 500000

  return {
    values: {
      propertyId: property.id,
      branchId: property.branchId,
      tenantIds: tenant ? [tenant.id] : [],
      ownerIds,
      startDate: todayPlus(10),
      endDate: todayPlus(400),
      initialRent: String(rent),
      currentRent: String(rent),
      currency: 'ARS',
      adjustmentMethod: 'IPC',
      adjustmentFrequency: 'QUARTERLY',
      nextAdjustmentDate: todayPlus(100),
      deposit: String(rent),
      guaranteeType: 'INSURANCE',
      notes: 'Cláusula de garantía de caución detectada — verificar vigencia de la póliza.',
    },
    confidence: { adjustmentMethod: 'medium', guaranteeType: 'medium' },
  }
}

export function AIContractIntakeSheet({ open, onOpenChange, onAnalyzed }: AIContractIntakeSheetProps) {
  const [step, setStep] = useState<Step>('select')
  const [file, setFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) {
      setStep('select')
      setFile(null)
      setError(null)
    }
  }, [open])

  function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0]
    if (!selected) return
    if (selected.type !== 'application/pdf') {
      setError('Solo se admiten archivos PDF.')
      setFile(null)
      return
    }
    setError(null)
    setFile(selected)
  }

  async function analyze() {
    if (!file) return
    setStep('analyzing')
    const detected = await buildDetectedContract()
    setTimeout(() => {
      onOpenChange(false)
      onAnalyzed(detected.values, detected.confidence)
    }, 900)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0">
        <SheetHeader>
          <SheetTitle>Cargar contrato</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 px-4 py-2">
          {step === 'select' && (
            <>
              <p className="text-sm text-muted-foreground">
                Seleccioná el PDF del contrato para analizarlo. Esta es una simulación de IA para el prototipo: el archivo no se sube
                ni se procesa realmente.
              </p>
              <label className="flex cursor-pointer flex-col items-center gap-2 rounded-lg border border-dashed border-border p-6 text-center transition-colors hover:border-primary/40">
                <UploadCloud className="size-6 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{file ? file.name : 'Seleccionar PDF'}</span>
                {file && (
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(0)} KB · {file.type}
                  </span>
                )}
                <input type="file" accept="application/pdf" className="hidden" onChange={handleFile} aria-label="Seleccionar contrato en PDF" />
              </label>
              {error && <p className="text-xs text-danger">{error}</p>}
            </>
          )}

          {step === 'analyzing' && (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <Loader2 className="size-6 animate-spin text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">Analizando contrato...</p>
              <p className="text-xs text-muted-foreground">Identificando partes, fechas, montos y cláusulas principales.</p>
            </div>
          )}
        </div>

        <SheetFooter className="flex-row">
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button className="flex-1" onClick={analyze} disabled={!file || step === 'analyzing'}>
            Analizar
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
