/** Coordenadas aproximadas de destinos frequentes (lat, lng). */
const CIDADES: Record<string, [number, number]> = {
  'foz do iguacu|pr': [-25.5163, -54.5855],
  'porto seguro|ba': [-16.4498, -39.0647],
  'gramado|rs': [-29.3788, -50.8739],
  'canela|rs': [-29.3644, -50.8135],
  'bonito|ms': [-21.1261, -56.4836],
  'campos do jordao|sp': [-22.7393, -45.5913],
  'itu|sp': [-23.2642, -47.2992],
  'embu das artes|sp': [-23.6493, -46.8522],
  'sao roque|sp': [-23.5303, -47.1354],
  'holambra|sp': [-22.6331, -47.0554],
  'paranapiacaba|sp': [-23.7778, -46.3047],
  'pedreira|sp': [-22.7419, -46.9014],
  'aguas de lindoia|sp': [-22.4767, -46.6128],
  'aguas de sao pedro|sp': [-22.5977, -47.8736],
  'santo antonio do pinhal|sp': [-22.8272, -45.6703],
  'pocos de caldas|mg': [-21.7879, -46.5614],
  'sao paulo|sp': [-23.5505, -46.6333],
  'rio de janeiro|rj': [-22.9068, -43.1729],
  'salvador|ba': [-12.9777, -38.5016],
  'brasilia|df': [-15.7975, -47.8919],
  'curitiba|pr': [-25.4284, -49.2733],
  'florianopolis|sc': [-27.5954, -48.548],
  'belo horizonte|mg': [-19.9167, -43.9345],
  'natal|rn': [-5.7945, -35.211],
  'fortaleza|ce': [-3.7319, -38.5267],
  'manaus|am': [-3.119, -60.0217],
  'recife|pe': [-8.0476, -34.877],
  'maceio|al': [-9.6498, -35.7089],
  'jericoacoara|ce': [-2.7975, -40.5137],
  'maragogi|al': [-9.0122, -35.2225],
  'caldas novas|go': [-17.7417, -48.6228],
  'aparecida|sp': [-22.8469, -45.23],
}

/** Centróides aproximados por UF (fallback). */
const UF_CENTRO: Record<string, [number, number]> = {
  AC: [-9.02, -70.81], AL: [-9.57, -36.78], AM: [-3.47, -65.1], AP: [1.41, -51.77],
  BA: [-13.29, -41.71], CE: [-5.2, -39.53], DF: [-15.78, -47.93], ES: [-19.19, -40.34],
  GO: [-15.98, -49.86], MA: [-5.42, -45.44], MG: [-18.1, -44.38], MS: [-20.51, -54.54],
  MT: [-12.64, -55.42], PA: [-3.79, -52.48], PB: [-7.28, -36.72], PE: [-8.38, -37.86],
  PI: [-6.6, -42.28], PR: [-24.89, -51.55], RJ: [-22.25, -42.66], RN: [-5.81, -36.59],
  RO: [-10.83, -63.34], RR: [1.99, -61.33], RS: [-30.17, -53.5], SC: [-27.45, -50.95],
  SE: [-10.57, -37.45], SP: [-22.19, -48.79], TO: [-9.46, -48.26],
}

const COD_UF: Record<string, string> = {
  '11': 'RO', '12': 'AC', '13': 'AM', '14': 'RR', '15': 'PA', '16': 'AP', '17': 'TO',
  '21': 'MA', '22': 'PI', '23': 'CE', '24': 'RN', '25': 'PB', '26': 'PE', '27': 'AL', '28': 'SE', '29': 'BA',
  '31': 'MG', '32': 'ES', '33': 'RJ', '35': 'SP',
  '41': 'PR', '42': 'SC', '43': 'RS',
  '50': 'MS', '51': 'MT', '52': 'GO', '53': 'DF',
}

export function ufDeCodigo(codigo: string): string | null {
  return COD_UF[codigo] ?? null
}

export function codigoDeUf(uf: string): string | null {
  const entry = Object.entries(COD_UF).find(([, sigla]) => sigla === uf.toUpperCase())
  return entry?.[0] ?? null
}

function normalizar(texto: string) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
}

export function centroUf(uf: string): [number, number] | null {
  return UF_CENTRO[uf.toUpperCase()] ?? null
}

export function coordsDestino(cidade: string | null, uf: string | null): [number, number] | null {
  if (cidade && uf) {
    const chave = `${normalizar(cidade)}|${uf.toLowerCase()}`
    if (CIDADES[chave]) return CIDADES[chave]
  }
  if (uf && UF_CENTRO[uf.toUpperCase()]) return UF_CENTRO[uf.toUpperCase()]
  return null
}
