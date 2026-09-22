import { AlertTriangle, CalendarClock, KeyRound, TrendingUp, Wallet2 } from 'lucide-react'
import { MetricCard, MetricCardSkeleton } from '@/components/data-display/MetricCard'
import { SectionCard } from '@/components/data-display/SectionCard'
import { ReportBarChart } from './ReportBarChart'
import type { AdministrationReport } from '@/types/report'

export function AdministrationReportView({ data, loading }: { data: AdministrationReport | null; loading: boolean }) {
  const showFinancials = !loading && data?.metrics.pendingAmount != null

  return (
    <div className="flex flex-col gap-4">
      <div className={`grid grid-cols-2 gap-3 lg:gap-4 ${showFinancials ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
        {loading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard label="Contratos activos" value={data.metrics.activeContracts} unit="" icon={KeyRound} />
            <MetricCard label="Contratos con deuda" value={data.metrics.withDebt} unit="" icon={AlertTriangle} />
            <MetricCard label="Próximos ajustes" value={data.metrics.upcomingAdjustments} unit="≤30 días" icon={TrendingUp} />
            <MetricCard label="Vencen en 90 días" value={data.metrics.expiringIn90} unit="" icon={CalendarClock} />
            {data.metrics.pendingAmount != null && (
              <MetricCard label="Monto pendiente" value={data.metrics.pendingAmount} unit="ARS" icon={Wallet2} />
            )}
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Contratos por estado">
          <ReportBarChart data={data?.byStatus.map((r) => ({ label: r.label, count: r.count })) ?? null} loading={loading} />
        </SectionCard>
        <SectionCard title="Próximos vencimientos" description="Contratos activos">
          <ReportBarChart data={data?.expirationBuckets ?? null} loading={loading} />
        </SectionCard>
      </div>

      <SectionCard title="Próximos ajustes por método">
        <ReportBarChart
          data={data?.adjustmentMethodBuckets.map((r) => ({ label: r.label, count: r.count })) ?? null}
          loading={loading}
        />
      </SectionCard>
    </div>
  )
}
