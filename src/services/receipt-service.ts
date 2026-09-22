import { RECEIPTS } from '@/mocks/payments'
import { loadOrSeed, persist } from '@/lib/local-store'
import type { Receipt } from '@/types/contract-account'

const KEY = 'fl.administration.receipts'

let receipts: Receipt[] = loadOrSeed(KEY, RECEIPTS)
let receiptSeq = Math.max(0, ...receipts.map((r) => Number(r.number)).filter((n) => Number.isFinite(n)))

function save() {
  persist(KEY, receipts)
}

export function getReceiptsByContract(contractId: string): Receipt[] {
  return receipts.filter((receipt) => receipt.contractId === contractId).sort((a, b) => b.date.localeCompare(a.date))
}

export function findReceiptSync(id: string): Receipt | undefined {
  return receipts.find((receipt) => receipt.id === id)
}

/** Drops receipts tied to payments that were deleted (e.g. reverting a charge back to pending). */
export function removeReceiptsForPayments(paymentIds: string[]): void {
  if (paymentIds.length === 0) return
  const ids = new Set(paymentIds)
  receipts = receipts.filter((receipt) => !receipt.paymentId || !ids.has(receipt.paymentId))
  save()
}

export async function createReceipt(input: {
  contractId: string
  paymentId?: string
  period: string
  date: string
  items: { description: string; amount: number }[]
  paymentMethod: Receipt['paymentMethod']
  notes?: string
}): Promise<Receipt> {
  receiptSeq += 1
  const receipt: Receipt = {
    id: `receipt-${Date.now()}`,
    number: String(receiptSeq).padStart(6, '0'),
    total: input.items.reduce((sum, item) => sum + item.amount, 0),
    ...input,
    createdAt: new Date().toISOString(),
  }
  receipts = [receipt, ...receipts]
  save()
  return receipt
}
