import { useEffect, useState } from 'react'
import { getContractById, getContractsByProperty } from '@/services/rental-contract-service'
import { getPropertyById } from '@/services/property-service'
import { getContactById } from '@/services/contact-service'
import type { Contact } from '@/types/contact'
import type { Property } from '@/types/property'
import type { RentalContract } from '@/types/rental-contract'

interface UseContractDetailResult {
  contract: RentalContract | null
  property: Property | null
  tenants: Contact[]
  owners: Contact[]
  propertyHistory: RentalContract[]
  loading: boolean
  notFound: boolean
  refetch: () => void
}

export function useContractDetail(contractId: string | undefined): UseContractDetailResult {
  const [contract, setContract] = useState<RentalContract | null>(null)
  const [property, setProperty] = useState<Property | null>(null)
  const [tenants, setTenants] = useState<Contact[]>([])
  const [owners, setOwners] = useState<Contact[]>([])
  const [propertyHistory, setPropertyHistory] = useState<RentalContract[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    if (!contractId) {
      setLoading(false)
      setNotFound(true)
      return
    }
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    getContractById(contractId).then(async (result) => {
      if (cancelled) return
      if (!result) {
        setNotFound(true)
        setLoading(false)
        return
      }
      const [propertyResult, tenantResults, ownerResults] = await Promise.all([
        getPropertyById(result.propertyId),
        Promise.all(result.tenantIds.map((id) => getContactById(id))),
        Promise.all(result.ownerIds.map((id) => getContactById(id))),
      ])
      if (cancelled) return

      setContract(result)
      setProperty(propertyResult)
      setTenants(tenantResults.filter((c): c is Contact => Boolean(c)))
      setOwners(ownerResults.filter((c): c is Contact => Boolean(c)))
      setPropertyHistory(getContractsByProperty(result.propertyId).filter((c) => c.id !== result.id))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [contractId, refreshToken])

  return {
    contract,
    property,
    tenants,
    owners,
    propertyHistory,
    loading,
    notFound,
    refetch: () => setRefreshToken((t) => t + 1),
  }
}
