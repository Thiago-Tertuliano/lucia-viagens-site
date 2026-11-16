import type { Metadata } from 'next'
import Link from 'next/link'
import { WhatsappButton } from '@/components/whatsapp-button'
import { CAPITULOS, PESSOAS, type Pessoa } from '@/content/sobre'
import { getSite, getViagens, viagensAtivas, viagensRealizadas } from '@/lib/content'
import { formatDate } from '@/lib/format'
import type { ViagemResumo } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Sobre',
  description:
    'Conheça a Lu&Cia Viagens: quem está por trás de cada saída e a nossa história, de uma excursão para outra.',
}

const EM_DESENVOLVIMENTO = process.env.NODE_ENV !== 'production'

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

function AvisoRascunho() {
  return (
    <span className="inline-block rounded-sm bg-gold/25 px-2 py-0.5 text-xs font-semibold text-navy">
      Texto a preencher (só aparece no seu computador)
    </span>
  )
}

function CartaoPessoa({ pessoa }: { pessoa: Pessoa }) {
  return (
    <article className="flex gap-5 sm:flex-col">
      <div className="size-24 shrink-0 overflow-hidden rounded-full bg-cream-deep sm:size-40">
        {pessoa.foto ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={pessoa.foto} alt={pessoa.nome} className="size-full object-cover" />
        ) : (
          <div
            className="flex size-full items-center justify-center font-display text-3xl text-navy/40 sm:text-5xl"
            aria-hidden
          >
            {iniciais(pessoa.nome)}
          </div>
        )}
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-2xl text-navy">{pessoa.nome}</h3>
        <p className="text-sm font-semibold text-rose-deep">{pessoa.cargo}</p>
        <p className="max-w-[44ch] leading-relaxed text-ink-soft">{pessoa.bio}</p>
        {pessoa.rascunho && EM_DESENVOLVIMENTO && <AvisoRascunho />}
      </div>
    </article>
  )
}

function ListaViagens({ viagens }: { viagens: ViagemResumo[] }) {
  if (viagens.length === 0) return null
  return (
    <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      {viagens.map((v) => (
        <li key={v.slug}>
          <Link
            href={`/viagens/${v.slug}`}
            className="group flex items-center gap-3 border border-line bg-surface p-2 pr-4 transition-colors duration-150 hover:border-accent/60"
          >
            <span className="size-14 shrink-0 overflow-hidden bg-cream-deep">
              {v.capa && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.capa.src} alt="" className="size-full object-cover" loading="lazy" />
              )}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold text-ink group-hover:text-rose-deep">
                {v.titulo}
              </span>
              <span className="block text-sm tabular-nums text-muted">{formatDate(v.dataPartida)}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default async function SobrePage() {
  const [site, todas] = await Promise.all([getSite(), getViagens()])
  const realizadas = viagensRealizadas(todas)
  const proximas = viagensAtivas(todas)

  const paragrafos = (site.sobre.texto || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  const primeiroAno = realizadas.length
    ? realizadas.reduce((min, v) => (v.dataPartida < min ? v.dataPartida : min), realizadas[0].dataPartida).slice(0, 4)
    : null

  const pessoas = PESSOAS.filter((p) => !p.rascunho || EM_DESENVOLVIMENTO)
  const capitulos = CAPITULOS.filter((c) => !c.rascunho || EM_DESENVOLVIMENTO)
  const capasTrio = realizadas.filter((v) => v.capa).slice(0, 3)

  return (
    <>
      <section className="section-pad pb-10 md:pb-14">
        <div className="container-page grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="space-y-6">
            <h1 className="font-display text-4xl leading-[1.08] text-navy md:text-6xl">
              {site.sobre.titulo || 'Quem somos'}
            </h1>
            <div className="max-w-[56ch] space-y-4">
              {paragrafos.map((p) => (
                <p key={p.slice(0, 48)} className="text-lg leading-[1.7] text-ink-soft">
                  {p}
                </p>
              ))}
            </div>

            <dl className="grid grid-cols-3 gap-6 border-t border-line pt-8">
              {primeiroAno && (
                <div>
                  <dt className="text-sm text-muted">Primeira saída registrada</dt>
                  <dd className="mt-1 font-display text-3xl tabular-nums text-navy">{primeiroAno}</dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-muted">Saídas realizadas</dt>
                <dd className="mt-1 font-display text-3xl tabular-nums text-navy">{realizadas.length}</dd>
              </div>
              <div>
                <dt className="text-sm text-muted">Na agenda agora</dt>
                <dd className="mt-1 font-display text-3xl tabular-nums text-navy">{proximas.length}</dd>
              </div>
            </dl>
          </div>

          {capasTrio.length >= 2 && (
            <div className="grid grid-cols-2 gap-3">
              {capasTrio.map((v, i) => (
                <Link
                  key={v.slug}
                  href={`/viagens/${v.slug}`}
                  className={`media-zoom relative block overflow-hidden bg-cream-deep ${
                    i === 0 ? 'col-span-2 aspect-[16/10]' : 'aspect-square'
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={v.capa!.src} alt={v.titulo} className="size-full object-cover" loading="lazy" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {pessoas.length > 0 && (
        <section className="border-y border-line bg-surface section-pad" aria-labelledby="equipe">
          <div className="container-page grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div className="space-y-3">
              <h2 id="equipe" className="font-display text-3xl text-navy md:text-4xl">
                Quem cuida da sua viagem
              </h2>
              <p className="max-w-[40ch] leading-relaxed text-ink-soft">
                Quando você fala com a Lu&Cia, fala com quem organiza a saída de ponta a ponta.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-10 sm:grid-cols-2">
              {pessoas.map((p) => (
                <CartaoPessoa key={p.nome} pessoa={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-pad" aria-labelledby="historia">
        <div className="container-page">
          <div className="mb-12 max-w-2xl space-y-3">
            <h2 id="historia" className="font-display text-3xl text-navy md:text-4xl">
              Nossa história, de saída em saída
            </h2>
            <p className="leading-relaxed text-ink-soft md:text-lg">
              Cada capítulo abaixo tem as viagens daquele período. Clique em uma para ver o roteiro e as fotos.
            </p>
          </div>

          <ol className="border-l-2 border-line">
            {capitulos.map((c) => {
              const viagens =
                c.chave === 'proximas'
                  ? proximas.slice(0, 4)
                  : realizadas.filter((v) => v.dataPartida.startsWith(c.chave)).reverse()
              const hoje = c.chave === 'proximas'
              return (
                <li key={c.chave} className="relative pb-14 pl-8 last:pb-0 md:pl-12">
                  <span
                    className={`absolute -left-[9px] top-2 size-4 rounded-full border-2 border-cream ${
                      hoje ? 'bg-rose-deep' : 'bg-navy'
                    }`}
                    aria-hidden
                  />
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[150px_minmax(0,1fr)] md:gap-10">
                    <p
                      className={`font-display tabular-nums text-navy ${
                        /^\d{4}$/.test(c.rotulo) ? 'text-4xl md:text-5xl' : 'text-3xl md:text-4xl'
                      }`}
                    >
                      {c.rotulo}
                    </p>
                    <div>
                      <h3 className="font-display text-2xl text-ink">{c.titulo}</h3>
                      <div className="mt-3 max-w-[62ch] space-y-3">
                        {c.texto.map((t) => (
                          <p key={t.slice(0, 40)} className="leading-[1.75] text-ink-soft">
                            {t}
                          </p>
                        ))}
                      </div>
                      {c.rascunho && EM_DESENVOLVIMENTO && (
                        <p className="mt-3">
                          <AvisoRascunho />
                        </p>
                      )}
                      <ListaViagens viagens={viagens} />
                    </div>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>
      </section>

      <section className="bg-navy text-cream section-pad">
        <div className="container-page flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <h2 className="font-display text-3xl md:text-4xl">Vamos planejar a próxima saída juntos?</h2>
            <p className="leading-relaxed text-cream/80">
              Veja a agenda ou mande uma mensagem. A reserva é uma conversa direta com a nossa equipe.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/viagens" className="btn btn-light">
              Ver agenda de viagens
            </Link>
            {site.contato.whatsappLink && (
              <WhatsappButton href={site.contato.whatsappLink} />
            )}
            {site.contato.instagram && (
              <a
                href={site.contato.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost border-cream/40 text-cream"
              >
                Instagram
              </a>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
