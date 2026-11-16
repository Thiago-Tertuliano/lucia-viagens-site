import type { Metadata } from 'next'
import { SectionHeading } from '@/components/section-heading'
import { ViagensFiltros } from '@/components/viagens-filtros'
import { getViagens, viagensAtivas } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Viagens',
  description:
    'Agenda de excursões da Lu&Cia — filtre por disponibilidade, busque destino e confira datas antes de falar no WhatsApp.',
}

export default async function ViagensPage() {
  const proximas = viagensAtivas(await getViagens())

  return (
    <div className="section-pad">
      <div className="container-page">
        <SectionHeading
          title="Próximas viagens"
          description="Cada viagem mostra o que você vai conhecer e o que está incluso. Gostou de uma? A reserva é com a equipe, pelo WhatsApp."
        />

        {proximas.length === 0 ? (
          <p className="rounded-sm border border-line bg-surface/70 p-8 text-ink-soft">
            Nenhuma viagem aberta publicada no momento. Volte em breve ou fale conosco pelo WhatsApp.
          </p>
        ) : (
          <ViagensFiltros viagens={proximas} />
        )}
      </div>
    </div>
  )
}
