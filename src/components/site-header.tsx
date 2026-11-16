'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BrandLogo } from '@/components/brand-logo'
import { WhatsappButton, WhatsappIcon } from '@/components/whatsapp-button'

const LINKS = [
  { href: '/viagens', label: 'Viagens' },
  { href: '/galeria', label: 'Galeria' },
  { href: '/guia', label: 'Guia' },
  { href: '/sobre', label: 'Sobre' },
]

export function SiteHeader({ whatsappLink }: { whatsappLink: string | null }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <header
      className="sticky top-0 z-50 border-b border-[#e8d9c8] text-[#1c3a59]"
      style={{ backgroundColor: '#fdf2e7' }}
    >
      <div className="mx-auto flex h-24 w-[min(1120px,calc(100%-2rem))] items-center justify-between gap-6 md:h-[7.25rem]">
        <BrandLogo size="nav" priority />

        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`border-b-2 py-1 text-sm font-semibold transition-colors duration-150 ${
                  active
                    ? 'border-[#d48995] text-[#1c3a59]'
                    : 'border-transparent text-[#3d536b] hover:text-[#1c3a59]'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          {whatsappLink && <WhatsappButton href={whatsappLink} size="sm" />}
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar no WhatsApp"
              className="btn btn-whatsapp size-10 !min-h-0 !p-0"
            >
              <WhatsappIcon className="size-5" />
            </a>
          )}
          <button
            type="button"
            className="inline-flex size-10 items-center justify-center border border-[#1c3a59]/20"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            aria-controls="menu-mobile"
            onClick={() => setOpen((v) => !v)}
          >
            <div className="space-y-1.5">
              <span className={`block h-0.5 w-5 bg-[#1c3a59] transition ${open ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`block h-0.5 w-5 bg-[#1c3a59] transition ${open ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 bg-[#1c3a59] transition ${open ? '-translate-y-2 -rotate-45' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      {open && (
        <div id="menu-mobile" className="border-t border-[#e8d9c8] md:hidden" style={{ backgroundColor: '#fdf2e7' }}>
          <nav className="mx-auto flex w-[min(1120px,calc(100%-2rem))] flex-col py-3" aria-label="Menu">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="py-3 text-base font-semibold text-[#1c3a59]">
                {link.label}
              </Link>
            ))}
            {whatsappLink && (
              <div className="mb-3 mt-2">
                <WhatsappButton href={whatsappLink} size="lg" full />
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
