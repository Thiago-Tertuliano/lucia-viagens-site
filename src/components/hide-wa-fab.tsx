'use client'

import { useEffect } from 'react'

/** Esconde o FAB global do WhatsApp nesta página (ex.: viagem já realizada). */
export function HideWaFab() {
  useEffect(() => {
    document.body.dataset.hideWaFab = '1'
    return () => {
      delete document.body.dataset.hideWaFab
    }
  }, [])
  return null
}
