// Gera public/logo.png a partir do logo original em alta resolução (1024x1024).
// Recorta as margens, mantém o fundo creme original e reduz para ~600px de altura (nítido em telas retina).
import sharp from 'sharp'

const SRC = process.argv[2] ?? 'C:/Users/cllev/Desktop/Guia Campos do Jordao/fotos/logo.jpg'
const OUT = 'public/logo.png'

const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true })
const bg = [data[0], data[1], data[2]]
let x0 = Infinity
let y0 = Infinity
let x1 = 0
let y1 = 0
for (let y = 0; y < info.height; y++) {
  for (let x = 0; x < info.width; x++) {
    const i = (y * info.width + x) * info.channels
    const d = Math.abs(data[i] - bg[0]) + Math.abs(data[i + 1] - bg[1]) + Math.abs(data[i + 2] - bg[2])
    if (d > 60) {
      x0 = Math.min(x0, x)
      x1 = Math.max(x1, x)
      y0 = Math.min(y0, y)
      y1 = Math.max(y1, y)
    }
  }
}
const pad = 24
const left = Math.max(0, x0 - pad)
const top = Math.max(0, y0 - pad)
const width = Math.min(info.width, x1 + pad) - left
const height = Math.min(info.height, y1 + pad) - top

await sharp(SRC)
  .extract({ left, top, width, height })
  .resize({ height: 600, kernel: 'lanczos3' })
  .png({ compressionLevel: 9 })
  .toFile(OUT)
await sharp(OUT).webp({ quality: 92 }).toFile('public/logo.webp')
console.log('ok', { left, top, width, height })
