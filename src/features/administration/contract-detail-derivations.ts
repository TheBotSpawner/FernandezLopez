import type { RentalContract } from '@/types/rental-contract'

export interface ContractHistoryEvent {
  id: string
  label: string
  date: string
}

export interface ContractDocument {
  id: string
  label: string
  status: 'available' | 'pending'
}

export function buildContractDocuments(contract: RentalContract): ContractDocument[] {
  const documents: ContractDocument[] = [
    { id: 'contract', label: 'Contrato de alquiler.pdf', status: contract.status === 'DRAFT' ? 'pending' : 'available' },
    {
      id: 'inventory',
      label: 'Inventario inicial.pdf',
      status: contract.status === 'DRAFT' || contract.status === 'UPCOMING' ? 'pending' : 'available',
    },
  ]
  if (contract.guaranteeType) {
    documents.push({ id: 'guarantee', label: 'Garantía.pdf', status: 'available' })
  }
  return documents
}

/** All event dates are normalized to plain YYYY-MM-DD (createdAt/updatedAt are full ISO timestamps elsewhere) so the tab can format every entry the same way. */
export function buildContractHistory(contract: RentalContract): ContractHistoryEvent[] {
  const events: ContractHistoryEvent[] = [{ id: 'created', label: 'Contrato creado', date: contract.createdAt.slice(0, 10) }]

  if (contract.status !== 'DRAFT' && contract.status !== 'UPCOMING') {
    events.push({ id: 'started', label: 'Contrato iniciado', date: contract.startDate })
  }
  if (contract.lastAdjustmentDate) {
    events.push({ id: 'adjusted', label: 'Alquiler actualizado', date: contract.lastAdjustmentDate })
  }
  if (contract.guaranteeType) {
    events.push({ id: 'document', label: 'Documento agregado', date: contract.createdAt.slice(0, 10) })
  }
  if (contract.nextAdjustmentDate && contract.status === 'ACTIVE') {
    events.push({ id: 'next-adjustment', label: 'Próximo ajuste programado', date: contract.nextAdjustmentDate })
  }
  if (contract.status === 'TERMINATED') {
    events.push({ id: 'terminated', label: 'Contrato finalizado', date: contract.updatedAt.slice(0, 10) })
  }
  if (contract.status === 'EXPIRED') {
    events.push({ id: 'expired', label: 'Contrato vencido', date: contract.endDate })
  }

  return events.sort((a, b) => b.date.localeCompare(a.date))
}
