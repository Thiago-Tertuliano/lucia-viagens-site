import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionHeading } from '@/components/section-heading'
import { WhatsappButton } from '@/components/whatsapp-button'
import { getSite } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Como funciona',
  description:
    'Entenda como consultar viagens, roteiros e galerias no site da Lu&Cia — e como falar com a equipe pelo WhatsApp.',
}

const PASSOS = [
  {
    titulo: 'Consulte a agenda',
    texto: 'Em Viagens estão as próximas saídas, com data, destino, duração e quantas vagas ainda restam.',
  },
  {
    titulo: 'Abra o detalhe da viagem',
    texto: 'Roteiro dia a dia, o que inclui, embarque, pontos turísticos e galeria de fotos — tudo antes de falar conosco.',
  },
  {
    titulo: 'Veja quem já viajou com a gente',
    texto: 'Na Galeria ficam as viagens que já fizemos, uma foto de capa para cada uma, e um mapa 3D de por onde passamos.',
  },
  {
    titulo: 'Fale no WhatsApp',
    texto: 'Não há venda pelo site. O interesse, dúvidas e reserva são com a equipe — com mensagem já pronta por viagem.',
  },
]

export default async function GuiaPage() {
  const site = await getSite()

  return (
    <div className="section-pad">
      <div className="container-page max-w-3xl">
        <SectionHeading
          eyebrow="Guia do passageiro"
          title="Como usar este site"
          description="Canal de informação da Lu&Cia: conteúdo claro primeiro, WhatsApp depois — sem checkout online."
        />

        <ol className="mt-2 space-y-0 border-l border-line">
          {PASSOS.map((p, i) => (
            <li key={p.titulo} className="relative pb-10 pl-8 last:pb-0">
              <span className="absolute -left-3 top-0 flex size-6 items-center justify-center rounded-full bg-[#1c3a59] text-xs font-bold text-[#fdf2e7]">
                {i + 1}
              </span>
              <h2 className="font-display text-xl text-[#1c3a59]">{p.titulo}</h2>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">{p.texto}</p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/viagens" className="btn btn-primary">
            Ver viagens
          </Link>
          <Link href="/galeria" className="btn border border-line bg-surface">
            Abrir galeria
          </Link>
          {site.contato.whatsappLink && <WhatsappButton href={site.contato.whatsappLink} />}
        </div>
      </div>
    </div>
  )
}
