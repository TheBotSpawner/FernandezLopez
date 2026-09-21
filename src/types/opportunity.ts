import type { PropertyType } from './property'

export type OpportunityType = 'RENT_SEARCH' | 'BUY_SEARCH' | 'OWNER_RENT' | 'OWNER_SELL'

/** Buyer/tenant demand-side pipeline. Provisional — pending client validation (see docs). */
export type DemandStage =
  | 'Nueva'
  | 'Contactado'
  | 'Propiedades seleccionadas'
  | 'Visita'
  | 'Negociación'
  | 'Reserva'
  | 'Cerrada'
  | 'Perdida'

/** Owner-side acquisition pipeline. */
export type OwnerStage = 'Nueva' | 'Contactado' | 'Tasación' | 'Captación' | 'Publicada' | 'Cerrada' | 'Perdida'

export type OpportunityStage = DemandStage | OwnerStage

export const DEMAND_STAGES: DemandStage[] = [
  'Nueva',
  'Contactado',
  'Propiedades seleccionadas',
  'Visita',
  'Negociación',
  'Reserva',
  'Cerrada',
  'Perdida',
]

export const OWNER_STAGES: OwnerStage[] = ['Nueva', 'Contactado', 'Tasación', 'Captación', 'Publicada', 'Cerrada', 'Perdida']

export function isOwnerOpportunity(type: OpportunityType): boolean {
  return type === 'OWNER_RENT' || type === 'OWNER_SELL'
}

export function stagesFor(type: OpportunityType): OpportunityStage[] {
  return isOwnerOpportunity(type) ? OWNER_STAGES : DEMAND_STAGES
}

export type LostReason =
  | 'No responde'
  | 'No encontró propiedad'
  | 'Presupuesto insuficiente'
  | 'Eligió otra inmobiliaria'
  | 'Postergó decisión'
  | 'Otro'

export interface Opportunity {
  id: string
  organizationId: string
  branchId: string
  contactId: string
  assignedUserId: string

  type: OpportunityType
  stage: OpportunityStage

  budgetMin?: number
  budgetMax?: number
  currency?: 'ARS' | 'USD'

  preferredNeighborhoods?: string[]
  propertyTypes?: PropertyType[]
  rooms?: number

  /** For owner-side opportunities, the property being sold/rented if already known. */
  ownerPropertyAddress?: string

  linkedPropertyIds: string[]
  notes?: string
  lostReason?: LostReason

  nextActionAt?: string
  nextActionLabel?: string

  lastActivityAt: string
  createdAt: string
  updatedAt: string
}

export interface OpportunityQuery {
  search?: string
  branchId?: string | 'all'
  assignedUserId?: string
  type?: OpportunityType | 'all'
  stage?: OpportunityStage[]
  overdueOnly?: boolean
}

export interface OpportunityInput {
  contactId: string
  assignedUserId: string
  branchId: string
  type: OpportunityType
  budgetMin?: number
  budgetMax?: number
  currency?: 'ARS' | 'USD'
  preferredNeighborhoods?: string[]
  propertyTypes?: PropertyType[]
  rooms?: number
  ownerPropertyAddress?: string
  notes?: string
  nextActionAt?: string
  nextActionLabel?: string
}
