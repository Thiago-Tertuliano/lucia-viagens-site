import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import type { ListaViagens, Site, Viagem, ViagemResumo } from '@/lib/types'

type ViagemRaw = Partial<Viagem> & ViagemResumo

const root = path.join(process.cwd(), 'content')

async function readJson<T>(filePath: string): Promise<T> {
  const raw = await readFile(filePath, 'utf8')
  return JSON.parse(raw) as T
}

export async function getSite(): Promise<Site> {
  return readJson<Site>(path.join(root, 'site.json'))
}

export async function getViagens(): Promise<ViagemResumo[]> {
  const lista = await readJson<ListaViagens>(path.join(root, 'viagens.json'))
  return lista.viagens
}

export async function getViagem(slug: string): Promise<Viagem | null> {
  try {
    const raw = await readJson<ViagemRaw>(path.join(root, 'viagens', `${slug}.json`))
    return {
      ...raw,
      descricao: raw.descricao ?? null,
      roteiro: raw.roteiro ?? [],
      pontosTuristicos: raw.pontosTuristicos ?? [],
      inclui: raw.inclui ?? [],
      naoInclui: raw.naoInclui ?? [],
      embarque: raw.embarque ?? null,
      fotos: raw.fotos ?? [],
      whatsappLink: raw.whatsappLink ?? null,
    }
  } catch {
    return null
  }
}

export async function getAllViagemSlugs(): Promise<string[]> {
  try {
    const files = await readdir(path.join(root, 'viagens'))
    return files.filter((f) => f.endsWith('.json')).map((f) => f.replace(/\.json$/, ''))
  } catch {
    return []
  }
}

export function viagensAtivas(viagens: ViagemResumo[]) {
  return viagens
    .filter((v) => v.situacao === 'ABERTA' || v.situacao === 'ESGOTADA')
    .sort((a, b) => a.dataPartida.localeCompare(b.dataPartida))
}

export function viagensDestaque(viagens: ViagemResumo[]) {
  return viagensAtivas(viagens).filter((v) => v.destaque)
}

export function viagensRealizadas(viagens: ViagemResumo[]) {
  return viagens
    .filter((v) => v.situacao === 'REALIZADA')
    .sort((a, b) => b.dataPartida.localeCompare(a.dataPartida))
}
