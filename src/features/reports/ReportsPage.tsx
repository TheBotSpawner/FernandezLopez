import { useState } from 'react'
import { useSession } from '@/app/session-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { can } from '@/lib/permissions'
import { getDemoUsers } from '@/services/user-service'
import { AdministrationReportView } from './components/AdministrationReportView'
import { CommercialReportView } from './components/CommercialReportView'
import { PropertyReportView } from './components/PropertyReportView'
import { ReportFilterBar } from './components/ReportFilterBar'
import { useAdministrationReport, useCommercialReport, usePropertyReport } from './use-report-data'
import type { ReportPeriod, ReportScope } from '@/types/report'

type ReportTab = 'commercial' | 'property' | 'administration'

export function ReportsPage() {
  const { user, branches, branchScope, setBranchScope } = useSession()
  const canFilterByBranch = user.role === 'ADMIN' || user.role === 'MANAGER'
  const effectiveBranch = canFilterByBranch ? branchScope : user.branchId
  const allBranchIds = branches.map((b) => b.id)

  const visibleTabs: ReportTab[] = [
    can(user.role, 'reports.commercial.view') && 'commercial',
    can(user.role, 'reports.property.view') && 'property',
    can(user.role, 'reports.administration.view') && 'administration',
  ].filter((tab): tab is ReportTab => Boolean(tab))

  const [activeTab, setActiveTab] = useState<ReportTab>(visibleTabs[0])
  const [period, setPeriod] = useState<ReportPeriod>('this-month')
  const [assignedUserId, setAssignedUserId] = useState<string | 'all'>('all')

  const scope: ReportScope = {
    branchId: effectiveBranch,
    role: user.role,
    userId: user.id,
    period,
    assignedUserId,
  }

  const commercial = useCommercialReport(scope, allBranchIds, activeTab === 'commercial')
  const property = usePropertyReport(scope, activeTab === 'property')
  const administration = useAdministrationReport(scope, can(user.role, 'reports.administration.viewFinancials'), activeTab === 'administration')

  const agents = getDemoUsers().filter((candidate) => candidate.role === 'AGENT')

  if (visibleTabs.length === 0) {
    return <p className="text-sm text-muted-foreground">No tenés acceso a reportes.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Reportes</h1>
        <p className="text-sm text-muted-foreground">Actividad comercial, cartera de propiedades y administración de alquileres.</p>
      </div>

      <ReportFilterBar
        period={period}
        onPeriodChange={setPeriod}
        branches={branches}
        branchId={effectiveBranch}
        onBranchChange={setBranchScope}
        showBranch={canFilterByBranch}
        agents={agents}
        assignedUserId={assignedUserId}
        onAssignedUserChange={setAssignedUserId}
        showResponsible={activeTab === 'commercial' && user.role !== 'AGENT' && can(user.role, 'reports.commercial.viewOrgWide')}
      />

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ReportTab)}>
        <TabsList>
          {visibleTabs.includes('commercial') && <TabsTrigger value="commercial">Comercial</TabsTrigger>}
          {visibleTabs.includes('property') && <TabsTrigger value="property">Propiedades</TabsTrigger>}
          {visibleTabs.includes('administration') && <TabsTrigger value="administration">Administración</TabsTrigger>}
        </TabsList>

        {visibleTabs.includes('commercial') && (
          <TabsContent value="commercial">
            <CommercialReportView data={commercial.data} loading={commercial.loading} />
          </TabsContent>
        )}
        {visibleTabs.includes('property') && (
          <TabsContent value="property">
            <PropertyReportView data={property.data} loading={property.loading} />
          </TabsContent>
        )}
        {visibleTabs.includes('administration') && (
          <TabsContent value="administration">
            <AdministrationReportView data={administration.data} loading={administration.loading} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}
