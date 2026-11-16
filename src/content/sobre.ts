/**
 * Conteúdo da página Sobre.
 *
 * Itens com `rascunho: true` são textos a preencher: aparecem só em desenvolvimento
 * (com aviso) e ficam fora do site publicado até você trocar por texto de verdade.
 */

export interface Pessoa {
  nome: string
  cargo: string
  bio: string
  /** Caminho em /public, ex.: "/equipe/ceo.jpg". Sem foto, aparecem as iniciais. */
  foto?: string
  rascunho?: boolean
}

export interface Capitulo {
  /** "2023", "2025"... ou "proximas" para o capítulo de hoje. */
  chave: string
  rotulo: string
  titulo: string
  texto: string[]
  rascunho?: boolean
}

export const PESSOAS: Pessoa[] = [
  {
    nome: 'Nome da CEO',
    cargo: 'CEO',
    bio: 'Define os destinos, cuida de cada passageiro e acompanha as saídas de perto. É quem dá a palavra final em tudo o que a Lu&Cia faz.',
    rascunho: true,
  },
  {
    nome: 'Seu nome',
    cargo: 'Marketing digital e tecnologia',
    bio: 'Cuida do site, das redes sociais e do sistema de gestão, e ajuda a organizar as saídas para que tudo chegue claro ao passageiro.',
    rascunho: true,
  },
]

export const CAPITULOS: Capitulo[] = [
  {
    chave: 'inicio',
    rotulo: 'O começo',
    titulo: 'Como a Lu&Cia nasceu',
    texto: [
      'Conte aqui como tudo começou: de quem foi a ideia, qual foi o primeiro passeio e de onde vem o nome Lu&Cia.',
    ],
    rascunho: true,
  },
  {
    chave: '2023',
    rotulo: '2023',
    titulo: 'As primeiras estradas',
    texto: [
      'A primeira saída que temos registrada é de janeiro de 2023: um dia em Monte Sião, em Minas Gerais.',
      'Em seguida vieram a Festa da Uva, em Jundiaí, as flores de Holambra e dois dias em Campos do Jordão, na Serra da Mantiqueira. Era o jeito Lu&Cia de viajar tomando forma: roteiro combinado e alguém cuidando de cada detalhe.',
    ],
  },
  {
    chave: '2025',
    rotulo: '2025',
    titulo: 'Fé, serra e águas termais',
    texto: [
      'Em maio, o grupo foi ao Santuário de Nossa Senhora Aparecida, o maior templo católico do Brasil. Em novembro, foram dois dias em Poços de Caldas, com águas termais, teleférico e a boa mesa mineira.',
    ],
  },
  {
    chave: '2026',
    rotulo: '2026',
    titulo: 'O ano em que a casa ganhou ferramentas',
    texto: [
      'Foi o ano de mais saídas: da Basílica de Nossa Senhora do Rosário, em Caieiras, a Ibitinga, Santo Antônio do Pinhal, Itu e uma volta a Campos do Jordão, com paradas pensadas em chocolate, café e vista da serra.',
      'Nos bastidores, a Lu&Cia ganhou um sistema próprio para organizar viagens, passageiros e roteiros, as redes sociais e este site, que reúne agenda, descrição de cada passeio e as fotos de quem já viajou com a gente.',
    ],
  },
  {
    chave: 'proximas',
    rotulo: 'Hoje',
    titulo: 'E agora, o que vem aí',
    texto: [
      'A agenda de 2027 já está tomando forma. Cada saída nova entra aqui no site com roteiro, atrações e o que está incluso, e a reserva continua sendo conversa direta com a equipe.',
    ],
  },
]
