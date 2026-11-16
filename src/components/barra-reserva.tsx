import { WhatsappButton } from '@/components/whatsapp-button'
import { formatPeriodo } from '@/lib/format'
import type { Situacao } from '@/lib/types'

function resumoVagas(situacao: Situacao, vagas: number | null) {
  if (situacao === 'ESGOTADA') return 'Esgotada'
  const v = vagas == null ? null : vagas === 1 ? '1 vaga' : `${vagas} vagas`
  if (situacao === 'CONFIRMADA') return v ? `Confirmada · ${v}` : 'Saída confirmada'
  return v ?? 'Vagas abertas'
}

/**
 * Barra fixa de reserva para o celular (< md) nas viagens futuras.
 * No desktop o cartão lateral continua sendo o ponto de reserva.
 * Também esconde o botão flutuante de WhatsApp no celular (evita duplicar)
 * e reserva espaço no fim da página para a barra não cobrir o rodapé.
 */
export function BarraReserva({
  href,
  dataPartida,
  dataRetorno,
  situacao,
  vagasRestantes,
  textoBotao,
}: {
  href: string
  dataPartida: string
  dataRetorno: string
  situacao: Situacao
  vagasRestantes: number | null
  textoBotao?: string
}) {
  const esgotada = situacao === 'ESGOTADA'
  const rotulo = esgotada ? 'Lista de espera' : textoBotao?.trim() || 'Reservar'

  return (
    <>
      <style>{`@media (max-width:767px){body .wa-fab{display:none!important}body{padding-bottom:calc(4.2rem + env(safe-area-inset-bottom))}}`}</style>
      <div className="reserva-bar md:hidden" role="region" aria-label="Reserva desta viagem">
        <div className="min-w-0">
          <p className="truncate font-display text-lg leading-tight tabular-nums text-navy">
            {formatPeriodo(dataPartida, dataRetorno)}
          </p>
          <p className="truncate text-sm leading-tight text-ink-soft">{resumoVagas(situacao, vagasRestantes)}</p>
        </div>
        <WhatsappButton href={href} className="shrink-0">
          {rotulo}
        </WhatsappButton>
      </div>
    </>
  )
}
