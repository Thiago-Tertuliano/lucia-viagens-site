// Baixa as fontes (Syne e Manrope, subset latin) do Google Fonts para src/fonts/.
// O site usa next/font/local: o build não depende mais do Google estar respondendo no formato esperado.
import { mkdir, writeFile } from 'node:fs/promises'

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
const FAMILIAS = [
  { nome: 'Syne', pesos: [500, 600, 700, 800] },
  { nome: 'Manrope', pesos: [400, 500, 600, 700] },
]

await mkdir('src/fonts', { recursive: true })
for (const { nome, pesos } of FAMILIAS) {
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?family=${nome}:wght@${pesos.join(';')}&display=swap`, {
      headers: { 'user-agent': UA },
    })
  ).text()
  const blocos = css.split('/* ').slice(1)
  for (const peso of pesos) {
    const bloco = blocos.find(
      (b) => b.startsWith('latin */') && new RegExp(`font-weight:\\s*${peso};`).test(b),
    )
    const url = bloco && /url\(([^)]+)\)/.exec(bloco)?.[1]
    if (!url) throw new Error(`Sem arquivo latin para ${nome} ${peso}`)
    const buf = Buffer.from(await (await fetch(url)).arrayBuffer())
    const destino = `src/fonts/${nome.toLowerCase()}-${peso}.woff2`
    await writeFile(destino, buf)
    console.log(destino, buf.length, buf.subarray(0, 4).toString('latin1'))
  }
}
