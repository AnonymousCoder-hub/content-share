'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Heart, Film, Tv, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/hooks/useFavorites'
import MovieCard from '@/components/MovieCard'
import Navigation from '@/components/Navigation'
import FloatingNav from '@/components/FloatingNav'

export default function FavouritesPage() {
  const router = useRouter()
  const { items, removeItem, clearAll, isInitialized } = useFavorites()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isInitialized) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </div>
        <FloatingNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Content */}
      <main className="flex-1 pt-8">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center">
                  <Heart className="w-6 h-6 text-red-500 fill-red-500" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">My Favourites</h1>
                  <p className="text-sm text-muted-foreground">
                    {items.length} {items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
              {items.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:scale-110 active:scale-95 transition-all duration-200"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-red-500/10 flex items-center justify-center mb-6">
                <Heart className="w-12 h-12 text-red-500/50" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No favourites yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Start adding movies and TV shows to your favourites by clicking the heart button on any page.
              </p>
              <Button
                onClick={() => router.push('/')}
                className="hover:scale-105 active:scale-95 transition-all duration-200"
              >
                Explore Movies & Shows
              </Button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              {items.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="relative group"
                >
                  <MovieCard
                    id={item.id}
                    title={item.title}
                    posterPath={item.posterPath}
                    voteAverage={item.voteAverage}
                    releaseDate={item.releaseDate}
                    index={index}
                    mediaType={item.mediaType}
                  />
                  {/* Delete Button - always visible */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-0 right-0 p-1.5 bg-black/60 hover:bg-red-500/90 active:bg-red-600 hover:scale-105 active:scale-95 rounded-tr-xl rounded-bl-lg transition-all duration-200 z-10"
                    title="Remove from favourites"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-white/90 group-hover:text-white" />
                  </button>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </main>

      <FloatingNav />
    </div>
  )
}
