import { useParams } from 'react-router-dom'
import { OpportunityDetailPage } from '@/features/opportunities/OpportunityDetailPage'

export default function OpportunityDetail() {
  const { opportunityId } = useParams<{ opportunityId: string }>()
  return <OpportunityDetailPage opportunityId={opportunityId} />
}
