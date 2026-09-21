import { LayoutGrid, List, Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { OpportunityFilters } from './components/OpportunityFilters'
import { OpportunityFormSheet } from './components/OpportunityFormSheet'
import { OpportunityListView } from './components/OpportunityListView'
import { OpportunityPipeline } from './components/OpportunityPipeline'
import { useOpportunityList } from './use-opportunity-list'

type ViewMode = 'pipeline' | 'list'

export function OpportunitiesPage() {
  const { filters, setFilters, opportunities, loading, activeFilterCount, clearFilters, refetch } = useOpportunityList()
  const [view, setView] = useState<ViewMode>('pipeline')
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Oportunidades</h1>
          <p className="text-sm text-muted-foreground">Pipeline comercial de búsquedas y captaciones.</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1" role="tablist" aria-label="Vista de oportunidades">
            {(
              [
                { mode: 'pipeline' as const, label: 'Pipeline', icon: LayoutGrid },
                { mode: 'list' as const, label: 'Lista', icon: List },
              ]
            ).map((item) => (
              <button
                key={item.mode}
                type="button"
                role="tab"
                aria-selected={view === item.mode}
                onClick={() => setView(item.mode)}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors',
                  view === item.mode ? 'bg-card text-foreground shadow-sm' : 'hover:text-foreground',
                )}
              >
                <item.icon className="size-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-1.5">
            <Plus className="size-4" />
            Nueva oportunidad
          </Button>
        </div>
      </div>

      <OpportunityFilters
        filters={filters}
        setFilters={setFilters}
        activeFilterCount={activeFilterCount}
        clearFilters={clearFilters}
        resultCount={opportunities.length}
      />

      {view === 'pipeline' ? (
        <OpportunityPipeline group={filters.group} opportunities={opportunities} loading={loading} onChanged={refetch} />
      ) : (
        <OpportunityListView opportunities={opportunities} loading={loading} />
      )}

      <OpportunityFormSheet open={createOpen} onOpenChange={setCreateOpen} onSaved={refetch} />
    </div>
  )
}
