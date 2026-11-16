/**
 * Enriquece uma viagem do site com atracoes e itens incluidos.
 *
 * Prioridade das atracoes: paradas do roteiro (LC Manager) > conteudo-editorial.json.
 * Itens incluidos: aba Web do LC Manager > editorial da viagem > padrao (so viagens futuras).
 */
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dir = path.dirname(fileURLToPath(import.meta.url))

export function slugify(text) {
  return String(text || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function carregarEditorial() {
  const raw = await readFile(path.join(dir, 'conteudo-editorial.json'), 'utf8')
  return JSON.parse(raw)
}

function normalizaHorario(h) {
  if (!h) return null
  const s = String(h).trim()
  if (/^\d{1,2}$/.test(s)) return `${s.padStart(2, '0')}:00`
  return s
}

/** Converte paradas do roteiro operacional em atracoes do site. */
export function paradasParaAtracoes(paradas) {
  return (Array.isArray(paradas) ? paradas : [])
    .slice()
    .sort((a, b) => (a.dia ?? 1) - (b.dia ?? 1) || (a.ordem ?? 0) - (b.ordem ?? 0))
    .map((p, i) => ({
      nome: p.nome,
      descricao: p.resumo || p.descricao || null,
      ordem: i + 1,
      horario: normalizaHorario(p.horario),
    }))
}

/** Resumo para cards: primeira(s) frase(s) até ~max caracteres. */
export function descricaoCurta(texto, max = 170) {
  const t = String(texto || '').replace(/\s+/g, ' ').trim()
  if (!t) return null
  if (t.length <= max) return t
  const frases = t.match(/[^.!?]+[.!?]+/g) || []
  let out = ''
  for (const f of frases) {
    if ((out + f).trim().length > max) break
    out += f
  }
  if (out.trim().length >= 60) return out.trim()
  const corte = t.slice(0, max)
  return corte.slice(0, corte.lastIndexOf(' ')).replace(/[,;:\s]+$/, '') + '…'
}

export function aplicarEditorial(full, editorial, { paradas } = {}) {
  const chave = slugify(`${full.titulo} ${full.destino?.nome ?? ''} ${full.destino?.cidade ?? ''}`)
  const entrada = editorial.destinos.find((d) => d.match.some((m) => chave.includes(m)))
  const futura = full.situacao !== 'REALIZADA'

  const doRoteiro = paradasParaAtracoes(paradas)
  if (doRoteiro.length > 0) {
    full.pontosTuristicos = doRoteiro
  } else if (futura && !full.pontosTuristicos?.length && entrada?.atracoes) {
    // Viagem já realizada só mostra atrações se vierem do roteiro real (não afirma o que não sabemos)
    full.pontosTuristicos = entrada.atracoes.map((a, i) => ({ ...a, ordem: i + 1 }))
  }

  // Itens incluídos só fazem sentido para saídas futuras
  if (futura) {
    if (!full.inclui?.length) full.inclui = entrada?.inclui ?? editorial.padrao.inclui
    if (!full.naoInclui?.length) full.naoInclui = entrada?.naoInclui ?? editorial.padrao.naoInclui
  }

  full.descricaoCurta = descricaoCurta(full.descricao)
  full.destaques = (full.pontosTuristicos || []).slice(0, 3).map((p) => p.nome)
  return full
}
