import { AlertTriangle, CalendarClock, CircleDollarSign, FileWarning, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'
import { SectionCard } from '@/components/data-display/SectionCard'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { formatARS, formatDateOnly } from '@/lib/format'
import { propertyTitle } from '@/features/properties/property-format'
import { findContactSync } from '@/services/contact-service'
import { findPropertySync } from '@/services/property-service'
import { adjustmentLabel, expirationLabel } from './contract-format'
import { useAdministrationOverview } from './use-administration-overview'

function MetricCard({ label, value, icon: Icon, loading }: { label: string; value: number; icon: typeof CalendarClock; loading: boolean }) {
  return (
    <div className="flex flex-col gap-2 rounded-lg border border-border p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className="size-4 text-muted-foreground" />
      </div>
      {loading ? <Skeleton className="h-7 w-12" /> : <span className="text-2xl font-semibold text-foreground">{value}</span>}
    </div>
  )
}

export function AdministrationOverviewPage() {
  const { overview, loading } = useAdministrationOverview()

  const attentionItems = overview
    ? [
        overview.upcomingAdjustmentsCount > 0 && {
          id: 'adjustments',
          message: `${overview.upcomingAdjustmentsCount} contrato${overview.upcomingAdjustmentsCount === 1 ? '' : 's'} ajusta${overview.upcomingAdjustmentsCount === 1 ? '' : 'n'} en los próximos 30 días`,
          href: '/administration/expirations',
        },
        overview.expiringWithin90Count > 0 && {
          id: 'expiring',
          message: `${overview.expiringWithin90Count} contrato${overview.expiringWithin90Count === 1 ? '' : 's'} vence${overview.expiringWithin90Count === 1 ? '' : 'n'} dentro de 90 días`,
          href: '/administration/expirations',
        },
        overview.expiredCount > 0 && {
          id: 'expired',
          message: `${overview.expiredCount} contrato${overview.expiredCount === 1 ? '' : 's'} ya está${overview.expiredCount === 1 ? '' : 'n'} vencido${overview.expiredCount === 1 ? '' : 's'}`,
          href: '/administration/contracts',
        },
        overview.draftCount > 0 && {
          id: 'draft',
          message: `${overview.draftCount} contrato${overview.draftCount === 1 ? '' : 's'} tiene${overview.draftCount === 1 ? '' : 'n'} información pendiente`,
          href: '/administration/contracts',
        },
      ].filter((item): item is { id: string; message: string; href: string } => Boolean(item))
    : []

  return (
    <div className="flex flex-col gap-6 pb-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Administración</h1>
        <p className="text-sm text-muted-foreground">¿Cómo está la cartera de alquileres hoy?</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Contratos activos" value={overview?.activeCount ?? 0} icon={CircleDollarSign} loading={loading} />
        <MetricCard label="Próximos ajustes" value={overview?.upcomingAdjustmentsCount ?? 0} icon={TrendingUp} loading={loading} />
        <MetricCard label="Vencen en 90 días" value={overview?.expiringWithin90Count ?? 0} icon={CalendarClock} loading={loading} />
        <MetricCard label="Con deuda" value={overview?.withDebtCount ?? 0} icon={FileWarning} loading={loading} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Requieren atención">
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : attentionItems.length === 0 ? (
            <EmptyState message="No hay elementos que requieran atención." />
          ) : (
            <ul className="flex flex-col gap-1.5">
              {attentionItems.map((item) => (
                <li key={item.id}>
                  <Link to={item.href} className="flex items-center gap-3 rounded-lg px-2.5 py-3 transition-colors hover:bg-muted">
                    <AlertTriangle className="size-4 shrink-0 text-muted-foreground" />
                    <span className="flex-1 text-sm text-foreground">{item.message}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard
          title="Próximos vencimientos"
          action={
            <Link to="/administration/expirations" className="text-sm font-medium text-primary hover:underline">
              Ver todos
            </Link>
          }
        >
          {loading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !overview || overview.expiringSoon.length === 0 ? (
            <EmptyState icon={CalendarClock} message="No hay contratos próximos a vencer." />
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {overview.expiringSoon.map((contract) => {
                const property = findPropertySync(contract.propertyId)
                return (
                  <li key={contract.id}>
                    <Link
                      to={`/administration/contracts/${contract.id}`}
                      className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-muted"
                    >
                      <span className="text-sm text-foreground">{property ? propertyTitle(property) : '—'}</span>
                      <span className="text-xs font-medium text-danger">{expirationLabel(contract.endDate)}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </SectionCard>
      </div>

      {!loading && overview && overview.upcomingAdjustments.length > 0 && (
        <SectionCard title="Próximos ajustes">
          <ul className="flex flex-col divide-y divide-border">
            {overview.upcomingAdjustments.map((contract) => {
              const property = findPropertySync(contract.propertyId)
              const tenant = findContactSync(contract.tenantIds[0])
              return (
                <li key={contract.id}>
                  <Link
                    to={`/administration/contracts/${contract.id}`}
                    className="flex items-center justify-between gap-3 py-2.5 transition-colors hover:bg-muted"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-foreground">{property ? propertyTitle(property) : '—'}</span>
                      <span className="text-xs text-muted-foreground">{tenant?.fullName ?? 'Sin inquilino'}</span>
                    </div>
                    <div className="text-right">
                      <span className="block text-sm font-medium text-foreground">{formatARS(contract.currentRent)}</span>
                      <span className="block text-xs text-muted-foreground">
                        {contract.nextAdjustmentDate && formatDateOnly(contract.nextAdjustmentDate)} ·{' '}
                        {adjustmentLabel(contract.nextAdjustmentDate)}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        </SectionCard>
      )}
    </div>
  )
}
