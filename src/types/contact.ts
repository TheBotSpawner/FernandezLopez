export type ContactRole = 'prospect' | 'tenant' | 'buyer' | 'owner' | 'seller'

export interface Contact {
  id: string
  organizationId: string
  branchId: string
  fullName: string
  phone: string
  email: string
  roles: ContactRole[]
  assignedUserId: string
  notes?: string
  source?: string
  lastActivityAt: string
  createdAt: string
  updatedAt: string
}

export interface ContactNote {
  id: string
  contactId: string
  authorUserId: string
  text: string
  createdAt: string
}

export interface ContactQuery {
  search?: string
  branchId?: string | 'all'
  roles?: ContactRole[]
  assignedUserId?: string
}

export interface ContactInput {
  fullName: string
  phone: string
  email: string
  roles: ContactRole[]
  assignedUserId: string
  branchId: string
  notes?: string
}
