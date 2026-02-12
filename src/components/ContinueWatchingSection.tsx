/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, X, Clock, Film, Tv, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useContinueWatching } from '@/hooks/useContinueWatching'

interface ContinueWatchingSectionProps {
  className?: string
}

export default function ContinueWatchingSection({ className = '' }: ContinueWatchingSectionProps) {
  const { items, removeItem } = useContinueWatching()
  const [mounted, setMounted] = useState(false)

  // Wait for client-side hydration to avoid mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted || items.length === 0) {
    return null
  }

  return (
    <section className={`mb-8 ${className}`}>
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold">Continue Watching</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              items.forEach((item) => removeItem(item.id))
            }}
            className="text-muted-foreground hover:text-foreground hover:bg-accent hover:scale-110 active:scale-95 transition-all duration-200"
            title="Clear all"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="grid grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
              }}
              className="relative group"
            >
              <Link
                href={`/watch/${item.id}?type=${item.mediaType}${item.mediaType === 'tv' ? `&s=${item.season}&e=${item.episode}` : ''}`}
                className="block relative"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden bg-muted">
                  {item.posterPath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w342${item.posterPath}`}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      {item.mediaType === 'movie' ? (
                        <Film className="w-12 h-12 text-muted-foreground/50" />
                      ) : (
                        <Tv className="w-12 h-12 text-muted-foreground/50" />
                      )}
                    </div>
                  )}

                  {/* Progress bar */}
                  {item.progress !== undefined && item.progress > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary/80">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  )}

                  {/* Play overlay on hover */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center">
                      <Play className="w-5 h-5 text-black fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="mt-3 space-y-1">
                  <h3 className="text-sm font-medium line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    {item.mediaType === 'tv' ? (
                      <>
                        S{item.season} E{item.episode}
                        {item.episodeName && `: ${item.episodeName}`}
                      </>
                    ) : (
                      item.lastWatched ? `Watched ${getTimeAgo(item.lastWatched)}` : ''
                    )}
                  </p>
                </div>
              </Link>

              {/* Sleek delete button - always visible */}
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  removeItem(item.id)
                }}
                className="absolute top-0 right-0 p-1.5 bg-black/60 hover:bg-red-500/90 active:bg-red-600 hover:scale-105 active:scale-95 rounded-tr-xl rounded-bl-lg transition-all duration-200 z-10"
                title="Remove from continue watching"
              >
                <Trash2 className="w-3.5 h-3.5 text-white/90 group-hover:text-white" />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString()
}
