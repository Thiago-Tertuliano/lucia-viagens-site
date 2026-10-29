import Link from 'next/link'
import { TripCard } from '@/components/trip-card'
import { SectionHeading } from '@/components/section-heading'
import { getSite, getViagens, viagensAtivas, viagensRealizadas } from '@/lib/content'

const HERO_IMAGE =
  'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=2000&q=80'

export default async function HomePage() {
  const [site, todas] = await Promise.all([getSite(), getViagens()])
  const proximas = viagensAtivas(todas).slice(0, 3)
  const realizadas = viagensRealizadas(todas).slice(0, 3)
  const destaque = proximas[0]
  const heroImage = destaque?.capa?.src || HERO_IMAGE

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
        <div className="absolute inset-0 bg-gradient-to-t from-[#12263a]/85 via-[#12263a]/40 to-[#12263a]/30" />

        <div className="relative container-page flex min-h-[72svh] flex-col justify-end py-16 md:min-h-[78svh] md:py-20">
          <div className="max-w-2xl space-y-5">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d4a456]">
              {site.nome}
            </p>
            <h1 className="font-display text-[clamp(2.2rem,4.6vw,3.55rem)] font-bold leading-[1.06] tracking-tight text-white">
              Roteiros claros. Agenda atualizada. Atendimento direto.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-white/90 md:text-lg">
              Consulte saídas, itinerários dia a dia e galerias das viagens realizadas.
              Interesse e reserva pelo WhatsApp — sem checkout no site.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link href="/viagens" className="btn btn-light">
                Ver agenda de viagens
              </Link>
              <Link href="/guia" className="btn btn-ghost border-cream/40 text-cream">
                Como funciona
              </Link>
              {site.contato.whatsappLink && (
                <a
                  href={site.contato.whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-accent"
                >
                  Falar no WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-page">
          <SectionHeading
            eyebrow="Agenda"
            title="Próximas viagens"
            description="Saídas abertas e confirmadas. Conteúdo sincronizado com o sistema de gestão."
          />
          {proximas.length === 0 ? (
            <p className="text-ink-soft">Nenhuma viagem publicada no momento.</p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {proximas.map((v) => (
                <TripCard key={v.slug} viagem={v} />
              ))}
            </div>
          )}
          <div className="mt-10 flex flex-wrap gap-3">
            <Link href="/viagens" className="btn btn-primary">
              Ver todas
            </Link>
            <Link href="/guia" className="btn border border-line bg-surface">
              Guia do passageiro
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface section-pad">
        <div className="container-page grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Empresa"
              title={site.sobre.titulo || 'Quem somos'}
              description={
                site.sobre.texto?.split(/\n\s*\n/)[0] ||
                'Excursões com acompanhamento completo e comunicação clara com cada passageiro.'
              }
            />
            <Link href="/sobre" className="btn btn-primary">
              Sobre a Lu&Cia
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
              <div className="flex aspect-[4/3] items-center justify-center bg-cream-deep text-muted">
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
              eyebrow="Galeria"
              title="Viagens realizadas"
              description="Memórias das saídas que já aconteceram — explore também no mapa 3D."
            />
            <div className="grid gap-4 sm:grid-cols-3">
              {realizadas.map((v) => (
                <Link
                  key={v.slug}
                  href={`/viagens/${v.slug}`}
                  className="media-zoom group relative aspect-[4/5] overflow-hidden bg-bg-deep"
                >
                  {v.capa && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={v.capa.src}
                      alt={v.titulo}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/75 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-cream">
                    <p className="font-display text-lg leading-snug">{v.titulo}</p>
                    <p className="mt-1 text-xs text-cream/70">{v.destino.nome}</p>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-10">
              <Link href="/galeria" className="btn btn-primary">
                Ver galeria e mapa
              </Link>
            </div>
          </div>
        </section>
      )}
    </>
  )
}
