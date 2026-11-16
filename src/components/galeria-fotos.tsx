'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { Foto } from '@/lib/types'

/**
 * Grade de fotos com visualização ampliada (dialog nativo: Esc fecha, foco preso, leitor de tela ok).
 * A primeira foto ganha destaque quando há mais de três.
 */
export function GaleriaFotos({ fotos, titulo }: { fotos: Foto[]; titulo: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [atual, setAtual] = useState<number | null>(null)

  const abrir = (i: number) => {
    setAtual(i)
    dialogRef.current?.showModal()
  }
  const fechar = useCallback(() => {
    dialogRef.current?.close()
    setAtual(null)
  }, [])
  const ir = useCallback(
    (delta: number) => {
      setAtual((i) => (i == null ? i : (i + delta + fotos.length) % fotos.length))
    },
    [fotos.length],
  )

  useEffect(() => {
    if (atual == null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') ir(1)
      if (e.key === 'ArrowLeft') ir(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [atual, ir])

  if (fotos.length === 0) return null
  const foto = atual != null ? fotos[atual] : null
  const destaque = fotos.length > 3

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {fotos.map((f, i) => (
          <li
            key={`${f.src}-${i}`}
            className={destaque && i === 0 ? 'col-span-2 row-span-2' : undefined}
          >
            <button
              type="button"
              onClick={() => abrir(i)}
              className="media-zoom block size-full overflow-hidden bg-bg-deep"
              aria-label={`Ampliar foto ${i + 1} de ${fotos.length}: ${titulo}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={f.src}
                alt={f.legenda || `${titulo}, foto ${i + 1}`}
                className={`size-full object-cover ${
                  destaque && i === 0 ? 'aspect-square' : 'aspect-[4/3]'
                }`}
                loading={i < 2 ? 'eager' : 'lazy'}
              />
            </button>
          </li>
        ))}
      </ul>

      <dialog
        ref={dialogRef}
        onClose={() => setAtual(null)}
        onClick={(e) => {
          if (e.target === dialogRef.current) fechar()
        }}
        aria-label={`Fotos de ${titulo}`}
        className="m-auto max-h-[100dvh] max-w-[100vw] bg-transparent p-0 backdrop:bg-navy-deep/90"
      >
        {foto && (
          <div className="relative flex h-[100dvh] w-[100vw] items-center justify-center p-4 md:p-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={foto.src}
              alt={foto.legenda || `${titulo}, foto ${(atual ?? 0) + 1}`}
              className="max-h-full max-w-full object-contain"
            />
            <button
              type="button"
              onClick={fechar}
              aria-label="Fechar"
              className="absolute right-4 top-4 flex size-11 items-center justify-center rounded-full bg-cream text-navy"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
            {fotos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => ir(-1)}
                  aria-label="Foto anterior"
                  className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-navy md:left-6"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M15 5l-7 7 7 7" />
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => ir(1)}
                  aria-label="Próxima foto"
                  className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-cream text-navy md:right-6"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </button>
                <p className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-cream px-3 py-1 text-sm font-semibold tabular-nums text-navy">
                  {(atual ?? 0) + 1} de {fotos.length}
                </p>
              </>
            )}
          </div>
        )}
      </dialog>
    </>
  )
}
