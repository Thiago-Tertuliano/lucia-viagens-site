/**
 * Publicador automático: LC Manager → GitHub → Netlify.
 *
 * Roda a cada poucos minutos (Agendador de Tarefas do Windows, ver scripts/instalar-publicador.ps1).
 * A cada execução:
 *   1. confere se o LC Manager está aberto (senão não faz nada);
 *   2. sincroniza as viagens (scripts/sync-from-lc-manager.mjs);
 *   3. se algo mudou em content/ ou public/web/, faz commit e push;
 *   4. o Netlify detecta o push e publica o site (1 a 2 minutos).
 *
 * Só mexe em content/ e public/web/ — o código do site nunca entra nesse commit.
 *
 * Uso manual:
 *   node scripts/publicar-automatico.mjs            # sincroniza e publica se houver mudança
 *   node scripts/publicar-automatico.mjs --dry-run  # sincroniza e mostra o que mudaria, sem commit/push
 */
import { execFile } from 'node:child_process'
import { cp, mkdir, readFile, rm, stat, unlink, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { promisify } from 'node:util'

const run = promisify(execFile)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.join(__dirname, '..')
const LOG = path.join(__dirname, 'publicador.log')
const LOCK = path.join(root, '.publicador.lock')
const ESTADO = path.join(root, '.publicador-estado.json')
const CAMINHOS = ['content', 'public/web']
const LC_URL = (process.env.LC_MANAGER_URL || 'http://127.0.0.1:3000').replace(/\/$/, '')
const DRY = process.argv.includes('--dry-run')

async function log(msg) {
  const linha = `[${new Date().toLocaleString('pt-BR')}] ${msg}`
  console.log(linha)
  let atual = ''
  try {
    atual = await readFile(LOG, 'utf8')
  } catch {
    /* primeira execução */
  }
  const linhas = (atual + linha + '\n').split('\n').filter(Boolean).slice(-300)
  await writeFile(LOG, linhas.join('\n') + '\n', 'utf8')
}

async function git(...args) {
  // Identidade só para estes comandos (não altera a configuração do Git do computador)
  const identidade = ['-c', 'user.name=Lu&Cia Viagens Site', '-c', 'user.email=site@luciaviagens.com.br']
  const { stdout } = await run('git', [...identidade, ...args], { cwd: root, maxBuffer: 64 * 1024 * 1024 })
  return stdout.trim()
}

async function lerEstado() {
  try {
    return JSON.parse(await readFile(ESTADO, 'utf8'))
  } catch {
    return {}
  }
}

async function salvarEstado(parcial) {
  await writeFile(ESTADO, JSON.stringify({ ...(await lerEstado()), ...parcial }), 'utf8')
}

async function contarViagens() {
  try {
    const j = JSON.parse((await readFile(path.join(root, 'content', 'viagens.json'), 'utf8')).replace(/^\uFEFF/, ''))
    return Array.isArray(j.viagens) ? j.viagens.length : 0
  } catch {
    return 0
  }
}

async function adquirirTrava() {
  try {
    const s = await stat(LOCK)
    if (Date.now() - s.mtimeMs < 15 * 60 * 1000) return false // outra execução em andamento
  } catch {
    /* sem trava */
  }
  await writeFile(LOCK, String(process.pid), 'utf8')
  return true
}

async function lcManagerAberto() {
  try {
    const res = await fetch(`${LC_URL}/api/health`, { signal: AbortSignal.timeout(5000) })
    return res.ok
  } catch {
    return false
  }
}

/** Empurra commits locais que ainda não subiram (ex.: falta de internet na execução anterior). */
async function enviar() {
  const branch = await git('rev-parse', '--abbrev-ref', 'HEAD')
  try {
    await git('push', 'origin', branch)
  } catch {
    // Alguém publicou no meio tempo: integra e tenta de novo
    await git('pull', '--rebase', '--autostash', 'origin', branch)
    await git('push', 'origin', branch)
  }
}

async function pendentesParaEnviar() {
  try {
    const n = await git('rev-list', '--count', '@{u}..HEAD')
    return Number(n) > 0
  } catch {
    return false
  }
}

async function main() {
  if (!(await adquirirTrava())) return

  const snapshot = path.join(os.tmpdir(), `lucia-publicador-${Date.now()}`)
  try {
    if (!(await lcManagerAberto())) {
      const estado = await lerEstado()
      if (estado.lcAberto !== false) await log('LC Manager fechado — aguardando ele ser aberto.')
      await salvarEstado({ lcAberto: false })
      if (!DRY && (await pendentesParaEnviar())) await enviar()
      return
    }
    await salvarEstado({ lcAberto: true })

    // Cópia de segurança: se o sync falhar ou vier vazio, volta tudo como estava
    const antes = await contarViagens()
    await mkdir(snapshot, { recursive: true })
    for (const c of CAMINHOS) {
      await cp(path.join(root, c), path.join(snapshot, c), { recursive: true }).catch(() => {})
    }
    const restaurar = async (motivo) => {
      for (const c of CAMINHOS) {
        await rm(path.join(root, c), { recursive: true, force: true })
        await cp(path.join(snapshot, c), path.join(root, c), { recursive: true }).catch(() => {})
      }
      await log(`Sincronização descartada (${motivo}). O site continua como estava.`)
    }

    try {
      await run(process.execPath, [path.join(__dirname, 'sync-from-lc-manager.mjs')], {
        cwd: root,
        maxBuffer: 64 * 1024 * 1024,
        timeout: 10 * 60 * 1000,
      })
    } catch (err) {
      await restaurar(`erro no sync: ${String(err.stderr || err.message).split('\n')[0]}`)
      return
    }

    const depois = await contarViagens()
    if (depois === 0 || (antes >= 2 && depois < antes / 2)) {
      await restaurar(`vieram ${depois} viagens, havia ${antes} — parece falha, não edição`)
      return
    }

    await git('add', '-A', '--', ...CAMINHOS)
    const mudancas = await git('status', '--porcelain', '--', ...CAMINHOS)
    if (!mudancas) {
      if (!DRY && (await pendentesParaEnviar())) await enviar()
      return // nada mudou no LC Manager desde a última vez
    }

    const arquivos = mudancas.split('\n').length
    if (DRY) {
      await git('reset', '-q', '--', ...CAMINHOS)
      await log(`[teste] ${arquivos} arquivo(s) mudariam. Nada foi enviado.`)
      return
    }

    await git(
      'commit',
      '--only',
      '-m',
      `Atualiza viagens do LC Manager (automático, ${depois} ${depois === 1 ? 'viagem' : 'viagens'})`,
      '--',
      ...CAMINHOS,
    )
    await enviar()
    await log(`Publicado: ${arquivos} arquivo(s) alterados, ${depois} viagens. O Netlify atualiza o site em 1–2 min.`)
  } catch (err) {
    await log(`Erro: ${String(err.stderr || err.message || err).split('\n').slice(0, 3).join(' | ')}`)
    process.exitCode = 1
  } finally {
    await rm(snapshot, { recursive: true, force: true }).catch(() => {})
    await unlink(LOCK).catch(() => {})
  }
}

main()
