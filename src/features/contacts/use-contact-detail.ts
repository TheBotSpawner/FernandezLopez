import { useEffect, useState } from 'react'
import { getContactById, getContactNotes } from '@/services/contact-service'
import { getOpportunitiesByContact } from '@/services/opportunity-service'
import { getPropertyById } from '@/services/property-service'
import { getVisitsByContact } from '@/services/visit-service'
import type { Contact, ContactNote } from '@/types/contact'
import type { Opportunity } from '@/types/opportunity'
import type { Property } from '@/types/property'
import type { Visit } from '@/types/visit'

interface UseContactDetailResult {
  contact: Contact | null
  opportunities: Opportunity[]
  visits: Visit[]
  relatedProperties: Record<string, Property>
  notes: ContactNote[]
  loading: boolean
  notFound: boolean
  refetch: () => void
}

export function useContactDetail(contactId: string | undefined): UseContactDetailResult {
  const [contact, setContact] = useState<Contact | null>(null)
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [visits, setVisits] = useState<Visit[]>([])
  const [relatedProperties, setRelatedProperties] = useState<Record<string, Property>>({})
  const [notes, setNotes] = useState<ContactNote[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [refreshToken, setRefreshToken] = useState(0)

  useEffect(() => {
    if (!contactId) {
      setLoading(false)
      setNotFound(true)
      return
    }
    let cancelled = false
    setLoading(true)
    setNotFound(false)
    getContactById(contactId).then(async (result) => {
      if (cancelled) return
      if (!result) {
        setNotFound(true)
        setLoading(false)
        return
      }
      const contactOpportunities = getOpportunitiesByContact(contactId)
      const contactVisits = getVisitsByContact(contactId)
      const linkedIds = contactOpportunities.flatMap((opportunity) => opportunity.linkedPropertyIds)
      const visitedIds = contactVisits.map((visit) => visit.propertyId)
      const uniquePropertyIds = Array.from(new Set([...linkedIds, ...visitedIds]))
      const properties = await Promise.all(uniquePropertyIds.map((id) => getPropertyById(id)))
      if (cancelled) return

      setContact(result)
      setOpportunities(contactOpportunities)
      setVisits(contactVisits)
      setRelatedProperties(
        Object.fromEntries(properties.filter((p): p is Property => Boolean(p)).map((property) => [property.id, property])),
      )
      setNotes(getContactNotes(contactId))
      setLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [contactId, refreshToken])

  return {
    contact,
    opportunities,
    visits,
    relatedProperties,
    notes,
    loading,
    notFound,
    refetch: () => setRefreshToken((t) => t + 1),
  }
}
