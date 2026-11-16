import Link from 'next/link'
import type { ViagemResumo } from '@/lib/types'
import { destinoLabel, formatPeriodo, formatPreco, listaNatural } from '@/lib/format'
import { StatusBadge } from '@/components/status-badge'

export function TripCard({ viagem }: { viagem: ViagemResumo }) {
  const mostrarPreco =
    viagem.precoAPartir != null &&
    viagem.situacao !== 'CONFIRMADA' &&
    viagem.situacao !== 'REALIZADA'
  const vagas =
    viagem.vagasRestantes != null &&
    (viagem.situacao === 'ABERTA' || viagem.situacao === 'CONFIRMADA')
      ? viagem.vagasRestantes === 1
        ? '1 vaga restante'
        : `${viagem.vagasRestantes} vagas restantes`
      : null

  return (
    <Link
      href={`/viagens/${viagem.slug}`}
      className="group flex h-full flex-col border border-line bg-surface transition-colors duration-150 hover:border-accent/60"
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
          <div className="flex h-full items-center justify-center bg-cream-deep font-display text-lg text-navy/40">
            {viagem.destino.cidade || viagem.destino.nome}
          </div>
        )}
        <div className="absolute left-3 top-3 rounded-sm bg-surface px-2.5 py-1">
          <StatusBadge situacao={viagem.situacao} />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="space-y-1.5">
          <p className="text-sm text-muted">
            {destinoLabel(viagem.destino)}, {viagem.dias} {viagem.dias === 1 ? 'dia' : 'dias'}
          </p>
          <h3 className="font-display text-xl leading-snug text-ink transition-colors duration-150 group-hover:text-rose-deep">
            {viagem.titulo}
          </h3>
        </div>

        {(viagem.descricaoCurta || viagem.chamada) && (
          <p className="line-clamp-3 text-sm leading-relaxed text-ink-soft">
            {viagem.descricaoCurta || viagem.chamada}
          </p>
        )}

        {viagem.destaques && viagem.destaques.length > 0 && (
          <p className="text-sm leading-relaxed text-ink">
            <span className="font-semibold">Você vai conhecer: </span>
            <span className="text-ink-soft">{listaNatural(viagem.destaques)}</span>
          </p>
        )}

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-4">
          <div>
            <p className="text-xs text-muted">Data</p>
            <p className="text-sm font-semibold tabular-nums">
              {formatPeriodo(viagem.dataPartida, viagem.dataRetorno)}
            </p>
          </div>
          {mostrarPreco ? (
            <div className="text-right">
              <p className="text-xs text-muted">A partir de</p>
              <p className="font-display text-lg tabular-nums text-navy">
                {formatPreco(viagem.precoAPartir)}
              </p>
            </div>
          ) : (
            vagas && <p className="text-sm font-semibold text-rose-deep">{vagas}</p>
          )}
        </div>
      </div>
    </Link>
  )
}
