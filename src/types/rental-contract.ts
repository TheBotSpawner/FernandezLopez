export type ContractStatus = 'DRAFT' | 'UPCOMING' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED'

export type AdjustmentMethod = 'IPC' | 'ICL' | 'MANUAL' | 'OTHER'

export type AdjustmentFrequency = 'QUARTERLY' | 'FOUR_MONTHLY' | 'SEMIANNUAL' | 'ANNUAL' | 'CUSTOM'

/** Cadence in months per frequency — null for CUSTOM, which has no fixed cadence. */
export const ADJUSTMENT_FREQUENCY_MONTHS: Record<AdjustmentFrequency, number | null> = {
  QUARTERLY: 3,
  FOUR_MONTHLY: 4,
  SEMIANNUAL: 6,
  ANNUAL: 12,
  CUSTOM: null,
}

export type GuaranteeType = 'OWNER_GUARANTEE' | 'INSURANCE' | 'PAYSLIP' | 'GUARANTOR' | 'OTHER'

export type ObligationConceptType = 'RENT' | 'EXPENSES' | 'ABL' | 'AYSA' | 'ELECTRICITY' | 'GAS' | 'OTHER'

export type ObligationResponsibility = 'TENANT' | 'OWNER' | 'BY_CONTRACT'

/**
 * Which recurring concepts apply to a contract, independent of any given
 * month's amount — one entry per `ObligationConceptType`, always present
 * (RENT is always `enabled`). Embedded directly on `RentalContract` rather
 * than a separate store: it's 1:1 owned data edited as a whole, not a
 * growing collection.
 */
export interface ContractObligation {
  type: ObligationConceptType
  enabled: boolean
  provider?: string
  responsibility?: ObligationResponsibility
  notes?: string
}

export const OBLIGATION_CONCEPT_TYPES: ObligationConceptType[] = ['RENT', 'EXPENSES', 'ABL', 'AYSA', 'ELECTRICITY', 'GAS', 'OTHER']

/** A sensible default obligation set for a newly-created contract — everything but RENT starts disabled. */
export function defaultObligations(): ContractObligation[] {
  return OBLIGATION_CONCEPT_TYPES.map((type) => ({
    type,
    enabled: type === 'RENT',
    responsibility: type === 'RENT' ? 'TENANT' : undefined,
  }))
}

export interface RentalContract {
  id: string
  organizationId: string
  branchId: string
  contractNumber: string

  propertyId: string
  tenantIds: string[]
  ownerIds: string[]

  startDate: string
  endDate: string

  initialRent: number
  currentRent: number
  currency: 'ARS' | 'USD'

  adjustmentMethod: AdjustmentMethod
  adjustmentFrequency: AdjustmentFrequency
  lastAdjustmentDate?: string
  nextAdjustmentDate?: string

  deposit?: number
  guaranteeType?: GuaranteeType

  obligations: ContractObligation[]

  status: ContractStatus
  documentUrl?: string
  notes?: string

  createdAt: string
  updatedAt: string
}

export interface RentalContractQuery {
  search?: string
  branchId?: string | 'all'
  status?: ContractStatus[]
  adjustmentMethod?: AdjustmentMethod[]
  expiration?: 'within30' | 'within60' | 'within90' | 'expired'
  sort?: 'endDate' | 'nextAdjustment' | 'rentDesc' | 'rentAsc' | 'recent'
}

export interface RentalContractInput {
  branchId: string
  propertyId: string
  tenantIds: string[]
  ownerIds: string[]
  startDate: string
  endDate: string
  initialRent: number
  currentRent: number
  currency: 'ARS' | 'USD'
  adjustmentMethod: AdjustmentMethod
  adjustmentFrequency: AdjustmentFrequency
  nextAdjustmentDate?: string
  deposit?: number
  guaranteeType?: GuaranteeType
  notes?: string
}
