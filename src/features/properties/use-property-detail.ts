import { useEffect, useState } from 'react'
import { getOpportunitiesByProperty } from '@/services/opportunity-service'
import { getPropertyById } from '@/services/property-service'
import { getActiveContractForProperty } from '@/services/rental-contract-service'
import { getVisitsByProperty } from '@/services/visit-service'
import type { Opportunity } from '@/types/opportunity'
import type { Property } from '@/types/property'
import type { RentalContract } from '@/types/rental-contract'
import type { Visit } from '@/types/visit'

interface UsePropertyDetailResult {
  property: Property | null
  opportunities: Opportunity[]
  visits: Visit[]
  activeContract: RentalContract | null
  loading: boolean
  notFound: boolean
}

export function usePropertyDetail(propertyId: string | undefined): UsePropertyDetailResult {
  const [property, setProperty] = useState<Property | null>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [activeContract, setActiveContract] = useState<RentalContract | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!propertyId) {
      setLoading(false)
      setNotFound(true)
      return
    }
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    getPropertyById(propertyId).then((result) => {
      if (cancelled) return
      setProperty(result)
      setNotFound(!result)
      setOpportunities(result ? getOpportunitiesByProperty(propertyId) : [])
      setVisits(result ? getVisitsByProperty(propertyId) : [])
      setActiveContract(result ? (getActiveContractForProperty(propertyId) ?? null) : null)
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [propertyId])

  return { property, opportunities, visits, activeContract, loading, notFound }
}
