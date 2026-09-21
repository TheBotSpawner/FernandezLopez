export type ActivityEntityType = 'contact' | 'opportunity'

export interface ActivityEvent {
  id: string
  entityType: ActivityEntityType
  entityId: string
  label: string
  date: string
}
