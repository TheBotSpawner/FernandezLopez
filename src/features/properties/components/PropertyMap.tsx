import L from 'leaflet'
import { MapPinOff } from 'lucide-react'
import { useEffect, useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet'
import { Link } from 'react-router-dom'
import { propertyPriceLines, propertyTitle } from '../property-format'
import { PROPERTY_STATUS_TONES } from '../property-labels'
import { OperationBadge, PropertyStatusBadge } from './PropertyBadges'
import type { Property } from '@/types/property'

const TONE_COLOR_VAR: Record<string, string> = {
  success: 'var(--success)',
  warning: 'var(--warning)',
  danger: 'var(--danger)',
  info: 'var(--info)',
  muted: 'var(--muted-foreground)',
}

const BUENOS_AIRES_CENTER: [number, number] = [-34.565, -58.47]

function markerIcon(property: Property): L.DivIcon {
  const color = TONE_COLOR_VAR[PROPERTY_STATUS_TONES[property.status]]
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:16px;height:16px;border-radius:9999px;background:${color};border:2px solid var(--background);box-shadow:0 1px 3px rgba(0,0,0,0.4)"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

function FitBounds({ properties }: { properties: Property[] }) {
  const map = useMap()

  useEffect(() => {
    if (properties.length === 0) return
    const bounds = L.latLngBounds(properties.map((property) => [property.latitude, property.longitude]))
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 15 })
  }, [map, properties])

  return null
}

export function PropertyMap({ properties, height = '520px' }: { properties: Property[]; height?: string }) {
  const withCoordinates = useMemo(
    () => properties.filter((property) => Number.isFinite(property.latitude) && Number.isFinite(property.longitude)),
    [properties],
  )

  return (
    <div className="relative overflow-hidden rounded-lg border border-border" style={{ height }}>
      <MapContainer center={BUENOS_AIRES_CENTER} zoom={13} scrollWheelZoom className="size-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds properties={withCoordinates} />
        {withCoordinates.map((property) => (
          <Marker key={property.id} position={[property.latitude, property.longitude]} icon={markerIcon(property)}>
            <Popup minWidth={220}>
              <div className="flex flex-col gap-1.5">
                <img
                  src={property.images[0]}
                  alt={propertyTitle(property)}
                  className="h-24 w-full rounded-md object-cover"
                />
                <p className="text-sm font-medium text-foreground">{propertyTitle(property)}</p>
                <p className="text-xs text-muted-foreground">{property.neighborhood}</p>
                <div className="flex items-center gap-1.5">
                  {property.operationTypes.map((operation) => (
                    <OperationBadge key={operation} operation={operation} />
                  ))}
                  <PropertyStatusBadge status={property.status} />
                </div>
                <p className="text-sm font-semibold text-foreground">
                  {propertyPriceLines(property)
                    .map((line) => line.value)
                    .join(' · ')}
                </p>
                <Link to={`/properties/${property.id}`} className="text-sm font-medium text-primary hover:underline">
                  Ver propiedad
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {withCoordinates.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background/70">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm text-muted-foreground shadow-md">
            <MapPinOff className="size-4" />
            No hay propiedades para mostrar en el mapa.
          </div>
        </div>
      )}
    </div>
  )
}
