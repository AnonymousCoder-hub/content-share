'use client'

import { useState, useEffect, useCallback } from 'react'

export interface FavoriteItem {
  id: number
  title: string
  posterPath: string | null
  mediaType: 'movie' | 'tv'
  voteAverage: number
  releaseDate: string
}

const FAVORITES_KEY = 'fireflix-favorites'

export function useFavorites() {
  const [items, setItems] = useState<FavoriteItem[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load favorites from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY)
      if (stored) {
        setItems(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading favorites:', error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  const addItem = useCallback((item: FavoriteItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.id === item.id)
      if (exists) {
        return prev
      }
      const updated = [item, ...prev]
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const removeItem = useCallback((id: number) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.id !== id)
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const isFavorite = useCallback((id: number) => {
    return items.some((item) => item.id === id)
  }, [items])

  const toggleFavorite = useCallback((item: FavoriteItem) => {
    if (isFavorite(item.id)) {
      removeItem(item.id)
      return false
    } else {
      addItem(item)
      return true
    }
  }, [isFavorite, addItem, removeItem])

  const clearAll = useCallback(() => {
    setItems([])
    localStorage.removeItem(FAVORITES_KEY)
  }, [])

  return {
    items,
    addItem,
    removeItem,
    isFavorite,
    toggleFavorite,
    clearAll,
    isInitialized
  }
}
