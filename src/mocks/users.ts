import type { User } from '@/types/session'

// Fictional demo staff — not real Fernández López employees.
export const USERS: User[] = [
  {
    id: 'user-martin',
    organizationId: 'org-fl',
    branchId: 'branch-coghlan',
    name: 'Martín Aguirre',
    role: 'MANAGER',
    avatarInitials: 'MA',
  },
  {
    id: 'user-camila',
    organizationId: 'org-fl',
    branchId: 'branch-coghlan',
    name: 'Carlos Fernandez',
    role: 'ADMIN',
    avatarInitials: 'CF',
  },
  {
    id: 'user-lucia',
    organizationId: 'org-fl',
    branchId: 'branch-belgrano',
    name: 'Lucía Romero',
    role: 'ADMINISTRATION',
    avatarInitials: 'LR',
  },
  {
    id: 'user-nicolas',
    organizationId: 'org-fl',
    branchId: 'branch-coghlan',
    name: 'Nicolás Paz',
    role: 'AGENT',
    avatarInitials: 'NP',
  },
]

export const DEFAULT_USER_ID = 'user-martin'

export function getUserByRole(role: User['role']): User {
  const user = USERS.find((candidate) => candidate.role === role)
  if (!user) throw new Error(`No demo user configured for role ${role}`)
  return user
}
