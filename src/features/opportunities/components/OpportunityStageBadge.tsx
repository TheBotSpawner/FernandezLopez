import { StatusBadge } from '@/components/data-display/StatusBadge'
import { STAGE_TONES } from '../opportunity-labels'
import type { OpportunityStage } from '@/types/opportunity'

export function OpportunityStageBadge({ stage }: { stage: OpportunityStage }) {
  return <StatusBadge tone={STAGE_TONES[stage]}>{stage}</StatusBadge>
}
