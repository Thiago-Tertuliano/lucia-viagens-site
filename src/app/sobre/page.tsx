import type { Metadata } from 'next'
import { SectionHeading } from '@/components/section-heading'
import { getSite } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Sobre',
  description: 'Conheça a Lu&Cia Viagens — excursões com acompanhamento completo.',
}

export default async function SobrePage() {
  const site = await getSite()
  const paragrafos = (site.sobre.texto || '')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className="section-pad">
      <div className="container-page grid items-start gap-12 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <SectionHeading
            eyebrow="Empresa"
            title={site.sobre.titulo || 'Quem somos'}
            description={site.slogan || undefined}
          />
          <div className="space-y-4">
            {paragrafos.map((p) => (
              <p key={p.slice(0, 48)} className="text-base leading-relaxed text-ink-soft md:text-lg">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-12 grid gap-6 border-t border-line pt-10 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Contato</p>
              <div className="mt-3 space-y-2 text-sm text-ink-soft">
                {site.contato.telefone && <p>{site.contato.telefone}</p>}
                {site.contato.email && (
                  <a href={`mailto:${site.contato.email}`} className="block hover:text-accent">
                    {site.contato.email}
                  </a>
                )}
                {site.contato.endereco && <p>{site.contato.endereco}</p>}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">Redes</p>
              <div className="mt-3 space-y-2 text-sm">
                {site.contato.instagram && (
                  <a href={site.contato.instagram} target="_blank" rel="noopener noreferrer" className="block text-accent hover:underline">
                    Instagram
                  </a>
                )}
                {site.contato.facebook && (
                  <a href={site.contato.facebook} target="_blank" rel="noopener noreferrer" className="block text-accent hover:underline">
                    Facebook
                  </a>
                )}
                {site.contato.whatsappLink && (
                  <a href={site.contato.whatsappLink} target="_blank" rel="noopener noreferrer" className="btn btn-primary mt-4">
                    Falar no WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>

        </div>

        <div className="overflow-hidden border border-line bg-bg-deep">
          {site.sobre.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={site.sobre.foto}
              alt={site.sobre.titulo || site.nome}
              className="aspect-[4/5] w-full object-cover"
            />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center font-display text-3xl text-muted">
              {site.nome}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
