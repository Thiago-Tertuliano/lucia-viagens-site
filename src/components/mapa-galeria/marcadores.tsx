'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { Html } from '@react-three/drei'
import { latLngParaMapa } from './geo'
import type { DestinoMapa } from './types'

function Pin({
  destino,
  ativo,
  onSelect,
}: {
  destino: DestinoMapa
  ativo: boolean
  onSelect: () => void
}) {
  const grupo = useRef<THREE.Group>(null)
  const base = latLngParaMapa(destino.lat, destino.lng, 1.55)

  useFrame(({ clock }) => {
    if (!grupo.current) return
    const t = clock.getElapsedTime()
    grupo.current.position.z = base.z + (ativo ? 0.15 + Math.sin(t * 3) * 0.08 : 0)
  })

  return (
    <group ref={grupo} position={[base.x, base.y, base.z]}>
      <mesh
        onClick={(e) => {
          e.stopPropagation()
          if (e.delta > 5) return
          onSelect()
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[ativo ? 0.28 : 0.2, 18, 18]} />
        <meshStandardMaterial
          color={ativo ? '#d4a456' : '#1c3a59'}
          emissive={ativo ? '#d4a456' : '#1c3a59'}
          emissiveIntensity={ativo ? 0.5 : 0.2}
          roughness={0.3}
        />
      </mesh>
      <mesh position={[0, 0, -0.08]}>
        <ringGeometry args={[0.22, 0.38, 28]} />
        <meshBasicMaterial
          color={ativo ? '#d4a456' : '#d48995'}
          transparent
          opacity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>
      <Html distanceFactor={22} position={[0, 0, 0.55]} center style={{ pointerEvents: 'none' }}>
        <div
          className={`whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-semibold shadow-sm ${
            ativo ? 'bg-[#1c3a59] text-[#fdf2e7]' : 'bg-[#fdf2e7]/90 text-[#1c3a59]'
          }`}
        >
          {destino.destino.cidade || destino.destino.nome}
        </div>
      </Html>
    </group>
  )
}

export function Marcadores({
  destinos,
  ativoSlug,
  onSelect,
}: {
  destinos: DestinoMapa[]
  ativoSlug: string | null
  onSelect: (slug: string) => void
}) {
  return (
    <group>
      {destinos.map((d) => (
        <Pin
          key={d.slug}
          destino={d}
          ativo={d.slug === ativoSlug}
          onSelect={() => onSelect(d.slug)}
        />
      ))}
    </group>
  )
}
