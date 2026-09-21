import { BRANCHES, ORGANIZATION } from '@/mocks/organization'
import type { Branch, Organization } from '@/types/session'

export function getOrganization(): Organization {
  return ORGANIZATION
}

export function getBranches(): Branch[] {
  return BRANCHES
}
