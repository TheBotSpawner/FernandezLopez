import { loadOrSeed, persist } from '@/lib/local-store'
import type { ActivityEntityType, ActivityEvent } from '@/types/activity'

const STORAGE_KEY = 'fl.crm.activity'

let events: ActivityEvent[] = loadOrSeed(STORAGE_KEY, [])

function save() {
  persist(STORAGE_KEY, events)
}

/** Appends a timeline event for a contact or opportunity — called by the other CRM services as a side effect of user actions. */
export function recordActivity(entityType: ActivityEntityType, entityId: string, label: string): void {
  if (!entityId) return
  events = [
    ...events,
    { id: `activity-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, entityType, entityId, label, date: new Date().toISOString() },
  ]
  save()
}

export function getRecordedActivity(entityType: ActivityEntityType, entityId: string): ActivityEvent[] {
  return events.filter((event) => event.entityType === entityType && event.entityId === entityId)
}
