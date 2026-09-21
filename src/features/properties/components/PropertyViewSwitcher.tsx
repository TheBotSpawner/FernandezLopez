import { LayoutGrid, List, Map } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PropertyViewMode } from '../use-property-list'

const VIEWS: { mode: PropertyViewMode; label: string; icon: typeof List }[] = [
  { mode: 'list', label: 'Lista', icon: List },
  { mode: 'cards', label: 'Tarjetas', icon: LayoutGrid },
  { mode: 'map', label: 'Mapa', icon: Map },
]

export function PropertyViewSwitcher({ value, onChange }: { value: PropertyViewMode; onChange: (mode: PropertyViewMode) => void }) {
  return (
    <div className="flex gap-1 rounded-lg border border-border bg-muted/40 p-1" role="tablist" aria-label="Vista de propiedades">
      {VIEWS.map((item) => (
        <button
          key={item.mode}
          type="button"
          role="tab"
          aria-selected={value === item.mode}
          onClick={() => onChange(item.mode)}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted-foreground transition-colors',
            value === item.mode ? 'bg-card text-foreground shadow-sm' : 'hover:text-foreground',
          )}
        >
          <item.icon className="size-4" />
          <span className="hidden sm:inline">{item.label}</span>
        </button>
      ))}
    </div>
  )
}
