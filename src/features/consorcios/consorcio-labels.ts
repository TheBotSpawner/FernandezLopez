import type { StatusTone } from '@/components/data-display/StatusBadge'
import type { ConsorcioAssembly, ConsorcioStatus, MaintenanceStatus, UnitExpenseStatus } from '@/types/consorcio'

export const CONSORCIO_STATUS: Record<ConsorcioStatus, { label: string; tone: StatusTone }> = {
  ACTIVE: { label: 'Administrado', tone: 'success' },
  ONBOARDING: { label: 'En incorporación', tone: 'info' },
}

export const UNIT_EXPENSE_STATUS: Record<UnitExpenseStatus, { label: string; tone: StatusTone }> = {
  PAID: { label: 'Pagado', tone: 'success' },
  PENDING: { label: 'Pendiente', tone: 'warning' },
  PARTIAL: { label: 'Pago parcial', tone: 'info' },
}

export const MAINTENANCE_STATUS: Record<MaintenanceStatus, { label: string; tone: StatusTone }> = {
  PENDING: { label: 'Pendiente', tone: 'warning' },
  IN_PROGRESS: { label: 'En curso', tone: 'info' },
  RESOLVED: { label: 'Resuelto', tone: 'success' },
}

export const ASSEMBLY_TYPE: Record<ConsorcioAssembly['type'], string> = {
  ORDINARY: 'Asamblea ordinaria',
  EXTRAORDINARY: 'Asamblea extraordinaria',
}

/** Collection state of the current period — "Al día" once practically everything is collected. */
export function collectionState(collectedPct: number): { label: string; tone: StatusTone } {
  return collectedPct >= 95 ? { label: 'Al día', tone: 'success' } : { label: 'En cobranza', tone: 'warning' }
}
