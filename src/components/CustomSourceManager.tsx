'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { X, Variable, Check, Eye, Info, AlertCircle, Film, Tv } from 'lucide-react'

export interface CustomSource {
  id: string
  name: string
  baseUrl: string
  useSandbox: boolean
  mediaType: 'movie' | 'tv' | 'both'
}

interface CustomSourceManagerProps {
  isOpen: boolean
  onClose: () => void
  onSourceAdd: (source: CustomSource) => void
}

type MediaType = 'movie' | 'tv' | 'both'

const MOVIE_VARIABLES = [
  { key: '{tmdb_id}', label: 'TMDB ID', description: 'The TMDB ID of the movie' },
  { key: '{imdb_id}', label: 'IMDB ID', description: 'The IMDB ID of the movie' },
]

const TV_VARIABLES = [
  { key: '{tmdb_id}', label: 'TMDB ID', description: 'The TMDB ID of the TV show' },
  { key: '{imdb_id}', label: 'IMDB ID', description: 'The IMDB ID of the TV show' },
  { key: '{season}', label: 'Season', description: 'Season number' },
  { key: '{episode}', label: 'Episode', description: 'Episode number' },
]

export default function CustomSourceManager({ isOpen, onClose, onSourceAdd }: CustomSourceManagerProps) {
  const [name, setName] = useState('')
  const [baseUrl, setBaseUrl] = useState('')
  const [useSandbox, setUseSandbox] = useState(false)
  const [mediaType, setMediaType] = useState<MediaType>('both')
  const [error, setError] = useState('')

  // Get variables based on media type
  const getVariables = () => {
    if (mediaType === 'movie') return MOVIE_VARIABLES
    if (mediaType === 'tv') return TV_VARIABLES
    return [...MOVIE_VARIABLES, ...TV_VARIABLES.filter(v => !MOVIE_VARIABLES.some(mv => mv.key === v.key))]
  }

  const AVAILABLE_VARIABLES = getVariables()

  const isValidUrl = (url: string): boolean => {
    try {
      // Must start with http:// or https:// and have a domain
      const urlPattern = /^https?:\/\/.+\..+/
      return urlPattern.test(url.trim())
    } catch {
      return false
    }
  }

  const handleAddVariable = (variable: string) => {
    const input = document.getElementById('base-url-input') as HTMLInputElement
    if (input) {
      const start = input.selectionStart
      const end = input.selectionEnd
      const text = baseUrl
      const before = text.substring(0, start)
      const after = text.substring(end, text.length)
      setBaseUrl(before + variable + after)
      // Set cursor position after the inserted variable
      setTimeout(() => {
        input.focus()
        input.setSelectionRange(start + variable.length, start + variable.length)
      }, 0)
    } else {
      setBaseUrl(baseUrl + variable)
    }
  }

  const handleSave = () => {
    if (!name.trim()) {
      setError('Please enter a source name')
      return
    }

    if (!baseUrl.trim()) {
      setError('Please enter a base URL')
      return
    }

    // Validate URL must be absolute (http:// or https://)
    if (!isValidUrl(baseUrl)) {
      setError('URL must start with http:// or https:// and include a domain (e.g., https://example.com/player/{tmdb_id})')
      return
    }

    const newSource: CustomSource = {
      id: Date.now().toString(),
      name: name.trim(),
      baseUrl: baseUrl.trim(),
      useSandbox,
      mediaType
    }

    // Let PlayerSelector handle the actual saving
    onSourceAdd(newSource)

    // Reset form and error
    setName('')
    setBaseUrl('')
    setUseSandbox(false)
    setMediaType('both')
    setError('')
  }

  const previewUrl = baseUrl
    .replace('{tmdb_id}', '12345')
    .replace('{imdb_id}', 'tt1234567')
    .replace('{season}', '1')
    .replace('{episode}', '1')

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Popup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-br from-gray-900 to-black border border-white/10 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <Variable className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Add Custom Source</h2>
                    <p className="text-sm text-white/60">Create your own video player source</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  className="text-white/60 hover:text-white hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {/* Form */}
                <div className="space-y-6">
                  {/* Source Name */}
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Source Name
                    </label>
                    <Input
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        setError('')
                      }}
                      placeholder="e.g., My Custom Player"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-white/10"
                    />
                  </div>

                  {/* Media Type Selector */}
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Media Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setMediaType('movie')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                          mediaType === 'movie'
                            ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <Film className="w-4 h-4" />
                        <span className="text-sm font-medium">Movie</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaType('tv')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                          mediaType === 'tv'
                            ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <Tv className="w-4 h-4" />
                        <span className="text-sm font-medium">TV Show</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMediaType('both')}
                        className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 transition-all ${
                          mediaType === 'both'
                            ? 'bg-purple-500/20 border-purple-500 text-purple-400'
                            : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10 hover:border-white/20'
                        }`}
                      >
                        <Film className="w-4 h-4" />
                        <span className="text-sm font-medium">Both</span>
                      </button>
                    </div>
                  </div>

                  {/* Base URL */}
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Base URL
                    </label>
                    <Input
                      id="base-url-input"
                      value={baseUrl}
                      onChange={(e) => {
                        setBaseUrl(e.target.value)
                        setError('')
                      }}
                      placeholder="https://example.com/player/{tmdb_id}?s={season}&e={episode}"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:bg-white/10 font-mono text-sm"
                    />
                    {error && (
                      <div className="mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-red-400">{error}</span>
                      </div>
                    )}
                    {baseUrl && !error && (
                      <div className="mt-2 p-3 bg-white/5 rounded-lg">
                        <div className="flex items-center gap-2 text-xs text-white/60 mb-1">
                          <Eye className="w-3 h-3" />
                          <span>Preview:</span>
                        </div>
                        <code className="text-xs text-purple-400 break-all">
                          {previewUrl}
                        </code>
                      </div>
                    )}
                  </div>

                  {/* Variables */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Variable className="w-4 h-4 text-purple-400" />
                      <label className="block text-sm font-medium text-white/90">
                        Available Variables
                      </label>
                      <Badge variant="secondary" className="text-xs">
                        Click to insert
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {AVAILABLE_VARIABLES.map((variable) => (
                        <button
                          key={variable.key}
                          onClick={() => handleAddVariable(variable.key)}
                          className="flex items-start gap-2 p-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-500/50 rounded-lg transition-all text-left group"
                        >
                          <code className="text-xs text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">
                            {variable.key}
                          </code>
                          <div className="flex-1">
                            <div className="text-sm text-white/90 font-medium">
                              {variable.label}
                            </div>
                            <div className="text-xs text-white/50">
                              {variable.description}
                            </div>
                          </div>
                          <Info className="w-4 h-4 text-white/40 group-hover:text-purple-400 transition-colors mt-0.5" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sandbox Toggle */}
                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <Info className="w-5 h-5 text-blue-400" />
                      <div>
                        <div className="text-sm font-medium text-white/90">Use Sandbox</div>
                        <div className="text-xs text-white/50">
                          Restricts iframe permissions for security
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setUseSandbox(!useSandbox)}
                      className={`relative w-14 h-8 rounded-full transition-colors ${
                        useSandbox ? 'bg-purple-500' : 'bg-white/10'
                      }`}
                    >
                      <motion.div
                        initial={false}
                        animate={{ x: useSandbox ? 28 : 4 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute top-1 w-6 h-6 rounded-full bg-white shadow-md"
                      />
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 p-6 border-t border-white/10 bg-white/5">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-white/70 hover:text-white"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!name.trim() || !baseUrl.trim()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Save Source
                </Button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
