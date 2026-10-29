import type { Metadata } from 'next'
import Link from 'next/link'
import { SectionHeading } from '@/components/section-heading'
import { getSite } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Como funciona',
  description:
    'Entenda como consultar viagens, roteiros e galerias no site da Lu&Cia — e como falar com a equipe pelo WhatsApp.',
}

const PASSOS = [
  {
    titulo: 'Consulte a agenda',
    texto: 'Em Viagens você vê saídas abertas e esgotadas, com datas, destino, duração e valor a partir de (quando informado).',
  },
  {
    titulo: 'Abra o detalhe da viagem',
    texto: 'Roteiro dia a dia, o que inclui, embarque, pontos turísticos e galeria de fotos — tudo antes de falar conosco.',
  },
  {
    titulo: 'Explore o mapa e a galeria',
    texto: 'Na Galeria, o mapa 3D mostra onde já fomos. Clique em um estado para ver as memórias daquela região.',
  },
  {
    titulo: 'Fale no WhatsApp',
    texto: 'Não há venda pelo site. O interesse, dúvidas e reserva são com a equipe — com mensagem já pronta por viagem.',
  },
]

const DICAS = [
  'Status “Vagas abertas” e “Esgotada” são atualizados pelo sistema de gestão da Lu&Cia.',
  'Preço “a partir de” ou “Consulte” depende do que foi liberado para o site — o valor final é confirmado no atendimento.',
  'Pontos turísticos e roteiros evoluem com o cadastro no sistema interno; o site só exibe o que foi publicado.',
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
              <span className="absolute -left-[11px] top-0 flex h-5 w-5 items-center justify-center rounded-full bg-[#1c3a59] text-[11px] font-bold text-[#fdf2e7]">
                {i + 1}
              </span>
              <h2 className="font-display text-xl text-[#1c3a59]">{p.titulo}</h2>
              <p className="mt-2 text-base leading-relaxed text-ink-soft">{p.texto}</p>
            </li>
          ))}
        </ol>

        <section className="mt-14 rounded-xl border border-line bg-surface/80 p-6 md:p-8">
          <h2 className="font-display text-xl text-[#1c3a59]">Boas práticas</h2>
          <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-soft">
            {DICAS.map((d) => (
              <li key={d} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d48995]" />
                <span>{d}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/viagens" className="btn btn-primary">
            Ver viagens
          </Link>
          <Link href="/galeria" className="btn border border-line bg-surface">
            Abrir galeria
          </Link>
          {site.contato.whatsappLink && (
            <a
              href={site.contato.whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
              style={{ backgroundColor: '#d48995', color: '#fff' }}
            >
              Falar no WhatsApp
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
