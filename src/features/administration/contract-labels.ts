import type { StatusTone } from '@/components/data-display/StatusBadge'
import type { AdjustmentFrequency, AdjustmentMethod, ContractStatus, GuaranteeType } from '@/types/rental-contract'
import type { ExpirationSeverity } from './expiration-utils'

export const CONTRACT_STATUS_LABELS: Record<ContractStatus, string> = {
  DRAFT: 'Borrador',
  UPCOMING: 'Próximo',
  ACTIVE: 'Activo',
  EXPIRED: 'Vencido',
  TERMINATED: 'Finalizado',
}

export const CONTRACT_STATUS_TONES: Record<ContractStatus, StatusTone> = {
  DRAFT: 'muted',
  UPCOMING: 'info',
  ACTIVE: 'success',
  EXPIRED: 'danger',
  TERMINATED: 'muted',
}

export const ADJUSTMENT_METHOD_LABELS: Record<AdjustmentMethod, string> = {
  IPC: 'IPC',
  ICL: 'ICL',
  MANUAL: 'Manual',
  OTHER: 'Otro',
}

export const ADJUSTMENT_FREQUENCY_LABELS: Record<AdjustmentFrequency, string> = {
  QUARTERLY: 'Trimestral',
  FOUR_MONTHLY: 'Cuatrimestral',
  SEMIANNUAL: 'Semestral',
  ANNUAL: 'Anual',
  CUSTOM: 'Personalizada',
}

export const GUARANTEE_TYPE_LABELS: Record<GuaranteeType, string> = {
  OWNER_GUARANTEE: 'Garantía propietaria',
  INSURANCE: 'Seguro de caución',
  PAYSLIP: 'Recibo de sueldo',
  GUARANTOR: 'Fiador',
  OTHER: 'Otra',
}

export const EXPIRATION_SEVERITY_TONES: Record<ExpirationSeverity, StatusTone> = {
  normal: 'muted',
  within90: 'info',
  within60: 'warning',
  within30: 'danger',
  expired: 'danger',
}
