import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { getProperties } from '@/services/property-service'
import { propertyTitle } from '@/features/properties/property-format'
import type { Property } from '@/types/property'

export function LinkPropertySheet({
  open,
  onOpenChange,
  excludeIds,
  onSelect,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  excludeIds: string[]
  onSelect: (propertyId: string) => void
}) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Property[]>([])

  useEffect(() => {
    if (!open) return
    getProperties({ search: search || undefined }).then((result) => setResults(result.filter((p) => !excludeIds.includes(p.id)).slice(0, 20)))
  }, [open, search, excludeIds])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col gap-0">
        <SheetHeader>
          <SheetTitle>Vincular propiedad</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-3 overflow-y-auto px-4 py-2">
          <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar propiedad..." />
          <div className="flex flex-col gap-1.5">
            {results.map((property) => (
              <button
                key={property.id}
                type="button"
                onClick={() => {
                  onSelect(property.id)
                  onOpenChange(false)
                }}
                className="flex items-center gap-2.5 rounded-lg border border-border p-2 text-left hover:border-primary/40"
              >
                <img src={property.images[0]} alt="" className="size-10 shrink-0 rounded-md object-cover" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{propertyTitle(property)}</p>
                  <p className="truncate text-xs text-muted-foreground">{property.neighborhood}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
