'use client'

import { useState, useCallback } from 'react'

export interface ContinueWatchingItem {
  id: number
  title: string
  posterPath: string | null
  mediaType: 'movie' | 'tv'
  season?: number
  episode?: number
  episodeName?: string
  timestamp?: number
  progress?: number
  lastWatched: string
}

const STORAGE_KEY = 'fireflix_continue_watching'

const loadFromStorage = (): ContinueWatchingItem[] => {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as ContinueWatchingItem[]
      // Sort by last watched, most recent first
      return parsed.sort((a, b) =>
        new Date(b.lastWatched).getTime() - new Date(a.lastWatched).getTime()
      )
    }
  } catch (error) {
    console.error('Failed to load continue watching data:', error)
  }
  return []
}

export const useContinueWatching = () => {
  const [items, setItems] = useState<ContinueWatchingItem[]>(loadFromStorage)

  const addItem = useCallback((item: ContinueWatchingItem) => {
    setItems((prev) => {
      // Remove existing item with same id
      const filtered = prev.filter((i) => i.id !== item.id)

      // Add new item at the beginning
      const updated = [item, ...filtered]

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 10))) // Keep only 10 most recent
      } catch (error) {
        console.error('Failed to save continue watching data:', error)
      }

      return updated
    })
  }, [])

  const removeItem = useCallback((id: number) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== id)

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch (error) {
        console.error('Failed to remove from continue watching:', error)
      }

      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    setItems([])
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch (error) {
      console.error('Failed to clear continue watching:', error)
    }
  }, [])

  return { items, addItem, removeItem, clearAll }
}
