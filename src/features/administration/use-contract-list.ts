import { useEffect, useState } from 'react'
import { useSession } from '@/app/session-context'
import { getContracts } from '@/services/rental-contract-service'
import type { AdjustmentMethod, ContractStatus, RentalContract, RentalContractQuery } from '@/types/rental-contract'

export interface ContractFiltersState {
  search: string
  status: ContractStatus[]
  adjustmentMethod: AdjustmentMethod[]
  expiration: RentalContractQuery['expiration'] | 'all'
  sort: NonNullable<RentalContractQuery['sort']>
}

const DEFAULT_FILTERS: ContractFiltersState = {
  search: '',
  status: [],
  adjustmentMethod: [],
  expiration: 'all',
  sort: 'endDate',
}

export function useContractList() {
  const { user, branchScope } = useSession()
  const effectiveBranch = user.role === 'ADMIN' || user.role === 'MANAGER' ? branchScope : user.branchId

  const [filters, setFilters] = useState<ContractFiltersState>(DEFAULT_FILTERS)
  const [contracts, setContracts] = useState<RentalContract[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const query: RentalContractQuery = {
      search: filters.search || undefined,
      branchId: effectiveBranch,
      status: filters.status.length ? filters.status : undefined,
      adjustmentMethod: filters.adjustmentMethod.length ? filters.adjustmentMethod : undefined,
      expiration: filters.expiration === 'all' ? undefined : filters.expiration,
      sort: filters.sort,
    }
    getContracts(query).then((result) => {
      if (cancelled) return
      setContracts(result)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [effectiveBranch, filters.search, filters.status, filters.adjustmentMethod, filters.expiration, filters.sort, refreshToken])

  const activeFilterCount =
    filters.status.length + filters.adjustmentMethod.length + (filters.expiration !== 'all' ? 1 : 0)

  function clearFilters() {
    setFilters((prev) => ({ ...DEFAULT_FILTERS, search: prev.search, sort: prev.sort }))
  }

  return {
    filters,
    setFilters,
    contracts,
    loading,
    activeFilterCount,
    clearFilters,
    refetch: () => setRefreshToken((t) => t + 1),
  }
}
