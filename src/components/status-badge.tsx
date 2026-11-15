import type { Situacao } from '@/lib/types'

const MAP: Record<Situacao, { label: string; color: string }> = {
  ABERTA: { label: 'Vagas abertas', color: 'var(--ok)' },
  CONFIRMADA: { label: 'Confirmada', color: 'var(--accent)' },
  ESGOTADA: { label: 'Esgotada', color: 'var(--warn)' },
  REALIZADA: { label: 'Realizada', color: 'var(--muted)' },
}

export function StatusBadge({
  situacao,
  tone = 'dark',
}: {
  situacao: Situacao
  tone?: 'dark' | 'light'
}) {
  const item = MAP[situacao]
  return (
    <span
      className={`inline-flex items-center gap-2 text-[0.78rem] font-semibold uppercase tracking-[0.08em] ${
        tone === 'light' ? 'text-white/90' : 'text-ink-soft'
      }`}
    >
      <span className="status-dot" style={{ background: item.color }} />
      {item.label}
    </span>
  )
}
