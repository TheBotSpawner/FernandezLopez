import { CalendarClock, Handshake, TrendingUp, Users, Video } from 'lucide-react'
import { MetricCard, MetricCardSkeleton } from '@/components/data-display/MetricCard'
import { SectionCard } from '@/components/data-display/SectionCard'
import { ReportBarChart } from './ReportBarChart'
import { ReportTrendChart } from './ReportTrendChart'
import type { CommercialReport } from '@/types/report'

export function CommercialReportView({ data, loading }: { data: CommercialReport | null; loading: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5 lg:gap-4">
        {loading || !data ? (
          Array.from({ length: 5 }).map((_, i) => <MetricCardSkeleton key={i} />)
        ) : (
          <>
            <MetricCard label="Contactos nuevos" value={data.metrics.newContacts} unit="" icon={Users} />
            <MetricCard label="Oportunidades creadas" value={data.metrics.opportunitiesCreated} unit="" icon={TrendingUp} />
            <MetricCard label="Visitas realizadas" value={data.metrics.visitsCompleted} unit="" icon={Video} />
            <MetricCard label="Operaciones concretadas" value={data.metrics.operationsClosed} unit="" icon={Handshake} />
            <MetricCard label="Seguimientos pendientes" value={data.metrics.pendingFollowUps} unit="" icon={CalendarClock} />
          </>
        )}
      </div>

      {!loading && data && data.conversionRate != null && (
        <p className="text-sm text-muted-foreground">
          Conversión (operaciones cerradas / oportunidades creadas):{' '}
          <span className="font-medium text-foreground">{Math.round(data.conversionRate * 100)}%</span>
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionCard title="Contactos nuevos" description="Por período">
          <ReportTrendChart data={data?.newContactsTrend ?? null} loading={loading} unitLabel="contacto" />
        </SectionCard>
        <SectionCard title="Oportunidades por estado" description="Creadas en el período">
          <ReportBarChart data={data?.opportunitiesByStage.map((r) => ({ label: r.stage, count: r.count })) ?? null} loading={loading} />
        </SectionCard>
      </div>

      <SectionCard title="Visitas realizadas" description="Por período">
        <ReportTrendChart data={data?.visitsTrend ?? null} loading={loading} unitLabel="visita" />
      </SectionCard>
    </div>
  )
}
