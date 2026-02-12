'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Star, Check, ChevronDown, Play, Plus, Trash2, AlertCircle, Film, Tv, Download } from 'lucide-react'
import { toast } from 'sonner'
import CustomSourceManager, { CustomSource as CustomSourceType } from './CustomSourceManager'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

export interface Player {
  id: string
  name: string
  getUrl: (imdbId: string, tmdbId: string, mediaType: 'movie' | 'tv', season?: number, episode?: number) => string
  useSandbox: boolean
  sandboxPermissions?: string
  isCustom?: boolean
  baseUrl?: string
  mediaType?: 'movie' | 'tv' | 'both'
  isImported?: boolean
  isPublic?: boolean
}

export interface CustomSource {
  id: string
  name: string
  baseUrl: string
  useSandbox: boolean
  mediaType: 'movie' | 'tv' | 'both'
}

// Default built-in players
const builtInPlayers: Player[] = [
  {
    id: 'ezsource',
    name: 'EZsource',
    getUrl: (imdbId) => `https://lethe399key.com/play/${imdbId}`,
    useSandbox: true,
    sandboxPermissions: "allow-scripts allow-same-origin allow-presentation allow-forms"
  },
  {
    id: 'autoembed',
    name: 'AutoEmbed',
    getUrl: (imdbId, tmdbId, mediaType, season = 1, episode = 1) => {
      if (mediaType === 'tv') {
        return `https://player.autoembed.cc/embed/tv/${imdbId}/${season}/${episode}?server=15`
      }
      return `https://player.autoembed.cc/embed/movie/${imdbId}?server=15`
    },
    useSandbox: false
  },
  {
    id: 'vidsrc',
    name: 'VidSrc',
    getUrl: (imdbId, tmdbId, mediaType, season = 1, episode = 1) => {
      if (mediaType === 'tv') {
        return `https://vidsrc.cc/v2/embed/tv/${imdbId}/${season}/${episode}`
      }
      return `https://vidsrc.cc/v2/embed/movie/${imdbId}`
    },
    useSandbox: true,
    sandboxPermissions: "allow-scripts allow-same-origin allow-presentation"
  },
  {
    id: 'rivestream',
    name: 'RiveStream',
    getUrl: (imdbId, tmdbId, mediaType, season = 1, episode = 1) => {
      if (mediaType === 'tv') {
        return `https://rivestream.org/embed?type=tv&id=${tmdbId}&season=${season}&episode=${episode}`
      }
      return `https://rivestream.org/embed?type=movie&id=${tmdbId}`
    },
    useSandbox: false
  }
]

// Function to create a player from custom source
export const createPlayerFromCustomSource = (customSource: CustomSource): Player => {
  return {
    id: customSource.id,
    name: customSource.name,
    getUrl: (imdbId, tmdbId, mediaType, season = 1, episode = 1) => {
      let url = customSource.baseUrl
        .replace('{tmdb_id}', tmdbId)
        .replace('{imdb_id}', imdbId)
        .replace('{season}', season.toString())
        .replace('{episode}', episode.toString())
      return url
    },
    useSandbox: customSource.useSandbox,
    sandboxPermissions: customSource.useSandbox ? "allow-scripts allow-same-origin allow-presentation" : undefined,
    isCustom: true,
    baseUrl: customSource.baseUrl,
    mediaType: customSource.mediaType
  }
}

interface PlayerSelectorProps {
  imdbId: string
  tmdbId: string
  mediaType: 'movie' | 'tv'
  season?: number
  episode?: number
  onPlayerChange: (player: Player) => void
}

export default function PlayerSelector({
  imdbId,
  tmdbId,
  mediaType,
  season = 1,
  episode = 1,
  onPlayerChange
}: PlayerSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isCustomSourceOpen, setIsCustomSourceOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [playerToDelete, setPlayerToDelete] = useState<Player | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Helper function to deduplicate players by name and id
  const deduplicatePlayers = (players: Player[]): Player[] => {
    const seen = new Map<string, Player>()
    players.forEach(player => {
      // Use both name and id to uniquely identify players
      const key = `${player.name}-${player.id}`
      if (!seen.has(key)) {
        seen.set(key, player)
      }
    })
    return Array.from(seen.values())
  }

  // State for all players (built-in + custom + public) - load from localStorage on mount
  const [players, setPlayers] = useState<Player[]>(() => {
    try {
      const savedSources = localStorage.getItem('customSources')
      const importedSources = localStorage.getItem('importedPlayers')

      const customPlayers: Player[] = []
      const importedPlayersList: Player[] = []
      const publicPlayersList: Player[] = []

      // Load custom sources
      if (savedSources) {
        const customSourcesData: CustomSourceType[] = JSON.parse(savedSources)
        customPlayers.push(...customSourcesData.map(createPlayerFromCustomSource))
      }

      // Load ALL imported players (both manual and public from Import Players page)
      if (importedSources) {
        const imported: any[] = JSON.parse(importedSources)
        importedPlayersList.push(...imported.map((imp: any) => ({
          id: imp.id,
          name: imp.name,
          getUrl: (imdbId: string, tmdbId: string, mediaType: 'movie' | 'tv', season = 1, episode = 1) => {
            let url = ''
            if (mediaType === 'tv' && imp.tvUrl) {
              url = imp.tvUrl
                .replace('{tmdb_id}', tmdbId)
                .replace('{imdb_id}', imdbId)
                .replace('{season}', season.toString())
                .replace('{episode}', episode.toString())
            } else if (mediaType === 'movie' && imp.movieUrl) {
              url = imp.movieUrl
                .replace('{tmdb_id}', tmdbId)
                .replace('{imdb_id}', imdbId)
            } else if (imp.url) {
              url = imp.url
                .replace('{tmdb_id}', tmdbId)
                .replace('{imdb_id}', imdbId)
                .replace('{season}', season.toString())
                .replace('{episode}', episode.toString())
            }
            return url
          },
          useSandbox: imp.useSandbox || false,
          sandboxPermissions: imp.useSandbox ? "allow-scripts allow-same-origin allow-presentation" : undefined,
          isCustom: true,
          isImported: true,
          isPublic: imp.source === 'public'
        })))
      }

      // Deduplicate and combine all players
      return deduplicatePlayers([...builtInPlayers, ...customPlayers, ...importedPlayersList])
    } catch (error) {
      console.error('Error loading players from localStorage:', error)
    }
    return builtInPlayers
  })
  const [importedPlayerNames, setImportedPlayerNames] = useState<Set<string>>(new Set())

  // Initialize with saved default player or fallback to ezsource
  const [selectedPlayer, setSelectedPlayer] = useState<Player>(() => {
    const savedDefaultPlayer = typeof window !== 'undefined' ? localStorage.getItem('defaultPlayerId') : null
    const player = builtInPlayers.find((p) => p.id === savedDefaultPlayer)
    return player || builtInPlayers[0]
  })
  const [defaultPlayerId, setDefaultPlayerId] = useState<string>(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('defaultPlayerId') || 'ezsource' : 'ezsource'
  })

  const hasInitializedRef = useRef(false)

  // Notify parent of initial player (only once on mount)
  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true
      onPlayerChange(selectedPlayer)
    }
  }, [])

  // Reload custom sources and imported players when dropdown opens
  useEffect(() => {
    if (!isOpen) return

    const updatePlayers = () => {
      try {
        const savedSources = localStorage.getItem('customSources')
        const importedSources = localStorage.getItem('importedPlayers')

        const customPlayers: Player[] = []
        const importedPlayersList: Player[] = []

        // Load custom sources
        if (savedSources) {
          const customSourcesData: CustomSourceType[] = JSON.parse(savedSources)
          customPlayers.push(...customSourcesData.map(createPlayerFromCustomSource))
        }

        // Load ALL imported players
        if (importedSources) {
          const imported: any[] = JSON.parse(importedSources)
          importedPlayersList.push(...imported.map((imp: any) => ({
            id: imp.id,
            name: imp.name,
            getUrl: (imdbId: string, tmdbId: string, mediaType: 'movie' | 'tv', season = 1, episode = 1) => {
              let url = ''
              if (mediaType === 'tv' && imp.tvUrl) {
                url = imp.tvUrl
                  .replace('{tmdb_id}', tmdbId)
                  .replace('{imdb_id}', imdbId)
                  .replace('{season}', season.toString())
                  .replace('{episode}', episode.toString())
              } else if (mediaType === 'movie' && imp.movieUrl) {
                url = imp.movieUrl
                  .replace('{tmdb_id}', tmdbId)
                  .replace('{imdb_id}', imdbId)
              } else if (imp.url) {
                url = imp.url
                  .replace('{tmdb_id}', tmdbId)
                  .replace('{imdb_id}', imdbId)
                  .replace('{season}', season.toString())
                  .replace('{episode}', episode.toString())
              }
              return url
            },
            useSandbox: imp.useSandbox || false,
            sandboxPermissions: imp.useSandbox ? "allow-scripts allow-same-origin allow-presentation" : undefined,
            isCustom: true,
            isImported: true,
            isPublic: imp.source === 'public'
          })))
        }

        // Deduplicate and combine all players
        const allPlayers = deduplicatePlayers([...builtInPlayers, ...customPlayers, ...importedPlayersList])

        // Update selected player if it was deleted (check against all players)
        const currentStillExists = allPlayers.find(p => p.id === selectedPlayer.id)
        if (!currentStillExists) {
          const newPlayer = builtInPlayers[0]
          setSelectedPlayer(newPlayer)
          onPlayerChange(newPlayer)
        }

        setPlayers(allPlayers)
      } catch (error) {
        console.error('Error reloading players:', error)
      }
    }

    // Use setTimeout to avoid synchronous setState in effect
    setTimeout(updatePlayers, 0)
  }, [isOpen, mediaType])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player)
    onPlayerChange(player)
    setIsOpen(false)
  }

  const handleSetDefault = (e: React.MouseEvent, playerId: string) => {
    e.stopPropagation()
    setDefaultPlayerId(playerId)
    localStorage.setItem('defaultPlayerId', playerId)
  }

  const handleDeleteClick = function(player, e) {
    e.stopPropagation()

    if (player.isPublic) {
      // For public players, show different message
      setPlayerToDelete(player)
      setDeleteDialogOpen(true)
    } else {
      setPlayerToDelete(player)
      setDeleteDialogOpen(true)
    }
  }

  const handleDeleteConfirm = () => {
    if (!playerToDelete) return

    try {
      // All imported players (from Settings and Import Players page) are in localStorage as 'importedPlayers'
      // Custom players are in localStorage as 'customSources'
      
      if (playerToDelete.isCustom || playerToDelete.isImported) {
        // Remove from importedPlayers (handles both Settings and Import Players page imports)
        const importedSources = localStorage.getItem('importedPlayers')
        if (importedSources) {
          const imported = JSON.parse(importedSources)
          const updated = imported.filter((s: any) => s.id !== playerToDelete.id)
          localStorage.setItem('importedPlayers', JSON.stringify(updated))
        }

        // Also check customSources
        const savedSources = localStorage.getItem('customSources')
        if (savedSources) {
          const customSources: CustomSourceType[] = JSON.parse(savedSources)
          const updated = customSources.filter(s => s.id !== playerToDelete.id)
          localStorage.setItem('customSources', JSON.stringify(updated))
        }

        toast.success(`"${playerToDelete.name}" removed successfully`)
      }

      // Update state by removing the player
      setPlayers(players.filter(p => p.id !== playerToDelete.id))

      // If deleted player was selected, select first available player
      if (selectedPlayer.id === playerToDelete.id) {
        const newSelected = players.find(p => p.id !== playerToDelete.id) || builtInPlayers[0]
        setSelectedPlayer(newSelected)
        onPlayerChange(newSelected)
      }

      // If deleted player was default, reset to ezsource
      if (defaultPlayerId === playerToDelete.id) {
        setDefaultPlayerId('ezsource')
        localStorage.setItem('defaultPlayerId', 'ezsource')
      }

      setDeleteDialogOpen(false)
      setPlayerToDelete(null)
    } catch (error) {
      console.error('Error removing player:', error)
      toast.error('Failed to remove player')
    }
  }

  const handleCustomSourceAdd = (customSource: CustomSourceType) => {
    // Check for duplicate base URLs (optional - prevents adding same source twice)
    try {
      const savedSources = localStorage.getItem('customSources')
      const existingSources: CustomSourceType[] = savedSources ? JSON.parse(savedSources) : []
      const isDuplicate = existingSources.some(s => s.baseUrl === customSource.baseUrl)

      if (isDuplicate) {
        console.warn('A source with this URL already exists')
        return
      }

      // Save to localStorage
      const updatedSources = [...existingSources, customSource]
      localStorage.setItem('customSources', JSON.stringify(updatedSources))

      // Add to players list
      const newPlayer = createPlayerFromCustomSource(customSource)
      setPlayers([...players, newPlayer])

      // Select the new player and notify parent
      setSelectedPlayer(newPlayer)
      onPlayerChange(newPlayer)

      // Close the modal
      setIsCustomSourceOpen(false)
    } catch (error) {
      console.error('Error saving custom source to localStorage:', error)
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black/60 hover:bg-black/70 backdrop-blur-md text-white border border-white/20 rounded-lg px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all"
      >
        <Play className="w-4 h-4" />
        <span>{selectedPlayer.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute right-0 top-full mt-2 w-56 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 max-h-96 flex flex-col"
          >
            {/* Scrollable player list */}
            <div className="p-2 space-y-1 overflow-y-auto flex-1 scrollbar-dropdown">
              {players.map((player) => (
                <div
                  key={player.id}
                  className="relative group"
                >
                  <button
                    onClick={() => handlePlayerSelect(player)}
                    className="w-full flex items-center justify-between px-3 py-3 text-white hover:bg-white/10 transition-all duration-200 rounded-lg pr-10"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full transition-colors ${
                        selectedPlayer.id === player.id ? 'bg-green-500' : 'bg-white/30 group-hover:bg-white/50'
                      }`} />
                      <Star
                        className={`w-3.5 h-3.5 transition-all duration-200 ${
                          defaultPlayerId === player.id
                            ? 'fill-yellow-400 text-yellow-400 scale-110'
                            : 'text-white/30 group-hover:text-white/50 hover:text-yellow-400/70'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleSetDefault(e, player.id)
                        }}
                      />
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{player.name}</span>
                        {player.isCustom && (
                          <>
                            <Download className="w-3 h-3 text-blue-400" />
                            {player.mediaType && player.mediaType !== 'both' && (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/10">
                                {player.mediaType === 'movie' ? (
                                  <Film className="w-3 h-3 text-purple-400" />
                                ) : (
                                  <Tv className="w-3 h-3 text-green-400" />
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                    <Check
                      className={`w-4 h-4 transition-all duration-200 ${
                        selectedPlayer.id === player.id ? 'text-green-500 scale-100' : 'opacity-0 scale-75'
                      }`}
                    />
                  </button>

                  {/* Delete button for custom and imported sources */}
                  {player.isCustom && (
                    <button
                      onClick={(e) => handleDeleteClick(player, e)}
                      className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 text-red-400/80 hover:text-red-400 hover:bg-red-500/20 rounded-lg transition-all"
                      title="Remove this source"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Fixed bottom button */}
            <div className="p-2 border-t border-white/10 bg-black/95 backdrop-blur-xl">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsCustomSourceOpen(true)
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 transition-all duration-200 rounded-lg group border border-dashed border-white/20 hover:border-purple-500/50"
              >
                <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">Add Custom Source</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Source Manager */}
      <CustomSourceManager
        isOpen={isCustomSourceOpen}
        onClose={() => setIsCustomSourceOpen(false)}
        onSourceAdd={handleCustomSourceAdd}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-gray-900 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <span>Delete Source</span>
            </DialogTitle>
            <DialogDescription className="text-white/70">
              Are you sure you want to delete "{playerToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setPlayerToDelete(null)
              }}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700 text-white border-0"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
