import type { Metadata } from 'next'
import Link from 'next/link'
import { MapaGaleria, type DestinoMapa } from '@/components/mapa-galeria'
import { SectionHeading } from '@/components/section-heading'
import { getViagem, getViagens, viagensRealizadas } from '@/lib/content'
import { coordsDestino } from '@/lib/coords'
import { formatDate, localSeDiferenteDoTitulo } from '@/lib/format'
import type { Foto, ViagemResumo } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Galeria',
  description: 'Mapa 3D e fotos das viagens realizadas pela Lu&Cia. Escolha uma viagem para ver todas as fotos.',
}

function legendaLocal(resumo: ViagemResumo) {
  return localSeDiferenteDoTitulo(resumo.titulo, resumo.destino) ?? ''
}

type Item = { resumo: ViagemResumo; capa: Foto | null; totalFotos: number }

export default async function GaleriaPage() {
  const realizadas = viagensRealizadas(await getViagens())

  const itens: Item[] = await Promise.all(
    realizadas.map(async (resumo) => {
      const full = await getViagem(resumo.slug)
      const fotos = full?.fotos ?? []
      return { resumo, capa: resumo.capa ?? fotos[0] ?? null, totalFotos: fotos.length }
    }),
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

  // Agrupa por ano (viagensRealizadas já vem da mais recente para a mais antiga)
  const porAno = new Map<string, Item[]>()
  for (const item of itens) {
    const ano = item.resumo.dataPartida.slice(0, 4)
    porAno.set(ano, [...(porAno.get(ano) ?? []), item])
  }

  return (
    <>
      <div className="container-page section-pad pb-6 md:pb-8">
        <SectionHeading
          title="Galeria de viagens realizadas"
          description="Escolha uma viagem para ver o roteiro e as fotos. Lá embaixo, o mapa mostra por onde já passamos."
        />
      </div>

      <div className="container-page pb-16 md:pb-24">
        {itens.length === 0 ? (
          <p className="text-ink-soft">Ainda não há viagens realizadas publicadas.</p>
        ) : (
          <div className="space-y-14">
            {[...porAno.entries()].map(([ano, lista]) => (
              <section key={ano} aria-labelledby={`ano-${ano}`} className="space-y-6">
                <h2 id={`ano-${ano}`} className="font-display text-3xl tabular-nums text-navy">
                  {ano}
                </h2>
                <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {lista.map(({ resumo, capa, totalFotos }) => (
                    <li key={resumo.slug} id={`galeria-${resumo.slug}`} className="scroll-mt-28">
                      <Link
                        href={`/viagens/${resumo.slug}`}
                        className="media-zoom group relative block aspect-[4/5] overflow-hidden bg-cream-deep"
                      >
                        {capa ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={capa.src}
                            alt=""
                            className="absolute inset-0 size-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center px-6 text-center font-display text-xl text-navy/30">
                            {resumo.destino.cidade || resumo.destino.nome}
                          </span>
                        )}
                        <span
                          className="absolute inset-0 bg-gradient-to-t from-navy-deep/90 via-navy-deep/20 to-transparent"
                          aria-hidden
                        />
                        <span className="absolute inset-x-0 bottom-0 block p-5 text-cream">
                          <span className="block font-display text-xl leading-snug">{resumo.titulo}</span>
                          <span className="mt-1 block text-sm tabular-nums text-cream/85">
                            {formatDate(resumo.dataPartida)}
                            {legendaLocal(resumo) ? `, ${legendaLocal(resumo)}` : ''}
                          </span>
                          <span className="mt-3 inline-block text-sm font-semibold underline underline-offset-4 decoration-cream/50 group-hover:decoration-cream">
                            {totalFotos > 0
                              ? `Ver ${totalFotos} ${totalFotos === 1 ? 'foto' : 'fotos'}`
                              : 'Ver a viagem'}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>

      {destinos.length > 0 && (
        <section className="border-t border-line bg-cream">
          <div className="container-page pb-6 pt-14 md:pt-20">
            <SectionHeading
              title="Por onde já passamos"
              description="Gire o mapa e toque em um estado para ver as viagens que fizemos por lá."
            />
          </div>
          <MapaGaleria destinos={destinos} />
        </section>
      )}
    </>
  )
}
