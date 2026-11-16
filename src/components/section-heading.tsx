export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string
  title: string
  description?: string
}) {
  return (
    <div className="mb-10 max-w-2xl space-y-3">
      {eyebrow && <p className="text-sm font-semibold text-accent">{eyebrow}</p>}
      <h2 className="font-display text-3xl leading-tight text-ink md:text-4xl">{title}</h2>
      {description && (
        <p className="text-base leading-relaxed text-ink-soft md:text-lg">{description}</p>
      )}
    </div>
  )
}
