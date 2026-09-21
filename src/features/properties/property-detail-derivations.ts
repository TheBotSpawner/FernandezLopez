import { PROPERTY_STATUS_LABELS } from './property-labels'
import type { Property } from '@/types/property'

export interface PropertyHistoryEvent {
  id: string
  label: string
  date: string
}

export interface PropertyDocument {
  id: string
  label: string
  status: 'available' | 'pending'
}

/** Small seeded hash so derived demo data stays stable across renders/reloads. */
function seedFrom(id: string): number {
  let hash = 0
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) >>> 0
  return hash
}

export function buildPropertyHistory(property: Property): PropertyHistoryEvent[] {
  const events: PropertyHistoryEvent[] = [
    { id: 'created', label: 'Propiedad ingresada', date: property.createdAt },
  ]

  const seed = seedFrom(property.id)
  if (seed % 5 === 0 && property.updatedAt !== property.createdAt) {
    events.push({ id: 'price', label: 'Precio actualizado', date: property.updatedAt })
  }
  if (property.updatedAt !== property.createdAt) {
    events.push({
      id: 'status',
      label: `Estado actualizado a ${PROPERTY_STATUS_LABELS[property.status]}`,
      date: property.updatedAt,
    })
  }
  if (property.interest.visitsThisMonth > 0) {
    events.push({ id: 'visit', label: 'Visita realizada', date: property.interest.lastInquiryAt ?? property.updatedAt })
  }
  if (property.status === 'reserved') {
    events.push({ id: 'reservation', label: 'Reserva creada', date: property.updatedAt })
  }

  return events.sort((a, b) => b.date.localeCompare(a.date))
}

export function buildPropertyDocuments(property: Property): PropertyDocument[] {
  const documents: PropertyDocument[] = [
    { id: 'sheet', label: 'Ficha de propiedad', status: 'available' },
    { id: 'rules', label: 'Reglamento', status: 'available' },
    { id: 'plan', label: 'Plano', status: 'available' },
  ]

  if (property.status === 'available' || property.status === 'reserved' || property.status === 'valuation') {
    documents.push({ id: 'pending', label: 'Documentación pendiente', status: 'pending' })
  }

  return documents
}
