import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { GaleriaFotos } from '@/components/galeria-fotos'
import { HideWaFab } from '@/components/hide-wa-fab'
import { StatusBadge } from '@/components/status-badge'
import { WhatsappButton } from '@/components/whatsapp-button'
import { BarraReserva } from '@/components/barra-reserva'
import { getAllViagemSlugs, getSite, getViagem } from '@/lib/content'
import { linkWhatsappViagem } from '@/lib/whatsapp'
import {
  chamadaPersonalizada,
  destinoLabel,
  localSeDiferenteDoTitulo,
  formatDate,
  formatPeriodo,
  formatPreco,
  listaNatural,
} from '@/lib/format'

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
    description:
      chamadaPersonalizada(viagem.chamada) ||
      viagem.descricaoCurta ||
      viagem.descricao?.slice(0, 160) ||
      undefined,
  }
}

function IconeCheck() {
  return (
    <svg className="mt-0.5 size-5 shrink-0 text-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  )
}

function IconeX() {
  return (
    <svg className="mt-0.5 size-5 shrink-0 text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
      <path d="M7 7l10 10M17 7L7 17" />
    </svg>
  )
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

  const site = await getSite()
  const linkReserva = linkWhatsappViagem(viagem, site)

  const realizada = viagem.situacao === 'REALIZADA'
  const confirmada = viagem.situacao === 'CONFIRMADA'
  const ocultarPreco = realizada || confirmada || viagem.precoAPartir == null

  const atracoes = [...viagem.pontosTuristicos].sort((a, b) => (a.ordem ?? 999) - (b.ordem ?? 999))
  const atracoesComHorario = atracoes.some((a) => a.horario)
  const temInclusos = viagem.inclui.length > 0 || viagem.naoInclui.length > 0

  const subtitulo =
    chamadaPersonalizada(viagem.chamada) ||
    (viagem.destaques && viagem.destaques.length > 0
      ? `${realizada ? 'Passamos por' : 'Você vai conhecer'} ${listaNatural(viagem.destaques)}.`
      : null)

  // Realizada: só o que está em fotos[] (espelho da galeria do LC Manager)
  const fotosGaleria = viagem.fotos

  return (
    <article>
      {realizada && (
        <>
          <HideWaFab />
          {/* Esconde o FAB já no HTML (sem flash) até o client setar body[data-hide-wa-fab] */}
          <style>{`body .wa-fab{display:none!important}`}</style>
        </>
      )}

      {!realizada && linkReserva && (
        <BarraReserva
          href={linkReserva}
          dataPartida={viagem.dataPartida}
          dataRetorno={viagem.dataRetorno}
          situacao={viagem.situacao}
          vagasRestantes={viagem.vagasRestantes}
          textoBotao={viagem.textoBotao}
        />
      )}

      <header className="relative min-h-[60svh] overflow-hidden bg-navy-deep text-white">
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
        <div className="relative container-page flex min-h-[60svh] flex-col justify-end py-12 md:py-16">
          <div className="mb-4">
            <StatusBadge situacao={viagem.situacao} tone="light" />
          </div>
          <p className="text-base font-semibold text-[#e6bf7e]">
            {[localSeDiferenteDoTitulo(viagem.titulo, viagem.destino), `${viagem.dias} ${viagem.dias === 1 ? 'dia' : 'dias'}`]
              .filter(Boolean)
              .join(', ')}
          </p>
          <h1 className="mt-2 max-w-4xl font-display text-[clamp(2rem,6vw,3.8rem)] leading-[1.04]">
            {viagem.titulo}
          </h1>
          {subtitulo && <p className="mt-4 max-w-2xl text-base text-white/90 md:text-lg">{subtitulo}</p>}
        </div>
      </header>

      <div className="container-page grid gap-12 py-14 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-16">
        <div className="min-w-0 space-y-16">
          {paragrafos.length > 0 && (
            <section aria-labelledby="sobre" className="space-y-4">
              <h2 id="sobre" className="font-display text-2xl md:text-3xl">
                {realizada ? 'Sobre o destino' : 'Sobre a viagem'}
              </h2>
              <div className="max-w-[68ch] space-y-4">
                {paragrafos.map((p) => (
                  <p key={p.slice(0, 40)} className="text-base leading-[1.75] text-ink-soft md:text-[1.0625rem]">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          )}

          {atracoes.length > 0 && (
            <section aria-labelledby="atracoes" className="space-y-6">
              <div className="space-y-2">
                <h2 id="atracoes" className="font-display text-2xl md:text-3xl">
                  {atracoesComHorario ? 'Paradas e atrações' : 'O que você vai conhecer'}
                </h2>
                <p className="max-w-[60ch] text-ink-soft">
                  {realizada
                    ? 'Os lugares que fizeram parte desta saída.'
                    : atracoesComHorario
                      ? 'A ordem e os horários previstos podem mudar conforme o trânsito e o ritmo do grupo.'
                      : 'Os principais pontos desta saída. Os horários são combinados com o grupo antes do embarque.'}
                </p>
              </div>

              {atracoesComHorario ? (
                <ol className="border-l border-line">
                  {atracoes.map((a, i) => (
                    <li key={`${a.nome}-${i}`} className="relative pb-7 pl-7 last:pb-0">
                      <span className="absolute -left-[5px] top-2 size-2.5 rounded-full bg-rose" aria-hidden />
                      <div className="flex flex-wrap items-baseline gap-x-3">
                        {a.horario && (
                          <span className="text-sm font-semibold tabular-nums text-rose-deep">{a.horario}</span>
                        )}
                        <h3 className="font-display text-lg text-navy">{a.nome}</h3>
                      </div>
                      {a.descricao && (
                        <p className="mt-1 max-w-[60ch] text-sm leading-relaxed text-ink-soft">{a.descricao}</p>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
                  {atracoes.map((a, i) => (
                    <li key={`${a.nome}-${i}`} className="border-t-2 border-navy pt-4">
                      <h3 className="font-display text-lg leading-snug text-navy">{a.nome}</h3>
                      {a.descricao && (
                        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{a.descricao}</p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}

          {temInclusos && (
            <section aria-labelledby="incluso" className="space-y-6">
              <h2 id="incluso" className="font-display text-2xl md:text-3xl">
                O que está incluso
              </h2>
              <div className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
                {viagem.inclui.length > 0 && (
                  <div className="bg-surface p-6">
                    <h3 className="font-display text-lg text-navy">Está incluso</h3>
                    <ul className="mt-4 space-y-3 text-[0.9375rem] leading-snug text-ink">
                      {viagem.inclui.map((item) => (
                        <li key={item} className="flex gap-3">
                          <IconeCheck />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {viagem.naoInclui.length > 0 && (
                  <div className="bg-cream-deep/50 p-6">
                    <h3 className="font-display text-lg text-navy">Fica por sua conta</h3>
                    <ul className="mt-4 space-y-3 text-[0.9375rem] leading-snug text-ink-soft">
                      {viagem.naoInclui.map((item) => (
                        <li key={item} className="flex gap-3">
                          <IconeX />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {!realizada && linkReserva && (
                <p className="text-sm text-ink-soft">
                  Ficou com dúvida sobre algum item?{' '}
                  <a
                    href={linkReserva}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-rose-deep underline underline-offset-2"
                  >
                    Pergunte pelo WhatsApp
                  </a>
                  .
                </p>
              )}
            </section>
          )}

          {viagem.roteiro.length > 0 && (
            <section aria-labelledby="roteiro" className="space-y-6">
              <h2 id="roteiro" className="font-display text-2xl md:text-3xl">
                Roteiro dia a dia
              </h2>
              <ol className="border-l border-line">
                {viagem.roteiro.map((dia) => (
                  <li key={dia.dia} className="relative pb-8 pl-8 last:pb-0">
                    <span className="absolute -left-[5px] top-2 size-2.5 rounded-full bg-rose" aria-hidden />
                    <p className="text-sm font-semibold text-rose-deep">Dia {dia.dia}</p>
                    <h3 className="mt-1 font-display text-xl">{dia.titulo}</h3>
                    {dia.descricao && (
                      <p className="mt-2 max-w-[60ch] text-sm leading-relaxed text-ink-soft">{dia.descricao}</p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {fotosGaleria.length > 0 && (
            <section aria-labelledby="fotos" className="space-y-6">
              <div className="space-y-2">
                <h2 id="fotos" className="font-display text-2xl md:text-3xl">
                  {realizada ? 'Fotos desta saída' : 'Fotos'}
                </h2>
                {realizada && (
                  <p className="text-ink-soft">
                    Clique em uma foto para ampliar. É assim que costuma ser a viagem com a gente.
                  </p>
                )}
              </div>
              <GaleriaFotos fotos={fotosGaleria} titulo={viagem.titulo} />
            </section>
          )}
        </div>

        <aside className="lg:sticky lg:top-28 lg:self-start" aria-label="Resumo da viagem">
          <div className="ticket">
            <div className="space-y-5 p-6">
              <div>
                <p className="text-sm text-muted">Data</p>
                <p className="mt-1 font-display text-2xl tabular-nums">
                  {formatPeriodo(viagem.dataPartida, viagem.dataRetorno)}
                </p>
                {viagem.dataPartida !== viagem.dataRetorno && (
                  <p className="mt-1 text-sm tabular-nums text-ink-soft">
                    {formatDate(viagem.dataPartida)} a {formatDate(viagem.dataRetorno)}
                  </p>
                )}
              </div>

              <div>
                <p className="text-sm text-muted">Destino</p>
                <p className="mt-1 font-semibold">{destinoLabel(viagem.destino)}</p>
              </div>

              {realizada ? (
                <div>
                  <p className="text-sm text-muted">Situação</p>
                  <p className="mt-1 font-semibold">Viagem realizada</p>
                </div>
              ) : (
                <>
                  {confirmada && (
                    <div>
                      <p className="text-sm text-muted">Situação</p>
                      <p className="mt-1 font-semibold">Saída confirmada</p>
                    </div>
                  )}
                  {!ocultarPreco && (
                    <div>
                      <p className="text-sm text-muted">A partir de</p>
                      <p className="mt-1 font-display text-3xl tabular-nums text-navy">
                        {formatPreco(viagem.precoAPartir)}
                      </p>
                    </div>
                  )}
                  {viagem.vagasRestantes != null && (
                    <div>
                      <p className="text-sm text-muted">Vagas</p>
                      <p className="mt-1 font-semibold">
                        {viagem.situacao === 'ESGOTADA'
                          ? 'Esgotada. Entre na lista de espera.'
                          : viagem.vagasRestantes === 1
                            ? '1 vaga restante'
                            : `${viagem.vagasRestantes} vagas restantes`}
                      </p>
                    </div>
                  )}
                  {viagem.embarque && (
                    <div>
                      <p className="text-sm text-muted">Embarque</p>
                      <p className="mt-1 font-semibold">{viagem.embarque.local}</p>
                      {viagem.embarque.horario && (
                        <p className="text-sm tabular-nums text-ink-soft">{viagem.embarque.horario}</p>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="ticket-cut" aria-hidden />

            <div className="space-y-3 p-6">
              {realizada ? (
                <>
                  <p className="text-sm leading-relaxed text-ink-soft">
                    Quer fazer um passeio assim? Veja as próximas saídas.
                  </p>
                  <Link href="/viagens" className="btn btn-primary w-full">
                    Ver próximas viagens
                  </Link>
                </>
              ) : (
                <>
                  {linkReserva && (
                    <WhatsappButton href={linkReserva} size="lg" full>
                      {viagem.situacao === 'ESGOTADA' ? 'Entrar na lista de espera' : 'Reservar pelo WhatsApp'}
                    </WhatsappButton>
                  )}
                  <p className="text-center text-sm text-muted">Sem pagamento no site. A reserva é com a equipe.</p>
                </>
              )}
            </div>
          </div>

          <Link
            href="/viagens"
            className="mt-4 inline-block text-sm font-semibold text-navy underline underline-offset-4 decoration-navy/30 hover:decoration-navy"
          >
            Voltar para viagens
          </Link>
        </aside>
      </div>
    </article>
  )
}
