import type { VisitStatus } from './dashboard'

export type VisitOutcome = 'Interesado' | 'Quiere reservar' | 'No interesado' | 'Reprogramar'

export interface Visit {
  id: string
  organizationId: string
  branchId: string

  contactId: string
  opportunityId?: string
  propertyId: string
  assignedUserId: string

  startAt: string
  endAt: string

  status: VisitStatus
  notes?: string
  outcome?: VisitOutcome

  createdAt: string
  updatedAt: string
}

export interface VisitQuery {
  branchId?: string | 'all'
  assignedUserId?: string
  contactId?: string
  opportunityId?: string
  propertyId?: string
  status?: VisitStatus[]
  from?: string
  to?: string
}

export interface VisitInput {
  contactId: string
  opportunityId?: string
  propertyId: string
  assignedUserId: string
  branchId: string
  startAt: string
  endAt: string
  notes?: string
}

export type { VisitStatus }
