import { getRecordedActivity } from '@/services/activity-service'
import type { Contact, ContactNote } from '@/types/contact'
import type { Opportunity } from '@/types/opportunity'
import type { Visit } from '@/types/visit'

export interface TimelineEntry {
  id: string
  label: string
  date: string
}

/** Most events are derived straight from entity timestamps; only stage-change history (which stage changes overwrite) needs the recorded activity log. */
export function buildContactTimeline(
  contact: Contact,
  opportunities: Opportunity[],
  visits: Visit[],
  notes: ContactNote[],
): TimelineEntry[] {
  const entries: TimelineEntry[] = [{ id: `created-${contact.id}`, label: 'Contacto creado', date: contact.createdAt }]

  for (const opportunity of opportunities) {
    entries.push({ id: `opp-created-${opportunity.id}`, label: 'Oportunidad creada', date: opportunity.createdAt })
  }

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

  for (const note of notes) {
    entries.push({ id: `note-${note.id}`, label: 'Nota agregada', date: note.createdAt })
  }

  for (const event of getRecordedActivity('contact', contact.id)) {
    entries.push({ id: event.id, label: event.label, date: event.date })
  }

  return entries.sort((a, b) => b.date.localeCompare(a.date))
}
