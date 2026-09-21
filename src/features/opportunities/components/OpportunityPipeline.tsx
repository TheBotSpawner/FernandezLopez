import { useState } from 'react'
import { useToast } from '@/app/toast-context'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { changeStage } from '@/services/opportunity-service'
import { DEMAND_STAGES, OWNER_STAGES } from '@/types/opportunity'
import type { LostReason, Opportunity, OpportunityStage } from '@/types/opportunity'
import type { PipelineGroup } from '../use-opportunity-list'
import { LostReasonSheet } from './LostReasonSheet'
import { OpportunityCard } from './OpportunityCard'

export function OpportunityPipeline({
  group,
  opportunities,
  loading,
  onChanged,
}: {
  group: PipelineGroup
  opportunities: Opportunity[]
  loading: boolean
  onChanged: () => void
}) {
  const { showToast } = useToast()
  const [lostTarget, setLostTarget] = useState<Opportunity | null>(null)
  const stages = group === 'demand' ? DEMAND_STAGES : OWNER_STAGES

  async function handleStageChange(opportunity: Opportunity, stage: OpportunityStage) {
    if (stage === 'Perdida') {
      setLostTarget(opportunity)
      return
    }
    await changeStage(opportunity.id, stage)
    showToast(stage === 'Cerrada' ? 'Oportunidad cerrada' : 'Etapa actualizada')
    onChanged()
  }

  async function confirmLost(reason: LostReason) {
    if (!lostTarget) return
    await changeStage(lostTarget.id, 'Perdida', reason)
    showToast('Oportunidad marcada como perdida')
    setLostTarget(null)
    onChanged()
  }

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto pb-2">
        {stages.map((stage) => (
          <Skeleton key={stage} className="h-80 w-64 shrink-0" />
        ))}
      </div>
    )
  }

  if (opportunities.length === 0) {
    return <EmptyState message="No hay oportunidades con estos filtros." />
  }

  return (
    <>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {stages.map((stage) => {
          const stageOpportunities = opportunities.filter((opportunity) => opportunity.stage === stage)
          return (
            <div key={stage} className="flex w-72 shrink-0 flex-col gap-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-sm font-medium text-foreground">{stage}</span>
                <span className="text-xs text-muted-foreground">{stageOpportunities.length}</span>
              </div>
              <div className="flex flex-col gap-2 rounded-lg bg-muted/40 p-2 min-h-24">
                {stageOpportunities.map((opportunity) => (
                  <OpportunityCard key={opportunity.id} opportunity={opportunity} onStageChange={handleStageChange} />
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <LostReasonSheet open={Boolean(lostTarget)} onOpenChange={(open) => !open && setLostTarget(null)} onConfirm={confirmLost} />
    </>
  )
}
