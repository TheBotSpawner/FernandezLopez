import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { OPERATION_LABELS, PROPERTY_STATUS_LABELS, PROPERTY_STATUS_TONES } from '../property-labels'
import type { OperationType, PropertyStatus } from '@/types/property'

export function PropertyStatusBadge({ status, className }: { status: PropertyStatus; className?: string }) {
  return (
    <StatusBadge tone={PROPERTY_STATUS_TONES[status]} className={className}>
      {PROPERTY_STATUS_LABELS[status]}
    </StatusBadge>
  )
}

export function OperationBadge({ operation }: { operation: OperationType }) {
  return <Badge variant="secondary">{OPERATION_LABELS[operation]}</Badge>
}
