import type { UserRole } from '@/types/session'

// Small centralized capability lookup — see docs/architecture.md#permission-architecture-direction.
// Prototype-level only: covers the capabilities Reports/Settings actually gate,
// not a generic permission engine.
export type Capability =
  | 'reports.commercial.view'
  | 'reports.commercial.viewOrgWide'
  | 'reports.property.view'
  | 'reports.administration.view'
  | 'reports.administration.viewFinancials'
  | 'settings.view'
  | 'settings.organization.edit'
  | 'settings.branches.edit'
  | 'settings.users.edit'

const CAPABILITIES_BY_ROLE: Record<UserRole, Capability[]> = {
  ADMIN: [
    'reports.commercial.view',
    'reports.commercial.viewOrgWide',
    'reports.property.view',
    'reports.administration.view',
    'reports.administration.viewFinancials',
    'settings.view',
    'settings.organization.edit',
    'settings.branches.edit',
    'settings.users.edit',
  ],
  MANAGER: [
    'reports.commercial.view',
    'reports.commercial.viewOrgWide',
    'reports.property.view',
    'reports.administration.view',
    'reports.administration.viewFinancials',
    'settings.view',
  ],
  ADMINISTRATION: ['reports.administration.view', 'reports.administration.viewFinancials'],
  AGENT: ['reports.commercial.view', 'reports.property.view'],
}

export function can(role: UserRole, capability: Capability): boolean {
  return CAPABILITIES_BY_ROLE[role].includes(capability)
}
