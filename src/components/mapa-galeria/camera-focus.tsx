'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { enquadrarBbox } from './geo'
import type { GeoBrasil } from './use-geo-brasil'

type ControlsLike = {
  target: THREE.Vector3
  update: () => void
}

const FOV = 36
/** ms de transição forçada após mudar o foco */
const TRANSICAO_MS = 950

export function CameraFocus({
  ufAtiva,
  geo,
}: {
  ufAtiva: string | null
  geo: GeoBrasil | null
}) {
  const { camera, size } = useThree()
  const controls = useThree((s) => s.controls) as ControlsLike | null
  const posAlvo = useRef(new THREE.Vector3(0, -30, 40))
  const lookAlvo = useRef(new THREE.Vector3(0, 0, 0))
  const ate = useRef(0)
  const pronto = useRef(false)

  const aspect = size.width / Math.max(1, size.height)

  const visaoGeral = useMemo(() => {
    if (!geo) return null
    return enquadrarBbox(geo.bbox, { fovDeg: FOV, aspect, margem: 1.34 })
  }, [geo, aspect])

  const visaoEstado = useMemo(() => {
    if (!geo || !ufAtiva) return null
    const regiao = geo.porUf.get(ufAtiva)
    if (!regiao) return null
    return enquadrarBbox(regiao.bbox, { fovDeg: FOV, aspect, margem: 1.5 })
  }, [geo, ufAtiva, aspect])

  useEffect(() => {
    camera.up.set(0, 0, 1)
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.fov = FOV
      camera.updateProjectionMatrix()
    }

    const enq = visaoEstado ?? visaoGeral
    if (!enq) return

    posAlvo.current.copy(enq.pos)
    lookAlvo.current.copy(enq.alvo)
    ate.current = performance.now() + TRANSICAO_MS

    if (!pronto.current) {
      camera.position.copy(enq.pos)
      if (controls) {
        controls.target.copy(enq.alvo)
        controls.update()
      } else {
        camera.lookAt(enq.alvo)
      }
      pronto.current = true
    }
  }, [camera, controls, visaoGeral, visaoEstado])

  useFrame((_, dt) => {
    if (!pronto.current) return
    const emTransicao = performance.now() < ate.current
    const k = 1 - Math.exp(-(emTransicao ? 3.2 : 1.2) * dt)

    if (emTransicao) {
      camera.position.lerp(posAlvo.current, k)
    }

    if (controls) {
      controls.target.lerp(lookAlvo.current, k)
      controls.update()
    } else if (emTransicao) {
      camera.lookAt(lookAlvo.current)
    }
  })

  return null
}
