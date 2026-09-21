import { PropertyCardGrid } from './components/PropertyCardGrid'
import { PropertyFilters } from './components/PropertyFilters'
import { PropertyListView } from './components/PropertyListView'
import { PropertyMap } from './components/PropertyMap'
import { PropertyViewSwitcher } from './components/PropertyViewSwitcher'
import { usePropertyList } from './use-property-list'

export function PropertiesPage() {
  const { filters, setFilters, view, setView, properties, loading, activeFilterCount, clearFilters, neighborhoods, propertyTypes } =
    usePropertyList()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-foreground">Propiedades</h1>
        <p className="text-sm text-muted-foreground">Portfolio de propiedades de la inmobiliaria.</p>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <PropertyFilters
          filters={filters}
          setFilters={setFilters}
          neighborhoods={neighborhoods}
          propertyTypes={propertyTypes}
          activeFilterCount={activeFilterCount}
          clearFilters={clearFilters}
          resultCount={properties.length}
        />
        <PropertyViewSwitcher value={view} onChange={setView} />
      </div>

      {view === 'list' && <PropertyListView properties={properties} loading={loading} onClearFilters={clearFilters} />}
      {view === 'cards' && <PropertyCardGrid properties={properties} loading={loading} onClearFilters={clearFilters} />}
      {view === 'map' && !loading && <PropertyMap properties={properties} />}
      {view === 'map' && loading && <div className="h-[520px] animate-pulse rounded-lg bg-muted" />}
    </div>
  )
}
