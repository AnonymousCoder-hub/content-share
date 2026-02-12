'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import MovieCard from '@/components/MovieCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Search, Film, Tv, Users } from 'lucide-react'
import { useSettings } from '@/hooks/useSettings'

interface SearchResult {
  id: number
  title?: string
  name?: string
  posterPath: string | null
  voteAverage: number
  releaseDate?: string
  firstAirDate?: string
  mediaType: string
  overview: string
}

function SearchContent() {
  const searchParams = useSearchParams()
  const { settings } = useSettings()
  const query = searchParams.get('query') || ''
  const [searchQuery, setSearchQuery] = useState(query)
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([])
      setHasSearched(false)
      return
    }

    setLoading(true)
    setHasSearched(true)

    try {
      const region = settings.region || 'US'
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchTerm)}&region=${region}`)
      if (!response.ok) throw new Error('Failed to search')

      const data = await response.json()

      // Map TMDB API response to our interface
      const filteredResults = (data.results || [])
        .filter((item: any) => item.media_type === 'movie' || item.media_type === 'tv')
        .map((item: any) => ({
          id: item.id,
          title: item.title || item.name || 'Unknown',
          name: item.name,
          posterPath: item.poster_path,
          voteAverage: item.vote_average,
          releaseDate: item.release_date,
          firstAirDate: item.first_air_date,
          mediaType: item.media_type,
          overview: item.overview || ''
        }))

      setResults(filteredResults)
    } catch (error) {
      console.error('Error searching:', error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (query) {
      setSearchQuery(query)
      handleSearch(query)
    }
  }, [query])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(searchQuery)
    // Update URL without navigating
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('query', searchQuery)
      window.history.pushState({}, '', url.toString())
    }
  }

  const movies = results.filter((r) => r.mediaType === 'movie')
  const tvShows = results.filter((r) => r.mediaType === 'tv')

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-12">
        {/* Search Header */}
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <h1 className="text-4xl sm:text-5xl font-bold">Search</h1>
            <p className="text-foreground/70 text-lg">
              Find your favorite movies and TV shows
            </p>

            <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for movies, TV shows..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 pr-4 h-14 text-base bg-card border-border focus:border-primary transition-all duration-200 rounded-2xl"
              />
              <Button
                type="submit"
                size="lg"
                className="absolute right-2 top-1/2 -translate-y-1/2 h-10 px-6 rounded-xl"
              >
                Search
              </Button>
            </form>
          </motion.div>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0">
                    <MovieCardSkeleton />
                  </div>
                ))}
              </div>
            ) : results.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h2 className="text-2xl font-semibold mb-2">No results found</h2>
                <p className="text-muted-foreground">
                  Try searching for something else
                </p>
              </motion.div>
            ) : (
              <>
                {/* Movies Section */}
                {movies.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Film className="w-6 h-6" />
                      Movies ({movies.length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {movies.map((movie, index) => (
                        <div key={movie.id} className="flex-shrink-0">
                          <MovieCard
                            id={movie.id}
                            title={movie.title || movie.name || 'Unknown'}
                            posterPath={movie.posterPath}
                            voteAverage={movie.voteAverage}
                            releaseDate={movie.releaseDate || movie.firstAirDate || ''}
                            index={index}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.section>
                )}

                {/* TV Shows Section */}
                {tvShows.length > 0 && (
                  <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="space-y-6"
                  >
                    <h2 className="text-2xl font-bold flex items-center gap-2">
                      <Tv className="w-6 h-6" />
                      TV Shows ({tvShows.length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                      {tvShows.map((show, index) => (
                        <div key={show.id} className="flex-shrink-0">
                          <MovieCard
                            id={show.id}
                            title={show.title || show.name || 'Unknown'}
                            posterPath={show.posterPath}
                            voteAverage={show.voteAverage}
                            releaseDate={show.releaseDate || show.firstAirDate || ''}
                            index={index}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.section>
                )}
              </>
            )}
          </div>
        )}

        {/* Popular Searches (shown when no search) */}
        {!hasSearched && !query && (
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <section>
                <h2 className="text-xl font-semibold mb-4">Popular Searches</h2>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Action',
                    'Comedy',
                    'Drama',
                    'Horror',
                    'Sci-Fi',
                    'Thriller',
                    'Romance',
                    'Animation'
                  ].map((term) => (
                    <Badge
                      key={term}
                      variant="secondary"
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full px-4 py-2 cursor-pointer transition-all hover:scale-105"
                      onClick={() => {
                        setSearchQuery(term)
                        handleSearch(term)
                      }}
                    >
                      {term}
                    </Badge>
                  ))}
                </div>
              </section>

              <section>
                <h2 className="text-xl font-semibold mb-4">Trending Now</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    'Dune: Part Two',
                    'Oppenheimer',
                    'Barbie',
                    'The Batman',
                    'Avatar: The Way of Water',
                    'Top Gun: Maverick'
                  ].map((movie, index) => (
                    <button
                      key={movie}
                      onClick={() => {
                        setSearchQuery(movie)
                        handleSearch(movie)
                      }}
                      className="flex items-center gap-3 p-4 bg-card rounded-xl hover:bg-accent transition-colors text-left"
                    >
                      <span className="text-2xl font-bold text-muted-foreground w-8">
                        {index + 1}
                      </span>
                      <span className="font-medium">{movie}</span>
                    </button>
                  ))}
                </div>
              </section>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}

function MovieCardSkeleton() {
  return (
    <div className="relative group aspect-[2/3] rounded-2xl overflow-hidden bg-card">
      <Skeleton className="w-full h-full animate-shimmer" />
      <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2 bg-gradient-to-t from-background/80 to-transparent">
        <Skeleton className="h-5 w-3/4 bg-white/10" />
        <Skeleton className="h-4 w-1/2 bg-white/10" />
      </div>
    </div>
  )
}

// Force dynamic rendering to avoid build-time prerendering issues
export const dynamic = 'force-dynamic'

// Loading fallback for Suspense
function SearchPageFallback() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="pt-24 pb-12">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 mb-12">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="h-12 bg-muted rounded-2xl w-3/4 mx-auto" />
            <div className="h-6 bg-muted rounded-lg w-1/2 mx-auto" />
            <div className="h-14 bg-muted rounded-2xl max-w-2xl mx-auto" />
          </div>
        </div>
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex-shrink-0">
                <MovieCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// Default export with Suspense boundary
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageFallback />}>
      <SearchContent />
    </Suspense>
  )
}
