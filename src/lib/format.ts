const MESES = [
  'jan', 'fev', 'mar', 'abr', 'mai', 'jun',
  'jul', 'ago', 'set', 'out', 'nov', 'dez',
]

/** `AAAA-MM-DD` → `12 abr 2026` */
export function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  return `${d} ${MESES[m - 1]} ${y}`
}

/** Intervalo curto: `12–15 abr` ou `28 mar – 2 abr` */
export function formatPeriodo(partida: string, retorno: string): string {
  const [y1, m1, d1] = partida.split('-').map(Number)
  const [y2, m2, d2] = retorno.split('-').map(Number)
  if (!y1 || !m1 || !d1 || !y2 || !m2 || !d2) return `${partida} – ${retorno}`

  if (y1 === y2 && m1 === m2 && d1 === d2) return `${d1} ${MESES[m1 - 1]} ${y1}`
  if (y1 === y2 && m1 === m2) return `${d1}–${d2} ${MESES[m1 - 1]}`
  if (y1 === y2) return `${d1} ${MESES[m1 - 1]} – ${d2} ${MESES[m2 - 1]}`
  return `${d1} ${MESES[m1 - 1]} ${y1} – ${d2} ${MESES[m2 - 1]} ${y2}`
}

export function formatPreco(valor: number | null): string {
  if (valor == null) return 'Consulte'
  return valor.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  })
}

/** ["A", "B", "C"] → "A, B e C" */
export function listaNatural(itens: string[]) {
  if (itens.length <= 1) return itens.join('')
  return `${itens.slice(0, -1).join(', ')} e ${itens[itens.length - 1]}`
}

/** Chamadas geradas automaticamente pelo sync ("Viagem confirmada — ...") não valem como texto de venda. */
export function chamadaPersonalizada(chamada: string | null): string | null {
  if (!chamada) return null
  if (/^Viagem (confirmada|realizada|com a Lu&Cia) —/.test(chamada)) return null
  return chamada
}

export function destinoLabel(destino: { nome: string; cidade: string | null; uf: string | null }) {
  const local = [destino.cidade, destino.uf].filter(Boolean).join('/')
  return local || destino.nome
}

/** Corta o texto no fim de uma frase (até ~max caracteres), sem deixar reticências no meio de uma ideia. */
export function resumirPorFrases(texto: string | null | undefined, max = 420): string | null {
  const t = (texto ?? '').replace(/\s+/g, ' ').trim()
  if (!t) return null
  if (t.length <= max) return t
  const frases = t.match(/[^.!?]+[.!?]+/g) ?? []
  let out = ''
  for (const f of frases) {
    if ((out + f).trim().length > max) break
    out += f
  }
  if (out.trim().length >= 80) return out.trim()
  const corte = t.slice(0, max)
  return corte.slice(0, corte.lastIndexOf(' ')).replace(/[,;:\s]+$/, '') + '…'
}

/** Retorna o local do destino, ou null quando ele só repete o título (ex.: "Ibitinga - SP" / "Ibitinga - SP"). */
export function localSeDiferenteDoTitulo(
  titulo: string,
  destino: { nome: string; cidade: string | null; uf: string | null },
) {
  const local = destinoLabel(destino)
  const norm = (t: string) => t.toLowerCase().normalize('NFD').replace(/[^a-z0-9]/g, '')
  const a = norm(local)
  const b = norm(titulo)
  return !a || b.includes(a) || a.includes(b) ? null : local
}
