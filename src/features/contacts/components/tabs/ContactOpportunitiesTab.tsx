import { Handshake } from 'lucide-react'
import { EmptyState } from '@/components/feedback/EmptyState'
import { OpportunityListItem } from '@/features/opportunities/components/OpportunityListItem'
import type { Opportunity } from '@/types/opportunity'

export function ContactOpportunitiesTab({ opportunities }: { opportunities: Opportunity[] }) {
  if (opportunities.length === 0) {
    return <EmptyState icon={Handshake} message="Este contacto todavía no tiene oportunidades." />
  }

  return (
    <div className="flex flex-col gap-2">
      {opportunities.map((opportunity) => (
        <OpportunityListItem key={opportunity.id} opportunity={opportunity} />
      ))}
    </div>
  )
}
