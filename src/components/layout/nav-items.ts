import {
  BarChart3,
  Building2,
  LayoutDashboard,
  Settings,
  TrendingUp,
  Users,
  Wallet2,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  label: string
  path: string
  icon: LucideIcon
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Inicio', path: '/', icon: LayoutDashboard },
  { label: 'Administración', path: '/administration', icon: Wallet2 },
  { label: 'Propiedades', path: '/properties', icon: Building2 },
  { label: 'Comercial', path: '/commercial', icon: TrendingUp },
  { label: 'Contactos', path: '/contacts', icon: Users },
  { label: 'Reportes', path: '/reports', icon: BarChart3 },
  { label: 'Configuración', path: '/settings', icon: Settings },
]

// Highest-frequency items shown directly in the mobile bottom nav; the rest
// live behind "Más".
export const MOBILE_PRIMARY_PATHS = ['/', '/properties', '/commercial', '/contacts']
