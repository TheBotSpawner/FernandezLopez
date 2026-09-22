import { RENTAL_CONTRACTS } from '@/mocks/rental-contracts'
import { loadOrSeed, persist } from '@/lib/local-store'
import { daysUntil, expirationSeverity } from '@/features/administration/expiration-utils'
import { daysUntilAdjustment } from '@/features/administration/adjustment-utils'
import { findContactSync } from '@/services/contact-service'
import { findPropertySync } from '@/services/property-service'
import { defaultObligations } from '@/types/rental-contract'
import type { ContractObligation, RentalContract, RentalContractInput, RentalContractQuery } from '@/types/rental-contract'

const KEY = 'fl.administration.contracts'

let contracts: RentalContract[] = loadOrSeed(KEY, RENTAL_CONTRACTS)

function save() {
  persist(KEY, contracts)
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
}

function matchesQuery(contract: RentalContract, query: RentalContractQuery, haystacks: Map<string, string>): boolean {
  if (query.branchId && query.branchId !== 'all' && contract.branchId !== query.branchId) return false
  if (query.status?.length && !query.status.includes(contract.status)) return false
  if (query.adjustmentMethod?.length && !query.adjustmentMethod.includes(contract.adjustmentMethod)) return false
  if (query.expiration) {
    const severity = expirationSeverity(contract.endDate)
    if (query.expiration === 'expired' && severity !== 'expired') return false
    if (query.expiration === 'within30' && severity !== 'within30' && severity !== 'expired') return false
    if (query.expiration === 'within60' && !['within60', 'within30', 'expired'].includes(severity)) return false
    if (query.expiration === 'within90' && severity === 'normal') return false
  }
  if (query.search) {
    const needle = normalize(query.search)
    const haystack = haystacks.get(contract.id) ?? ''
    if (!haystack.includes(needle)) return false
  }
  return true
}

/**
 * Ascending by raw day-count would put the most-overdue item first (e.g. a
 * contract expired 492 days ago outranking one expiring in 5 days) — not
 * what "closest/next" means to a person. Not-yet-due items sort first
 * (soonest first); overdue items follow, most-recently-overdue first.
 */
function soonestFirst(a: number, b: number): number {
  if (a >= 0 && b >= 0) return a - b
  if (a >= 0) return -1
  if (b >= 0) return 1
  return b - a
}

function sortContracts(list: RentalContract[], sort: RentalContractQuery['sort'] = 'endDate'): RentalContract[] {
  const sorted = [...list]
  switch (sort) {
    case 'nextAdjustment':
      sorted.sort((a, b) => {
        const da = daysUntilAdjustment(a.nextAdjustmentDate) ?? Infinity
        const db = daysUntilAdjustment(b.nextAdjustmentDate) ?? Infinity
        return soonestFirst(da, db)
      })
      break
    case 'rentDesc':
      sorted.sort((a, b) => b.currentRent - a.currentRent)
      break
    case 'rentAsc':
      sorted.sort((a, b) => a.currentRent - b.currentRent)
      break
    case 'recent':
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      break
    default:
      sorted.sort((a, b) => soonestFirst(daysUntil(a.endDate), daysUntil(b.endDate)))
  }
  return sorted
}

/** Search matches property address, tenant/owner names, or contract number. */
function searchText(contract: RentalContract): string {
  const property = findPropertySync(contract.propertyId)
  const tenants = contract.tenantIds.map((id) => findContactSync(id)?.fullName ?? '').join(' ')
  const owners = contract.ownerIds.map((id) => findContactSync(id)?.fullName ?? '').join(' ')
  return `${contract.contractNumber} ${property?.address ?? ''} ${tenants} ${owners}`
}

export async function getContracts(query: RentalContractQuery = {}): Promise<RentalContract[]> {
  await delay(200)
  const haystacks = new Map(contracts.map((contract) => [contract.id, normalize(searchText(contract))]))
  const filtered = contracts.filter((contract) => matchesQuery(contract, query, haystacks))
  return sortContracts(filtered, query.sort)
}

export async function getContractById(id: string): Promise<RentalContract | null> {
  await delay(150)
  return contracts.find((contract) => contract.id === id) ?? null
}

export function findContractSync(id: string): RentalContract | undefined {
  return contracts.find((contract) => contract.id === id)
}

export function getContractsByProperty(propertyId: string): RentalContract[] {
  return contracts
    .filter((contract) => contract.propertyId === propertyId)
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
}

export function getActiveContractForProperty(propertyId: string): RentalContract | undefined {
  return contracts.find((contract) => contract.propertyId === propertyId && contract.status === 'ACTIVE')
}

export function getContractsByContact(contactId: string): RentalContract[] {
  return contracts
    .filter((contract) => contract.tenantIds.includes(contactId) || contract.ownerIds.includes(contactId))
    .sort((a, b) => b.startDate.localeCompare(a.startDate))
}

export function getExpiringContracts(days: number): RentalContract[] {
  return contracts
    .filter((contract) => contract.status === 'ACTIVE' && daysUntil(contract.endDate) <= days)
    .sort((a, b) => daysUntil(a.endDate) - daysUntil(b.endDate))
}

export function getUpcomingAdjustments(days: number): RentalContract[] {
  return contracts
    .filter((contract) => {
      const remaining = daysUntilAdjustment(contract.nextAdjustmentDate)
      return contract.status === 'ACTIVE' && remaining != null && remaining >= 0 && remaining <= days
    })
    .sort((a, b) => (daysUntilAdjustment(a.nextAdjustmentDate) ?? 0) - (daysUntilAdjustment(b.nextAdjustmentDate) ?? 0))
}

function nextContractNumber(): string {
  const year = new Date().getFullYear()
  const numbers = contracts
    .map((c) => Number(c.contractNumber.split('-').pop()))
    .filter((n) => Number.isFinite(n))
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1
  return `CTR-${year}-${String(next).padStart(3, '0')}`
}

export async function createContract(input: RentalContractInput): Promise<RentalContract> {
  await delay(250)
  const now = new Date().toISOString()
  const contract: RentalContract = {
    id: `contract-${Date.now()}`,
    organizationId: 'org-fl',
    contractNumber: nextContractNumber(),
    status: new Date(input.startDate) > new Date() ? 'UPCOMING' : 'ACTIVE',
    obligations: defaultObligations(),
    ...input,
    createdAt: now,
    updatedAt: now,
  }
  contracts = [contract, ...contracts]
  save()
  return contract
}

export async function updateContract(id: string, input: Partial<RentalContractInput>): Promise<RentalContract> {
  await delay(200)
  const now = new Date().toISOString()
  contracts = contracts.map((contract) => (contract.id === id ? { ...contract, ...input, updatedAt: now } : contract))
  save()
  return contracts.find((contract) => contract.id === id)!
}

export async function updateContractObligations(id: string, obligations: ContractObligation[]): Promise<RentalContract> {
  await delay(150)
  const now = new Date().toISOString()
  contracts = contracts.map((contract) => (contract.id === id ? { ...contract, obligations, updatedAt: now } : contract))
  save()
  return contracts.find((contract) => contract.id === id)!
}
