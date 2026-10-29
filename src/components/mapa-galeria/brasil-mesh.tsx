'use client'

import { memo, useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber'
import type { Regiao } from './geo'
import { codigoDeUf, ufDeCodigo } from '@/lib/coords'
import type { GeoBrasil } from './use-geo-brasil'

const VERDE_REGIAO: Record<string, string> = {
  N: '#1f6b3a',
  NE: '#6b9a4a',
  CO: '#4f8a3c',
  SE: '#3d7a42',
  S: '#458a4e',
}

const REGIAO_POR_UF: Record<string, string> = {
  AC: 'N', AP: 'N', AM: 'N', PA: 'N', RO: 'N', RR: 'N', TO: 'N',
  AL: 'NE', BA: 'NE', CE: 'NE', MA: 'NE', PB: 'NE', PE: 'NE', PI: 'NE', RN: 'NE', SE: 'NE',
  DF: 'CO', GO: 'CO', MT: 'CO', MS: 'CO',
  ES: 'SE', MG: 'SE', RJ: 'SE', SP: 'SE',
  PR: 'S', RS: 'S', SC: 'S',
}

const COR_HOVER = '#9fd45f'
const COR_ATIVO = '#d4a456'
const COR_VISITADO = '#1f8a48'
const COR_APAGADO = '#a8b5a0'
const ESPESSURA = 1.45
const ELEVACAO = 1.65
const LIMITE_ARRASTO = 5

function corBaseUf(codigo: string): string {
  const uf = ufDeCodigo(codigo)
  if (!uf) return '#3d7a42'
  return VERDE_REGIAO[REGIAO_POR_UF[uf] ?? 'SE']
}

function EstadoMesh({
  regiao,
  visitado,
  selecionado,
  apagado,
  onSelect,
}: {
  regiao: Regiao
  visitado: boolean
  selecionado: boolean
  apagado: boolean
  onSelect: (codigo: string) => void
}) {
  const grupo = useRef<THREE.Group>(null)
  const material = useRef<THREE.MeshStandardMaterial>(null)
  const [hover, setHover] = useState(false)
  const corAlvo = useMemo(() => new THREE.Color(), [])
  const verdeBase = useMemo(() => corBaseUf(regiao.codigo), [regiao.codigo])
  const { gl } = useThree()

  const geometria = useMemo(
    () => new THREE.ExtrudeGeometry(regiao.shapes, { depth: ESPESSURA, bevelEnabled: false, curveSegments: 1 }),
    [regiao],
  )

  const contorno = useMemo(() => {
    const pts: number[] = []
    for (const shape of regiao.shapes) {
      const pontos = shape.getPoints(20)
      for (let i = 0; i < pontos.length; i++) {
        const a = pontos[i]
        const b = pontos[(i + 1) % pontos.length]
        pts.push(a.x, a.y, ESPESSURA + 0.02, b.x, b.y, ESPESSURA + 0.02)
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3))
    return geo
  }, [regiao])

  useEffect(() => () => {
    geometria.dispose()
    contorno.dispose()
  }, [geometria, contorno])

  useFrame((_, dt) => {
    if (!grupo.current || !material.current) return
    const z = apagado ? -0.45 : hover || selecionado ? ELEVACAO : 0
    grupo.current.position.z = THREE.MathUtils.damp(grupo.current.position.z, z, 9, dt)

    const base = selecionado
      ? COR_ATIVO
      : hover
        ? COR_HOVER
        : visitado
          ? COR_VISITADO
          : apagado
            ? COR_APAGADO
            : verdeBase

    corAlvo.set(base)
    material.current.color.lerp(corAlvo, Math.min(1, dt * 10))
    material.current.emissive.set(hover || selecionado ? base : '#000000')
    material.current.emissiveIntensity = THREE.MathUtils.damp(
      material.current.emissiveIntensity,
      hover || selecionado ? 0.2 : 0,
      8,
      dt,
    )
    material.current.opacity = THREE.MathUtils.damp(material.current.opacity, apagado ? 0.28 : 1, 8, dt)
  })

  return (
    <group ref={grupo}>
      <mesh
        geometry={geometria}
        onPointerOver={(e) => {
          e.stopPropagation()
          setHover(true)
          gl.domElement.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          setHover(false)
          gl.domElement.style.cursor = 'grab'
        }}
        onClick={(e: ThreeEvent<MouseEvent>) => {
          e.stopPropagation()
          if (e.delta > LIMITE_ARRASTO) return
          onSelect(regiao.codigo)
        }}
      >
        <meshStandardMaterial
          ref={material}
          color={verdeBase}
          transparent
          roughness={0.85}
          metalness={0.03}
          flatShading
        />
      </mesh>
      <lineSegments geometry={contorno} raycast={() => null}>
        <lineBasicMaterial
          color={selecionado || hover ? '#fff8e8' : visitado ? '#0d3d22' : '#163820'}
          transparent
          opacity={selecionado || hover ? 1 : visitado ? 0.85 : 0.72}
          depthWrite={false}
        />
      </lineSegments>
    </group>
  )
}

const EstadoMemo = memo(EstadoMesh)

export function BrasilMesh({
  geo,
  ufsVisitadas,
  ufAtiva,
  onSelectUf,
}: {
  geo: GeoBrasil
  ufsVisitadas: string[]
  ufAtiva: string | null
  onSelectUf: (uf: string | null) => void
}) {
  const visitados = useMemo(() => {
    const set = new Set<string>()
    for (const uf of ufsVisitadas) {
      const cod = codigoDeUf(uf)
      if (cod) set.add(cod)
    }
    return set
  }, [ufsVisitadas])

  const codigoAtivo = ufAtiva ? codigoDeUf(ufAtiva) : null

  return (
    <group>
      {geo.regioes.map((regiao) => (
        <EstadoMemo
          key={regiao.codigo}
          regiao={regiao}
          visitado={visitados.has(regiao.codigo)}
          selecionado={codigoAtivo === regiao.codigo}
          apagado={Boolean(codigoAtivo) && codigoAtivo !== regiao.codigo}
          onSelect={(codigo) => {
            const uf = ufDeCodigo(codigo)
            if (!uf) return
            onSelectUf(uf === ufAtiva ? null : uf)
          }}
        />
      ))}
    </group>
  )
}
