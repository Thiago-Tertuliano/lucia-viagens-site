import type { Metadata, Viewport } from 'next'
import { Manrope, Syne } from 'next/font/google'
import { Analytics } from '@/components/analytics'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { WhatsappFab } from '@/components/whatsapp-fab'
import { getSite } from '@/lib/content'
import './globals.css'

const syne = Syne({
  variable: '--font-syne',
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  display: 'swap',
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://luciaviagens.com.br'

export const viewport: Viewport = {
  themeColor: '#fdf2e7',
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
}

export async function generateMetadata(): Promise<Metadata> {
  const site = await getSite()
  const description =
    site.slogan ||
    'Excursões e viagens com roteiros claros, galerias e informações para o passageiro. Agenda atualizada; atendimento pelo WhatsApp.'

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: site.nome,
      template: `%s · ${site.nome}`,
    },
    description,
    applicationName: site.nome,
    authors: [{ name: site.nome }],
    creator: site.nome,
    keywords: [
      'Lu&Cia Viagens',
      'excursões',
      'viagens em grupo',
      'roteiros',
      'turismo Brasil',
      'passeios',
    ],
    alternates: {
      canonical: '/',
    },
    openGraph: {
      title: site.nome,
      description,
      locale: 'pt_BR',
      type: 'website',
      siteName: site.nome,
      url: SITE_URL,
    },
    twitter: {
      card: 'summary_large_image',
      title: site.nome,
      description,
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: [{ url: '/favicon.ico' }, { url: '/icon.png', type: 'image/png' }],
      apple: [{ url: '/apple-icon.png' }],
    },
  }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const site = await getSite()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'TravelAgency',
    name: site.nome,
    description: site.slogan || undefined,
    url: SITE_URL,
    email: site.contato.email || undefined,
    telephone: site.contato.telefone || undefined,
    address: site.contato.endereco
      ? { '@type': 'PostalAddress', addressLocality: site.contato.endereco }
      : undefined,
    sameAs: [site.contato.instagram, site.contato.facebook].filter(Boolean),
  }

  return (
    <html lang="pt-BR">
      <body className={`${syne.variable} ${manrope.variable} antialiased`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SiteHeader whatsappLink={site.contato.whatsappLink} />
        <main>{children}</main>
        <SiteFooter site={site} />
        <WhatsappFab href={site.contato.whatsappLink} />
        <Analytics />
      </body>
    </html>
  )
}
