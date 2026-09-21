import type { PropertyOwner } from '@/types/property'

// Fictional demo owners — not real Fernández López clients.
export const PROPERTY_OWNERS: PropertyOwner[] = [
  { id: 'owner-1', name: 'María González', phone: '+54 11 4555-2301' },
  { id: 'owner-2', name: 'Jorge Almada', phone: '+54 11 4555-2302' },
  { id: 'owner-3', name: 'Patricia Ledesma', phone: '+54 11 4555-2303' },
  { id: 'owner-4', name: 'Ricardo Funes', phone: '+54 11 4555-2304' },
  { id: 'owner-5', name: 'Silvia Cáceres', phone: '+54 11 4555-2305' },
  { id: 'owner-6', name: 'Hernán Vidal', phone: '+54 11 4555-2306' },
  { id: 'owner-7', name: 'Claudia Bregman', phone: '+54 11 4555-2307' },
  { id: 'owner-8', name: 'Alejandro Pucheta', phone: '+54 11 4555-2308' },
  { id: 'owner-9', name: 'Marcela Isla', phone: '+54 11 4555-2309' },
  { id: 'owner-10', name: 'Fabián Otero', phone: '+54 11 4555-2310' },
  { id: 'owner-11', name: 'Gabriela Sansone', phone: '+54 11 4555-2311' },
  { id: 'owner-12', name: 'Eduardo Miño', phone: '+54 11 4555-2312' },
  { id: 'owner-13', name: 'Verónica Tissera', phone: '+54 11 4555-2313' },
  { id: 'owner-14', name: 'Sergio Balestra', phone: '+54 11 4555-2314' },
  { id: 'owner-15', name: 'Lorena Quiroga', phone: '+54 11 4555-2315' },
  { id: 'owner-16', name: 'Damián Rossi', phone: '+54 11 4555-2316' },
]

export function getPropertyOwners(ownerIds: string[]): PropertyOwner[] {
  return ownerIds.map((id) => PROPERTY_OWNERS.find((owner) => owner.id === id)).filter((owner): owner is PropertyOwner => Boolean(owner))
}
