import { Filter, Search } from 'lucide-react'
import { type Dispatch, type SetStateAction, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import type { PropertySort, PropertyStatus, PropertyType } from '@/types/property'
import { PROPERTY_STATUS_LABELS, PROPERTY_TYPE_LABELS } from '../property-labels'
import type { PropertyFiltersState } from '../use-property-list'

const SORT_OPTIONS: { value: PropertySort; label: string }[] = [
  { value: 'recent', label: 'Más recientes' },
  { value: 'price-asc', label: 'Precio menor' },
  { value: 'price-desc', label: 'Precio mayor' },
  { value: 'interest', label: 'Mayor interés' },
]

const OPERATION_OPTIONS = [
  { value: 'all', label: 'Todas' },
  { value: 'sale', label: 'Venta' },
  { value: 'rent', label: 'Alquiler' },
] as const

const STATUS_OPTIONS: PropertyStatus[] = ['available', 'reserved', 'rented', 'sold', 'paused', 'valuation']

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

interface PropertyFiltersProps {
  filters: PropertyFiltersState
  setFilters: Dispatch<SetStateAction<PropertyFiltersState>>
  neighborhoods: string[]
  propertyTypes: PropertyType[]
  activeFilterCount: number
  clearFilters: () => void
  resultCount: number
}

export function PropertyFilters({
  filters,
  setFilters,
  neighborhoods,
  propertyTypes,
  activeFilterCount,
  clearFilters,
  resultCount,
}: PropertyFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const hasAnyFilter = activeFilterCount > 0 || Boolean(filters.search) || filters.operation !== 'all'

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            placeholder="Buscar por dirección, barrio o referencia..."
            className="pl-8"
          />
        </div>

        <div className="flex rounded-lg border border-border p-0.5">
          {OPERATION_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              aria-pressed={filters.operation === option.value}
              onClick={() => setFilters((prev) => ({ ...prev, operation: option.value }))}
              className={cn(
                'rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
                filters.operation === option.value
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>

        <Select value={filters.sort} onValueChange={(value) => setFilters((prev) => ({ ...prev, sort: value as PropertySort }))}>
          <SelectTrigger size="sm" className="w-40">
            <SelectValue>{(value: string) => SORT_OPTIONS.find((option) => option.value === value)?.label ?? value}</SelectValue>
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
          {resultCount} propiedad{resultCount === 1 ? '' : 'es'}
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
            <FilterChipGroup
              label="Estado"
              options={STATUS_OPTIONS.map((status) => ({ value: status, label: PROPERTY_STATUS_LABELS[status] }))}
              selected={filters.status}
              onToggle={(value) =>
                setFilters((prev) => ({ ...prev, status: toggleValue(prev.status, value as PropertyStatus) }))
              }
            />
            <FilterChipGroup
              label="Tipo"
              options={propertyTypes.map((type) => ({ value: type, label: PROPERTY_TYPE_LABELS[type] }))}
              selected={filters.propertyType}
              onToggle={(value) =>
                setFilters((prev) => ({ ...prev, propertyType: toggleValue(prev.propertyType, value as PropertyType) }))
              }
            />
            <FilterChipGroup
              label="Barrio"
              options={neighborhoods.map((neighborhood) => ({ value: neighborhood, label: neighborhood }))}
              selected={filters.neighborhoods}
              onToggle={(value) => setFilters((prev) => ({ ...prev, neighborhoods: toggleValue(prev.neighborhoods, value) }))}
            />

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Precio</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Mín."
                  value={filters.minPrice ?? ''}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, minPrice: event.target.value ? Number(event.target.value) : null }))
                  }
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="number"
                  placeholder="Máx."
                  value={filters.maxPrice ?? ''}
                  onChange={(event) =>
                    setFilters((prev) => ({ ...prev, maxPrice: event.target.value ? Number(event.target.value) : null }))
                  }
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {filters.operation === 'rent' ? 'En pesos (ARS), valor mensual.' : 'En dólares (USD).'}
              </p>
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

function FilterChipGroup({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string
  options: { value: string; label: string }[]
  selected: string[]
  onToggle: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => {
          const active = selected.includes(option.value)
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              onClick={() => onToggle(option.value)}
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
  )
}
