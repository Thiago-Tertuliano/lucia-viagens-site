'use client'

import Link from 'next/link'
import type { DestinoMapa } from './types'
import { formatPeriodo } from '@/lib/format'
import { NOME_UF } from '@/lib/ufs'

export function PainelEstado({
  uf,
  viagens,
  destinoAtivo,
  onSelectDestino,
  onFechar,
}: {
  uf: string
  viagens: DestinoMapa[]
  destinoAtivo: string | null
  onSelectDestino: (slug: string) => void
  onFechar: () => void
}) {
  return (
    <aside
      className="absolute bottom-4 left-4 right-4 z-10 max-h-[55%] overflow-auto rounded-xl bg-[#fdf2e7]/95 p-4 shadow-[0_12px_40px_rgba(28,58,89,0.16)] backdrop-blur-md md:bottom-6 md:left-6 md:right-auto md:w-[340px] md:max-h-[70%]"
      role="dialog"
      aria-label={`Viagens em ${NOME_UF[uf] ?? uf}`}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#2f8f4e]">
            {NOME_UF[uf] ?? uf}
          </p>
          <p className="mt-1 text-sm text-[#3d536b]">
            {viagens.length === 0
              ? 'Nenhuma viagem realizada neste estado.'
              : `${viagens.length} ${viagens.length === 1 ? 'viagem' : 'viagens'} realizada${viagens.length === 1 ? '' : 's'}`}
          </p>
        </div>
        <button
          type="button"
          onClick={onFechar}
          className="shrink-0 rounded-md border border-[#1c3a59]/15 px-2.5 py-1 text-xs font-semibold text-[#1c3a59] hover:bg-[#1c3a59]/5"
        >
          Voltar
        </button>
      </div>

      <ul className="space-y-2">
        {viagens.map((d) => {
          const ativo = d.slug === destinoAtivo
          return (
            <li key={d.slug}>
              <button
                type="button"
                onClick={() => onSelectDestino(d.slug)}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  ativo
                    ? 'border-[#2f8f4e] bg-[#2f8f4e]/10'
                    : 'border-[#1c3a59]/10 bg-white/50 hover:border-[#2f8f4e]/40'
                }`}
              >
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2f8f4e]">
                  {formatPeriodo(d.dataPartida, d.dataRetorno)}
                </p>
                <p className="mt-1 font-display text-base leading-snug text-[#1c3a59]">{d.titulo}</p>
                {d.chamada && (
                  <p className="mt-1 line-clamp-2 text-xs text-[#3d536b]">{d.chamada}</p>
                )}
              </button>
              {ativo && (
                <div className="mt-2 flex flex-wrap gap-2">
                  <Link
                    href={`#galeria-${d.slug}`}
                    className="inline-flex h-9 items-center rounded-md bg-[#2f8f4e] px-3 text-sm font-semibold text-white hover:bg-[#267a42]"
                  >
                    Ver fotos
                  </Link>
                  <Link
                    href={`/viagens/${d.slug}`}
                    className="inline-flex h-9 items-center rounded-md border border-[#1c3a59]/20 px-3 text-sm font-semibold text-[#1c3a59]"
                  >
                    Página da viagem
                  </Link>
                </div>
              )}
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
