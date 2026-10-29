import type { MetadataRoute } from 'next'
import { getAllViagemSlugs, getViagens, viagensAtivas, viagensRealizadas } from '@/lib/content'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://luciaviagens.com.br'

export const dynamic = 'force-static'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, lista] = await Promise.all([getAllViagemSlugs(), getViagens()])
  const ativas = new Set(viagensAtivas(lista).map((v) => v.slug))
  const realizadas = new Set(viagensRealizadas(lista).map((v) => v.slug))

  const estaticas: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/viagens/`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/galeria/`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/guia/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/sobre/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  const viagens: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${SITE_URL}/viagens/${slug}/`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: ativas.has(slug) ? 0.85 : realizadas.has(slug) ? 0.65 : 0.5,
  }))

  return [...estaticas, ...viagens]
}
