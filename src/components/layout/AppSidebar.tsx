import { NavLink } from 'react-router-dom'
import logo from '@/assets/fernandez-lopez-logo-800x800.png'
import { useSession } from '@/app/session-context'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { NAV_ITEMS } from './nav-items'

export function AppSidebar() {
  const { organization } = useSession()

  return (
    <aside className="hidden shrink-0 flex-col border-r border-border bg-card md:flex md:w-16 lg:w-64">
      <div className="flex h-14 items-center gap-2 px-3 lg:px-5">
        <img src={logo} alt={organization.name} className="size-8 shrink-0 rounded-lg" />
        <span className="hidden truncate text-sm font-semibold text-foreground lg:inline">{organization.name}</span>
      </div>
      <Separator />
      <nav className="flex flex-1 flex-col gap-1 p-2 lg:p-3">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground',
                isActive && 'bg-primary/10 text-primary hover:bg-primary/10 hover:text-primary',
              )
            }
          >
            <item.icon className="size-4.5 shrink-0" />
            <span className="hidden lg:inline">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
