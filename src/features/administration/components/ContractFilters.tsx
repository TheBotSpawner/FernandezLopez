import { Filter, Search } from 'lucide-react'
import { type Dispatch, type SetStateAction, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { ADJUSTMENT_METHOD_LABELS, CONTRACT_STATUS_LABELS } from '../contract-labels'
import type { ContractFiltersState } from '../use-contract-list'
import type { AdjustmentMethod, ContractStatus, RentalContractQuery } from '@/types/rental-contract'

const STATUS_OPTIONS = Object.keys(CONTRACT_STATUS_LABELS) as ContractStatus[]
const METHOD_OPTIONS = Object.keys(ADJUSTMENT_METHOD_LABELS) as AdjustmentMethod[]

const EXPIRATION_OPTIONS: { value: NonNullable<RentalContractQuery['expiration']> | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'within30', label: 'Vence en 30 días' },
  { value: 'within60', label: 'Vence en 60 días' },
  { value: 'within90', label: 'Vence en 90 días' },
  { value: 'expired', label: 'Vencidos' },
]

const SORT_OPTIONS: { value: ContractFiltersState['sort']; label: string }[] = [
  { value: 'endDate', label: 'Vencimiento más próximo' },
  { value: 'nextAdjustment', label: 'Próximo ajuste' },
  { value: 'rentDesc', label: 'Alquiler mayor' },
  { value: 'rentAsc', label: 'Alquiler menor' },
  { value: 'recent', label: 'Más recientes' },
]

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

interface ContractFiltersProps {
  filters: ContractFiltersState
  setFilters: Dispatch<SetStateAction<ContractFiltersState>>
  activeFilterCount: number
  clearFilters: () => void
  resultCount: number
}

export function ContractFilters({ filters, setFilters, activeFilterCount, clearFilters, resultCount }: ContractFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const hasAnyFilter = activeFilterCount > 0 || Boolean(filters.search)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            placeholder="Buscar por dirección, inquilino, propietario o Nº de contrato..."
            className="pl-8"
          />
        </div>

        <Select value={filters.sort} onValueChange={(value) => setFilters((prev) => ({ ...prev, sort: value as ContractFiltersState['sort'] }))}>
          <SelectTrigger className="w-56">
            <SelectValue>{(value: string) => SORT_OPTIONS.find((o) => o.value === value)?.label ?? value}</SelectValue>
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)} className="gap-1.5">
          <Filter className="size-4" />
          Filtros
          {activeFilterCount > 0 && <Badge className="px-1.5">{activeFilterCount}</Badge>}
        </Button>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {resultCount} contrato{resultCount === 1 ? '' : 's'}
          {hasAnyFilter ? ' encontrados' : ''}
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
                {STATUS_OPTIONS.map((status) => {
                  const active = filters.status.includes(status)
                  return (
                    <button
                      key={status}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilters((prev) => ({ ...prev, status: toggleValue(prev.status, status) }))}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                      )}
                    >
                      {CONTRACT_STATUS_LABELS[status]}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Método de ajuste</span>
              <div className="flex flex-wrap gap-1.5">
                {METHOD_OPTIONS.map((method) => {
                  const active = filters.adjustmentMethod.includes(method)
                  return (
                    <button
                      key={method}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilters((prev) => ({ ...prev, adjustmentMethod: toggleValue(prev.adjustmentMethod, method) }))}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                      )}
                    >
                      {ADJUSTMENT_METHOD_LABELS[method]}
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Vencimiento</span>
              <div className="flex flex-wrap gap-1.5">
                {EXPIRATION_OPTIONS.map((option) => {
                  const active = filters.expiration === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilters((prev) => ({ ...prev, expiration: option.value }))}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                      )}
                    >
                      {option.label}
                    </button>
                  )
                })}
              </div>
            </div>
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
