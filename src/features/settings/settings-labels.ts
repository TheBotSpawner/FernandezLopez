import type { BranchStatus, UserRole, UserStatus } from '@/types/session'

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN: 'Administrador',
  MANAGER: 'Gerencia',
  ADMINISTRATION: 'Administración',
  AGENT: 'Comercial / Vendedor',
}

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  active: 'Activo',
  inactive: 'Inactivo',
}

export const BRANCH_STATUS_LABELS: Record<BranchStatus, string> = {
  active: 'Activa',
  inactive: 'Inactiva',
}

export const ROLE_MATRIX: { module: string; access: Record<UserRole, string> }[] = [
  {
    module: 'Dashboard general',
    access: { ADMIN: 'Sí', MANAGER: 'Sí', ADMINISTRATION: 'Parcial', AGENT: 'Propio' },
  },
  {
    module: 'Propiedades',
    access: { ADMIN: 'Sí', MANAGER: 'Sí', ADMINISTRATION: 'Lectura', AGENT: 'Sí' },
  },
  {
    module: 'Comercial',
    access: { ADMIN: 'Sí', MANAGER: 'Sí', ADMINISTRATION: 'Lectura', AGENT: 'Sí' },
  },
  {
    module: 'Contactos',
    access: { ADMIN: 'Sí', MANAGER: 'Sí', ADMINISTRATION: 'Lectura', AGENT: 'Sí' },
  },
  {
    module: 'Administración',
    access: { ADMIN: 'Sí', MANAGER: 'Sí', ADMINISTRATION: 'Sí', AGENT: 'Limitado' },
  },
  {
    module: 'Reportes',
    access: { ADMIN: 'Sí', MANAGER: 'Sí', ADMINISTRATION: 'Admin', AGENT: 'Propio' },
  },
  {
    module: 'Configuración',
    access: { ADMIN: 'Sí', MANAGER: 'Limitado', ADMINISTRATION: 'No', AGENT: 'No' },
  },
]
