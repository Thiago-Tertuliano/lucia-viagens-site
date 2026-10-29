import * as THREE from 'three'

export type Posicao = [number, number]

export interface GeoFeature {
  properties: { codarea: string }
  geometry:
    | { type: 'Polygon'; coordinates: Posicao[][] }
    | { type: 'MultiPolygon'; coordinates: Posicao[][][] }
}

export interface BBox {
  minX: number
  maxX: number
  minY: number
  maxY: number
}

export interface Regiao {
  codigo: string
  shapes: THREE.Shape[]
  centro: Posicao
  bbox: BBox
}

const LON_CENTRO = -54
const LAT_CENTRO = -15
const ESCALA = 0.9

const mercatorY = (lat: number) =>
  (Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI) / 360)) * 180) / Math.PI

const Y_CENTRO = mercatorY(LAT_CENTRO)

export function projetar([lon, lat]: Posicao): Posicao {
  return [(lon - LON_CENTRO) * ESCALA, (mercatorY(lat) - Y_CENTRO) * ESCALA]
}

export function latLngParaMapa(lat: number, lng: number, altura = 0.7): THREE.Vector3 {
  const [x, y] = projetar([lng, lat])
  return new THREE.Vector3(x, y, altura)
}

function areaAssinada(anel: Posicao[]): number {
  let area = 0
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    area += (anel[j][0] + anel[i][0]) * (anel[j][1] - anel[i][1])
  }
  return area / 2
}

function centroide(anel: Posicao[]): Posicao {
  let cx = 0
  let cy = 0
  let a = 0
  for (let i = 0, j = anel.length - 1; i < anel.length; j = i++) {
    const f = anel[j][0] * anel[i][1] - anel[i][0] * anel[j][1]
    cx += (anel[j][0] + anel[i][0]) * f
    cy += (anel[j][1] + anel[i][1]) * f
    a += f
  }
  if (Math.abs(a) < 1e-9) return anel[0]
  return [cx / (3 * a), cy / (3 * a)]
}

export function unirCaixas(caixas: BBox[]): BBox {
  const bbox = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  for (const c of caixas) {
    if (c.minX < bbox.minX) bbox.minX = c.minX
    if (c.maxX > bbox.maxX) bbox.maxX = c.maxX
    if (c.minY < bbox.minY) bbox.minY = c.minY
    if (c.maxY > bbox.maxY) bbox.maxY = c.maxY
  }
  return bbox
}

export function construirRegiao(feature: GeoFeature): Regiao {
  const poligonos =
    feature.geometry.type === 'Polygon'
      ? [feature.geometry.coordinates]
      : feature.geometry.coordinates

  const shapes: THREE.Shape[] = []
  const bbox: BBox = { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity }
  let maiorArea = -1
  let centro: Posicao = [0, 0]

  for (const poligono of poligonos) {
    const aneis = poligono
      .map((anel) => {
        const pontos = anel.map(projetar)
        const [px, py] = pontos[0]
        const [ux, uy] = pontos[pontos.length - 1]
        if (px === ux && py === uy) pontos.pop()
        return pontos
      })
      .filter((anel) => anel.length >= 3)

    if (!aneis.length) continue
    const [externo, ...buracos] = aneis
    const shape = new THREE.Shape(externo.map(([x, y]) => new THREE.Vector2(x, y)))
    for (const buraco of buracos) {
      shape.holes.push(new THREE.Path(buraco.map(([x, y]) => new THREE.Vector2(x, y))))
    }
    shapes.push(shape)

    for (const [x, y] of externo) {
      if (x < bbox.minX) bbox.minX = x
      if (x > bbox.maxX) bbox.maxX = x
      if (y < bbox.minY) bbox.minY = y
      if (y > bbox.maxY) bbox.maxY = y
    }

    const area = Math.abs(areaAssinada(externo))
    if (area > maiorArea) {
      maiorArea = area
      centro = centroide(externo)
    }
  }

  return { codigo: feature.properties.codarea, shapes, centro, bbox }
}

export interface Enquadramento {
  pos: THREE.Vector3
  alvo: THREE.Vector3
}

/**
 * Calcula câmera (Z-up) para caber o bbox no viewport com margem.
 * Evita corte do mapa sem depender de constantes mágicas.
 */
export function enquadrarBbox(
  bbox: BBox,
  opts: { fovDeg?: number; aspect?: number; margem?: number; altura?: number } = {},
): Enquadramento {
  const fovDeg = opts.fovDeg ?? 36
  const aspect = Math.max(0.5, opts.aspect ?? 16 / 9)
  const margem = opts.margem ?? 1.28
  const altura = opts.altura ?? 0.35

  const cx = (bbox.minX + bbox.maxX) / 2
  const cy = (bbox.minY + bbox.maxY) / 2
  const w = Math.max(0.1, (bbox.maxX - bbox.minX) * margem)
  const h = Math.max(0.1, (bbox.maxY - bbox.minY) * margem)

  const halfFov = THREE.MathUtils.degToRad(fovDeg) / 2
  const distPorAltura = h / 2 / Math.tan(halfFov)
  const distPorLargura = w / 2 / Math.tan(halfFov) / aspect
  const dist = Math.max(distPorAltura, distPorLargura, 6)

  // Olhar de sul/sudoeste — mesmo padrão do LC-Manager
  return {
    pos: new THREE.Vector3(cx, cy - dist * 0.78, dist * 0.66 + altura),
    alvo: new THREE.Vector3(cx, cy, altura),
  }
}
