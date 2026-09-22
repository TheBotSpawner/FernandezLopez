import { DemoResetCard } from '@/features/settings/components/DemoResetCard'
import { PreferencesForm } from '@/features/settings/components/PreferencesForm'
import { getPreferences } from '@/services/preferences-service'

export default function SettingsPreferences() {
  return (
    <div className="flex flex-col gap-4">
      <PreferencesForm preferences={getPreferences()} />
      <DemoResetCard />
    </div>
  )
}
