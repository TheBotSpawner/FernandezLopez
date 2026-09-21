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
