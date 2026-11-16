export type Situacao = 'ABERTA' | 'CONFIRMADA' | 'ESGOTADA' | 'REALIZADA'

export interface Foto {
  src: string
  largura: number
  altura: number
  legenda: string | null
}

export interface Site {
  nome: string
  slogan: string | null
  sobre: {
    titulo: string | null
    texto: string | null
    foto: string | null
  }
  contato: {
    whatsapp: string | null
    whatsappLink: string | null
    telefone: string | null
    email: string | null
    instagram: string | null
    facebook: string | null
    endereco: string | null
  }
  /** Opcional — só exibir se preenchido no publish. */
  cnpj: string | null
  cadastur: string | null
}

export interface PontoTuristico {
  nome: string
  descricao: string | null
  /** Ordem de visita sugerida (1-based). */
  ordem?: number
  /** Horário previsto (ex.: "10:00"), quando vem do roteiro operacional. */
  horario?: string | null
}

export interface ViagemResumo {
  slug: string
  titulo: string
  chamada: string | null
  destino: { nome: string; cidade: string | null; uf: string | null }
  dataPartida: string
  dataRetorno: string
  dias: number
  precoAPartir: number | null
  vagasRestantes: number | null
  situacao: Situacao
  destaque: boolean
  capa: Foto | null
  /** Primeiras frases da descrição, para cards. */
  descricaoCurta?: string | null
  /** Nomes das principais atrações, para cards. */
  destaques?: string[]
  /**
   * Mensagem do WhatsApp desta viagem (texto livre; aceita {titulo} e {data}).
   * Vem de scripts/conteudo-editorial.json. Sem ela, usa `whatsappLink`.
   */
  mensagemWhatsapp?: string
  /** Texto do botão da barra de reserva no celular (padrão: "Reservar"). */
  textoBotao?: string
}

export interface Viagem extends ViagemResumo {
  descricao: string | null
  roteiro: { dia: number; titulo: string; descricao: string | null }[]
  /** Pontos turísticos do destino — publicado pelo LC-Manager quando disponível. */
  pontosTuristicos: PontoTuristico[]
  inclui: string[]
  naoInclui: string[]
  embarque: { local: string; horario: string | null } | null
  fotos: Foto[]
  whatsappLink: string | null
}

export interface ListaViagens {
  viagens: ViagemResumo[]
}
