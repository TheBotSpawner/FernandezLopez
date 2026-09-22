import type { Branch, Organization } from '@/types/session'

// Fictional demo branches — not confirmed real Fernández López locations.
export const ORGANIZATION: Organization = {
  id: 'org-fl',
  name: 'Fernández López',
  phone: '+54 11 4555-0100',
  email: 'contacto@fernandezlopez.com.ar',
  address: 'Av. Congreso 2450, CABA',
  timezone: 'America/Argentina/Buenos_Aires',
  currency: 'ARS',
  cuit: '30-71234567-8',
}

export const BRANCHES: Branch[] = [
  { id: 'branch-coghlan', organizationId: 'org-fl', name: 'Coghlan', address: 'Av. Congreso 2450, Coghlan', phone: '+54 11 4555-0101', status: 'active' },
  { id: 'branch-belgrano', organizationId: 'org-fl', name: 'Belgrano', address: 'Av. Cabildo 2100, Belgrano', phone: '+54 11 4555-0102', status: 'active' },
]

export const BRANCH_IDS = {
  coghlan: 'branch-coghlan',
  belgrano: 'branch-belgrano',
} as const
