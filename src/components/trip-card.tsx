import Link from 'next/link'
import type { ViagemResumo } from '@/lib/types'
import { destinoLabel, formatPeriodo, formatPreco } from '@/lib/format'
import { StatusBadge } from '@/components/status-badge'

export function TripCard({ viagem }: { viagem: ViagemResumo }) {
  return (
    <Link
      href={`/viagens/${viagem.slug}`}
      className="group block border border-line bg-surface/70 backdrop-blur-sm transition-colors hover:border-accent/40"
    >
      <div className="media-zoom relative aspect-[16/10] bg-bg-deep">
        {viagem.capa ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={viagem.capa.src}
            alt={viagem.capa.legenda || viagem.titulo}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted">Sem capa</div>
        )}
        <div className="absolute left-3 top-3 rounded-sm bg-surface/90 px-2.5 py-1 backdrop-blur">
          <StatusBadge situacao={viagem.situacao} />
        </div>
      </div>

      <div className="space-y-3 p-5">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
            {destinoLabel(viagem.destino)} · {viagem.dias} dias
          </p>
          <h3 className="font-display text-xl leading-snug text-ink transition-colors group-hover:text-rose">
            {viagem.titulo}
          </h3>
        </div>
        {viagem.chamada && (
          <p className="line-clamp-2 text-sm leading-relaxed text-ink-soft">{viagem.chamada}</p>
        )}
        <div className="flex items-end justify-between gap-3 border-t border-line pt-3">
          <div>
            <p className="text-xs text-muted">Período</p>
            <p className="text-sm font-medium">{formatPeriodo(viagem.dataPartida, viagem.dataRetorno)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted">A partir de</p>
            <p className="font-display text-lg text-navy">{formatPreco(viagem.precoAPartir)}</p>
          </div>
        </div>
        {viagem.vagasRestantes != null && viagem.situacao === 'ABERTA' && (
          <p className="text-xs text-muted">
            {viagem.vagasRestantes === 1
              ? '1 vaga restante'
              : `${viagem.vagasRestantes} vagas restantes`}
          </p>
        )}
      </div>
    </Link>
  )
}
