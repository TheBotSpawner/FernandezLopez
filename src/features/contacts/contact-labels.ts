import type { StatusTone } from '@/components/data-display/StatusBadge'
import type { ContactRole } from '@/types/contact'

export const CONTACT_ROLE_LABELS: Record<ContactRole, string> = {
  prospect: 'Interesado',
  tenant: 'Inquilino',
  buyer: 'Comprador',
  owner: 'Propietario',
  seller: 'Vendedor',
}

export const CONTACT_ROLE_TONES: Record<ContactRole, StatusTone> = {
  prospect: 'info',
  tenant: 'success',
  buyer: 'warning',
  owner: 'muted',
  seller: 'muted',
}

export const CONTACT_ROLE_ORDER: ContactRole[] = ['prospect', 'tenant', 'buyer', 'owner', 'seller']
