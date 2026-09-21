import { Plus } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ContactFilters } from './components/ContactFilters'
import { ContactFormSheet } from './components/ContactFormSheet'
import { ContactListView } from './components/ContactListView'
import { useContactList } from './use-contact-list'

export function ContactsPage() {
  const { filters, setFilters, contacts, loading, activeFilterCount, clearFilters, refetch } = useContactList()
  const [createOpen, setCreateOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold text-foreground">Contactos</h1>
          <p className="text-sm text-muted-foreground">Base de datos central de contactos e interesados.</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-1.5 self-start">
          <Plus className="size-4" />
          Nuevo contacto
        </Button>
      </div>

      <ContactFilters
        filters={filters}
        setFilters={setFilters}
        activeFilterCount={activeFilterCount}
        clearFilters={clearFilters}
        resultCount={contacts.length}
      />

      <ContactListView contacts={contacts} loading={loading} onClearFilters={clearFilters} />

      <ContactFormSheet open={createOpen} onOpenChange={setCreateOpen} onSaved={refetch} />
    </div>
  )
}
