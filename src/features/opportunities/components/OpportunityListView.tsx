import { AlertTriangle, Handshake } from 'lucide-react'
import { Link } from 'react-router-dom'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { formatShortDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { getUserForContact } from '@/mocks/contacts'
import { findContactSync } from '@/services/contact-service'
import type { Opportunity } from '@/types/opportunity'
import { isNextActionOverdue, opportunityBudgetLine, opportunityZoneLine } from '../opportunity-format'
import { OPPORTUNITY_TYPE_LABELS } from '../opportunity-labels'
import { OpportunityStageBadge } from './OpportunityStageBadge'

export function OpportunityListView({ opportunities, loading }: { opportunities: Opportunity[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    )
  }

  if (opportunities.length === 0) {
    return <EmptyState icon={Handshake} message="No hay oportunidades con estos filtros." />
  }

  return (
    <>
      <div className="flex flex-col gap-2 md:hidden">
        {opportunities.map((opportunity) => {
          const contact = findContactSync(opportunity.contactId)
          return (
            <Link
              key={opportunity.id}
              to={`/commercial/opportunities/${opportunity.id}`}
              className="flex flex-col gap-1.5 rounded-lg border border-border p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-foreground">{contact?.fullName ?? 'Contacto'}</span>
                <OpportunityStageBadge stage={opportunity.stage} />
              </div>
              <p className="text-xs text-muted-foreground">{OPPORTUNITY_TYPE_LABELS[opportunity.type]}</p>
            </Link>
          )
        })}
      </div>

      <div className="hidden overflow-hidden rounded-lg border border-border md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
              <th className="px-3 py-2 font-medium">Contacto</th>
              <th className="px-3 py-2 font-medium">Tipo</th>
              <th className="px-3 py-2 font-medium">Estado</th>
              <th className="px-3 py-2 font-medium">Presupuesto / Zona</th>
              <th className="px-3 py-2 font-medium">Responsable</th>
              <th className="px-3 py-2 font-medium">Próxima acción</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {opportunities.map((opportunity) => {
              const contact = findContactSync(opportunity.contactId)
              const agent = getUserForContact(opportunity.assignedUserId)
              const overdue = isNextActionOverdue(opportunity)
              return (
                <tr key={opportunity.id} className="transition-colors hover:bg-muted/50">
                  <td className="px-3 py-2">
                    <Link to={`/commercial/opportunities/${opportunity.id}`} className="font-medium text-foreground hover:underline">
                      {contact?.fullName ?? 'Contacto'}
                    </Link>
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{OPPORTUNITY_TYPE_LABELS[opportunity.type]}</td>
                  <td className="px-3 py-2">
                    <OpportunityStageBadge stage={opportunity.stage} />
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {opportunityBudgetLine(opportunity) ?? opportunityZoneLine(opportunity) ?? '—'}
                  </td>
                  <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{agent?.name ?? '—'}</td>
                  <td className="px-3 py-2 whitespace-nowrap">
                    {opportunity.nextActionAt ? (
                      <span className={cn('flex items-center gap-1', overdue ? 'font-medium text-danger' : 'text-muted-foreground')}>
                        {overdue && <AlertTriangle className="size-3.5" />}
                        {formatShortDate(opportunity.nextActionAt)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
