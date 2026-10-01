import { AlertCircle, Building, ChevronRight, Percent, Users, Wrench } from 'lucide-react'
import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useSession } from '@/app/session-context'
import { MetricCard } from '@/components/data-display/MetricCard'
import { StatusBadge } from '@/components/data-display/StatusBadge'
import { EmptyState } from '@/components/feedback/EmptyState'
import { formatPeriodLabel } from '@/features/administration/account-utils'
import { getConsorcios, type ConsorcioListItem } from '@/services/consorcio-service'
import { CONSORCIO_STATUS, collectionState } from './consorcio-labels'

export function CollectionBar({ pct }: { pct: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
    </div>
  )
}

function ConsorcioCard({ item }: { item: ConsorcioListItem }) {
  const { consorcio, summary } = item
  const state = collectionState(summary.collectedPct)
  return (
    <Link
      to={`/consorcios/${consorcio.id}`}
      className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">{consorcio.name}</p>
          <p className="text-sm text-muted-foreground">
            {consorcio.address} · {consorcio.neighborhood}
          </p>
        </div>
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge tone={state.tone}>{state.label}</StatusBadge>
        <CollectionBar pct={summary.collectedPct} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md bg-muted/50 p-2">
          <p className="text-sm font-semibold text-foreground">{summary.unitCount}</p>
          <p className="text-[11px] text-muted-foreground">Unidades</p>
        </div>
        <div className="rounded-md bg-muted/50 p-2">
          <p className="text-sm font-semibold text-foreground">{summary.pendingUnits}</p>
          <p className="text-[11px] text-muted-foreground">Pendientes</p>
        </div>
        <div className="rounded-md bg-muted/50 p-2">
          <p className="text-sm font-semibold text-foreground">{summary.openIssues}</p>
          <p className="text-[11px] text-muted-foreground">Reclamos</p>
        </div>
      </div>
    </Link>
  )
}

export function ConsorciosPage() {
  const { branchScope } = useSession()
  const items = useMemo(() => getConsorcios(branchScope), [branchScope])

  const unitCount = items.reduce((sum, i) => sum + i.summary.unitCount, 0)
  const pendingUnits = items.reduce((sum, i) => sum + i.summary.pendingUnits, 0)
  const toDistribute = items.reduce((sum, i) => sum + i.summary.totalToDistribute, 0)
  const collected = items.reduce((sum, i) => sum + i.summary.collected, 0)
  const collectedPct = toDistribute > 0 ? Math.round((collected / toDistribute) * 100) : 0
  const period = items[0]?.consorcio.currentPeriod

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Consorcios</h1>
        <p className="text-sm text-muted-foreground">Edificios administrados, unidades, expensas y mantenimiento.</p>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Consorcios administrados" value={items.length} unit="edificios" icon={Building} />
        <MetricCard label="Unidades" value={unitCount} unit="funcionales" icon={Users} />
        <MetricCard
          label="Expensas del período"
          value={collectedPct}
          unit={`% cobrado${period ? ` · ${formatPeriodLabel(period)}` : ''}`}
          icon={Percent}
        />
        <MetricCard label="Pendientes" value={pendingUnits} unit="unidades" icon={AlertCircle} />
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-border py-10">
          <EmptyState icon={Building} message="No hay consorcios administrados en esta sucursal." />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:hidden">
            {items.map((item) => (
              <ConsorcioCard key={item.consorcio.id} item={item} />
            ))}
          </div>

          <div className="hidden overflow-x-auto rounded-lg border border-border md:block">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/50 text-left text-xs text-muted-foreground">
                  <th className="px-3 py-2 font-medium">Consorcio</th>
                  <th className="px-3 py-2 font-medium">Dirección</th>
                  <th className="px-3 py-2 text-right font-medium">Unidades</th>
                  <th className="px-3 py-2 font-medium">Período actual</th>
                  <th className="px-3 py-2 font-medium">Estado de expensas</th>
                  <th className="px-3 py-2 text-right font-medium">Pendientes</th>
                  <th className="px-3 py-2 text-right font-medium">Reclamos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map(({ consorcio, summary }) => {
                  const state = collectionState(summary.collectedPct)
                  return (
                    <tr key={consorcio.id} className="transition-colors hover:bg-muted/50">
                      <td className="px-3 py-2.5">
                        <Link to={`/consorcios/${consorcio.id}`} className="flex flex-col">
                          <span className="font-medium text-foreground hover:text-primary">{consorcio.name}</span>
                          {consorcio.status !== 'ACTIVE' && (
                            <span className="text-xs text-info">{CONSORCIO_STATUS[consorcio.status].label}</span>
                          )}
                        </Link>
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground">
                        {consorcio.address} · {consorcio.neighborhood}
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{summary.unitCount}</td>
                      <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">
                        {formatPeriodLabel(consorcio.currentPeriod)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-3">
                          <StatusBadge tone={state.tone}>{state.label}</StatusBadge>
                          <CollectionBar pct={summary.collectedPct} />
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{summary.pendingUnits}</td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          {summary.openIssues > 0 && <Wrench className="size-3.5 text-warning" />}
                          {summary.openIssues}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
