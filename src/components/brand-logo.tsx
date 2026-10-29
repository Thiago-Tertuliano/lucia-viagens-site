import Link from 'next/link'

type Size = 'nav' | 'md' | 'footer'

const SIZES: Record<Size, { height: number; className: string }> = {
  nav: { height: 64, className: 'h-14 w-auto md:h-16' },
  md: { height: 72, className: 'h-[4.5rem] w-auto' },
  footer: { height: 72, className: 'h-[4.5rem] w-auto' },
}

export function BrandLogo({
  size = 'nav',
  href = '/',
  priority = false,
  className = '',
}: {
  size?: Size
  href?: string | null
  priority?: boolean
  className?: string
}) {
  const cfg = SIZES[size]
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png?v=4"
      alt="Lu&Cia Viagens"
      width={Math.round(cfg.height * 1.15)}
      height={cfg.height}
      className={`${cfg.className} object-contain object-left ${className}`}
      style={{ height: cfg.height, width: 'auto' }}
      {...(priority ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })}
    />
  )

  if (!href) return img
  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label="Lu&Cia Viagens — início">
      {img}
    </Link>
  )
}
