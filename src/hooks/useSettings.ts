/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'

export interface Settings {
  notificationsEnabled: boolean
  showContinueWatching: boolean
  showOriginals: boolean
  showFeaturedSpotlights: boolean
  layoutDensity: 'compact' | 'comfortable'
  imageQuality: 'original' | 'low' | 'medium'
  region: string
  showAdultContent: boolean
  defaultSort: string
  itemsPerPage: string
  categoryOrder: string[]
}

const defaultSettings: Settings = {
  notificationsEnabled: true,
  showContinueWatching: true,
  showOriginals: true,
  showFeaturedSpotlights: true,
  layoutDensity: 'comfortable',
  imageQuality: 'original',
  region: 'US',
  showAdultContent: false,
  defaultSort: 'popularity',
  itemsPerPage: '20',
  categoryOrder: ['nowPlaying', 'trending', 'popular', 'topRated', 'trendingTV', 'popularTV', 'topRatedTV'],
}

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCategoryOrder = localStorage.getItem('fireflix-category-order')
      const parsedCategoryOrder = savedCategoryOrder ? JSON.parse(savedCategoryOrder) : defaultSettings.categoryOrder

      const loadedSettings: Settings = {
        notificationsEnabled: localStorage.getItem('fireflix-notifications-enabled') !== 'false',
        showContinueWatching: localStorage.getItem('fireflix-show-continue-watching') !== 'false',
        showOriginals: localStorage.getItem('fireflix-show-originals') !== 'false',
        showFeaturedSpotlights: localStorage.getItem('fireflix-show-featured-spotlights') !== 'false',
        layoutDensity: (localStorage.getItem('fireflix-layout-density') as 'compact' | 'comfortable') || 'comfortable',
        imageQuality: (localStorage.getItem('fireflix-image-quality') as 'original' | 'low' | 'medium') || 'original',
        region: localStorage.getItem('fireflix-region') || 'US',
        showAdultContent: localStorage.getItem('fireflix-show-adult-content') === 'true',
        defaultSort: localStorage.getItem('fireflix-default-sort') || 'popularity',
        itemsPerPage: localStorage.getItem('fireflix-items-per-page') || '20',
        categoryOrder: parsedCategoryOrder,
      }
      setSettings(loadedSettings)
      setMounted(true)
    }
  }, [])

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    if (typeof window !== 'undefined') {
      if (key === 'categoryOrder' && Array.isArray(value)) {
        localStorage.setItem(`fireflix-category-order`, JSON.stringify(value))
      } else {
        localStorage.setItem(`fireflix-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, String(value))
      }
      setSettings(prev => ({ ...prev, [key]: value }))
    }
  }

  return { settings, updateSetting, mounted }
}
