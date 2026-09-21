import type { Branch, Organization } from '@/types/session'

// Fictional demo branches — not confirmed real Fernández López locations.
export const ORGANIZATION: Organization = {
  id: 'org-fl',
  name: 'Fernández López',
}

export const BRANCHES: Branch[] = [
  { id: 'branch-coghlan', organizationId: 'org-fl', name: 'Coghlan' },
  { id: 'branch-belgrano', organizationId: 'org-fl', name: 'Belgrano' },
]

export const BRANCH_IDS = {
  coghlan: 'branch-coghlan',
  belgrano: 'branch-belgrano',
} as const
