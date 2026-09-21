import { Filter, Search } from 'lucide-react'
import { type Dispatch, type SetStateAction, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'
import { getDemoUsers } from '@/services/user-service'
import type { ContactRole } from '@/types/contact'
import { CONTACT_ROLE_LABELS, CONTACT_ROLE_ORDER } from '../contact-labels'
import type { ActivityFilter, ContactFiltersState } from '../use-contact-list'

const ACTIVITY_OPTIONS: { value: ActivityFilter; label: string }[] = [
  { value: 'all', label: 'Cualquiera' },
  { value: 'week', label: 'Última semana' },
  { value: 'month', label: 'Último mes' },
]

function toggleValue<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

interface ContactFiltersProps {
  filters: ContactFiltersState
  setFilters: Dispatch<SetStateAction<ContactFiltersState>>
  activeFilterCount: number
  clearFilters: () => void
  resultCount: number
}

export function ContactFilters({ filters, setFilters, activeFilterCount, clearFilters, resultCount }: ContactFiltersProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const users = getDemoUsers()
  const hasAnyFilter = activeFilterCount > 0 || Boolean(filters.search)

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
            placeholder="Buscar por nombre, teléfono o email..."
            className="pl-8"
          />
        </div>

        <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)} className="gap-1.5">
          <Filter className="size-4" />
          Filtros
          {activeFilterCount > 0 && <Badge className="px-1.5">{activeFilterCount}</Badge>}
        </Button>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          {resultCount} contacto{resultCount === 1 ? '' : 's'}
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
              <span className="text-sm font-medium text-foreground">Rol</span>
              <div className="flex flex-wrap gap-1.5">
                {CONTACT_ROLE_ORDER.map((role) => {
                  const active = filters.roles.includes(role)
                  return (
                    <button
                      key={role}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setFilters((prev) => ({ ...prev, roles: toggleValue(prev.roles, role as ContactRole) }))}
                      className={cn(
                        'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                        active
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground',
                      )}
                    >
                      {CONTACT_ROLE_LABELS[role]}
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

            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Actividad reciente</span>
              <Select value={filters.activity} onValueChange={(value) => setFilters((prev) => ({ ...prev, activity: value as ActivityFilter }))}>
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {(value: string) => ACTIVITY_OPTIONS.find((option) => option.value === value)?.label ?? value}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {ACTIVITY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
