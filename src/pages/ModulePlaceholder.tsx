import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface ModulePlaceholderProps {
  title: string
  description: string
  icon: LucideIcon
}

export default function ModulePlaceholder({ title, description, icon: Icon }: ModulePlaceholderProps) {
  return (
    <div className="flex min-h-[60svh] items-center justify-center">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Icon className="size-6" />
          </div>
          <h1 className="text-lg font-semibold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
          <p className="text-xs text-muted-foreground">
            Este módulo forma parte de la hoja de ruta del prototipo y todavía no está implementado.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
