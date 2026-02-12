'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Info, ChevronLeft, ChevronRight, Star, Calendar, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface Movie {
  id: number
  title: string
  backdropPath: string | null
  overview: string
  voteAverage: number
  releaseDate: string
  genreIds: number[]
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[70vh] sm:h-[80vh] overflow-hidden">
      <Skeleton className="w-full h-full animate-shimmer" />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
    </div>
  )
}

interface HeroSectionProps {
  movies: Movie[]
}

export default function HeroSection({ movies }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)

  useEffect(() => {
    if (!isAutoPlaying || movies.length === 0) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length)
    }, 6000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, movies.length])

  const nextSlide = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev + 1) % movies.length)
  }

  const prevSlide = () => {
    setIsAutoPlaying(false)
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length)
  }

  if (movies.length === 0) {
    return <HeroSkeleton />
  }

  const currentMovie = movies[currentIndex]
  const backdropUrl = currentMovie.backdropPath
    ? `https://image.tmdb.org/t/p/original${currentMovie.backdropPath}`
    : null

  const year = currentMovie.releaseDate
    ? new Date(currentMovie.releaseDate).getFullYear()
    : 'N/A'

  return (
    <section className="relative h-[70vh] sm:h-[80vh] overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          {/* Background Image with Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />

          {backdropUrl && (
            <img
              src={backdropUrl}
              alt={currentMovie.title}
              className="w-full h-full object-cover"
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="absolute inset-0 z-20 flex items-center">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4 sm:space-y-6"
              >
                {/* Badges */}
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-red-500 hover:bg-red-600 text-white border-0 px-4 py-1.5 rounded-full text-sm font-semibold">
                    Featured
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-white/10 backdrop-blur-md text-white border-0 px-3 py-1.5 rounded-full flex items-center gap-1.5"
                  >
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    {currentMovie.voteAverage?.toFixed(1) || 'N/A'}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-white/10 backdrop-blur-md text-white border-0 px-3 py-1.5 rounded-full flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {year}
                  </Badge>
                </div>

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
                  {currentMovie.title}
                </h1>

                {/* Overview */}
                <p className="text-base sm:text-lg text-white/80 line-clamp-3 sm:line-clamp-4 leading-relaxed">
                  {currentMovie.overview}
                </p>

                {/* Buttons */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Link href={`/watch/${currentMovie.id}`}>
                    <Button
                      size="lg"
                      className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12 text-base font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <Play className="w-5 h-5 mr-2 fill-current" />
                      Watch Now
                    </Button>
                  </Link>
                  <Link href={`/movie/${currentMovie.id}`}>
                    <Button
                      size="lg"
                      variant="secondary"
                      className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border-0 rounded-full px-8 h-12 text-base font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      <Info className="w-5 h-5 mr-2" />
                      More Info
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-8 right-8 z-30 flex items-center gap-2">
        <Button
          size="icon"
          variant="secondary"
          onClick={prevSlide}
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 border-0 rounded-full w-12 h-12 transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <ChevronLeft className="w-5 h-5 text-white" />
        </Button>
        <Button
          size="icon"
          variant="secondary"
          onClick={nextSlide}
          className="bg-white/10 backdrop-blur-md hover:bg-white/20 border-0 rounded-full w-12 h-12 transition-all duration-200 hover:scale-110 active:scale-95"
        >
          <ChevronRight className="w-5 h-5 text-white" />
        </Button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setIsAutoPlaying(false)
              setCurrentIndex(index)
            }}
            className={`h-1 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/50 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </section>
  )
}
