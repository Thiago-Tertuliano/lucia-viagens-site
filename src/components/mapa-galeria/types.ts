export interface DestinoMapa {
  slug: string
  titulo: string
  chamada: string | null
  capa: string | null
  destino: { nome: string; cidade: string | null; uf: string | null }
  dataPartida: string
  dataRetorno: string
  lat: number
  lng: number
}
