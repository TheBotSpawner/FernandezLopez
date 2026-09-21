import { Filter, Search } from 'lucide-react'
import { type Dispatch, type SetStateAction, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { getDemoUsers } from '@/services/user-service'
import { DEMAND_STAGES, OWNER_STAGES } from '@/types/opportunity'
import type { OpportunityStage } from '@/types/opportunity'
import type { OpportunityFiltersState, PipelineGroup } from '../use-opportunity-list'

const GROUP_OPTIONS: { value: PipelineGroup; label: string }[] = [
  { value: 'demand', label: 'Búsqueda' },
  { value: 'owner', label: 'Captación' },
]

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

interface OpportunityFiltersProps {
  filters: OpportunityFiltersState
  setFilters: Dispatch<SetStateAction<OpportunityFiltersState>>
  activeFilterCount: number
  clearFilters: () => void
  resultCount: number
}

export function OpportunityFilters({ filters, setFilters, activeFilterCount, clearFilters, resultCount }: OpportunityFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const users = getDemoUsers()
  const stages = filters.group === 'demand' ? DEMAND_STAGES : OWNER_STAGES
  const hasAnyFilter = activeFilterCount > 0 || Boolean(filters.search)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            placeholder="Buscar en notas o dirección..."
            className="pl-8"
          />
        </div>

        <div className="flex rounded-lg border border-border p-0.5">
          {GROUP_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filters.group === option.value}
              onClick={() => setFilters((prev) => ({ ...prev, group: option.value, stage: [] }))}
              className={cn(
                'rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
                filters.group === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)} className="gap-1.5">
          <Filter className="size-4" />
          Filtros
          {activeFilterCount > 0 && <Badge className="px-1.5">{activeFilterCount}</Badge>}
        </Button>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {resultCount} oportunidad{resultCount === 1 ? '' : 'es'}
          {hasAnyFilter ? ' encontradas' : ''}
        </span>
        {hasAnyFilter && (
          <button type="button" onClick={clearFilters} className="font-medium text-primary hover:underline">
            Limpiar filtros
          </button>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="flex flex-col gap-0">
          <SheetHeader>
            <SheetTitle>Filtros</SheetTitle>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4 py-2">
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Estado</span>
              <div className="flex flex-wrap gap-1.5">
                {stages.map((stage) => {
                  const active = filters.stage.includes(stage)
                  return (
                    <button
                      key={stage}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilters((prev) => ({ ...prev, stage: toggleValue(prev.stage, stage as OpportunityStage) }))}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                      )}
                    >
                      {stage}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Responsable</span>
              <Select
                value={filters.assignedUserId}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, assignedUserId: value as string }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) => (value === 'all' ? 'Todos' : (users.find((u) => u.id === value)?.name ?? value))}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <button
              type="button"
              aria-pressed={filters.overdueOnly}
              onClick={() => setFilters((prev) => ({ ...prev, overdueOnly: !prev.overdueOnly }))}
              className={cn(
                'flex items-center justify-between rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                filters.overdueOnly ? 'border-primary bg-primary/10 text-primary' : 'border-border text-foreground',
              )}
            >
              Con próxima acción vencida
              <span className={cn('size-4 rounded border', filters.overdueOnly ? 'border-primary bg-primary' : 'border-border')} />
            </button>
          </div>

          <SheetFooter className="flex-row">
            <Button variant="outline" className="flex-1" onClick={clearFilters}>
              Limpiar
            </Button>
            <Button className="flex-1" onClick={() => setSheetOpen(false)}>
              Aplicar filtros
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
