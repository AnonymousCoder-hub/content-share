'use client'

import { useState, useEffect, useCallback } from 'react'

export interface BookmarkItem {
  id: number
  title: string
  posterPath: string | null
  mediaType: 'movie' | 'tv'
  voteAverage: number
  releaseDate: string
}

export interface BookmarkList {
  id: string
  name: string
  items: BookmarkItem[]
  createdAt: string
}

const BOOKMARKS_KEY = 'fireflix-bookmarks'

export function useBookmarks() {
  const [lists, setLists] = useState<BookmarkList[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Load bookmarks from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_KEY)
      if (stored) {
        setLists(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error)
    } finally {
      setIsInitialized(true)
    }
  }, [])

  const createList = useCallback((name: string) => {
    const newList: BookmarkList = {
      id: `list-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      items: [],
      createdAt: new Date().toISOString()
    }
    setLists((prev) => {
      const updated = [...prev, newList]
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated))
      return updated
    })
    return newList.id
  }, [])

  const deleteList = useCallback((listId: string) => {
    setLists((prev) => {
      const updated = prev.filter((list) => list.id !== listId)
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const addItemToList = useCallback((listId: string, item: BookmarkItem) => {
    setLists((prev) => {
      const updated = prev.map((list) => {
        if (list.id === listId) {
          const exists = list.items.some((i) => i.id === item.id)
          if (!exists) {
            return {
              ...list,
              items: [item, ...list.items]
            }
          }
          return list
        }
        return list
      })
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const removeItemFromList = useCallback((listId: string, itemId: number) => {
    setLists((prev) => {
      const updated = prev.map((list) => {
        if (list.id === listId) {
          return {
            ...list,
            items: list.items.filter((i) => i.id !== itemId)
          }
        }
        return list
      })
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const isItemInList = useCallback((listId: string, itemId: number) => {
    const list = lists.find((l) => l.id === listId)
    return list ? list.items.some((i) => i.id === itemId) : false
  }, [lists])

  const removeItemFromAllLists = useCallback((itemId: number) => {
    setLists((prev) => {
      const updated = prev.map((list) => ({
        ...list,
        items: list.items.filter((i) => i.id !== itemId)
      }))
      localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearAll = useCallback(() => {
    setLists([])
    localStorage.removeItem(BOOKMARKS_KEY)
  }, [])

  return {
    lists,
    createList,
    deleteList,
    addItemToList,
    removeItemFromList,
    isItemInList,
    removeItemFromAllLists,
    clearAll,
    isInitialized
  }
}
