import { DEFAULT_USER_ID, USERS } from '@/mocks/users'
import { loadOrSeed, persist } from '@/lib/local-store'
import type { User, UserRole } from '@/types/session'

const KEY = 'fl.settings.users'

let users: User[] = loadOrSeed(KEY, USERS)

function save() {
  persist(KEY, users)
}

export function getDemoUsers(): User[] {
  return users
}

export function getDefaultUser(): User {
  const user = users.find((candidate) => candidate.id === DEFAULT_USER_ID) ?? users[0]
  if (!user) throw new Error('No demo users configured')
  return user
}

/** Prefers an active user for the role (used by the dev-only role switcher); falls back to any match. */
export function getDemoUserForRole(role: UserRole): User {
  const user = users.find((candidate) => candidate.role === role && candidate.status === 'active') ?? users.find((candidate) => candidate.role === role)
  if (!user) throw new Error(`No demo user configured for role ${role}`)
  return user
}

export function findUserSync(id: string): User | undefined {
  return users.find((user) => user.id === id)
}

export interface UserInput {
  name: string
  email: string
  role: UserRole
  branchId: string
}

export async function createUser(input: UserInput): Promise<User> {
  const initials = input.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join('')
  const user: User = {
    id: `user-${Date.now()}`,
    organizationId: 'org-fl',
    status: 'active',
    avatarInitials: initials || '??',
    ...input,
  }
  users = [...users, user]
  save()
  return user
}

export async function updateUser(id: string, input: Partial<UserInput>): Promise<User> {
  users = users.map((user) => (user.id === id ? { ...user, ...input } : user))
  save()
  return users.find((user) => user.id === id)!
}

export async function setUserStatus(id: string, status: User['status']): Promise<User> {
  users = users.map((user) => (user.id === id ? { ...user, status } : user))
  save()
  return users.find((user) => user.id === id)!
}
