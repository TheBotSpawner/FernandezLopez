import { useState } from 'react'
import { cn } from '@/lib/utils'

export function PropertyGallery({ images, title }: { images: string[]; title: string }) {
  const [active, setActive] = useState(0)

  if (images.length === 0) {
    return <div className="aspect-16/9 w-full rounded-lg bg-muted" />
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="aspect-16/9 w-full overflow-hidden rounded-lg bg-muted">
        <img src={images[active]} alt={title} className="size-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto">
          {images.map((image, index) => (
            <button
              key={image}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                'size-16 shrink-0 overflow-hidden rounded-md border-2 transition-colors',
                index === active ? 'border-primary' : 'border-transparent opacity-70 hover:opacity-100',
              )}
            >
              <img src={image} alt="" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
