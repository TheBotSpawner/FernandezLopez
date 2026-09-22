import { useState } from 'react'
import { useTheme } from '@/app/theme-context'
import { useToast } from '@/app/toast-context'
import { SectionCard } from '@/components/data-display/SectionCard'
import { Button } from '@/components/ui/button'
import { readStoredPropertyView, writeStoredPropertyView, type PropertyViewMode } from '@/lib/property-view-preference'
import { updatePreferences } from '@/services/preferences-service'
import type { Preferences } from '@/types/preferences'

const VIEW_LABELS: Record<PropertyViewMode, string> = { list: 'Listado', cards: 'Tarjetas', map: 'Mapa' }
const DATE_FORMAT_LABELS: Record<Preferences['dateFormat'], string> = { 'dd/MM/yyyy': 'DD/MM/AAAA', 'MM/dd/yyyy': 'MM/DD/AAAA' }

export function PreferencesForm({ preferences }: { preferences: Preferences }) {
  const { theme, toggleTheme } = useTheme()
  const { showToast } = useToast()
  const [values, setValues] = useState(preferences)
  const [propertiesView, setPropertiesView] = useState<PropertyViewMode>(readStoredPropertyView)

  async function handleChange(patch: Partial<Preferences>) {
    const updated = await updatePreferences(patch)
    setValues(updated)
    showToast('Preferencias actualizadas')
  }

  function handleViewChange(view: PropertyViewMode) {
    setPropertiesView(view)
    writeStoredPropertyView(view)
    showToast('Preferencias actualizadas')
  }

  return (
    <SectionCard title="Preferencias generales">
      <div className="flex flex-col divide-y divide-border">
        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Tema</p>
            <p className="text-xs text-muted-foreground">Claro u oscuro para toda la aplicación.</p>
          </div>
          <Button variant="outline" size="sm" onClick={toggleTheme}>
            {theme === 'dark' ? 'Oscuro' : 'Claro'}
          </Button>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Vista inicial de propiedades</p>
            <p className="text-xs text-muted-foreground">Con qué vista abre el listado de Propiedades.</p>
          </div>
          <div className="flex gap-1">
            {(Object.keys(VIEW_LABELS) as PropertyViewMode[]).map((mode) => (
              <Button
                key={mode}
                variant={propertiesView === mode ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleViewChange(mode)}
              >
                {VIEW_LABELS[mode]}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Formato de fecha</p>
            <p className="text-xs text-muted-foreground">Cómo se muestran las fechas en formularios.</p>
          </div>
          <div className="flex gap-1">
            {(Object.keys(DATE_FORMAT_LABELS) as Preferences['dateFormat'][]).map((format) => (
              <Button
                key={format}
                variant={values.dateFormat === format ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleChange({ dateFormat: format })}
              >
                {DATE_FORMAT_LABELS[format]}
              </Button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between py-3">
          <div>
            <p className="text-sm font-medium text-foreground">Moneda predeterminada</p>
            <p className="text-xs text-muted-foreground">Moneda sugerida al cargar nuevos valores.</p>
          </div>
          <div className="flex gap-1">
            {(['ARS', 'USD'] as const).map((currency) => (
              <Button
                key={currency}
                variant={values.currency === currency ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleChange({ currency })}
              >
                {currency}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
