import type { ObligationConceptType, ObligationResponsibility } from './rental-contract'

export type ChargeType = ObligationConceptType | 'INTEREST'

/** Stored states only — `OVERDUE` is a display-time overlay, not a stored value (see `effectiveChargeStatus()`). */
export type ChargeStatus = 'PENDING' | 'PARTIAL' | 'PAID'

/** Same as `ChargeStatus` plus the derived `OVERDUE` band shown in the UI. */
export type EffectiveChargeStatus = ChargeStatus | 'OVERDUE'

export type ChargeSource = 'RECURRING' | 'MANUAL'

export interface ContractCharge {
  id: string
  contractId: string
  /** `YYYY-MM` */
  period: string

  type: ChargeType
  description: string
  provider?: string

  amount: number
  /** Sum of allocations applied so far — kept in sync by `payment-service.ts` when a payment is registered. */
  paidAmount: number
  dueDate: string
  status: ChargeStatus

  responsibility?: ObligationResponsibility
  source: ChargeSource
  notes?: string

  createdAt: string
  updatedAt: string
}

export interface ContractChargeInput {
  contractId: string
  period: string
  type: ChargeType
  description: string
  provider?: string
  amount: number
  dueDate: string
  responsibility?: ObligationResponsibility
  notes?: string
}

export type PaymentMethod = 'TRANSFER' | 'CASH' | 'DEPOSIT' | 'OTHER'

export interface PaymentAllocation {
  /** `null` = held as unallocated credit rather than applied to a specific charge. */
  chargeId: string | null
  amount: number
}

export interface Payment {
  id: string
  contractId: string
  /** `YYYY-MM-DD` */
  date: string
  /** Cash amount received — `0` for a pure credit-application entry (see `applyCreditToCharge`). */
  amount: number
  method: PaymentMethod
  notes?: string
  allocations: PaymentAllocation[]
  /** True for a zero-cash payment that moves money from the credit pool to a real charge. */
  isCreditApplication?: boolean
  createdAt: string
}

export interface PaymentInput {
  contractId: string
  date: string
  amount: number
  method: PaymentMethod
  notes?: string
  /** Explicit allocations to specific charges; any remainder becomes credit. */
  allocations: { chargeId: string; amount: number }[]
}

export interface ReceiptItem {
  description: string
  amount: number
}

export interface Receipt {
  id: string
  contractId: string
  /** Absent for a manually-generated period receipt covering several payments at once. */
  paymentId?: string
  number: string
  date: string
  /** `YYYY-MM` of the primary period covered — the first allocated charge's period. */
  period: string
  items: ReceiptItem[]
  total: number
  paymentMethod: PaymentMethod
  notes?: string
  createdAt: string
}

export type SettlementStatus = 'DRAFT' | 'READY' | 'PAID'

export interface SettlementDeduction {
  description: string
  amount: number
}

export interface OwnerSettlement {
  id: string
  contractId: string
  ownerIds: string[]
  /** `YYYY-MM` */
  period: string

  grossCollected: number
  feeType: 'PERCENTAGE' | 'FIXED'
  feeValue: number
  administrationFee: number
  deductions: SettlementDeduction[]
  netAmount: number

  status: SettlementStatus
  notes?: string

  createdAt: string
  updatedAt: string
}

export interface OwnerSettlementInput {
  contractId: string
  ownerIds: string[]
  period: string
  grossCollected: number
  feeType: 'PERCENTAGE' | 'FIXED'
  feeValue: number
  deductions: SettlementDeduction[]
  notes?: string
}

export interface OwnerSettlementQuery {
  period?: string
  status?: SettlementStatus[]
  ownerId?: string
  branchId?: string | 'all'
}

/**
 * A contract's operational movement history — always derived at read time
 * from `ContractCharge`/`Payment`/`Receipt`/`OwnerSettlement` records, never
 * stored separately, so it can't drift from the data it summarizes. See
 * `features/administration/movement-derivations.ts`.
 */
export type MovementType =
  | 'CHARGE_CREATED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_APPLIED'
  | 'CREDIT_APPLIED'
  | 'RECEIPT_ISSUED'
  | 'SETTLEMENT_CREATED'

export type MovementDirection = 'DEBIT' | 'CREDIT' | 'NEUTRAL'

export interface ContractMovement {
  id: string
  contractId: string
  date: string
  period?: string
  type: MovementType
  description: string
  amount: number
  direction: MovementDirection
  chargeId?: string
  paymentId?: string
  receiptId?: string
  settlementId?: string
}
