import { useParams } from 'react-router-dom'
import { ConsorcioDetailPage } from '@/features/consorcios/ConsorcioDetailPage'

export default function ConsorcioDetail() {
  const { consorcioId } = useParams<{ consorcioId: string }>()
  return <ConsorcioDetailPage consorcioId={consorcioId} />
}
