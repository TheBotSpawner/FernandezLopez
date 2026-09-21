import { StatusBadge } from '@/components/data-display/StatusBadge'
import { CONTRACT_STATUS_LABELS, CONTRACT_STATUS_TONES } from '../contract-labels'
import type { ContractStatus } from '@/types/rental-contract'

export function ContractStatusBadge({ status }: { status: ContractStatus }) {
  return <StatusBadge tone={CONTRACT_STATUS_TONES[status]}>{CONTRACT_STATUS_LABELS[status]}</StatusBadge>
}
