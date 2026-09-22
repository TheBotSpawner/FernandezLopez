import { Building2, Link2, Shield, SlidersHorizontal, Users } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { useSession } from '@/app/session-context'
import { can } from '@/lib/permissions'
import { cn } from '@/lib/utils'

const TABS = [
  { path: '/settings', label: 'Inmobiliaria', icon: Building2, end: true },
  { path: '/settings/branches', label: 'Sedes', icon: Building2, end: false },
  { path: '/settings/users', label: 'Usuarios', icon: Users, end: false },
  { path: '/settings/roles', label: 'Roles', icon: Shield, end: false },
  { path: '/settings/preferences', label: 'Preferencias', icon: SlidersHorizontal, end: false },
  { path: '/settings/integrations', label: 'Integraciones', icon: Link2, end: false },
]

export default function SettingsLayout() {
  const { user } = useSession()

  if (!can(user.role, 'settings.view')) {
    return (
      <div className="flex flex-col gap-1 py-10 text-center">
        <p className="text-sm font-medium text-foreground">No tenés acceso a Configuración.</p>
        <p className="text-sm text-muted-foreground">Este módulo está reservado a Administración y Gerencia.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Configuración</h1>
        <p className="text-sm text-muted-foreground">Inmobiliaria, sedes, usuarios, roles y preferencias.</p>
      </div>
      <nav className="flex gap-1 overflow-x-auto border-b border-border">
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
