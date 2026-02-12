'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { Button } from '@/components/ui/button'
import { Download, Trash2, Check, Upload, AlertCircle, Film, Tv } from 'lucide-react'
import { toast } from 'sonner'

interface PlayerConfig {
  name: string
  movieUrl?: string
  tvUrl?: string
  url?: string
  useSandbox: boolean
}

export default function ImportPlayersPage() {
  const [players, setPlayers] = useState<PlayerConfig[]>([])
  const [importedPlayerNames, setImportedPlayerNames] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load players from public/players.json
  useEffect(() => {
    const loadPlayers = async () => {
      try {
        // Add cache-busting and timeout
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 second timeout

        const response = await fetch(`/players.json?_t=${Date.now()}`, {
          signal: controller.signal,
          cache: 'no-store'
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          throw new Error(`Failed to load players. Status: ${response.status}`)
        }

        const data = await response.json()
        setPlayers(Array.isArray(data) ? data : [data])

        // Load imported player names from localStorage
        const savedImported = localStorage.getItem('importedPlayers')
        if (savedImported) {
          const imported = JSON.parse(savedImported)
          const importedNames = new Set(imported.map((p: any) => p.name))
          setImportedPlayerNames(importedNames)
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error'
        console.error('Error loading players:', errorMsg)
        setError(`Failed to load players: ${errorMsg}`)
      } finally {
        setLoading(false)
      }
    }
    loadPlayers()
  }, [])

  const handleImport = (player: PlayerConfig) => {
    const isImported = importedPlayerNames.has(player.name)

    if (isImported) {
      // Delete
      const updatedNames = new Set(importedPlayerNames)
      updatedNames.delete(player.name)
      setImportedPlayerNames(updatedNames)

      // Remove from importedPlayers in localStorage
      const importedPlayers = JSON.parse(localStorage.getItem('importedPlayers') || '[]')
      const updated = importedPlayers.filter((p: any) => p.name !== player.name)
      localStorage.setItem('importedPlayers', JSON.stringify(updated))

      toast.success(`"${player.name}" removed`)
    } else {
      // Import
      // Save to localStorage (used by PlayerSelector)
      const existingImported = JSON.parse(localStorage.getItem('importedPlayers') || '[]')
      const existing = existingImported.find((p: any) => p.name === player.name)

      if (existing) {
        toast.error(`"${player.name}" is already imported`)
        return
      }

      // Add to importedPlayers in localStorage
      const newPlayer = {
        id: `public-${Date.now()}`,
        name: player.name,
        movieUrl: player.movieUrl || player.url || '',
        tvUrl: player.tvUrl || player.url || '',
        useSandbox: player.useSandbox,
        source: 'public'
      }
      const updated = [...existingImported, newPlayer]
      localStorage.setItem('importedPlayers', JSON.stringify(updated))

      // Update local state
      const updatedNames = new Set(importedPlayerNames)
      updatedNames.add(player.name)
      setImportedPlayerNames(updatedNames)

      toast.success(`"${player.name}" imported successfully!`)
    }
  }

  const handleClearAll = () => {
    setImportedPlayerNames(new Set())
    localStorage.setItem('importedPlayers', JSON.stringify([]))
    toast.success('All imported players cleared')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading players...</div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-[1400px] mx-auto">
          <div className="flex items-center justify-center min-h-[50vh]">
            <div className="text-center max-w-md">
              <AlertCircle className="w-16 h-16 mx-auto mb-4 text-destructive" />
              <h2 className="text-2xl font-semibold mb-2">Error Loading Players</h2>
              <p className="text-muted-foreground mb-6">{error}</p>
              <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-20 pb-12">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">Import Players</h1>
                <p className="text-muted-foreground mt-1">
                  Browse and import video players from the server
                </p>
              </div>
            </div>
          </motion.div>

          {/* Players List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-3"
          >
            {players.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No players found</p>
              </div>
            ) : (
              players.map((player, index) => {
                const isImported = importedPlayerNames.has(player.name)

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="relative bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between p-4 sm:p-6">
                      {/* Left side: Player Info */}
                      <div className="flex items-center gap-4 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                          <Download className="w-6 h-6 text-white" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base sm:text-lg text-white truncate">
                            {player.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            {player.movieUrl && <span className="flex items-center gap-1"><Film className="w-3 h-3" />Movie</span>}
                            {player.tvUrl && <span className="flex items-center gap-1"><Tv className="w-3 h-3" />TV</span>}
                            {player.useSandbox && <span className="text-orange-400">Sandboxed</span>}
                          </div>
                        </div>
                      </div>

                      {/* Right side: Import/ Delete Button */}
                      <div className="flex-shrink-0 ml-4">
                        <motion.button
                          onClick={() => handleImport(player)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.95 }}
                          className={`
                            px-5 py-2.5 rounded-xl text-sm font-medium
                            transition-all duration-300
                            flex items-center gap-2
                            ${isImported
                              ? 'bg-red-500 hover:bg-red-600 text-white border-red-500'
                              : 'bg-white hover:bg-gray-100 text-gray-900 border-gray-200'
                            }
                          `}
                        >
                          {isImported ? (
                            <>
                              <Trash2 className="w-4 h-4" />
                              <span className="hidden sm:inline">Delete</span>
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4" />
                              <span className="hidden sm:inline">Import</span>
                            </>
                          )}
                        </motion.button>
                      </div>
                    </div>

                    {/* Success Indicator for Imported */}
                    <AnimatePresence>
                      {isImported && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 bg-green-500/10 border border-green-500/30 rounded-2xl pointer-events-none"
                        >
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })
            )}
          </motion.div>

          {/* Clear All Button */}
          {importedPlayerNames.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="mt-8 pt-6 border-t border-border/50 flex justify-center"
            >
              <Button
                variant="outline"
                onClick={handleClearAll}
                className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:border-destructive/50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All Imported Players ({importedPlayerNames.size})
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
