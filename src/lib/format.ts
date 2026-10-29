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

export function destinoLabel(destino: { nome: string; cidade: string | null; uf: string | null }) {
  const local = [destino.cidade, destino.uf].filter(Boolean).join('/')
  return local || destino.nome
}
