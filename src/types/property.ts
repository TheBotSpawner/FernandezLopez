export type PropertyType = 'apartment' | 'house' | 'ph' | 'commercial' | 'office' | 'parking' | 'land' | 'other'

export type OperationType = 'sale' | 'rent'

export type PropertyStatus = 'available' | 'reserved' | 'rented' | 'sold' | 'paused' | 'valuation'

export interface PropertyOwner {
  id: string
  name: string
  phone: string
}

export interface PropertyInterest {
  inquiries: number
  activeOpportunities: number
  visitsThisMonth: number
  lastInquiryAt?: string
  assignedAgentName?: string
}

export interface Property {
  id: string
  organizationId: string
  branchId: string
  referenceCode: string

  address: string
  floor?: string
  neighborhood: string
  city: string

  latitude: number
  longitude: number

  propertyType: PropertyType
  operationTypes: OperationType[]
  status: PropertyStatus

  /** USD — only meaningful when operationTypes includes 'sale'. */
  salePrice?: number
  /** ARS — only meaningful when operationTypes includes 'rent'. */
  rentalPrice?: number

  rooms: number
  bedrooms: number
  bathrooms: number
  surface: number
  coveredSurface?: number
  parkingSpaces?: number
  featured?: boolean

  description: string
  images: string[]

  ownerIds: string[]
  interest: PropertyInterest

  createdAt: string
  updatedAt: string
}

export type PropertySort = 'recent' | 'price-asc' | 'price-desc' | 'interest'

export interface PropertyQuery {
  search?: string
  branchId?: string | 'all'
  operation?: 'all' | OperationType
  status?: PropertyStatus[]
  propertyType?: PropertyType[]
  neighborhoods?: string[]
  minPrice?: number | null
  maxPrice?: number | null
  sort?: PropertySort
}
