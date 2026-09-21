export type UserRole = 'ADMIN' | 'MANAGER' | 'ADMINISTRATION' | 'AGENT'

export interface Organization {
  id: string
  name: string
}

export interface Branch {
  id: string
  organizationId: string
  name: string
}

export interface User {
  id: string
  organizationId: string
  branchId: string
  name: string
  role: UserRole
  avatarInitials: string
}
