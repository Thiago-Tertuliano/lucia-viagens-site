'use client'

import { useMemo, useState } from 'react'
import { TripCard } from '@/components/trip-card'
import type { Situacao, ViagemResumo } from '@/lib/types'

type Filtro = 'TODAS' | 'ABERTA' | 'CONFIRMADA' | 'ESGOTADA'

const OPCOES: { valor: Filtro; rotulo: string }[] = [
  { valor: 'TODAS', rotulo: 'Todas' },
  { valor: 'CONFIRMADA', rotulo: 'Confirmadas' },
  { valor: 'ABERTA', rotulo: 'Vagas abertas' },
  { valor: 'ESGOTADA', rotulo: 'Esgotadas' },
]

export function ViagensFiltros({ viagens }: { viagens: ViagemResumo[] }) {
  const [filtro, setFiltro] = useState<Filtro>('TODAS')
  const [busca, setBusca] = useState('')

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase()
    return viagens.filter((v) => {
      if (filtro !== 'TODAS' && v.situacao !== (filtro as Situacao)) return false
      if (!q) return true
      const blob = `${v.titulo} ${v.destino.nome} ${v.destino.cidade ?? ''} ${v.destino.uf ?? ''} ${v.chamada ?? ''}`.toLowerCase()
      return blob.includes(q)
    })
  }, [viagens, filtro, busca])

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div className="flex flex-wrap gap-2">
          {OPCOES.map((o) => (
            <button
              key={o.valor}
              type="button"
              onClick={() => setFiltro(o.valor)}
              className={`h-10 rounded-md px-4 text-sm font-semibold transition ${
                filtro === o.valor
                  ? 'bg-[#1c3a59] text-[#fdf2e7]'
                  : 'border border-[#1c3a59]/15 text-[#1c3a59] hover:bg-[#1c3a59]/5'
              }`}
            >
              {o.rotulo}
            </button>
          ))}
        </div>
        <label className="block w-full max-w-xs">
          <span className="sr-only">Buscar destino</span>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar destino ou título…"
            className="h-10 w-full rounded-md border border-[#1c3a59]/15 bg-white/70 px-3 text-sm text-[#1c3a59] outline-none ring-[#d48995] placeholder:text-[#1c3a59]/40 focus:ring-2"
          />
        </label>
      </div>

      {lista.length === 0 ? (
        <p className="rounded-sm border border-line bg-surface/70 p-8 text-ink-soft">
          Nenhuma viagem encontrada com esses filtros.
        </p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {lista.map((v) => (
            <TripCard key={v.slug} viagem={v} />
          ))}
        </div>
      )}
    </div>
  )
}
