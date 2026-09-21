import { useParams } from 'react-router-dom'
import { PropertyDetailPage } from '@/features/properties/PropertyDetailPage'

export default function PropertyDetail() {
  const { propertyId } = useParams<{ propertyId: string }>()
  return <PropertyDetailPage propertyId={propertyId} />
}
