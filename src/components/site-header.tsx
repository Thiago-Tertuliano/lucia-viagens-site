'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { BrandLogo } from '@/components/brand-logo'

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
      <div className="mx-auto flex h-20 w-[min(1120px,calc(100%-2rem))] items-center justify-between gap-6 md:h-[5.5rem]">
        <BrandLogo size="nav" priority />

        <nav className="hidden items-center gap-8 md:flex">
          {LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-semibold tracking-wide ${
                  active ? 'text-[#1c3a59]' : 'text-[#3d536b] hover:text-[#1c3a59]'
                }`}
              >
                {link.label}
              </Link>
            )
          })}
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-10 items-center gap-2 rounded-md px-4 text-sm font-semibold transition hover:opacity-90"
              style={{ backgroundColor: '#d48995', color: '#ffffff' }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M20.5 3.5A11 11 0 0 0 2.1 17.1L1 23l6.1-1.1A11 11 0 0 0 20.5 3.5Zm-8.5 17a9 9 0 0 1-4.6-1.3l-.3-.2-3.6.7.7-3.5-.2-.3a9 9 0 1 1 8 4.6Zm5-6.7c-.3-.1-1.6-.8-1.9-.9s-.4-.1-.6.2-.7.9-.8 1-.3.2-.6.1a7.3 7.3 0 0 1-2.1-1.3 8 8 0 0 1-1.5-1.8c-.2-.3 0-.4.1-.6l.4-.5.3-.4a.5.5 0 0 0 0-.5c0-.1-.6-1.4-.8-1.9s-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1.1 2.6 11.5 11.5 0 0 0 4.4 3.9c.6.3 1 .4 1.4.5a3.4 3.4 0 0 0 2.3-.8 2.7 2.7 0 0 0 .9-1.9c0-.1 0-.2-.2-.3Z" />
              </svg>
              Falar no WhatsApp
            </a>
          )}
        </nav>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center border border-[#1c3a59]/20 md:hidden"
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <div className="space-y-1.5">
            <span className={`block h-0.5 w-5 bg-[#1c3a59] transition ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-5 bg-[#1c3a59] transition ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 bg-[#1c3a59] transition ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </div>
        </button>
      </div>

      {open && (
        <div className="border-t border-[#e8d9c8] md:hidden" style={{ backgroundColor: '#fdf2e7' }}>
          <nav className="mx-auto flex w-[min(1120px,calc(100%-2rem))] flex-col py-3">
            {LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="py-3 text-base font-semibold text-[#1c3a59]">
                {link.label}
              </Link>
            ))}
            {whatsappLink && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mb-3 mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-md px-4 text-sm font-semibold"
                style={{ backgroundColor: '#d48995', color: '#ffffff' }}
              >
                Falar no WhatsApp
              </a>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
