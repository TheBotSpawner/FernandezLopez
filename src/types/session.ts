export type UserRole = 'ADMIN' | 'MANAGER' | 'ADMINISTRATION' | 'AGENT'

export interface Organization {
  id: string
  name: string
  phone?: string
  email?: string
  address?: string
  timezone?: string
  currency?: 'ARS' | 'USD'
  cuit?: string
}

export type BranchStatus = 'active' | 'inactive'

export interface Branch {
  id: string
  organizationId: string
  name: string
  address?: string
  phone?: string
  status: BranchStatus
}

export type UserStatus = 'active' | 'inactive'

export interface User {
  id: string
  organizationId: string
  branchId: string
  name: string
  email: string
  role: UserRole
  status: UserStatus
  avatarInitials: string
}
