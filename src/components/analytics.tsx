'use client'

import Script from 'next/script'

/**
 * Analytics opcional via variável de ambiente.
 * Defina NEXT_PUBLIC_GA_ID=G-XXXX no .env / Netlify para ativar o GA4.
 */
export function Analytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID
  if (!gaId) return null

  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      <Script id="ga4-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gaId}',{anonymize_ip:true});`}
      </Script>
    </>
  )
}

export function trackEvent(nome: string, params?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return
  const gtag = (window as unknown as { gtag?: (...args: unknown[]) => void }).gtag
  gtag?.('event', nome, params)
}
