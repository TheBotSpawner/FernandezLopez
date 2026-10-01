// Prototype reference model — the real consorcio workflow is not yet
// validated with Fernández López, see docs/modules/consorcios.md.

export type ConsorcioStatus = 'ACTIVE' | 'ONBOARDING'

export interface Consorcio {
  id: string
  organizationId: string
  branchId: string
  name: string
  address: string
  neighborhood: string
  city: string
  taxId?: string
  administratorUserId?: string
  /** Encargado del edificio. */
  managerName?: string
  managerPhone?: string
  /** `YYYY-MM` of the expensas period currently being collected. */
  currentPeriod: string
  status: ConsorcioStatus
  /** Current reserve fund balance. */
  reserveFund?: number
  /** Monthly contribution to the reserve fund, added on top of the period's expenses. */
  reserveContribution: number
  notes?: string
  createdAt: string
  updatedAt: string
}

export type UnitExpenseStatus = 'PAID' | 'PENDING' | 'PARTIAL'

export interface ConsorcioUnit {
  id: string
  consorcioId: string
  unitLabel: string
  floor?: string
  functionalUnitNumber?: number
  ownerContactId?: string
  occupantContactId?: string
  /** Percentage of the building's expenses this unit pays (all units sum to 100). */
  coefficient?: number
  currentExpenseAmount?: number
  /** Amount already collected for the current period. */
  paidAmount?: number
  expenseStatus?: UnitExpenseStatus
  /** Set when Fernández López also manages/sells/rents this unit as a Property. */
  linkedPropertyId?: string
}

export interface ConsorcioExpense {
  id: string
  consorcioId: string
  period: string
  description: string
  category: string
  amount: number
  /** `YYYY-MM-DD` */
  date: string
  provider?: string
  status: 'PAID' | 'PENDING'
}

export type MaintenanceStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED'

export interface ConsorcioIssue {
  id: string
  consorcioId: string
  title: string
  status: MaintenanceStatus
  provider?: string
  unitLabel?: string
  reportedAt: string
}

export interface ConsorcioDocument {
  id: string
  consorcioId: string
  name: string
  type: string
  /** `YYYY-MM-DD` */
  date: string
}

export interface ConsorcioAssembly {
  id: string
  consorcioId: string
  type: 'ORDINARY' | 'EXTRAORDINARY'
  date: string
  status: 'SCHEDULED' | 'DONE'
  notes?: string
}

/** Derived current-period figures — never stored, always computed from units/expenses. */
export interface ConsorcioPeriodSummary {
  expensesTotal: number
  reserveContribution: number
  totalToDistribute: number
  collected: number
  pending: number
  collectedPct: number
  pendingUnits: number
  openIssues: number
  unitCount: number
}
