import { useEffect, useState } from 'react'
import { useSession } from '@/app/session-context'
import { readStoredPropertyView, writeStoredPropertyView } from '@/lib/property-view-preference'
import { getNeighborhoods, getProperties, getPropertyTypes } from '@/services/property-service'
import type { Property, PropertyQuery, PropertySort, PropertyStatus, PropertyType } from '@/types/property'
import type { PropertyViewMode } from '@/lib/property-view-preference'

export type { PropertyViewMode } from '@/lib/property-view-preference'

export interface PropertyFiltersState {
  search: string
  operation: 'all' | 'sale' | 'rent'
  status: PropertyStatus[]
  propertyType: PropertyType[]
  neighborhoods: string[]
  minPrice: number | null
  maxPrice: number | null
  sort: PropertySort
}

const DEFAULT_FILTERS: PropertyFiltersState = {
  search: '',
  operation: 'all',
  status: [],
  propertyType: [],
  neighborhoods: [],
  minPrice: null,
  maxPrice: null,
  sort: 'recent',
}

export function usePropertyList() {
  const { user, branchScope } = useSession()
  const effectiveBranch = user.role === 'ADMIN' || user.role === 'MANAGER' ? branchScope : user.branchId

  const [filters, setFilters] = useState<PropertyFiltersState>(DEFAULT_FILTERS)
  const [view, setViewState] = useState<PropertyViewMode>(readStoredPropertyView)
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  function setView(next: PropertyViewMode) {
    setViewState(next)
    writeStoredPropertyView(next)
  }

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const query: PropertyQuery = {
      search: filters.search || undefined,
      branchId: effectiveBranch,
      operation: filters.operation,
      status: filters.status.length ? filters.status : undefined,
      propertyType: filters.propertyType.length ? filters.propertyType : undefined,
      neighborhoods: filters.neighborhoods.length ? filters.neighborhoods : undefined,
      minPrice: filters.minPrice,
      maxPrice: filters.maxPrice,
      sort: filters.sort,
    }
    getProperties(query).then((result) => {
      if (!cancelled) {
        setProperties(result)
        setLoading(false)
      }
    })
    return () => {
      cancelled = true
    }
  }, [
    effectiveBranch,
    filters.search,
    filters.operation,
    filters.status,
    filters.propertyType,
    filters.neighborhoods,
    filters.minPrice,
    filters.maxPrice,
    filters.sort,
  ])

  const activeFilterCount =
    filters.status.length +
    filters.propertyType.length +
    filters.neighborhoods.length +
    (filters.minPrice != null ? 1 : 0) +
    (filters.maxPrice != null ? 1 : 0)

  function clearFilters() {
    setFilters((prev) => ({ ...DEFAULT_FILTERS, search: prev.search, operation: prev.operation, sort: prev.sort }))
  }

  return {
    filters,
    setFilters,
    view,
    setView,
    properties,
    loading,
    activeFilterCount,
    clearFilters,
    neighborhoods: getNeighborhoods(),
    propertyTypes: getPropertyTypes(),
  }
}
