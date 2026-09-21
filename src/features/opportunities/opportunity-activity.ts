import { getRecordedActivity } from '@/services/activity-service'
import type { Opportunity } from '@/types/opportunity'
import type { Visit } from '@/types/visit'

export interface TimelineEntry {
  id: string
  label: string
  date: string
}

export function buildOpportunityTimeline(opportunity: Opportunity, visits: Visit[]): TimelineEntry[] {
  const entries: TimelineEntry[] = [{ id: `created-${opportunity.id}`, label: 'Oportunidad creada', date: opportunity.createdAt }]

  for (const visit of visits) {
    entries.push({ id: `visit-created-${visit.id}`, label: 'Visita agendada', date: visit.createdAt })
    if (visit.status === 'Realizada') {
      entries.push({
        id: `visit-done-${visit.id}`,
        label: `Visita realizada${visit.outcome ? ` · ${visit.outcome}` : ''}`,
        date: visit.updatedAt,
      })
    }
  }

  if (opportunity.linkedPropertyIds.length > 0) {
    entries.push({
      id: `linked-${opportunity.id}`,
      label: `${opportunity.linkedPropertyIds.length} propiedad${opportunity.linkedPropertyIds.length === 1 ? '' : 'es'} vinculada${opportunity.linkedPropertyIds.length === 1 ? '' : 's'}`,
      date: opportunity.updatedAt,
    })
  }

  for (const event of getRecordedActivity('opportunity', opportunity.id)) {
    entries.push({ id: event.id, label: event.label, date: event.date })
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date))
}
