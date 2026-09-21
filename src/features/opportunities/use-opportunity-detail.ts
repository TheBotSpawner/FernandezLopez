import { useEffect, useState } from 'react'
import { getOpportunityById, getCompatibleProperties } from '@/services/opportunity-service'
import { getPropertyById } from '@/services/property-service'
import { getVisitsByOpportunity } from '@/services/visit-service'
import type { CompatibleProperty } from '@/services/opportunity-service'
import type { Opportunity } from '@/types/opportunity'
import type { Property } from '@/types/property'
import type { Visit } from '@/types/visit'

interface UseOpportunityDetailResult {
  opportunity: Opportunity | null
  linkedProperties: Property[]
  compatibleProperties: CompatibleProperty[]
  visits: Visit[]
  loading: boolean
  notFound: boolean
  refetch: () => void
}

export function useOpportunityDetail(opportunityId: string | undefined): UseOpportunityDetailResult {
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [linkedProperties, setLinkedProperties] = useState<Property[]>([])
  const [compatibleProperties, setCompatibleProperties] = useState<CompatibleProperty[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    if (!opportunityId) {
      setLoading(false)
      setNotFound(true)
      return
    }
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    getOpportunityById(opportunityId).then(async (result) => {
      if (cancelled) return
      if (!result) {
        setNotFound(true)
        setLoading(false)
        return
      }
      const [properties, compatible] = await Promise.all([
        Promise.all(result.linkedPropertyIds.map((id) => getPropertyById(id))),
        getCompatibleProperties(result),
      ])
      if (cancelled) return

      setOpportunity(result)
      setLinkedProperties(properties.filter((p): p is Property => Boolean(p)))
      setCompatibleProperties(compatible.filter((c) => !result.linkedPropertyIds.includes(c.property.id)))
      setVisits(getVisitsByOpportunity(opportunityId))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [opportunityId, refreshToken])

  return { opportunity, linkedProperties, compatibleProperties, visits, loading, notFound, refetch: () => setRefreshToken((t) => t + 1) }
}
