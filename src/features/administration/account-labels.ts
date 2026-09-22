import type { StatusTone } from '@/components/data-display/StatusBadge'
import type { ChargeType, EffectiveChargeStatus, MovementType, PaymentMethod, SettlementStatus } from '@/types/contract-account'
import type { ObligationConceptType, ObligationResponsibility } from '@/types/rental-contract'

export const OBLIGATION_TYPE_LABELS: Record<ObligationConceptType, string> = {
  RENT: 'Alquiler',
  EXPENSES: 'Expensas',
  ABL: 'ABL',
  AYSA: 'AYSA',
  ELECTRICITY: 'Electricidad',
  GAS: 'Gas',
  OTHER: 'Otro',
}

export const CHARGE_TYPE_LABELS: Record<ChargeType, string> = {
  ...OBLIGATION_TYPE_LABELS,
  INTEREST: 'Interés',
}

export const RESPONSIBILITY_LABELS: Record<ObligationResponsibility, string> = {
  TENANT: 'Inquilino',
  OWNER: 'Propietario',
  BY_CONTRACT: 'Según contrato',
}

export const CHARGE_STATUS_LABELS: Record<EffectiveChargeStatus, string> = {
  PENDING: 'Pendiente',
  PARTIAL: 'Pago parcial',
  PAID: 'Pagado',
  OVERDUE: 'Vencido',
}

export const CHARGE_STATUS_TONES: Record<EffectiveChargeStatus, StatusTone> = {
  PENDING: 'warning',
  PARTIAL: 'warning',
  PAID: 'success',
  OVERDUE: 'danger',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  TRANSFER: 'Transferencia',
  CASH: 'Efectivo',
  DEPOSIT: 'Depósito',
  OTHER: 'Otro',
}

export const SETTLEMENT_STATUS_LABELS: Record<SettlementStatus, string> = {
  DRAFT: 'Borrador',
  READY: 'Lista',
  PAID: 'Pagada',
}

export const SETTLEMENT_STATUS_TONES: Record<SettlementStatus, StatusTone> = {
  DRAFT: 'muted',
  READY: 'info',
  PAID: 'success',
}

export const MOVEMENT_TYPE_LABELS: Record<MovementType, string> = {
  CHARGE_CREATED: 'Cargo generado',
  PAYMENT_RECEIVED: 'Pago recibido',
  PAYMENT_APPLIED: 'Pago aplicado',
  CREDIT_APPLIED: 'Saldo a favor aplicado',
  RECEIPT_ISSUED: 'Recibo emitido',
  SETTLEMENT_CREATED: 'Liquidación generada',
}
