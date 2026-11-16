import { WhatsappIcon } from '@/components/whatsapp-button'

export function WhatsappFab({ href }: { href: string | null }) {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="wa-fab"
      aria-label="Falar no WhatsApp"
    >
      <WhatsappIcon className="size-9" />
    </a>
  )
}
