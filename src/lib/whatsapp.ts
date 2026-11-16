import { formatDate } from '@/lib/format'
import type { Site, ViagemResumo } from '@/lib/types'

/** Só dígitos do número (com DDI) a partir do site.json ou do link já gerado. */
function numeroWhatsapp(site: Pick<Site, 'contato'>, whatsappLink: string | null): string | null {
  const doSite = site.contato.whatsapp?.replace(/\D/g, '')
  if (doSite) return doSite
  const doLink = whatsappLink?.match(/wa\.me\/(\d+)/)?.[1]
  return doLink ?? null
}

/**
 * Link do WhatsApp da viagem. Se a viagem tem `mensagemWhatsapp`, monta o link com ela
 * (trocando {titulo} e {data}); senão devolve o `whatsappLink` padrão.
 */
export function linkWhatsappViagem(
  viagem: Pick<ViagemResumo, 'titulo' | 'dataPartida' | 'dataRetorno' | 'mensagemWhatsapp'> & {
    whatsappLink: string | null
  },
  site: Pick<Site, 'contato'>,
): string | null {
  const modelo = viagem.mensagemWhatsapp?.trim()
  const numero = numeroWhatsapp(site, viagem.whatsappLink)
  if (!modelo || !numero) return viagem.whatsappLink

  const data =
    viagem.dataPartida === viagem.dataRetorno
      ? formatDate(viagem.dataPartida)
      : `${formatDate(viagem.dataPartida)} a ${formatDate(viagem.dataRetorno)}`
  const texto = modelo.replaceAll('{titulo}', viagem.titulo).replaceAll('{data}', data)
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`
}
