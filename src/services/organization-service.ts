import { BRANCHES, ORGANIZATION } from '@/mocks/organization'
import { loadOrSeed, persist } from '@/lib/local-store'
import type { Branch, Organization } from '@/types/session'

const ORG_KEY = 'fl.settings.organization'
const BRANCHES_KEY = 'fl.settings.branches'

// Organization is a single record, not a list — reuse the array-based
// localStorage helpers with a one-element array rather than adding a
// separate single-object persistence utility for one caller.
let organization: Organization = loadOrSeed(ORG_KEY, [ORGANIZATION])[0]
let branches: Branch[] = loadOrSeed(BRANCHES_KEY, BRANCHES)

function saveOrganization() {
  persist(ORG_KEY, [organization])
}

function saveBranches() {
  persist(BRANCHES_KEY, branches)
}

export function getOrganization(): Organization {
  return organization
}

export function getBranches(): Branch[] {
  return branches
}

export function findBranchSync(id: string): Branch | undefined {
  return branches.find((branch) => branch.id === id)
}

export async function updateOrganization(input: Partial<Omit<Organization, 'id'>>): Promise<Organization> {
  organization = { ...organization, ...input }
  saveOrganization()
  return organization
}

export interface BranchInput {
  name: string
  address?: string
  phone?: string
}

export async function createBranch(input: BranchInput): Promise<Branch> {
  const branch: Branch = { id: `branch-${Date.now()}`, organizationId: organization.id, status: 'active', ...input }
  branches = [...branches, branch]
  saveBranches()
  return branch
}

export async function updateBranch(id: string, input: Partial<BranchInput>): Promise<Branch> {
  branches = branches.map((branch) => (branch.id === id ? { ...branch, ...input } : branch))
  saveBranches()
  return branches.find((branch) => branch.id === id)!
}

export async function setBranchStatus(id: string, status: Branch['status']): Promise<Branch> {
  branches = branches.map((branch) => (branch.id === id ? { ...branch, status } : branch))
  saveBranches()
  return branches.find((branch) => branch.id === id)!
}
