import Link from 'next/link'
import { TripCard } from '@/components/trip-card'
import { StatusBadge } from '@/components/status-badge'
import { WhatsappButton } from '@/components/whatsapp-button'
import { SectionHeading } from '@/components/section-heading'
import { getSite, getViagem, getViagens, viagensAtivas, viagensRealizadas } from '@/lib/content'
import { destinoLabel, formatDate as formatData, formatPeriodo, resumirPorFrases } from '@/lib/format'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80'

export default async function HomePage() {
  const [site, todas] = await Promise.all([getSite(), getViagens()])
  const proximas = viagensAtivas(todas)
  const realizadas = viagensRealizadas(todas).slice(0, 3)
  const destaque = proximas[0]
  const demais = proximas.slice(1, 4)
  const heroImage = destaque?.capa?.src || HERO_IMAGE
  const destaqueFull = destaque ? await getViagem(destaque.slug) : null
  const primeiroParagrafo = resumirPorFrases(destaqueFull?.descricao?.split(/\n\s*\n/)[0])

  return (
    <>
      <section className="relative overflow-hidden bg-navy text-cream">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={heroImage}
          alt={destaque?.capa?.legenda || 'Viagens Lu&Cia'}
          className="absolute inset-0 h-full w-full object-cover"
          fetchPriority="high"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#12263a]/90 via-[#12263a]/50 to-[#12263a]/25" />

        <div className="relative container-page flex min-h-[72svh] flex-col justify-end py-16 md:min-h-[78svh] md:py-20">
          <div className="max-w-2xl space-y-5">
            <h1 className="font-display text-[clamp(2.2rem,4.6vw,3.55rem)] font-bold leading-[1.06] text-white">
              Roteiros claros. Agenda atualizada. Atendimento direto.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-white/90 md:text-lg">
              Veja as próximas saídas, o que está incluso e o que você vai conhecer em cada
              passeio. Para reservar, fale com a gente pelo WhatsApp.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/viagens" className="btn btn-light">
                Ver agenda de viagens
              </Link>
              <Link href="/guia" className="btn btn-ghost border-cream/40 text-cream">
                Como reservar
              </Link>
              {site.contato.whatsappLink && <WhatsappButton href={site.contato.whatsappLink} />}
            </div>
          </div>
        </div>
      </section>

      {destaque && (
        <section className="section-pad" aria-labelledby="proxima-saida">
          <div className="container-page grid items-start gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
            <div className="space-y-6">
              <div className="space-y-3">
                <p className="text-sm font-semibold text-rose-deep">Próxima saída</p>
                <h2 id="proxima-saida" className="font-display text-3xl leading-tight text-ink md:text-5xl">
                  {destaque.titulo}
                </h2>
                <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-ink-soft">
                  <span className="font-semibold tabular-nums text-ink">
                    {formatPeriodo(destaque.dataPartida, destaque.dataRetorno)}
                  </span>
                  <span>{destinoLabel(destaque.destino)}</span>
                  <StatusBadge situacao={destaque.situacao} />
                </p>
              </div>

              {primeiroParagrafo && (
                <p className="max-w-[60ch] text-[1.0625rem] leading-[1.75] text-ink-soft">
                  {primeiroParagrafo}
                </p>
              )}

              <div className="flex flex-wrap gap-3 pt-1">
                <Link href={`/viagens/${destaque.slug}`} className="btn btn-primary">
                  Ver detalhes da viagem
                </Link>
                {destaqueFull?.whatsappLink && (
                  <WhatsappButton href={destaqueFull.whatsappLink}>Reservar pelo WhatsApp</WhatsappButton>
                )}
              </div>
            </div>

            {destaqueFull && (destaqueFull.pontosTuristicos.length > 0 || destaqueFull.inclui.length > 0) && (
              <div className="ticket">
                {destaqueFull.pontosTuristicos.length > 0 && (
                  <div className="p-6">
                    <h3 className="font-display text-lg text-navy">O que você vai conhecer</h3>
                    <ul className="mt-3 space-y-2 text-[0.9375rem] text-ink">
                      {destaqueFull.pontosTuristicos.slice(0, 4).map((p) => (
                        <li key={p.nome} className="flex gap-3">
                          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-rose" aria-hidden />
                          <span>{p.nome}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {destaqueFull.pontosTuristicos.length > 0 && destaqueFull.inclui.length > 0 && (
                  <div className="ticket-cut" aria-hidden />
                )}
                {destaqueFull.inclui.length > 0 && (
                  <div className="p-6">
                    <h3 className="font-display text-lg text-navy">Está incluso</h3>
                    <ul className="mt-3 space-y-2 text-[0.9375rem] text-ink-soft">
                      {destaqueFull.inclui.slice(0, 3).map((item) => (
                        <li key={item} className="flex gap-3">
                          <svg className="mt-0.5 size-5 shrink-0 text-ok" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
                            <path d="M5 12.5l4.5 4.5L19 7.5" />
                          </svg>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {demais.length > 0 && (
        <section className="section-pad border-t border-line pt-12 md:pt-16" aria-labelledby="mais-saidas">
          <div className="container-page">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 id="mais-saidas" className="font-display text-2xl md:text-3xl">
                Outras saídas na agenda
              </h2>
              <Link href="/viagens" className="text-sm font-semibold text-navy underline underline-offset-4 decoration-navy/30 hover:decoration-navy">
                Ver todas as viagens
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {demais.map((v) => (
                <TripCard key={v.slug} viagem={v} />
              ))}
            </div>
          </div>
        </section>
      )}

      {proximas.length === 0 && (
        <section className="section-pad">
          <div className="container-page">
            <p className="text-ink-soft">
              Nenhuma viagem publicada no momento. Fale com a gente pelo WhatsApp para saber as próximas datas.
            </p>
          </div>
        </section>
      )}

      <section className="border-y border-line bg-surface section-pad">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              title={site.sobre.titulo || 'Quem somos'}
              description={
                site.sobre.texto?.split(/\n\s*\n/)[0] ||
                'Excursões com acompanhamento completo e comunicação clara com cada passageiro.'
              }
            />
            <Link href="/sobre" className="btn btn-primary">
              Conheça a Lu&Cia
            </Link>
          </div>
          <div className="overflow-hidden border border-line">
            {site.sobre.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={site.sobre.foto}
                alt={site.sobre.titulo || site.nome}
                className="aspect-[4/3] w-full object-cover"
              />
            ) : (
              <div className="flex aspect-[4/3] items-center justify-center bg-cream-deep font-display text-xl text-navy/40">
                Lu&Cia Viagens
              </div>
            )}
          </div>
        </div>
      </section>

      {realizadas.length > 0 && (
        <section className="section-pad">
          <div className="container-page">
            <SectionHeading
              title="Quem já viajou com a gente"
              description="Fotos das últimas saídas. Veja também no mapa em 3D por onde já passamos."
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {realizadas.map((v) => (
                <Link
                  key={v.slug}
                  href={`/viagens/${v.slug}`}
                  className="media-zoom group relative aspect-[4/5] overflow-hidden bg-cream-deep"
                >
                  {v.capa && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={v.capa.src}
                      alt=""
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-deep/85 via-navy-deep/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-cream">
                    <p className="font-display text-xl leading-snug">{v.titulo}</p>
                    <p className="mt-1 text-sm tabular-nums text-cream/80">
                      {formatData(v.dataPartida)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-10">
              <Link href="/galeria" className="btn btn-primary">
                Abrir galeria e mapa
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
