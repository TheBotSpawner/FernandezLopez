import { formatPrice } from '@/lib/format'
import type { Property } from '@/types/property'

export function propertyTitle(property: Property): string {
  return property.floor ? `${property.address} · ${property.floor}` : property.address
}

export function propertyFeatures(property: Property): string[] {
  const features: string[] = []
  if (property.rooms > 0) features.push(`${property.rooms} amb.`)
  if (property.bedrooms > 0) features.push(`${property.bedrooms} dorm.`)
  if (property.bathrooms > 0) features.push(`${property.bathrooms} baño${property.bathrooms > 1 ? 's' : ''}`)
  if (property.surface > 0) features.push(`${property.surface} m²`)
  return features
}

interface PriceLine {
  label: string
  value: string
}

export function propertyPriceLines(property: Property): PriceLine[] {
  const lines: PriceLine[] = []
  if (property.operationTypes.includes('sale') && property.salePrice) {
    lines.push({ label: 'Venta', value: formatPrice(property.salePrice, 'USD') })
  }
  if (property.operationTypes.includes('rent') && property.rentalPrice) {
    lines.push({ label: 'Alquiler', value: `${formatPrice(property.rentalPrice, 'ARS')} /mes` })
  }
  return lines
}
