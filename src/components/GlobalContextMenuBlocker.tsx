'use client'

import { useEffect } from 'react'

export default function GlobalContextMenuBlocker() {
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault()
    }

    // Add event listener to document
    document.addEventListener('contextmenu', handleContextMenu)

    // Clean up on unmount
    return () => {
      document.removeEventListener('contextmenu', handleContextMenu)
    }
  }, [])

  return null
}
