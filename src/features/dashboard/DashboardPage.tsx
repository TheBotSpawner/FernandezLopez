import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useSession } from '@/app/session-context'
import { SectionCard } from '@/components/data-display/SectionCard'
import { Button } from '@/components/ui/button'
import { AttentionPanel } from './components/AttentionPanel'
import { ContactTrendChart } from './components/ContactTrendChart'
import { DashboardHeader } from './components/DashboardHeader'
import { HighInterestProperties } from './components/HighInterestProperties'
import { MetricsGrid } from './components/MetricsGrid'
import { OpportunitySummary } from './components/OpportunitySummary'
import { PortfolioOverview } from './components/PortfolioOverview'
import { UpcomingVisits } from './components/UpcomingVisits'
import { getDashboardWidgetConfig } from './dashboard-widgets.config'
import { useDashboardData } from './use-dashboard-data'

export function DashboardPage() {
  const { user, branchScope } = useSession()
  const config = getDashboardWidgetConfig(user.role)
  const { data, loading } = useDashboardData(branchScope, user.role, user.id)

  const firstName = user.name.split(' ')[0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col gap-6 pb-4"
    >
      <DashboardHeader firstName={firstName} />

      <MetricsGrid keys={config.metrics} metrics={data?.metrics ?? null} loading={loading} />

      {(config.showChart || config.showOpportunitySummary) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {config.showChart && (
            <SectionCard title="Nuevos contactos" description="Últimos 6 meses">
              <ContactTrendChart data={data?.contactTrend ?? null} loading={loading} />
            </SectionCard>
          )}
          {config.showOpportunitySummary && (
            <SectionCard title="Oportunidades activas" description="Por etapa">
              <OpportunitySummary stages={data?.opportunityStages ?? null} loading={loading} />
            </SectionCard>
          )}
        </div>
      )}

      {(config.showAttention || config.showVisits) && (
        <div className="grid gap-4 lg:grid-cols-2">
          {config.showAttention && (
            <SectionCard title="Requieren tu atención">
              <AttentionPanel items={data?.attentionItems ?? null} loading={loading} />
            </SectionCard>
          )}
          {config.showVisits && (
            <SectionCard
              title="Próximas visitas"
              action={
                <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/commercial/visits" />}>
                  Ver agenda
                </Button>
              }
            >
              <UpcomingVisits visits={data?.upcomingVisits ?? null} loading={loading} />
            </SectionCard>
          )}
        </div>
      )}

      {config.showPortfolio && (
        <SectionCard title="Portfolio de propiedades">
          <PortfolioOverview portfolio={data?.portfolio ?? null} loading={loading} />
        </SectionCard>
      )}

      {config.showHighInterestProperties && (
        <SectionCard
          title="Propiedades con más actividad"
          action={
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/properties" />}>
              Ver todas
            </Button>
          }
        >
          <HighInterestProperties properties={data?.highInterestProperties ?? null} loading={loading} />
        </SectionCard>
      )}
    </motion.div>
  )
}
