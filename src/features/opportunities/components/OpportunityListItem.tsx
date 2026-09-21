import { AlertTriangle } from 'lucide-react'
import { Link } from 'react-router-dom'
import { formatShortDate } from '@/lib/format'
import { getUserForContact } from '@/mocks/contacts'
import type { Opportunity } from '@/types/opportunity'
import { OPPORTUNITY_TYPE_LABELS } from '../opportunity-labels'
import { isNextActionOverdue, opportunityBudgetLine, opportunityZoneLine } from '../opportunity-format'
import { OpportunityStageBadge } from './OpportunityStageBadge'

export function OpportunityListItem({ opportunity }: { opportunity: Opportunity }) {
  const agent = getUserForContact(opportunity.assignedUserId)
  const budgetLine = opportunityBudgetLine(opportunity)
  const zoneLine = opportunityZoneLine(opportunity)
  const overdue = isNextActionOverdue(opportunity)

  return (
    <Link
      to={`/commercial/opportunities/${opportunity.id}`}
      className="flex flex-col gap-1.5 rounded-lg border border-border p-3 transition-colors hover:border-primary/40"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium text-foreground">{OPPORTUNITY_TYPE_LABELS[opportunity.type]}</span>
        <OpportunityStageBadge stage={opportunity.stage} />
      </div>
      {budgetLine && <p className="text-xs text-muted-foreground">{budgetLine}</p>}
      {zoneLine && <p className="text-xs text-muted-foreground">{zoneLine}</p>}
      <div className="flex items-start justify-between gap-2 text-xs text-muted-foreground">
        <span className="shrink-0">{agent?.name ?? '—'}</span>
        {opportunity.nextActionAt && (
          <span className={overdue ? 'flex items-start gap-1 text-right font-medium text-danger' : 'text-right'}>
            {overdue && <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />}
            {opportunity.nextActionLabel} · {formatShortDate(opportunity.nextActionAt)}
          </span>
        )}
      </div>
    </Link>
  )
}
