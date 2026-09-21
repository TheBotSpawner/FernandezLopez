import { formatPrice } from '@/lib/format'
import { isOwnerOpportunity } from '@/types/opportunity'
import type { Opportunity } from '@/types/opportunity'

export function opportunityBudgetLine(opportunity: Opportunity): string | null {
  if (isOwnerOpportunity(opportunity.type)) return opportunity.ownerPropertyAddress ?? null
  const { budgetMin, budgetMax, currency } = opportunity
  if (!currency || (budgetMin == null && budgetMax == null)) return null
  const suffix = currency === 'ARS' ? ' /mes' : ''
  if (budgetMin != null && budgetMax != null) return `${formatPrice(budgetMin, currency)} – ${formatPrice(budgetMax, currency).replace(/^\D+/, '')}${suffix}`
  if (budgetMax != null) return `Hasta ${formatPrice(budgetMax, currency)}${suffix}`
  return `Desde ${formatPrice(budgetMin!, currency)}${suffix}`
}

export function opportunityZoneLine(opportunity: Opportunity): string | null {
  if (isOwnerOpportunity(opportunity.type)) return null
  return opportunity.preferredNeighborhoods?.length ? opportunity.preferredNeighborhoods.join(', ') : null
}

export function isNextActionOverdue(opportunity: Opportunity): boolean {
  if (!opportunity.nextActionAt) return false
  return new Date(opportunity.nextActionAt) < new Date()
}
