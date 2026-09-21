import { Calendar, CalendarDays, Plus, Table } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { getDemoUsers } from '@/services/user-service'
import { VisitAgendaView } from './components/VisitAgendaView'
import { VisitCalendarView } from './components/VisitCalendarView'
import { VisitDetailSheet } from './components/VisitDetailSheet'
import { VisitFormSheet } from './components/VisitFormSheet'
import { VisitListTable } from './components/VisitListTable'
import { useVisitList } from './use-visit-list'
import type { Visit } from '@/types/visit'

type ViewMode = 'agenda' | 'calendar' | 'list'

export function VisitsPage() {
  const { filters, setFilters, visits, loading, activeFilterCount, clearFilters, refetch } = useVisitList()
  const users = getDemoUsers()
  const [view, setView] = useState<ViewMode>('agenda')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [createOpen, setCreateOpen] = useState(false)
  const [detailVisit, setDetailVisit] = useState<Visit | null>(null)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Visitas</h1>
          <p className="text-sm text-muted-foreground">Agenda de visitas a propiedades.</p>
        </div>
        <div className="flex items-center gap-2 self-start">
          <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1" role="tablist" aria-label="Vista de visitas">
            {(
              [
                { mode: 'agenda' as const, label: 'Agenda', icon: CalendarDays },
                { mode: 'calendar' as const, label: 'Calendario', icon: Calendar },
                { mode: 'list' as const, label: 'Lista', icon: Table },
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
            Nueva visita
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={filters.assignedUserId}
          onValueChange={(value) => setFilters((prev) => ({ ...prev, assignedUserId: value as string }))}
        >
          <SelectTrigger className="w-48">
            <SelectValue>
              {(value: string) => (value === 'all' ? 'Todos los responsables' : (users.find((u) => u.id === value)?.name ?? value))}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los responsables</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <button type="button" onClick={clearFilters} className="text-sm font-medium text-primary hover:underline">
            Limpiar filtros
            <Badge className="ml-1.5 px-1.5">{activeFilterCount}</Badge>
          </button>
        )}
      </div>

      {view === 'agenda' && (
        <VisitAgendaView
          visits={visits}
          loading={loading}
          selectedDate={selectedDate}
          onSelectedDateChange={setSelectedDate}
          onSelectVisit={setDetailVisit}
        />
      )}
      {view === 'calendar' && (
        <VisitCalendarView visits={visits} month={selectedMonth} onMonthChange={setSelectedMonth} onSelectVisit={setDetailVisit} />
      )}
      {view === 'list' && <VisitListTable visits={visits} loading={loading} onSelectVisit={setDetailVisit} />}

      <VisitFormSheet open={createOpen} onOpenChange={setCreateOpen} onSaved={refetch} />
      <VisitDetailSheet visit={detailVisit} open={Boolean(detailVisit)} onOpenChange={(open) => !open && setDetailVisit(null)} onChanged={refetch} />
    </div>
  )
}
