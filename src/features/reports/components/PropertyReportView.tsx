import { Building2, Home, KeyRound, Landmark } from 'lucide-react'
import { MetricCard, MetricCardSkeleton } from '@/components/data-display/MetricCard'
import { SectionCard } from '@/components/data-display/SectionCard'
import { EmptyState } from '@/components/feedback/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { ReportBarChart } from './ReportBarChart'
import type { PropertyReport } from '@/types/report'

export function PropertyReportView({ data, loading }: { data: PropertyReport | null; loading: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {loading || !data ? (
          Array.from({ length: 4 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard label="Propiedades activas" value={data.metrics.active} unit="" icon={Building2} />
            <MetricCard label="Propiedades ingresadas" value={data.metrics.added} unit="en el período" icon={Home} />
            <MetricCard label="En alquiler" value={data.metrics.forRent} unit="" icon={KeyRound} />
            <MetricCard label="En venta" value={data.metrics.forSale} unit="" icon={Landmark} />
          </>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Propiedades por estado">
          <ReportBarChart data={data?.byStatus.map((r) => ({ label: r.label, count: r.count })) ?? null} loading={loading} />
        </SectionCard>
        <SectionCard title="Propiedades por barrio">
          <ReportBarChart
            data={data?.byNeighborhood.map((r) => ({ label: r.neighborhood, count: r.count })) ?? null}
            loading={loading}
            layout="horizontal"
          />
        </SectionCard>
      </div>

      <SectionCard title="Propiedades con más actividad" description="Oportunidades y visitas vinculadas">
        {loading || !data ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : data.mostActive.length === 0 ? (
          <EmptyState message="No hay datos para este período." />
        ) : (
          <div className="flex flex-col divide-y divide-border">
            {data.mostActive.map((row) => (
              <div key={row.id} className="flex items-center justify-between py-2 text-sm">
                <span className="text-foreground">{row.address}</span>
                <span className="text-muted-foreground">{row.activityLabel}</span>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  )
}
