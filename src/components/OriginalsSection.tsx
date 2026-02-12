'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Film } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import MovieCard, { MovieCardSkeleton } from './MovieCard'

interface Movie {
  id: number
  title: string
  posterPath: string | null
  voteAverage: number
  releaseDate: string
  mediaType?: 'movie' | 'tv'
}

interface StreamingPlatform {
  id: number
  name: string
  providerId: number
  region: string
}

const STREAMING_PLATFORMS: StreamingPlatform[] = [
  { id: 1, name: 'Netflix', providerId: 8, region: 'US' },
  { id: 2, name: 'Prime', providerId: 9, region: 'US' },
  { id: 3, name: 'Disney+', providerId: 337, region: 'US' },
  { id: 4, name: 'Hulu', providerId: 15, region: 'US' },
  { id: 5, name: 'Apple TV', providerId: 350, region: 'US' },
  { id: 6, name: 'Max', providerId: 1899, region: 'US' },
  { id: 7, name: 'Paramount+', providerId: 531, region: 'US' },
  { id: 8, name: 'Peacock', providerId: 386, region: 'US' },
  { id: 9, name: 'Crunchyroll', providerId: 283, region: 'US' },
  { id: 10, name: 'Hotstar', providerId: 2336, region: 'IN' },
]

export default function OriginalsSection() {
  const [selectedPlatform, setSelectedPlatform] = useState(STREAMING_PLATFORMS[0])
  const [movies, setMovies] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false)
  const [scrollContainerRef, setScrollContainerRef] = useState<HTMLDivElement | null>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const TMDB_API_KEY = '7967738a03ec215c7d6d675faba9c973'
  const BASE_URL = 'https://api.themoviedb.org/3'

  useEffect(() => {
    const fetchOriginals = async () => {
      setLoading(true)
      try {
        const response = await fetch(
          `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_watch_providers=${selectedPlatform.providerId}&watch_region=${selectedPlatform.region}&sort_by=popularity.desc&page=1`
        )
        const data = await response.json()

        const mappedMovies = (data.results || []).map((m: any) => ({
          id: m.id,
          title: m.title || m.name || 'Unknown',
          posterPath: m.poster_path,
          voteAverage: m.vote_average,
          releaseDate: m.release_date || m.first_air_date || '',
          mediaType: 'movie' as const
        }))

        setMovies(mappedMovies)
      } catch (error) {
        console.error('Error fetching originals:', error)
        setMovies([])
      } finally {
        setLoading(false)
        setHasLoadedOnce(true)
      }
    }

    fetchOriginals()
  }, [selectedPlatform])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef) {
      const scrollAmount = 220
      const newScrollPosition =
        direction === 'left'
          ? scrollContainerRef.scrollLeft - scrollAmount
          : scrollContainerRef.scrollLeft + scrollAmount

      scrollContainerRef.scrollTo({
        left: newScrollPosition,
        behavior: 'smooth'
      })
    }
  }

  const handleScroll = () => {
    if (scrollContainerRef) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    if (scrollContainerRef && !loading && movies.length > 0) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }, [loading, movies.length])

  return (
    <section className="space-y-4 py-6">
      {/* Section Title */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
          Originals
        </h2>

        {/* Platform Selector */}
        <Select
          value={selectedPlatform.id.toString()}
          onValueChange={(value) => {
            const platform = STREAMING_PLATFORMS.find(p => p.id.toString() === value)
            if (platform) setSelectedPlatform(platform)
          }}
        >
          <SelectTrigger className="w-[140px] sm:w-[180px] h-9 bg-card/50 border-border/50">
            <SelectValue placeholder="Select platform" />
          </SelectTrigger>
          <SelectContent>
            {STREAMING_PLATFORMS.map((platform) => (
              <SelectItem key={platform.id} value={platform.id.toString()}>
                {platform.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Scroll Buttons */}
        {!loading && movies.length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              size="icon"
              variant="ghost"
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="rounded-full h-9 w-9 hover:bg-white/10 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:scale-100 disabled:active:scale-100 transition-all duration-200"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="rounded-full h-9 w-9 hover:bg-white/10 hover:scale-110 active:scale-95 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:scale-100 disabled:active:scale-100 transition-all duration-200"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Movies Container */}
      <div className="relative">
        {/* Fade gradients on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-background via-background/50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-background via-background/50 to-transparent z-10 pointer-events-none" />

        {/* Scrollable container */}
        <div
          ref={setScrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-4 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto scrollbar-hide"
          style={{
            scrollSnapType: 'x mandatory',
            scrollPadding: '0 1px 0 0'
          }}
        >
          {loading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[220px]"
                style={{ scrollSnapAlign: 'start' }}
              >
                <MovieCardSkeleton />
              </div>
            ))
          ) : movies.length > 0 ? (
            movies.map((movie, index) => (
              <div
                key={movie.id}
                className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[220px]"
                style={{ scrollSnapAlign: 'start' }}
              >
                <MovieCard
                  id={movie.id}
                  title={movie.title}
                  posterPath={movie.posterPath}
                  voteAverage={movie.voteAverage}
                  releaseDate={movie.releaseDate}
                  index={index}
                  mediaType={movie.mediaType}
                />
              </div>
            ))
          ) : hasLoadedOnce ? (
            <div className="w-full py-16 flex flex-col items-center justify-center text-center px-4">
              <Film className="w-16 h-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-sm">
                No originals available for {selectedPlatform.name}
              </p>
              <p className="text-muted-foreground/50 text-xs mt-2">
                Try selecting a different streaming platform
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
