import { Building2, Handshake, KeyRound, Users, type LucideIcon } from 'lucide-react'
import type { MetricKey } from '@/types/dashboard'

interface MetricDefinition {
  label: string
  unit: string
  icon: LucideIcon
}

export const METRIC_DEFINITIONS: Record<MetricKey, MetricDefinition> = {
  contactosNuevos: { label: 'Contactos nuevos', unit: 'este mes', icon: Users },
  propiedadesIngresadas: { label: 'Propiedades ingresadas', unit: 'este mes', icon: Building2 },
  alquileresAdministrados: { label: 'Alquileres administrados', unit: 'activos', icon: KeyRound },
  operacionesConcretadas: { label: 'Operaciones concretadas', unit: 'este mes', icon: Handshake },
}
