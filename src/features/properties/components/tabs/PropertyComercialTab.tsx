import { Handshake } from 'lucide-react'
import { EmptyState } from '@/components/feedback/EmptyState'
import { OpportunityListItem } from '@/features/opportunities/components/OpportunityListItem'
import type { Opportunity } from '@/types/opportunity'

export function PropertyComercialTab({ opportunities }: { opportunities: Opportunity[] }) {
  if (opportunities.length === 0) {
    return <EmptyState icon={Handshake} message="Todavía no hay oportunidades vinculadas a esta propiedad." />
  }

  const active = opportunities.filter((o) => o.stage !== 'Cerrada' && o.stage !== 'Perdida')
  const closed = opportunities.filter((o) => o.stage === 'Cerrada')

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xl font-semibold text-foreground">{opportunities.length}</p>
          <p className="text-xs text-muted-foreground">Oportunidades vinculadas</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xl font-semibold text-foreground">{active.length}</p>
          <p className="text-xs text-muted-foreground">Activas</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xl font-semibold text-foreground">{closed.length}</p>
          <p className="text-xs text-muted-foreground">Cerradas</p>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        {opportunities.map((opportunity) => (
          <OpportunityListItem key={opportunity.id} opportunity={opportunity} />
        ))}
      </div>
    </div>
  )
}
