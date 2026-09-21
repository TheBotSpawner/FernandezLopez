import type { OperationType, PropertyStatus, PropertyType } from '@/types/property'
import type { StatusTone } from '@/components/data-display/StatusBadge'

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  apartment: 'Departamento',
  house: 'Casa',
  ph: 'PH',
  commercial: 'Local',
  office: 'Oficina',
  parking: 'Cochera',
  land: 'Terreno',
  other: 'Otro',
}

export const OPERATION_LABELS: Record<OperationType, string> = {
  sale: 'Venta',
  rent: 'Alquiler',
}

export const PROPERTY_STATUS_LABELS: Record<PropertyStatus, string> = {
  available: 'Disponible',
  reserved: 'Reservada',
  rented: 'Alquilada',
  sold: 'Vendida',
  paused: 'Pausada',
  valuation: 'En tasación',
}

export const PROPERTY_STATUS_TONES: Record<PropertyStatus, StatusTone> = {
  available: 'success',
  reserved: 'warning',
  rented: 'info',
  sold: 'muted',
  paused: 'muted',
  valuation: 'info',
}
