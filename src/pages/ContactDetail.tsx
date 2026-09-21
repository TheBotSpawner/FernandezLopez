import { useParams } from 'react-router-dom'
import { ContactDetailPage } from '@/features/contacts/ContactDetailPage'

export default function ContactDetail() {
  const { contactId } = useParams<{ contactId: string }>()
  return <ContactDetailPage contactId={contactId} />
}
