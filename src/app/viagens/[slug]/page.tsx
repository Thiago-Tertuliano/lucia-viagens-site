import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { HideWaFab } from '@/components/hide-wa-fab'
import { StatusBadge } from '@/components/status-badge'
import { getAllViagemSlugs, getViagem } from '@/lib/content'
import { destinoLabel, formatDate, formatPeriodo, formatPreco } from '@/lib/format'

export async function generateStaticParams() {
  const slugs = await getAllViagemSlugs()
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const viagem = await getViagem(slug)
  if (!viagem) return { title: 'Viagem' }
  return {
    title: viagem.titulo,
    description: viagem.chamada || viagem.descricao?.slice(0, 160) || undefined,
  }
}

export default async function ViagemPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const viagem = await getViagem(slug)
  if (!viagem) notFound()

  const paragrafos = (viagem.descricao || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  const realizada = viagem.situacao === 'REALIZADA'
  const confirmada = viagem.situacao === 'CONFIRMADA'
  const ocultarPreco =
    realizada || confirmada || viagem.precoAPartir == null
  // REALIZADA: só o que está em fotos[] (espelho da galeria do LC Manager)
  const fotosGaleria = realizada
    ? viagem.fotos
    : viagem.fotos.length > 0
      ? viagem.fotos
      : viagem.capa
        ? [viagem.capa]
        : []

  return (
    <article>
      {realizada && (
        <>
          <HideWaFab />
          {/* Esconde o FAB já no HTML (sem flash) até o client setar body[data-hide-wa-fab] */}
          <style>{`body .wa-fab{display:none!important}`}</style>
        </>
      )}
      <header className="relative min-h-[70svh] overflow-hidden bg-ink text-white">
        {viagem.capa && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={viagem.capa.src}
            alt={viagem.capa.legenda || viagem.titulo}
            className="absolute inset-0 h-full w-full object-cover"
            fetchPriority="high"
          />
        )}
        <div className="absolute inset-0" style={{ background: 'var(--hero-veil)' }} />
        <div className="relative container-page flex min-h-[60svh] flex-col justify-end py-12 md:min-h-[70svh] md:py-16">
          <div className="mb-4">
            <StatusBadge situacao={viagem.situacao} tone="light" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            {destinoLabel(viagem.destino)} · {viagem.dias} dias
          </p>
          <h1 className="mt-3 max-w-4xl font-display text-[clamp(2rem,6vw,3.8rem)] leading-[1.02] tracking-tight">
            {viagem.titulo}
          </h1>
          {viagem.chamada && (
            <p className="mt-4 max-w-2xl text-base text-white/85 md:text-lg">{viagem.chamada}</p>
          )}
        </div>
      </header>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[1.4fr_0.8fr]">
        <div className="space-y-12">
          {paragrafos.length > 0 && (
            <section className="space-y-4">
              <h2 className="font-display text-2xl">Sobre a viagem</h2>
              {paragrafos.map((p) => (
                <p key={p.slice(0, 40)} className="text-base leading-relaxed text-ink-soft">
                  {p}
                </p>
              ))}
            </section>
          )}

          {/* Viagem realizada: galeria em destaque para próximos passageiros */}
          {realizada && fotosGaleria.length > 0 && (
            <section className="space-y-6">
              <div>
                <h2 className="font-display text-2xl">Galeria da viagem</h2>
                <p className="mt-2 text-sm text-ink-soft">
                  Fotos desta saída — referência visual para quem pretende viajar conosco.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {fotosGaleria.map((foto, i) => (
                  <figure
                    key={`${foto.src}-${i}`}
                    className={`media-zoom overflow-hidden bg-bg-deep ${
                      i === 0 && fotosGaleria.length > 1 ? 'sm:col-span-2' : ''
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={foto.src}
                      alt={foto.legenda || viagem.titulo}
                      className={`w-full object-cover ${
                        i === 0 && fotosGaleria.length > 1 ? 'aspect-[16/9]' : 'aspect-[4/3]'
                      }`}
                      loading={i === 0 ? 'eager' : 'lazy'}
                    />
                    {foto.legenda && (
                      <figcaption className="border-t border-line px-3 py-2 text-xs text-muted">
                        {foto.legenda}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          )}

          {viagem.roteiro.length > 0 && (
            <section className="space-y-6">
              <h2 className="font-display text-2xl">Roteiro</h2>
              <ol className="space-y-0 border-l border-line">
                {viagem.roteiro.map((dia) => (
                  <li key={dia.dia} className="relative pl-8 pb-8 last:pb-0">
                    <span className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-rose" />
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-rose">
                      Dia {dia.dia}
                    </p>
                    <h3 className="mt-1 font-display text-xl">{dia.titulo}</h3>
                    {dia.descricao && (
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{dia.descricao}</p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {viagem.pontosTuristicos.length > 0 && (
            <section className="space-y-6">
              <h2 className="font-display text-2xl">Pontos turísticos</h2>
              <p className="text-sm text-ink-soft">
                Atrações previstas nesta saída — o cadastro definitivo vem do sistema de gestão.
              </p>
              <ol className="grid gap-4 sm:grid-cols-2">
                {[...viagem.pontosTuristicos]
                  .sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999))
                  .map((ponto, i) => (
                    <li
                      key={`${ponto.nome}-${i}`}
                      className="rounded-lg border border-line bg-surface/80 p-4"
                    >
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-rose">
                        {ponto.ordem != null ? `Ponto ${ponto.ordem}` : `Atração ${i + 1}`}
                      </p>
                      <h3 className="mt-1 font-display text-lg text-navy">{ponto.nome}</h3>
                      {ponto.descricao && (
                        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{ponto.descricao}</p>
                      )}
                    </li>
                  ))}
              </ol>
            </section>
          )}

          {(viagem.inclui.length > 0 || viagem.naoInclui.length > 0) && (
            <section className="grid gap-8 sm:grid-cols-2">
              {viagem.inclui.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl">Inclui</h2>
                  <ul className="mt-4 space-y-2 text-sm text-ink-soft">
                    {viagem.inclui.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-ok">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {viagem.naoInclui.length > 0 && (
                <div>
                  <h2 className="font-display text-2xl">Não inclui</h2>
                  <ul className="mt-4 space-y-2 text-sm text-ink-soft">
                    {viagem.naoInclui.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="text-muted">–</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}

          {!realizada && viagem.fotos.length > 0 && (
            <section className="space-y-6">
              <h2 className="font-display text-2xl">Galeria</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {viagem.fotos.map((foto) => (
                  <figure key={foto.src} className="media-zoom overflow-hidden bg-bg-deep">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={foto.src}
                      alt={foto.legenda || viagem.titulo}
                      className="aspect-[4/3] w-full object-cover"
                      loading="lazy"
                    />
                    {foto.legenda && (
                      <figcaption className="border-t border-line px-3 py-2 text-xs text-muted">
                        {foto.legenda}
                      </figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-5 border border-line bg-surface/80 p-6 backdrop-blur-sm">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Período</p>
              <p className="mt-1 font-display text-xl">
                {formatPeriodo(viagem.dataPartida, viagem.dataRetorno)}
              </p>
              <p className="mt-1 text-sm text-ink-soft">
                {formatDate(viagem.dataPartida)} → {formatDate(viagem.dataRetorno)}
              </p>
            </div>

            {realizada ? (
              <div className="border-t border-line pt-5">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">Status</p>
                <p className="mt-1 font-display text-xl text-navy">Viagem realizada</p>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  Confira a galeria ao lado — memórias desta saída para inspirar a próxima.
                </p>
              </div>
            ) : (
              <>
                {confirmada && (
                  <div className="border-t border-line pt-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">Status</p>
                    <p className="mt-1 font-display text-xl text-navy">Viagem confirmada</p>
                    <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                      Saída confirmada — fale conosco pelo WhatsApp para reservar sua vaga.
                    </p>
                  </div>
                )}

                {!ocultarPreco && (
                  <div className="border-t border-line pt-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">A partir de</p>
                    <p className="mt-1 font-display text-3xl text-navy">
                      {formatPreco(viagem.precoAPartir)}
                    </p>
                  </div>
                )}

                {viagem.vagasRestantes != null && (
                  <div className="border-t border-line pt-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">Vagas</p>
                    <p className="mt-1 text-sm font-medium">
                      {viagem.situacao === 'ESGOTADA'
                        ? 'Turma esgotada — lista de espera'
                        : viagem.vagasRestantes === 1
                          ? '1 vaga restante'
                          : `${viagem.vagasRestantes} vagas restantes`}
                    </p>
                  </div>
                )}

                {viagem.embarque && (
                  <div className="border-t border-line pt-5">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">Embarque</p>
                    <p className="mt-1 text-sm font-medium">{viagem.embarque.local}</p>
                    {viagem.embarque.horario && (
                      <p className="text-sm text-ink-soft">{viagem.embarque.horario}</p>
                    )}
                  </div>
                )}

                {viagem.whatsappLink && (
                  <a
                    href={viagem.whatsappLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-accent w-full"
                  >
                    {viagem.situacao === 'ESGOTADA' ? 'Entrar na lista de espera' : 'Falar no WhatsApp'}
                  </a>
                )}
              </>
            )}

            <Link href="/viagens" className="block text-center text-sm text-accent hover:underline">
              ← Voltar para viagens
            </Link>
          </div>
        </aside>
      </div>
    </article>
  )
}
