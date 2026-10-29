import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[60svh] flex-col items-start justify-center py-16">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">404</p>
      <h1 className="mt-3 font-display text-4xl tracking-tight">Página não encontrada</h1>
      <p className="mt-3 max-w-md text-ink-soft">
        Esse destino não está no roteiro. Volte ao início ou veja as próximas viagens.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className="btn btn-primary">
          Início
        </Link>
        <Link href="/viagens" className="btn border border-line bg-surface">
          Ver viagens
        </Link>
      </div>
    </div>
  )
}
