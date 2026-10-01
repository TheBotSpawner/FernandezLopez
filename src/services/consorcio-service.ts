import {
  CONSORCIOS,
  CONSORCIO_ASSEMBLIES,
  CONSORCIO_DOCUMENTS,
  CONSORCIO_EXPENSES,
  CONSORCIO_ISSUES,
  CONSORCIO_UNITS,
} from '@/mocks/consorcios'
import type {
  Consorcio,
  ConsorcioAssembly,
  ConsorcioDocument,
  ConsorcioExpense,
  ConsorcioIssue,
  ConsorcioPeriodSummary,
  ConsorcioUnit,
} from '@/types/consorcio'

// ponytail: read-only seed data, no localStorage — add persistence when consorcios gain edit flows.

export interface ConsorcioListItem {
  consorcio: Consorcio
  summary: ConsorcioPeriodSummary
}

export interface ConsorcioDetail extends ConsorcioListItem {
  units: ConsorcioUnit[]
  expenses: ConsorcioExpense[]
  issues: ConsorcioIssue[]
  documents: ConsorcioDocument[]
  assemblies: ConsorcioAssembly[]
}

function summarize(consorcio: Consorcio): ConsorcioPeriodSummary {
  const units = CONSORCIO_UNITS.filter((u) => u.consorcioId === consorcio.id)
  const expensesTotal = CONSORCIO_EXPENSES.filter(
    (e) => e.consorcioId === consorcio.id && e.period === consorcio.currentPeriod,
  ).reduce((sum, e) => sum + e.amount, 0)
  const totalToDistribute = expensesTotal + consorcio.reserveContribution
  const collected = units.reduce((sum, u) => sum + (u.paidAmount ?? 0), 0)
  return {
    expensesTotal,
    reserveContribution: consorcio.reserveContribution,
    totalToDistribute,
    collected,
    pending: totalToDistribute - collected,
    collectedPct: totalToDistribute > 0 ? Math.round((collected / totalToDistribute) * 100) : 0,
    pendingUnits: units.filter((u) => u.expenseStatus !== 'PAID').length,
    openIssues: CONSORCIO_ISSUES.filter((i) => i.consorcioId === consorcio.id && i.status !== 'RESOLVED').length,
    unitCount: units.length,
  }
}

export function getConsorcios(branchId: string | 'all'): ConsorcioListItem[] {
  return CONSORCIOS.filter((c) => branchId === 'all' || c.branchId === branchId).map((consorcio) => ({
    consorcio,
    summary: summarize(consorcio),
  }))
}

export function getConsorcioDetail(id: string | undefined): ConsorcioDetail | null {
  const consorcio = CONSORCIOS.find((c) => c.id === id)
  if (!consorcio) return null
  return {
    consorcio,
    summary: summarize(consorcio),
    units: CONSORCIO_UNITS.filter((u) => u.consorcioId === consorcio.id),
    expenses: CONSORCIO_EXPENSES.filter((e) => e.consorcioId === consorcio.id),
    issues: CONSORCIO_ISSUES.filter((i) => i.consorcioId === consorcio.id),
    documents: CONSORCIO_DOCUMENTS.filter((d) => d.consorcioId === consorcio.id),
    assemblies: CONSORCIO_ASSEMBLIES.filter((a) => a.consorcioId === consorcio.id).sort((a, b) => b.date.localeCompare(a.date)),
  }
}
