import { OWNER_SETTLEMENTS } from '@/mocks/owner-settlements'
import { loadOrSeed, persist } from '@/lib/local-store'
import { findContractSync } from '@/services/rental-contract-service'
import type { OwnerSettlement, OwnerSettlementInput, OwnerSettlementQuery } from '@/types/contract-account'

const KEY = 'fl.administration.settlements'

let settlements: OwnerSettlement[] = loadOrSeed(KEY, OWNER_SETTLEMENTS)

function save() {
  persist(KEY, settlements)
}

function matchesQuery(settlement: OwnerSettlement, query: OwnerSettlementQuery): boolean {
  if (query.period && settlement.period !== query.period) return false
  if (query.status?.length && !query.status.includes(settlement.status)) return false
  if (query.ownerId && !settlement.ownerIds.includes(query.ownerId)) return false
  if (query.branchId && query.branchId !== 'all') {
    const contract = findContractSync(settlement.contractId)
    if (!contract || contract.branchId !== query.branchId) return false
  }
  return true
}

export async function getSettlements(query: OwnerSettlementQuery = {}): Promise<OwnerSettlement[]> {
  return settlements.filter((settlement) => matchesQuery(settlement, query)).sort((a, b) => b.period.localeCompare(a.period))
}

export async function getSettlementById(id: string): Promise<OwnerSettlement | null> {
  return settlements.find((settlement) => settlement.id === id) ?? null
}

export function getSettlementsByContract(contractId: string): OwnerSettlement[] {
  return settlements.filter((settlement) => settlement.contractId === contractId).sort((a, b) => b.period.localeCompare(a.period))
}

function computeAmounts(input: Pick<OwnerSettlementInput, 'grossCollected' | 'feeType' | 'feeValue' | 'deductions'>) {
  const administrationFee =
    input.feeType === 'PERCENTAGE' ? Math.round((input.grossCollected * input.feeValue) / 100) : input.feeValue
  const netAmount = input.grossCollected - administrationFee - input.deductions.reduce((sum, d) => sum + d.amount, 0)
  return { administrationFee, netAmount }
}

export async function createSettlement(input: OwnerSettlementInput): Promise<OwnerSettlement> {
  const now = new Date().toISOString()
  const { administrationFee, netAmount } = computeAmounts(input)
  const settlement: OwnerSettlement = {
    id: `settlement-${Date.now()}`,
    ...input,
    administrationFee,
    netAmount,
    status: 'DRAFT',
    createdAt: now,
    updatedAt: now,
  }
  settlements = [settlement, ...settlements]
  save()
  return settlement
}

export async function updateSettlement(id: string, input: Partial<OwnerSettlementInput> & { status?: OwnerSettlement['status'] }): Promise<OwnerSettlement> {
  const now = new Date().toISOString()
  settlements = settlements.map((settlement) => {
    if (settlement.id !== id) return settlement
    const merged = { ...settlement, ...input }
    const { administrationFee, netAmount } = computeAmounts(merged)
    return { ...merged, administrationFee, netAmount, updatedAt: now }
  })
  save()
  return settlements.find((settlement) => settlement.id === id)!
}
