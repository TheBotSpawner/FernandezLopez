import { DEFAULT_USER_ID, USERS, getUserByRole } from '@/mocks/users'
import type { User, UserRole } from '@/types/session'

export function getDemoUsers(): User[] {
  return USERS
}

export function getDefaultUser(): User {
  const user = USERS.find((candidate) => candidate.id === DEFAULT_USER_ID)
  if (!user) throw new Error('Default demo user not found')
  return user
}

export function getDemoUserForRole(role: UserRole): User {
  return getUserByRole(role)
}
