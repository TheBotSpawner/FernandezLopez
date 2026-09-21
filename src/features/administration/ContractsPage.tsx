import { Plus, Sparkles } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { AIContractIntakeSheet } from './components/AIContractIntakeSheet'
import { ContractFilters } from './components/ContractFilters'
import { ContractFormSheet } from './components/ContractFormSheet'
import type { ContractFieldConfidence, ContractFormValues } from './components/ContractFormSheet'
import { ContractListView } from './components/ContractListView'
import { useContractList } from './use-contract-list'

export function ContractsPage() {
  const { filters, setFilters, contracts, loading, activeFilterCount, clearFilters, refetch } = useContractList()
  const [createOpen, setCreateOpen] = useState(false)
  const [aiOpen, setAiOpen] = useState(false)
  const [reviewValues, setReviewValues] = useState<Partial<ContractFormValues> | null>(null)
  const [reviewConfidence, setReviewConfidence] = useState<ContractFieldConfidence>({})

  function handleAnalyzed(values: Partial<ContractFormValues>, confidence: ContractFieldConfidence) {
    setReviewValues(values)
    setReviewConfidence(confidence)
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Contratos</h1>
          <p className="text-sm text-muted-foreground">Cartera de contratos de alquiler administrados.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 self-start">
          <Button variant="outline" onClick={() => setAiOpen(true)} className="gap-1.5">
            <Sparkles className="size-4" />
            Cargar contrato
          </Button>
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="size-4" />
            Nuevo contrato
          </Button>
        </div>
      </div>

      <ContractFilters
        filters={filters}
        setFilters={setFilters}
        activeFilterCount={activeFilterCount}
        clearFilters={clearFilters}
        resultCount={contracts.length}
      />

      <ContractListView contracts={contracts} loading={loading} />

      <ContractFormSheet open={createOpen} onOpenChange={setCreateOpen} onSaved={refetch} />

      <AIContractIntakeSheet open={aiOpen} onOpenChange={setAiOpen} onAnalyzed={handleAnalyzed} />
      <ContractFormSheet
        open={Boolean(reviewValues)}
        onOpenChange={(open) => !open && setReviewValues(null)}
        onSaved={refetch}
        title="Revisar contrato detectado"
        reviewMode
        reviewFieldConfidence={reviewConfidence}
        defaultValues={reviewValues ?? undefined}
      />
    </div>
  )
}
