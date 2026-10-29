'use client'

import { useEffect, useState } from 'react'
import { construirRegiao, unirCaixas, type BBox, type GeoFeature, type Regiao } from './geo'
import { ufDeCodigo } from '@/lib/coords'

export interface GeoBrasil {
  regioes: Regiao[]
  bbox: BBox
  porUf: Map<string, Regiao>
}

let cache: Promise<GeoBrasil> | null = null

function carregarGeoBrasil(): Promise<GeoBrasil> {
  if (!cache) {
    cache = fetch('/geo/estados.json')
      .then((r) => {
        if (!r.ok) throw new Error(`GeoJSON ${r.status}`)
        return r.json() as Promise<{ features: GeoFeature[] }>
      })
      .then((geo) => {
        const regioes = geo.features.map(construirRegiao)
        const porUf = new Map<string, Regiao>()
        for (const r of regioes) {
          const uf = ufDeCodigo(r.codigo)
          if (uf) porUf.set(uf, r)
        }
        return { regioes, bbox: unirCaixas(regioes.map((r) => r.bbox)), porUf }
      })
      .catch((err) => {
        cache = null
        throw err
      })
  }
  return cache
}

export function useGeoBrasil() {
  const [data, setData] = useState<GeoBrasil | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    carregarGeoBrasil()
      .then((geo) => {
        if (vivo) setData(geo)
      })
      .catch(() => {
        if (vivo) setErro('Não foi possível carregar o mapa.')
      })
    return () => {
      vivo = false
    }
  }, [])

  return { data, erro, carregando: !data && !erro }
}
