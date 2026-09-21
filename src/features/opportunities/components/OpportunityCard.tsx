import { AlertTriangle, MoreHorizontal } from 'lucide-react'
import { Link } from 'react-router-dom'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { getUserForContact } from '@/mocks/contacts'
import { findContactSync } from '@/services/contact-service'
import { isOwnerOpportunity, stagesFor } from '@/types/opportunity'
import type { Opportunity, OpportunityStage } from '@/types/opportunity'
import { isNextActionOverdue, opportunityBudgetLine, opportunityZoneLine } from '../opportunity-format'
import { OPPORTUNITY_TYPE_LABELS } from '../opportunity-labels'

interface OpportunityCardProps {
  opportunity: Opportunity
  onStageChange: (opportunity: Opportunity, stage: OpportunityStage) => void
}

export function OpportunityCard({ opportunity, onStageChange }: OpportunityCardProps) {
  const contact = findContactSync(opportunity.contactId)
  const owner = isOwnerOpportunity(opportunity.type)
  const budgetLine = opportunityBudgetLine(opportunity)
  const zoneLine = opportunityZoneLine(opportunity)
  const overdue = isNextActionOverdue(opportunity)

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <Link to={`/commercial/opportunities/${opportunity.id}`} className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground hover:underline">{contact?.fullName ?? 'Contacto'}</p>
          <p className="truncate text-xs text-muted-foreground">{OPPORTUNITY_TYPE_LABELS[opportunity.type]}</p>
        </Link>
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-md p-1 text-muted-foreground outline-none hover:bg-muted hover:text-foreground">
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52">
            <DropdownMenuRadioGroup
              value={opportunity.stage}
              onValueChange={(value) => onStageChange(opportunity, value as OpportunityStage)}
            >
              {stagesFor(opportunity.type).map((stage) => (
                <DropdownMenuRadioItem key={stage} value={stage}>
                  {stage}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {!owner && budgetLine && <p className="text-xs text-muted-foreground">{budgetLine}</p>}
      {!owner && zoneLine && <p className="text-xs text-muted-foreground">{zoneLine}</p>}
      {owner && opportunity.ownerPropertyAddress && (
        <p className="text-xs text-muted-foreground">{opportunity.ownerPropertyAddress}</p>
      )}

      {opportunity.lostReason && <p className="text-xs text-danger">Motivo: {opportunity.lostReason}</p>}

      <div className="flex items-start justify-between gap-2 text-xs text-muted-foreground">
        <span className="shrink-0">{getUserForContact(opportunity.assignedUserId)?.name ?? ''}</span>
        {opportunity.nextActionAt && (
          <span className={overdue ? 'flex items-start gap-1 text-right font-medium text-danger' : 'text-right'}>
            {overdue && <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />}
            {opportunity.nextActionLabel}
          </span>
        )}
      </div>
    </div>
  )
}
