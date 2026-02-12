'use client'

import { useRef, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import MovieCard, { MovieCardSkeleton } from './MovieCard'

interface Movie {
  id: number
  title: string
  posterPath: string | null
  voteAverage: number
  releaseDate: string
  mediaType?: 'movie' | 'tv'
}

interface MovieRowProps {
  title: string
  movies: Movie[]
  loading?: boolean
  skeletonCount?: number
  icon?: React.ReactNode
}

export default function MovieRow({
  title,
  movies,
  loading = false,
  skeletonCount = 6,
  icon
}: MovieRowProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Card widths with gap
  const cardWidths = {
    mobile: 160,
    tablet: 200,
    desktop: 220
  }
  const gap = 16

  // Get current card width based on viewport
  const getCurrentCardWidth = () => {
    if (typeof window === 'undefined') return cardWidths.mobile
    const width = window.innerWidth
    if (width >= 1024) return cardWidths.desktop
    if (width >= 640) return cardWidths.tablet
    return cardWidths.mobile
  }

  // Scroll to a specific card index
  const scrollToIndex = (index: number) => {
    if (scrollContainerRef.current) {
      const cardWidth = getCurrentCardWidth()
      const scrollPosition = index * (cardWidth + gap)
      scrollContainerRef.current.scrollTo({
        left: scrollPosition,
        behavior: 'smooth'
      })
    }
  }

  // Navigate to next/previous card
  const scroll = (direction: 'left' | 'right') => {
    const newIndex = direction === 'left' 
      ? Math.max(0, currentIndex - 1) 
      : Math.min(movies.length - 1, currentIndex + 1)
    scrollToIndex(newIndex)
  }

  // Update scroll state and current index
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      const cardWidth = getCurrentCardWidth()
      
      // Calculate current visible index
      const newIndex = Math.round(scrollLeft / (cardWidth + gap))
      setCurrentIndex(Math.max(0, Math.min(newIndex, movies.length - 1)))
      
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  // Update card width on resize
  useEffect(() => {
    const handleResize = () => {
      if (scrollContainerRef.current) {
        scrollToIndex(currentIndex)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [currentIndex, movies.length])

  // Update scroll buttons state
  useEffect(() => {
    if (scrollContainerRef.current && !loading && movies.length > 0) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 10)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }, [loading, movies.length])

  return (
    <section className="space-y-4 py-6">
      {/* Section Title */}
      <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
        <motion.h2
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2"
        >
          {icon}
          {title}
        </motion.h2>

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

      {/* Movies Container with Snap Scrolling */}
      <div className="relative group/row">
        {/* Fade gradients on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-r from-background via-background/50 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 sm:w-40 bg-gradient-to-l from-background via-background/50 to-transparent z-10 pointer-events-none" />

        {/* Scrollable container with snap */}
        <motion.div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex gap-4 overflow-x-auto pb-4 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto scrollbar-hide"
          style={{
            scrollSnapType: 'x mandatory',
            scrollPadding: '0 1px 0 0'
          }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
        >
          {loading
            ? Array.from({ length: skeletonCount }).map((_, i) => (
                <div 
                  key={i} 
                  className="flex-shrink-0 w-[160px] sm:w-[200px] md:w-[220px]"
                  style={{ scrollSnapAlign: 'start' }}
                >
                  <MovieCardSkeleton />
                </div>
              ))
            : movies.map((movie, index) => (
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
              ))}
        </motion.div>

        {/* Progress Indicators */}
        {!loading && movies.length > 0 && (
          <div className="flex justify-center gap-2 mt-4 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
            {Array.from({ length: Math.min(movies.length, 10) }).map((_, index) => (
              <button
                key={index}
                onClick={() => scrollToIndex(index)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? 'w-8 bg-foreground'
                    : 'w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
