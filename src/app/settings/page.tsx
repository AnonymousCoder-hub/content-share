/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Settings,
  Moon,
  Sun,
  Trash2,
  RefreshCw,
  Database,
  Layers,
  Sliders,
  Palette,
  Shield,
  Bell,
  Download,
  HelpCircle,
  Check,
  AlertTriangle,
  ArrowLeft,
  LayoutGrid,
  SortAsc,
  Globe,
  Zap,
  Heart,
  Clock,
  AlertCircle,
  Bookmark,
  Film,
  Sparkles,
  GripVertical,
  Upload,
  FileJson,
  Info,
  Trash
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useFavorites } from '@/hooks/useFavorites'
import { useContinueWatching } from '@/hooks/useContinueWatching'
import { useSettings } from '@/hooks/useSettings'
import { toast } from 'sonner'

export default function SettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const { lists, clearAll: clearBookmarks } = useBookmarks()
  const { items: favorites, clearAll: clearFavorites } = useFavorites()
  const { items: continueWatching, clearAll: clearContinueWatching } = useContinueWatching()
  const { settings, updateSetting, mounted: settingsMounted } = useSettings()

  const [activeTab, setActiveTab] = useState<'general' | 'data' | 'appearance' | 'advanced'>('general')
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Settings that are not in useSettings hook (additional preferences)
  const [cacheDuration, setCacheDuration] = useState('3600')
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true)
  const [crashReportsEnabled, setCrashReportsEnabled] = useState(true)
  const [draggingCategory, setDraggingCategory] = useState<number | null>(null)

  // Import Players state
  const [jsonInput, setJsonInput] = useState('')
  const [parsedPlayers, setParsedPlayers] = useState<any[]>([])
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(new Set())
  const [showFormatGuide, setShowFormatGuide] = useState(false)
  const [importedPlayers, setImportedPlayers] = useState<any[]>([])

  // Load imported players on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('importedPlayers')
        if (saved) {
          setImportedPlayers(JSON.parse(saved))
        }
      } catch (error) {
        console.error('Error loading imported players:', error)
      }
    }
  }, [])

  // Define available categories
  const availableCategories = [
    { id: 'nowPlaying', name: 'Now Playing', icon: '🎬' },
    { id: 'trending', name: 'Trending Movies', icon: '🔥' },
    { id: 'popular', name: 'Popular Movies', icon: '⭐' },
    { id: 'topRated', name: 'Top Rated Movies', icon: '🏆' },
    { id: 'trendingTV', name: 'Trending TV Shows', icon: '📺' },
    { id: 'popularTV', name: 'Popular TV Shows', icon: '🎭' },
    { id: 'topRatedTV', name: 'Top Rated TV Shows', icon: '👑' },
  ]

  // Load settings from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCacheDuration(localStorage.getItem('fireflix-cache-duration') || '3600')
      setAnalyticsEnabled(localStorage.getItem('fireflix-analytics') !== 'false')
      setCrashReportsEnabled(localStorage.getItem('fireflix-crash-reports') !== 'false')
    }
    setMounted(true)
  }, [])

  // Reorder categories
  const handleDragStart = (index: number) => {
    setDraggingCategory(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = (targetIndex: number) => {
    if (draggingCategory === null || draggingCategory === targetIndex) return

    const newOrder = [...settings.categoryOrder]
    const [removed] = newOrder.splice(draggingCategory, 1)
    newOrder.splice(targetIndex, 0, removed)

    updateSetting('categoryOrder', newOrder)
    setDraggingCategory(null)
    toast.success('Category order updated')
  }

  // Wait for both local mounted and settingsMounted states
  if (!mounted || !settingsMounted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  const handleClearBookmarks = () => {
    clearBookmarks()
    toast.success('All bookmarks cleared')
  }

  const handleClearFavorites = () => {
    clearFavorites()
    toast.success('All favorites cleared')
  }

  const handleClearContinueWatching = () => {
    clearContinueWatching()
    toast.success('Continue watching cleared')
  }

  const handleClearCustomSources = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('customSources')
    }
    toast.success('Custom sources cleared')
  }

  const handleClearAllData = () => {
    handleClearBookmarks()
    handleClearFavorites()
    handleClearContinueWatching()
    handleClearCustomSources()
    setShowClearAllConfirm(false)
    toast.success('All data cleared successfully')
  }

  // Import Players handlers
  const handleParseJson = () => {
    try {
      const parsed = JSON.parse(jsonInput)
      const players = Array.isArray(parsed) ? parsed : [parsed]
      setParsedPlayers(players)
      setSelectedPlayers(new Set())
      toast.success(`Successfully parsed ${players.length} player(s)`)
    } catch (error) {
      toast.error('Invalid JSON format. Please check your input.')
      console.error('JSON Parse Error:', error)
    }
  }

  const handleImportPlayer = (player: any, index: number) => {
    try {
      // Check if player already exists
      const exists = importedPlayers.some(p => p.name === player.name)
      if (exists) {
        toast.error(`"${player.name}" is already imported`)
        return
      }

      const newPlayer = {
        id: `imported-${Date.now()}-${index}`,
        name: player.name,
        movieUrl: player.movieUrl || player.url || '',
        tvUrl: player.tvUrl || player.url || '',
        useSandbox: player.useSandbox || false,
        source: 'imported'
      }

      const updated = [...importedPlayers, newPlayer]
      setImportedPlayers(updated)
      localStorage.setItem('importedPlayers', JSON.stringify(updated))
      toast.success(`Imported "${player.name}"`)
    } catch (error) {
      toast.error('Failed to import player')
      console.error('Import Error:', error)
    }
  }

  const handleImportSelected = () => {
    selectedPlayers.forEach(index => {
      handleImportPlayer(parsedPlayers[index], index)
    })
    setSelectedPlayers(new Set())
  }

  const handleImportAll = () => {
    try {
      // Import all players in a single batch to avoid state update conflicts
      const newPlayers = parsedPlayers
        .filter(player => !importedPlayers.some(p => p.name === player.name))
        .map((player, index) => ({
          id: `imported-${Date.now()}-${index}`,
          name: player.name,
          movieUrl: player.movieUrl || player.url || '',
          tvUrl: player.tvUrl || player.url || '',
          useSandbox: player.useSandbox || false,
          source: 'imported'
        }))

      if (newPlayers.length === 0) {
        toast.error('All players are already imported')
        return
      }

      const updated = [...importedPlayers, ...newPlayers]
      setImportedPlayers(updated)
      localStorage.setItem('importedPlayers', JSON.stringify(updated))
      toast.success(`Imported ${newPlayers.length} player(s)`)
    } catch (error) {
      toast.error('Failed to import players')
      console.error('Import All Error:', error)
    }
  }

  const handleDeleteImportedPlayer = (id: string) => {
    try {
      const updated = importedPlayers.filter(p => p.id !== id)
      setImportedPlayers(updated)
      localStorage.setItem('importedPlayers', JSON.stringify(updated))
      toast.success('Player deleted')
    } catch (error) {
      toast.error('Failed to delete player')
    }
  }

  const handleClearAllImported = () => {
    setImportedPlayers([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('importedPlayers')
    }
    toast.success('All imported players cleared')
  }

  const togglePlayerSelection = (index: number) => {
    const newSelected = new Set(selectedPlayers)
    if (newSelected.has(index)) {
      newSelected.delete(index)
    } else {
      newSelected.add(index)
    }
    setSelectedPlayers(newSelected)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-8 pb-12">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-accent hover:scale-110 active:scale-95 transition-all duration-200 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold flex items-center gap-3">
                <Settings className="w-8 h-8" />
                Settings
              </h1>
              <p className="text-muted-foreground mt-1">
                Customize your FireFlix experience
              </p>
            </div>
          </motion.div>

          {/* Settings Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Navigation */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="lg:col-span-1"
            >
              <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-4">
                <nav className="space-y-2">
                  <Button
                    variant={activeTab === 'general' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('general')}
                    className="w-full justify-start"
                  >
                    <LayoutGrid className="w-4 h-4 mr-2" />
                    General
                  </Button>
                  <Button
                    variant={activeTab === 'data' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('data')}
                    className="w-full justify-start"
                  >
                    <Database className="w-4 h-4 mr-2" />
                    Data Management
                  </Button>
                  <Button
                    variant={activeTab === 'appearance' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('appearance')}
                    className="w-full justify-start"
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Appearance
                  </Button>
                  <Button
                    variant={activeTab === 'advanced' ? 'default' : 'ghost'}
                    onClick={() => setActiveTab('advanced')}
                    className="w-full justify-start"
                  >
                    <Sliders className="w-4 h-4 mr-2" />
                    Advanced
                  </Button>
                </nav>
              </div>
            </motion.div>

            {/* Content Area */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="lg:col-span-3 space-y-6"
            >
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5" />
                      General Settings
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Bell className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <Label htmlFor="notifications">Notifications</Label>
                            <p className="text-sm text-muted-foreground">Receive updates about new content</p>
                          </div>
                        </div>
                        <Switch
                          id="notifications"
                          checked={settings.notificationsEnabled}
                          onCheckedChange={(checked) => {
                            updateSetting('notificationsEnabled', checked)
                            toast.success(checked ? 'Notification bell enabled' : 'Notification bell disabled')
                          }}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <Layers className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <Label htmlFor="showContinueWatching">Show Continue Watching</Label>
                            <p className="text-sm text-muted-foreground">Display continue watching section on homepage</p>
                          </div>
                        </div>
                        <Switch
                          id="showContinueWatching"
                          checked={settings.showContinueWatching}
                          onCheckedChange={(checked) => {
                            updateSetting('showContinueWatching', checked)
                            toast.success(checked ? 'Continue Watching shown' : 'Continue Watching hidden')
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <Globe className="w-5 h-5" />
                      Content Region
                    </h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="region">Content Region</Label>
                        <p className="text-sm text-muted-foreground">
                          Filter movies and shows based on your region. This affects content availability, 
                          release dates, ratings, and shows content popular in your country.
                        </p>
                        <select
                          id="region"
                          className="w-full bg-background border border-input rounded-md px-3 py-2"
                          value={settings.region}
                          onChange={(e) => {
                            updateSetting('region', e.target.value)
                            toast.success('Region preference saved. Content will reload.')
                          }}
                        >
                          <option value="US">United States</option>
                          <option value="GB">United Kingdom</option>
                          <option value="CA">Canada</option>
                          <option value="AU">Australia</option>
                          <option value="IN">India</option>
                          <option value="DE">Germany</option>
                          <option value="FR">France</option>
                          <option value="JP">Japan</option>
                          <option value="BR">Brazil</option>
                          <option value="ES">Spain</option>
                          <option value="IT">Italy</option>
                          <option value="KR">South Korea</option>
                          <option value="MX">Mexico</option>
                          <option value="RU">Russia</option>
                          <option value="CN">China</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <LayoutGrid className="w-5 h-5" />
                      Homepage Customization
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                            <Film className="w-5 h-5 text-purple-500" />
                          </div>
                          <div>
                            <Label htmlFor="showOriginals">Show Originals Section</Label>
                            <p className="text-sm text-muted-foreground">Display FireFlix Originals on homepage</p>
                          </div>
                        </div>
                        <Switch
                          id="showOriginals"
                          checked={settings.showOriginals}
                          onCheckedChange={(checked) => {
                            updateSetting('showOriginals', checked)
                            toast.success(checked ? 'Originals section shown' : 'Originals section hidden')
                          }}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-yellow-500" />
                          </div>
                          <div>
                            <Label htmlFor="showFeaturedSpotlights">Show Featured Spotlights</Label>
                            <p className="text-sm text-muted-foreground">Display large featured content cards</p>
                          </div>
                        </div>
                        <Switch
                          id="showFeaturedSpotlights"
                          checked={settings.showFeaturedSpotlights}
                          onCheckedChange={(checked) => {
                            updateSetting('showFeaturedSpotlights', checked)
                            toast.success(checked ? 'Featured spotlights shown' : 'Featured spotlights hidden')
                          }}
                        />
                      </div>
                      <Separator />
                      <div className="space-y-2">
                        <Label htmlFor="layoutDensity">Layout Density</Label>
                        <p className="text-sm text-muted-foreground mb-2">Adjust spacing between content sections</p>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant={settings.layoutDensity === 'compact' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              updateSetting('layoutDensity', 'compact')
                              toast.success('Compact layout selected')
                            }}
                            className="h-auto py-3"
                          >
                            <div className="flex flex-col items-center gap-1">
                              <LayoutGrid className="w-4 h-4" />
                              <span className="text-xs">Compact</span>
                            </div>
                          </Button>
                          <Button
                            variant={settings.layoutDensity === 'comfortable' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => {
                              updateSetting('layoutDensity', 'comfortable')
                              toast.success('Comfortable layout selected')
                            }}
                            className="h-auto py-3"
                          >
                            <div className="flex flex-col items-center gap-1">
                              <LayoutGrid className="w-4 h-4" />
                              <span className="text-xs">Comfortable</span>
                            </div>
                          </Button>
                        </div>
                      </div>
                      <Separator />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <GripVertical className="w-5 h-5 text-muted-foreground" />
                          <Label>Category Order</Label>
                        </div>
                        <p className="text-sm text-muted-foreground ml-7">Drag to reorder categories on the homepage</p>
                        <div className="space-y-2 ml-7">
                          {settings.categoryOrder.map((categoryId, index) => {
                            const category = availableCategories.find(c => c.id === categoryId)
                            if (!category) return null
                            return (
                              <div
                                key={category.id}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={handleDragOver}
                                onDrop={() => handleDrop(index)}
                                className={`
                                  relative flex items-center justify-between px-4 py-3 
                                  bg-background/80 backdrop-blur-sm border border-border/50
                                  rounded-lg cursor-move transition-all duration-200
                                  hover:border-primary/50 hover:scale-[1.02]
                                  ${draggingCategory === index ? 'opacity-50 scale-95' : 'opacity-100'}
                                `}
                              >
                                <div className="flex items-center gap-3">
                                  <span className="text-lg">{category.icon}</span>
                                  <span className="font-medium">{category.name}</span>
                                </div>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-1.5 opacity-40">
                                  <div className="w-4 h-0.5 bg-current rounded-full" />
                                  <div className="w-4 h-0.5 bg-current rounded-full" />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-6">
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                    <h2 className="textxl font-semibold mb-6 flex items-center gap-2">
                      <Database className="w-5 h-5" />
                      Data Management
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                            <Bookmark className="w-5 h-5 text-red-500" />
                          </div>
                          <div>
                            <Label>Bookmarks</Label>
                            <p className="text-sm text-muted-foreground">{clearBookmarks ? `${clearBookmarks.length} lists` : 'Loading...'}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearBookmarks}
                          disabled={!clearBookmarks || clearBookmarks.length === 0}
                          className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear All Bookmarks
                        </Button>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-pink-500/10 flex items-center justify-center">
                            <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />
                          </div>
                          <div>
                            <Label>Favorites</Label>
                            <p className="text-sm text-muted-foreground">{clearFavorites ? `${clearFavorites.length} items` : 'Loading...'}</p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearFavorites}
                          disabled={!clearFavorites || clearFavorites.length === 0}
                          className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear All Favorites
                        </Button>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <Clock className="w-5 h-5 text-blue-500" />
                          </div>
                          <div>
                            <Label>Continue Watching</Label>
                            <p className="text-sm text-muted-foreground">
                              {clearContinueWatching ? `${clearContinueWatching.length} items` : 'Loading...'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleClearContinueWatching}
                          disabled={!clearContinueWatching || clearContinueWatching.length === 0}
                          className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all duration-200"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Clear History
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <Layers className="w-5 h-5" />
                      Custom Sources
                    </h2>
                    <div className="space-y-4">
                      <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          Custom video sources you've added to the player selector are stored locally in your browser.
                        </AlertDescription>
                      </Alert>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleClearCustomSources}
                        className="hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-all duration-200"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Clear All Custom Sources
                      </Button>
                    </div>
                  </div>

                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-semibold flex items-center gap-2">
                        <Upload className="w-5 h-5 text-purple-500" />
                        Import Players
                      </h2>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowFormatGuide(!showFormatGuide)}
                        className="text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                      >
                        <Info className="w-4 h-4 mr-2" />
                        Format Guide
                      </Button>
                    </div>

                    {showFormatGuide && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mb-6 bg-purple-500/10 border border-purple-500/30 rounded-xl p-4"
                      >
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-purple-400">
                            <FileJson className="w-4 h-4" />
                            <h3 className="font-semibold">JSON Format Guide</h3>
                          </div>
                          <div className="space-y-2 text-sm">
                            <p className="text-white/80">Paste this JSON format to import multiple players:</p>
                            <pre className="bg-black/30 p-3 rounded-lg overflow-x-auto text-xs">
{`[
  {
    "name": "Player Name",
    "movieUrl": "https://example.com/movie/{imdb_id}",
    "tvUrl": "https://example.com/tv/{imdb_id}/{season}/{episode}",
    "useSandbox": false
  }
]`}
                            </pre>
                            <div className="text-xs text-white/60 space-y-1">
                              <p><strong>Available Variables:</strong></p>
                              <p>• {"{imdb_id}"} - IMDB ID (e.g., tt1234567)</p>
                              <p>• {"{tmdb_id}"} - TMDB ID (e.g., 12345)</p>
                              <p>• {"{season}"} - Season number (TV only)</p>
                              <p>• {"{episode}"} - Episode number (TV only)</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <Label>Paste JSON</Label>
                        <textarea
                          value={jsonInput}
                          onChange={(e) => setJsonInput(e.target.value)}
                          placeholder='[{"name": "My Player", "movieUrl": "...", "tvUrl": "...", "useSandbox": false}]'
                          className="w-full min-h-[120px] bg-background border border-input rounded-lg p-3 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                        />
                      </div>

                      {parsedPlayers.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <Label>Parsed Players ({parsedPlayers.length})</Label>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={handleImportSelected}
                                disabled={selectedPlayers.size === 0}
                                className="text-xs"
                              >
                                Import Selected ({selectedPlayers.size})
                              </Button>
                              <Button
                                size="sm"
                                onClick={handleImportAll}
                                className="bg-purple-500 hover:bg-purple-600 text-xs"
                              >
                                Import All
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {parsedPlayers.map((player, index) => (
                              <div
                                key={index}
                                onClick={() => togglePlayerSelection(index)}
                                className={`flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer ${
                                  selectedPlayers.has(index)
                                    ? 'bg-purple-500/20 border-purple-500/50'
                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${
                                    selectedPlayers.has(index)
                                      ? 'bg-purple-500 border-purple-500'
                                      : 'border-white/30'
                                  }`}>
                                    {selectedPlayers.has(index) && <Check className="w-3 h-3 text-white" />}
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm">{player.name}</div>
                                    <div className="text-xs text-white/50 mt-1">
                                      {player.movieUrl ? '🎬 Movie' : ''} {player.tvUrl ? '📺 TV' : ''}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleImportPlayer(player, index)
                                  }}
                                  className="bg-green-500/20 hover:bg-green-500/30 text-green-400 border-green-500/50 text-xs"
                                >
                                  Import
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={handleParseJson}
                          disabled={!jsonInput.trim()}
                          className="flex-1"
                        >
                          <FileJson className="w-4 h-4 mr-2" />
                          Parse JSON
                        </Button>
                        <Button
                          variant="ghost"
                          onClick={() => {
                            setJsonInput('')
                            setParsedPlayers([])
                            setSelectedPlayers(new Set())
                          }}
                          disabled={!jsonInput && !parsedPlayers.length}
                        >
                          Clear
                        </Button>
                      </div>

                      {importedPlayers.length > 0 && (
                        <div className="pt-4 border-t border-white/10">
                          <div className="flex items-center justify-between mb-3">
                            <Label>Imported Players ({importedPlayers.length})</Label>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleClearAllImported}
                              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                            >
                              Clear All
                            </Button>
                          </div>
                          <div className="space-y-2 max-h-[200px] overflow-y-auto">
                            {importedPlayers.map((player) => (
                              <div
                                key={player.id}
                                className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                    <Check className="w-4 h-4 text-green-400" />
                                  </div>
                                  <div>
                                    <div className="font-medium text-sm text-green-400">{player.name}</div>
                                    <div className="text-xs text-white/50 mt-1">
                                      {player.movieUrl ? '🎬 Movie' : ''} {player.tvUrl ? '📺 TV' : ''}
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteImportedPlayer(player.id)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                                >
                                  <Trash className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-orange-500" />
                      Danger Zone
                    </h2>
                    <div className="space-y-4">
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          This action cannot be undone. All your data will be permanently deleted.
                        </AlertDescription>
                      </Alert>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setShowClearAllConfirm(true)}
                        className="w-full"
                      >
                        <Database className="w-4 h-4 mr-2" />
                        Clear All Data
                      </Button>
                    </div>
                  </div>

                  {showClearAllConfirm && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                      <div className="bg-card border-border rounded-2xl p-6 max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">Clear All Data</h3>
                        <p className="text-muted-foreground mb-6">
                          Are you sure you want to permanently delete all your data? This includes bookmarks, favorites, continue watching history, and custom sources. This action cannot be undone.
                        </p>
                        <div className="flex gap-3 justify-end">
                          <Button
                            variant="outline"
                            onClick={() => setShowClearAllConfirm(false)}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="destructive"
                            onClick={handleClearAllData}
                          >
                            Yes, Clear All
                          </Button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <Palette className="w-5 h-5" />
                      Theme
                    </h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full ${theme === 'dark' ? 'bg-blue-500/10' : 'bg-orange-500/10'} flex items-center justify-center`}>
                            {theme === 'dark' ? <Moon className="w-5 h-5 text-blue-500" /> : <Sun className="w-5 h-5 text-orange-500" />}
                          </div>
                          <div>
                            <Label htmlFor="theme">Appearance Mode</Label>
                            <p className="text-sm text-muted-foreground">
                              {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                            </p>
                          </div>
                        </div>
                        <Switch
                          id="theme"
                          checked={theme === 'dark'}
                          onCheckedChange={(checked) => {
                            setTheme(checked ? 'dark' : 'light')
                            toast.success(`Switched to ${checked ? 'dark' : 'light'} mode`)
                          }}
                        />
                      </div>

                      <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Dark Theme</p>
                              <p className="text-xs text-muted-foreground">Deep dark background with light text</p>
                            </div>
                            <Button
                              variant={theme === 'dark' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setTheme('dark')}
                            >
                              <Moon className="w-4 h-4 mr-2" />
                              {theme === 'dark' ? 'Active' : 'Switch'}
                            </Button>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">Light Theme</p>
                              <p className="text-xs text-muted-foreground">Light background with dark text</p>
                            </div>
                            <Button
                              variant={theme === 'light' ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => setTheme('light')}
                            >
                              <Sun className="w-4 h-4 mr-2" />
                              {theme === 'light' ? 'Active' : 'Switch'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <SortAsc className="w-5 h-5" />
                      Content Preferences
                    </h2>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="defaultSort">Default Sort Order</Label>
                        <select
                          id="defaultSort"
                          className="w-full bg-background border border-input rounded-md px-3 py-2"
                          value={settings.defaultSort}
                          onChange={(e) => {
                            updateSetting('defaultSort', e.target.value)
                            toast.success('Default sort order saved')
                          }}
                        >
                          <option value="popularity">Popularity</option>
                          <option value="rating">Rating</option>
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="revenue">Revenue</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="itemsPerPage">Items Per Page</Label>
                        <select
                          id="itemsPerPage"
                          className="w-full bg-background border border-input rounded-md px-3 py-2"
                          value={settings.itemsPerPage}
                          onChange={(e) => {
                            updateSetting('itemsPerPage', e.target.value)
                            toast.success('Items per page saved')
                          }}
                        >
                          <option value="12">12 items</option>
                          <option value="20">20 items</option>
                          <option value="24">24 items</option>
                          <option value="36">36 items</option>
                          <option value="48">48 items</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <Label htmlFor="showAdultContent">Show Adult Content</Label>
                          <p className="text-sm text-muted-foreground">Include R-rated content in results</p>
                        </div>
                        <Switch
                          id="showAdultContent"
                          checked={settings.showAdultContent}
                          onCheckedChange={(checked) => {
                            updateSetting('showAdultContent', checked)
                            toast.success(checked ? 'Adult content enabled' : 'Adult content disabled')
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'advanced' && (
                <div className="space-y-6">
                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                    <h2 className="textxl font-semibold mb-6 flex items-center gap-2">
                      <Sliders className="w-5 h-5" />
                      Advanced Settings
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <Label htmlFor="cache">Cache Duration</Label>
                          <p className="text-sm text-muted-foreground">How long to cache API responses</p>
                        </div>
                        <select
                          id="cache"
                          className="bg-background border border-input rounded-md px-3 py-2 text-sm"
                          value={cacheDuration}
                          onChange={(e) => {
                            setCacheDuration(e.target.value)
                            saveSetting('cache-duration', e.target.value)
                            toast.success('Cache duration updated')
                          }}
                        >
                          <option value="0">Don't Cache</option>
                          <option value="1800">30 Minutes</option>
                          <option value="3600">1 Hour (Default)</option>
                          <option value="7200">2 Hours</option>
                          <option value="14400">4 Hours</option>
                          <option value="28800">8 Hours</option>
                        </select>
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <Label htmlFor="quality">Image Quality</Label>
                          <p className="text-sm text-muted-foreground">Higher quality uses more bandwidth</p>
                        </div>
                        <select
                          id="quality"
                          className="bg-background border border-input rounded-md px-3 py-2 text-sm"
                          value={settings.imageQuality}
                          onChange={(e) => {
                            updateSetting('imageQuality', e.target.value as 'original' | 'low' | 'medium')
                            toast.success('Image quality updated')
                          }}
                        >
                          <option value="original">Original Quality</option>
                          <option value="low">Low Quality (Fast)</option>
                          <option value="medium">Medium Quality</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Privacy & Security
                    </h2>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <Label htmlFor="analytics">Analytics</Label>
                          <p className="text-sm text-muted-foreground">Help improve FireFlix</p>
                        </div>
                        <Switch
                          id="analytics"
                          checked={analyticsEnabled}
                          onCheckedChange={(checked) => {
                            setAnalyticsEnabled(checked)
                            saveSetting('analytics', checked)
                            toast.success(checked ? 'Analytics enabled' : 'Analytics disabled')
                          }}
                        />
                      </div>
                      <Separator />
                      <div className="flex items-center justify-between py-3">
                        <div>
                          <Label htmlFor="crashReports">Error Reports</Label>
                          <p className="text-sm text-muted-foreground">Send anonymous crash data</p>
                        </div>
                        <Switch
                          id="crashReports"
                          checked={crashReportsEnabled}
                          onCheckedChange={(checked) => {
                            setCrashReportsEnabled(checked)
                            saveSetting('crash-reports', checked)
                            toast.success(checked ? 'Crash reports enabled' : 'Crash reports disabled')
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                    <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                      <Download className="w-5 h-5" />
                      Export Data
                    </h2>
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Download your data as a JSON file for backup or migration purposes.
                      </p>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          const data = {
                            bookmarks: localStorage.getItem('fireflix-bookmarks'),
                            favorites: localStorage.getItem('fireflix-favorites'),
                            continueWatching: localStorage.getItem('fireflix_continue_watching'),
                            customSources: localStorage.getItem('customSources'),
                            timestamp: new Date().toISOString()
                          }
                          const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a')
                          a.href = url
                          a.download = `fireflix-backup-${new Date().toISOString().split('T')[0]}.json`
                          a.click()
                          URL.revokeObjectURL(url)
                          toast.success('Data exported successfully')
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export All Data
                      </Button>
                    </div>
                  </div>

                  <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6">
                    <h2 className="xl font-semibold mb-6 flex items-center gap-2">
                      <HelpCircle className="w-5 h-5" />
                      About
                    </h2>
                    <div className="space-y-4 text-sm text-muted-650">
                      <p className="mb-4">
                        <strong>FireFlix v2.0</strong>
                      </p>
                      <p className="mb-2">
                        A modern streaming platform that lets you discover and watch movies and TV shows from TMDB.
                      </p>
                      <p className="mb-4">
                        Data provided by <a href="https://www.themoviedb.org" target="_blank" className="text-primary hover:underline">TMDB</a>.
                      </p>
                      <p>
                        This project is open source and available on <a href="https://github.com/AnonymousCoder-hub/fireflix_v2" target="_blank" className="text-primary hover:underline">GitHub</a>.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/30 mt-12">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <img src="/logo.png" alt="FireFlix" className="w-10 h-10 rounded-xl" />
                <span className="text-2xl font-bold">FireFlix</span>
              </div>
              <p className="text-muted-foreground max-w-md">
                Your ultimate destination for watching movies and TV shows online.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">Trending</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Popular</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Top Rated</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Coming Soon</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-650">
            <p>&copy; 2026 FireFlix. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
