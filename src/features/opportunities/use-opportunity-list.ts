import { useEffect, useState } from 'react'
import { useSession } from '@/app/session-context'
import { getOpportunities } from '@/services/opportunity-service'
import type { Opportunity, OpportunityQuery, OpportunityStage, OpportunityType } from '@/types/opportunity'

export type PipelineGroup = 'demand' | 'owner'

const GROUP_TYPES: Record<PipelineGroup, OpportunityType[]> = {
  demand: ['RENT_SEARCH', 'BUY_SEARCH'],
  owner: ['OWNER_RENT', 'OWNER_SELL'],
}

export interface OpportunityFiltersState {
  search: string
  group: PipelineGroup
  stage: OpportunityStage[]
  assignedUserId: string | 'all'
  overdueOnly: boolean
}

const DEFAULT_FILTERS: OpportunityFiltersState = {
  search: '',
  group: 'demand',
  stage: [],
  assignedUserId: 'all',
  overdueOnly: false,
}

export function useOpportunityList() {
  const { user, branchScope } = useSession()
  const effectiveBranch = user.role === 'ADMIN' || user.role === 'MANAGER' ? branchScope : user.branchId

  const [filters, setFilters] = useState<OpportunityFiltersState>(DEFAULT_FILTERS)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    const query: OpportunityQuery = {
      search: filters.search || undefined,
      branchId: effectiveBranch,
      assignedUserId: filters.assignedUserId === 'all' ? undefined : filters.assignedUserId,
      stage: filters.stage.length ? filters.stage : undefined,
      overdueOnly: filters.overdueOnly || undefined,
    }
    getOpportunities(query).then((result) => {
      if (cancelled) return
      const groupTypes = GROUP_TYPES[filters.group]
      setOpportunities(result.filter((opportunity) => groupTypes.includes(opportunity.type)))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [effectiveBranch, filters.search, filters.group, filters.stage, filters.assignedUserId, filters.overdueOnly, refreshToken])

  const activeFilterCount = filters.stage.length + (filters.assignedUserId !== 'all' ? 1 : 0) + (filters.overdueOnly ? 1 : 0)

  function clearFilters() {
    setFilters((prev) => ({ ...DEFAULT_FILTERS, search: prev.search, group: prev.group }))
  }

  return {
    filters,
    setFilters,
    opportunities,
    loading,
    activeFilterCount,
    clearFilters,
    refetch: () => setRefreshToken((t) => t + 1),
  }
}
