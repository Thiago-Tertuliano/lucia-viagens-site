import Link from 'next/link'
import { BrandLogo } from '@/components/brand-logo'
import type { Site } from '@/lib/types'

export function SiteFooter({ site }: { site: Site }) {
  const year = new Date().getFullYear()
  return (
    <footer className="border-t border-[#e8d9c8] bg-[#1c3a59] text-[#fdf2e7]">
      <div className="mx-auto grid w-[min(1120px,calc(100%-2rem))] gap-10 py-12 md:grid-cols-[1.3fr_1fr_1fr]">
        <div className="space-y-4">
          <div className="inline-flex rounded-lg p-2" style={{ backgroundColor: '#fdf2e7' }}>
            <BrandLogo size="footer" href={null} />
          </div>
          {site.slogan && <p className="max-w-sm text-sm leading-relaxed text-[#fdf2e7]/70">{site.slogan}</p>}
          <p className="max-w-sm text-xs leading-relaxed text-[#fdf2e7]/45">
            Site informativo — intereste e reserva pelo WhatsApp.
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d4a456]">Explorar</p>
          <div className="flex flex-col gap-2 text-sm">
            <Link href="/viagens" className="hover:text-[#d48995]">Viagens</Link>
            <Link href="/galeria" className="hover:text-[#d48995]">Galeria</Link>
            <Link href="/guia" className="hover:text-[#d48995]">Guia</Link>
            <Link href="/sobre" className="hover:text-[#d48995]">Sobre</Link>
          </div>
        </div>

        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#d4a456]">Contato</p>
          <div className="flex flex-col gap-2 text-sm text-[#fdf2e7]/80">
            {site.contato.whatsappLink && (
              <a href={site.contato.whatsappLink} target="_blank" rel="noopener noreferrer" className="hover:text-[#d48995]">
                WhatsApp
              </a>
            )}
            {site.contato.telefone && <span>{site.contato.telefone}</span>}
            {site.contato.email && (
              <a href={`mailto:${site.contato.email}`} className="hover:text-[#d48995]">
                {site.contato.email}
              </a>
            )}
            {site.contato.endereco && <span className="text-[#fdf2e7]/50">{site.contato.endereco}</span>}
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex w-[min(1120px,calc(100%-2rem))] flex-col gap-2 py-5 text-xs text-[#fdf2e7]/40 sm:flex-row sm:justify-between">
          <p>© {year} {site.nome}</p>
          <p>
            Tecnologia{' '}
            <a href="https://axellion.com.br" target="_blank" rel="noopener noreferrer" className="hover:text-[#d4a456]">
              Axellion
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
