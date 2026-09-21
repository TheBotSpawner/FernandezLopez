import type { StatusTone } from '@/components/data-display/StatusBadge'
import type { VisitStatus } from '@/types/dashboard'
import type { VisitOutcome } from '@/types/visit'
import type { OpportunityStage } from '@/types/opportunity'

export const VISIT_STATUS_TONES: Record<VisitStatus, StatusTone> = {
  Programada: 'info',
  Confirmada: 'success',
  Realizada: 'muted',
  Cancelada: 'danger',
  Reprogramada: 'warning',
}

export const VISIT_OUTCOME_OPTIONS: VisitOutcome[] = ['Interesado', 'Quiere reservar', 'No interesado', 'Reprogramar']

/**
 * Visit outcome → opportunity stage feedback loop. Only outcomes that clearly
 * imply forward pipeline movement advance the stage automatically; "No
 * interesado" and "Reprogramar" are left for the agent to act on manually.
 * Applied only when the target stage is valid for the opportunity's type
 * (see `stagesFor()`), so owner-side opportunities are unaffected.
 */
export const VISIT_OUTCOME_STAGE_MAP: Partial<Record<VisitOutcome, OpportunityStage>> = {
  Interesado: 'Negociación',
  'Quiere reservar': 'Reserva',
}
