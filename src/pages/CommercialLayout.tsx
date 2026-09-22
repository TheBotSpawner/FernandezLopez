import { Handshake, CalendarDays } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const TABS = [
  { path: '/commercial/opportunities', label: 'Oportunidades', icon: Handshake },
  { path: '/commercial/visits', label: 'Visitas', icon: CalendarDays },
]

export default function CommercialLayout() {
  return (
    <div className="flex flex-col gap-4">
      <nav className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )
            }
          >
            <tab.icon className="size-4" />
            {tab.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
