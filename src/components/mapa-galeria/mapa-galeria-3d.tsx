'use client'

import { Suspense, useCallback, useMemo, useState } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { BrasilMesh } from './brasil-mesh'
import { Marcadores } from './marcadores'
import { CameraFocus } from './camera-focus'
import { PainelEstado } from './painel-estado'
import { useGeoBrasil } from './use-geo-brasil'
import type { DestinoMapa } from './types'

function Cena({
  destinos,
  ufAtiva,
  destinoAtivo,
  onSelectUf,
  onSelectDestino,
}: {
  destinos: DestinoMapa[]
  ufAtiva: string | null
  destinoAtivo: string | null
  onSelectUf: (uf: string | null) => void
  onSelectDestino: (slug: string) => void
}) {
  const { data: geo, erro } = useGeoBrasil()

  const ufsVisitadas = useMemo(
    () => [...new Set(destinos.map((d) => d.destino.uf).filter(Boolean) as string[])],
    [destinos],
  )

  const pins = useMemo(() => {
    if (!ufAtiva) return []
    return destinos.filter((d) => d.destino.uf?.toUpperCase() === ufAtiva)
  }, [destinos, ufAtiva])

  if (erro) {
    return null
  }

  if (!geo) return null

  return (
    <>
      <color attach="background" args={['#fdf2e7']} />
      <ambientLight intensity={0.64} />
      <directionalLight position={[-14, -22, 38]} intensity={1.2} />
      <directionalLight position={[18, 14, 20]} intensity={0.32} color="#b8d4a8" />
      <hemisphereLight args={['#e8f4ff', '#3d5c32', 0.32]} />

      <BrasilMesh
        geo={geo}
        ufsVisitadas={ufsVisitadas}
        ufAtiva={ufAtiva}
        onSelectUf={onSelectUf}
      />
      <Marcadores destinos={pins} ativoSlug={destinoAtivo} onSelect={onSelectDestino} />
      <CameraFocus ufAtiva={ufAtiva} geo={geo} />

      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        enableRotate
        enableDamping
        dampingFactor={0.08}
        minPolarAngle={0.3}
        maxPolarAngle={1.15}
      />
    </>
  )
}

export default function MapaGaleria3D({ destinos }: { destinos: DestinoMapa[] }) {
  const [ufAtiva, setUfAtiva] = useState<string | null>(null)
  const [destinoAtivo, setDestinoAtivo] = useState<string | null>(null)
  const { erro: erroGeo } = useGeoBrasil()

  const noEstado = useMemo(() => {
    if (!ufAtiva) return []
    return destinos.filter((d) => d.destino.uf?.toUpperCase() === ufAtiva)
  }, [destinos, ufAtiva])

  const selecionarUf = useCallback((uf: string | null) => {
    setUfAtiva(uf)
    setDestinoAtivo(null)
  }, [])

  const fechar = useCallback(() => {
    setUfAtiva(null)
    setDestinoAtivo(null)
  }, [])

  if (!destinos.length) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center bg-[#fdf2e7] text-[#1c3a59]/70">
        Publique viagens realizadas para ver o mapa.
      </div>
    )
  }

  return (
    <section className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 bg-[#fdf2e7]">
      <div className="relative h-[min(70vh,820px)] min-h-[420px] w-full touch-pan-y md:h-[min(88vh,820px)] md:min-h-[560px] md:touch-none">
        <Canvas
          className="!block !h-full !w-full"
          camera={{ fov: 36, position: [0, -34, 46], near: 0.1, far: 800 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance', alpha: false }}
          style={{ width: '100%', height: '100%' }}
          onCreated={({ camera, gl }) => {
            camera.up.set(0, 0, 1)
            gl.domElement.style.cursor = 'grab'
            gl.domElement.addEventListener('pointerdown', () => {
              gl.domElement.style.cursor = 'grabbing'
            })
            gl.domElement.addEventListener('pointerup', () => {
              gl.domElement.style.cursor = 'grab'
            })
          }}
        >
          <Suspense fallback={null}>
            <Cena
              destinos={destinos}
              ufAtiva={ufAtiva}
              destinoAtivo={destinoAtivo}
              onSelectUf={selecionarUf}
              onSelectDestino={setDestinoAtivo}
            />
          </Suspense>
        </Canvas>

        {erroGeo && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#fdf2e7] text-sm text-[#1c3a59]/70">
            {erroGeo}
          </div>
        )}

        {ufAtiva && (
          <PainelEstado
            uf={ufAtiva}
            viagens={noEstado}
            destinoAtivo={destinoAtivo}
            onSelectDestino={setDestinoAtivo}
            onFechar={fechar}
          />
        )}

        {!ufAtiva && !erroGeo && (
          <div className="pointer-events-none absolute left-6 top-6 max-w-sm space-y-3 md:left-8 md:top-8">
            <p className="text-sm font-semibold text-[#1c3a59]/75">
              Toque ou clique em um estado para aproximar
            </p>
            <ul className="flex flex-wrap gap-x-4 gap-y-1.5 text-[11px] font-medium text-[#1c3a59]/70">
              <li className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: '#1f8a48' }} />
                Visitado
              </li>
              <li className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: '#3d7a42' }} />
                Demais UFs
              </li>
              <li className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: '#d4a456' }} />
                Selecionado
              </li>
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
