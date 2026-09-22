import { CalendarClock, FileText, LayoutDashboard, Wallet2 } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'

const TABS = [
  { path: '/administration', label: 'Resumen', icon: LayoutDashboard, end: true },
  { path: '/administration/contracts', label: 'Contratos', icon: FileText, end: false },
  { path: '/administration/settlements', label: 'Liquidaciones', icon: Wallet2, end: false },
  { path: '/administration/expirations', label: 'Vencimientos', icon: CalendarClock, end: false },
]

export default function AdministrationLayout() {
  return (
    <div className="flex flex-col gap-4">
      <nav className="flex gap-1 overflow-x-auto border-b border-border print:hidden">
        {TABS.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            end={tab.end}
            className={({ isActive }) =>
              cn(
                'flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2 text-sm font-medium transition-colors',
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
