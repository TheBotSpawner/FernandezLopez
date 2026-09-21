import type { StatusTone } from '@/components/data-display/StatusBadge'
import type { OpportunityStage, OpportunityType } from '@/types/opportunity'

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  RENT_SEARCH: 'Busca alquilar',
  BUY_SEARCH: 'Busca comprar',
  OWNER_RENT: 'Quiere alquilar una propiedad',
  OWNER_SELL: 'Quiere vender una propiedad',
}

export const STAGE_TONES: Record<OpportunityStage, StatusTone> = {
  Nueva: 'info',
  Contactado: 'info',
  'Propiedades seleccionadas': 'warning',
  Visita: 'warning',
  Tasación: 'warning',
  Captación: 'warning',
  Negociación: 'warning',
  Publicada: 'success',
  Reserva: 'success',
  Cerrada: 'success',
  Perdida: 'danger',
}
