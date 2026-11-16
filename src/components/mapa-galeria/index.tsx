'use client'

import dynamic from 'next/dynamic'
import type { DestinoMapa } from './types'

const MapaGaleria3D = dynamic(() => import('./mapa-galeria-3d'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[min(70vh,820px)] min-h-[420px] w-full md:h-[min(88vh,820px)] md:min-h-[560px] items-center justify-center bg-[#fdf2e7] text-sm text-[#1c3a59]/60">
      Carregando mapa…
    </div>
  ),
})

export function MapaGaleria({ destinos }: { destinos: DestinoMapa[] }) {
  return <MapaGaleria3D destinos={destinos} />
}

export type { DestinoMapa }
