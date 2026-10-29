import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionHeading } from '@/components/section-heading'
import { MapaGaleria, type DestinoMapa } from '@/components/mapa-galeria'
import { getViagem, getViagens, viagensRealizadas } from '@/lib/content'
import { coordsDestino } from '@/lib/coords'
import { formatPeriodo } from '@/lib/format'

export const metadata: Metadata = {
  title: 'Galeria',
  description: 'Mapa 3D e fotos das viagens realizadas pela Lu&Cia.',
}

export default async function GaleriaPage() {
  const realizadas = viagensRealizadas(await getViagens())
  const detalhes = await Promise.all(
    realizadas.map(async (v) => ({
      resumo: v,
      full: await getViagem(v.slug),
    })),
  )

  const destinos: DestinoMapa[] = realizadas
    .map((v) => {
      const coords = coordsDestino(v.destino.cidade || v.destino.nome, v.destino.uf)
      if (!coords) return null
      const [lat, lng] = coords
      return {
        slug: v.slug,
        titulo: v.titulo,
        chamada: v.chamada,
        capa: v.capa?.src ?? null,
        destino: v.destino,
        dataPartida: v.dataPartida,
        dataRetorno: v.dataRetorno,
        lat,
        lng,
      } satisfies DestinoMapa
    })
    .filter((d): d is DestinoMapa => d !== null)

  return (
    <>
      <div className="container-page section-pad pb-6 md:pb-8">
        <SectionHeading
          eyebrow="Memórias"
          title="Galeria de viagens realizadas"
          description="Clique em um estado para aproximar e ver as viagens realizadas."
        />
      </div>

      <MapaGaleria destinos={destinos} />

      <div className="container-page section-pad pt-10 md:pt-14">
        {detalhes.length === 0 ? (
          <p className="text-ink-soft">Ainda não há viagens realizadas publicadas.</p>
        ) : (
          <div className="space-y-16">
            {detalhes.map(({ resumo, full }) => {
              const fotos = full?.fotos?.length ? full.fotos : resumo.capa ? [resumo.capa] : []
              return (
                <section id={`galeria-${resumo.slug}`} key={resumo.slug} className="scroll-mt-28 space-y-5">
                  <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                        {formatPeriodo(resumo.dataPartida, resumo.dataRetorno)} · {resumo.destino.nome}
                      </p>
                      <h2 className="mt-1 font-display text-2xl md:text-3xl">
                        <Link href={`/viagens/${resumo.slug}`} className="hover:text-rose">
                          {resumo.titulo}
                        </Link>
                      </h2>
                    </div>
                    <Link
                      href={`/viagens/${resumo.slug}`}
                      className="text-sm font-semibold text-rose hover:underline"
                    >
                      Ver página →
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                    {fotos.map((foto, i) => (
                      <figure
                        key={`${foto.src}-${i}`}
                        className={`media-zoom overflow-hidden bg-bg-deep ${
                          i === 0 ? 'col-span-2 row-span-2 aspect-square md:aspect-auto md:min-h-[320px]' : 'aspect-square'
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={foto.src}
                          alt={foto.legenda || resumo.titulo}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </figure>
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
