/**
 * Sincroniza viagens do LC Manager (localhost) para content/ do site.
 *
 * Uso:
 *   npm run sync:lc
 *   LC_MANAGER_URL=http://127.0.0.1:3000 npm run sync:lc
 *
 * - CONCLUIDA / situacao REALIZADA → galeria (REALIZADA)
 * - CONFIRMADA / EM_ANDAMENTO → agenda (CONFIRMADA), sem preço público
 * - Viagens com web publicada → usam título/slug/fotos do Web
 * - Substitui a lista do site pelo que veio do LC Manager (sem demos)
 */
import { mkdir, readdir, rm, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { aplicarEditorial, carregarEditorial } from './editorial.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const contentDir = path.join(root, 'content')
const viagensDir = path.join(contentDir, 'viagens')
const publicWebDir = path.join(root, 'public', 'web', 'sync')

const LC_URL = (process.env.LC_MANAGER_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')
const WHATSAPP = '5511950755316'

function slugify(text) {
  return String(text || 'viagem')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'viagem'
}

function isoDate(value) {
  if (!value) return new Date().toISOString().slice(0, 10)
  return String(value).slice(0, 10)
}

function diasEntre(partida, retorno) {
  const a = new Date(isoDate(partida) + 'T12:00:00')
  const b = new Date(isoDate(retorno) + 'T12:00:00')
  const diff = Math.round((b - a) / 86400000)
  return Number.isFinite(diff) && diff >= 0 ? diff + 1 : 1
}

function decodeDestino(raw) {
  // Corrige mojibake comum Latin1↔UTF8 quando a API vem com encoding errado
  try {
    const fixed = Buffer.from(String(raw), 'latin1').toString('utf8')
    if (/[áàâãéêíóôõúçÁÀÂÃÉÊÍÓÔÕÚÇ]/.test(fixed) || fixed.includes('ã') || fixed.includes('ç')) {
      return fixed
    }
  } catch {
    /* ignore */
  }
  return String(raw || '')
}

async function fetchJson(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`${url} → ${res.status}`)
  const text = await res.text()
  return JSON.parse(text.replace(/^\uFEFF/, ''))
}

function extFromMime(mime, fallback = 'jpg') {
  const m = String(mime || '').toLowerCase()
  if (m.includes('png')) return 'png'
  if (m.includes('webp')) return 'webp'
  if (m.includes('gif')) return 'gif'
  if (m.includes('jpeg') || m.includes('jpg')) return 'jpg'
  return fallback
}

async function saveDataUrlImage(dataUrl, fileBase) {
  const m = /^data:(image\/[\w+.-]+);base64,(.+)$/i.exec(dataUrl || '')
  if (!m) return null
  const ext = extFromMime(m[1])
  await mkdir(publicWebDir, { recursive: true })
  const filename = `${fileBase}.${ext}`
  const out = path.join(publicWebDir, filename)
  await writeFile(out, Buffer.from(m[2], 'base64'))
  return {
    src: `/web/sync/${filename}`,
    largura: 1600,
    altura: 1067,
    legenda: null,
  }
}

async function saveBinaryImage(buffer, mime, fileBase) {
  const ext = extFromMime(mime, 'jpg')
  const dir = path.dirname(path.join(publicWebDir, fileBase))
  await mkdir(dir, { recursive: true })
  const filename = `${fileBase}.${ext}`
  const out = path.join(publicWebDir, filename)
  await writeFile(out, buffer)
  return {
    src: `/web/sync/${filename}`,
    largura: 1600,
    altura: 1067,
    legenda: null,
  }
}

/** Espelha a galeria operacional: pasta recriada do zero (add/remove no Manager = site). */
async function fetchGaleriaFotos(viagemId, slug) {
  const slugDir = path.join(publicWebDir, slug)
  await rm(slugDir, { recursive: true, force: true })
  // Remove capa legada solta (slug.jpg) — a galeria vive só em sync/<slug>/
  for (const ext of ['jpg', 'jpeg', 'png', 'webp', 'gif']) {
    await rm(path.join(publicWebDir, `${slug}.${ext}`), { force: true }).catch(() => {})
  }

  let meta = []
  try {
    const list = await fetchJson(`${LC_URL}/api/viagens/${viagemId}/fotos`)
    meta = Array.isArray(list) ? list : []
  } catch {
    return []
  }
  if (meta.length === 0) return []

  // Capa marcada primeiro; depois ordem de criação
  const ordenadas = [...meta].sort((a, b) => {
    if (a.capa && !b.capa) return -1
    if (!a.capa && b.capa) return 1
    return String(a.criadoEm || '').localeCompare(String(b.criadoEm || ''))
  })

  const fotos = []
  const concurrency = 4
  for (let i = 0; i < ordenadas.length; i += concurrency) {
    const chunk = ordenadas.slice(i, i + concurrency)
    const saved = await Promise.all(
      chunk.map(async (foto) => {
        const url = `${LC_URL}/api/viagens/${viagemId}/fotos/${foto.id}/arquivo`
        try {
          const res = await fetch(url)
          if (!res.ok) return null
          const mime = res.headers.get('content-type') || foto.tipo || 'image/jpeg'
          const buffer = Buffer.from(await res.arrayBuffer())
          if (buffer.length < 32) return null
          // id estável: se tirar a foto no Manager, some no próximo sync
          return saveBinaryImage(buffer, mime, `${slug}/${foto.id}`)
        } catch {
          return null
        }
      }),
    )
    for (const f of saved) if (f) fotos.push(f)
  }
  return fotos
}

function whatsappLink(titulo) {
  const text = encodeURIComponent(`Olá! Vi a viagem "${titulo}" no site e quero saber mais.`)
  return `https://wa.me/${WHATSAPP}?text=${text}`
}

function mapSituacao(v) {
  // Realizadas / concluídas no operacional (data já passou ou status CONCLUIDA)
  if (v.status === 'CONCLUIDA' || v.situacao === 'REALIZADA') return 'REALIZADA'

  // Confirmadas (e em andamento) entram na agenda mesmo sem página Web
  if (v.status === 'CONFIRMADA' || v.status === 'EM_ANDAMENTO') {
    if (v.situacao === 'ESGOTADA' || (typeof v.vagasRestantes === 'number' && v.vagasRestantes <= 0)) {
      return 'ESGOTADA'
    }
    return 'CONFIRMADA'
  }

  // Demais: só entra se estiver publicada na aba Web (evita puxar rascunho)
  if (!v.web?.publicada && process.env.SYNC_ALL !== '1') return null

  if (v.situacao === 'ESGOTADA' || (typeof v.vagasRestantes === 'number' && v.vagasRestantes <= 0))
    return 'ESGOTADA'
  return 'ABERTA'
}

async function buildFromSystem(v) {
  const situacao = mapSituacao(v)
  if (!situacao) return null

  const cidade = decodeDestino(v.destinoCidade || v.destino || '')
  const uf = v.destinoUf || null
  const destinoNome = decodeDestino(v.destino || cidade)
  const web = v.web
  const titulo = web?.titulo || destinoNome
  const slug = web?.slug || `${slugify(cidade || destinoNome)}-${isoDate(v.dataPartida)}`
  const chamadaPadrao =
    situacao === 'REALIZADA'
      ? `Viagem realizada — ${cidade}${uf ? `/${uf}` : ''}.`
      : situacao === 'CONFIRMADA'
        ? `Viagem confirmada — ${cidade}${uf ? `/${uf}` : ''}. Fale conosco para reservar.`
        : `Viagem com a Lu&Cia — ${cidade}${uf ? `/${uf}` : ''}.`
  const chamada = web?.chamada || chamadaPadrao

  // Galeria operacional = espelho no site (só essas fotos; vazio se não houver)
  const fotosGaleria = await fetchGaleriaFotos(v.id, slug)

  // Detalhe da viagem: descrição escrita no LC Manager + capa
  let detalhe = null
  try {
    detalhe = await fetchJson(`${LC_URL}/api/viagens/${v.id}`)
  } catch {
    /* segue sem detalhe */
  }

  // Roteiro operacional: as paradas viram "atrações" no site
  let paradas = []
  try {
    const roteiro = await fetchJson(`${LC_URL}/api/viagens/${v.id}/roteiro`)
    paradas = Array.isArray(roteiro?.paradas) ? roteiro.paradas : []
  } catch {
    /* sem roteiro */
  }

  let capa = fotosGaleria[0] || null
  // Sem galeria: usa a capa cadastrada na viagem (card, hero e mapa). Não entra em fotos[]
  if (!capa && detalhe?.imagemCapaUrl?.startsWith('data:image/')) {
    capa = await saveDataUrlImage(detalhe.imagemCapaUrl, `${slug}-capa`)
  }
  const descricaoLc = (web?.descricao || detalhe?.descricao || '').trim() || null

  // REALIZADA (e demais): na página só a galeria — nunca inventa foto extra
  const fotos = fotosGaleria

  const resumo = {
    slug,
    titulo,
    chamada,
    destino: { nome: destinoNome, cidade: cidade || null, uf },
    dataPartida: isoDate(v.dataPartida),
    dataRetorno: isoDate(v.dataRetorno),
    dias: diasEntre(v.dataPartida, v.dataRetorno),
    // Nunca expõe valorPassageiro operacional; só preço liberado na aba Web (e nunca em confirmada/realizada)
    precoAPartir:
      situacao === 'REALIZADA' || situacao === 'CONFIRMADA'
        ? null
        : web?.precoAPartir ?? null,
    vagasRestantes: situacao === 'REALIZADA' ? null : v.vagasRestantes ?? null,
    situacao,
    destaque: Boolean(web?.destaque),
    capa,
    _fromLcManager: true,
    _viagemId: v.id,
  }

  const full = {
    ...resumo,
    descricao:
      descricaoLc ||
      (situacao === 'REALIZADA' ? `Viagem realizada pela Lu&Cia para ${destinoNome}.` : null),
    roteiro: Array.isArray(web?.roteiro) ? web.roteiro : [],
    pontosTuristicos: Array.isArray(web?.pontosTuristicos) ? web.pontosTuristicos : [],
    inclui: Array.isArray(web?.inclui) ? web.inclui : [],
    naoInclui: Array.isArray(web?.naoInclui) ? web.naoInclui : [],
    embarque: web?.embarque || null,
    fotos,
    whatsappLink: whatsappLink(titulo),
  }
  delete full._fromLcManager
  delete full._viagemId

  aplicarEditorial(full, await carregarEditorial(), { paradas })
  resumo.descricaoCurta = full.descricaoCurta
  resumo.destaques = full.destaques

  return { resumo, full, fotosCount: fotos.length }
}

async function assinaturaGalerias(sistema) {
  const partes = []
  for (const v of sistema) {
    if (!mapSituacao(v)) continue
    try {
      const list = await fetchJson(`${LC_URL}/api/viagens/${v.id}/fotos`)
      const ids = (Array.isArray(list) ? list : []).map((f) => f.id).sort().join(',')
      partes.push(`${v.id}:${ids}`)
    } catch {
      partes.push(`${v.id}:`)
    }
  }
  return partes.sort().join('|')
}

async function syncOnce(payload) {
  const sistema = Array.isArray(payload.viagens) ? payload.viagens : []
  console.log(`API: ${sistema.length} viagem(ns) no sistema`)

  const mapped = []
  for (const v of sistema) {
    const item = await buildFromSystem(v)
    if (item) mapped.push(item)
  }

  const realizadas = mapped.filter((m) => m.resumo.situacao === 'REALIZADA')
  const confirmadas = mapped.filter((m) => m.resumo.situacao === 'CONFIRMADA')
  const ativas = mapped.filter(
    (m) => m.resumo.situacao !== 'REALIZADA' && m.resumo.situacao !== 'CONFIRMADA',
  )
  console.log(
    `Importáveis: ${mapped.length} (confirmadas=${confirmadas.length}, realizadas=${realizadas.length}, abertas/esgotadas=${ativas.length})`,
  )

  // Lista = só o que veio do LC Manager (remove demos/mocks antigos)
  const lista = {
    viagens: mapped
      .map(({ resumo }) => {
        const { _fromLcManager, _viagemId, ...clean } = resumo
        return clean
      })
      .sort((a, b) => b.dataPartida.localeCompare(a.dataPartida)),
  }

  await mkdir(viagensDir, { recursive: true })

  // Remove JSONs de viagens que não estão mais no sistema
  const keep = new Set(lista.viagens.map((v) => v.slug))
  try {
    for (const name of await readdir(viagensDir)) {
      if (!name.endsWith('.json')) continue
      const slug = name.replace(/\.json$/, '')
      if (!keep.has(slug)) {
        await unlink(path.join(viagensDir, name))
        console.log(`  ✗ removido mock/antigo ${slug}`)
      }
    }
  } catch {
    /* pasta pode não existir ainda */
  }

  await writeFile(path.join(contentDir, 'viagens.json'), JSON.stringify(lista, null, 2) + '\n', 'utf8')

  // Remove pastas de sync órfãs (viagens que saíram / mocks)
  try {
    for (const name of await readdir(publicWebDir, { withFileTypes: true })) {
      if (name.isDirectory() && !keep.has(name.name)) {
        await rm(path.join(publicWebDir, name.name), { recursive: true, force: true })
        console.log(`  ✗ pasta sync removida ${name.name}`)
      }
    }
  } catch {
    /* sync dir pode não existir */
  }

  for (const { full, fotosCount } of mapped) {
    await writeFile(path.join(viagensDir, `${full.slug}.json`), JSON.stringify(full, null, 2) + '\n', 'utf8')
    console.log(`  ✓ ${full.situacao.padEnd(9)} ${full.slug}  (${fotosCount} foto${fotosCount === 1 ? '' : 's'})`)
  }

  console.log('\nPronto. Site espelha a galeria do LC Manager (add/remove).')
  if (payload.publicacao && !payload.publicacao.configurado) {
    console.log('Obs: publicação GitHub ainda não configurada no LC Manager (aba Web).')
  }
}

async function main() {
  const watch = process.argv.includes('--watch') || process.env.SYNC_WATCH === '1'
  console.log(`Conectando em ${LC_URL}/api/web ...`)

  const carregar = async () => {
    try {
      return await fetchJson(`${LC_URL}/api/web`)
    } catch (err) {
      throw new Error(
        `Não foi possível conectar ao LC Manager. Abra o app e tente de novo.\n${err.message || err}`,
      )
    }
  }

  if (!watch) {
    const payload = await carregar()
    await syncOnce(payload)
    return
  }

  console.log('Modo watch: atualiza o site quando a galeria mudar no LC Manager (a cada 8s).')
  let anterior = null
  for (;;) {
    try {
      const payload = await carregar()
      const sistema = Array.isArray(payload.viagens) ? payload.viagens : []
      const assinatura = await assinaturaGalerias(sistema)
      if (assinatura !== anterior) {
        const mudou = anterior !== null
        anterior = assinatura
        if (mudou) console.log(`\n[${new Date().toLocaleTimeString('pt-BR')}] Galeria alterada — sincronizando…`)
        await syncOnce(payload)
      }
    } catch (err) {
      console.error(String(err.message || err))
    }
    await new Promise((r) => setTimeout(r, 8000))
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
