'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

interface MovieCardProps {
  id: number
  title: string
  posterPath: string | null
  voteAverage: number
  releaseDate: string
  index?: number
  mediaType?: 'movie' | 'tv'
}

export function MovieCardSkeleton() {
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

export default function MovieCard({
  id,
  title,
  posterPath,
  voteAverage,
  releaseDate,
  index = 0,
  mediaType = 'movie'
}: MovieCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)

  const posterUrl = posterPath
    ? `https://image.tmdb.org/t/p/w500${posterPath}`
    : '/placeholder-poster.jpg'

  const year = releaseDate ? new Date(releaseDate).getFullYear() : 'N/A'
  const href = mediaType === 'tv' ? `/tv/${id}` : `/movie/${id}`

  return (
    <Link href={href} className="block w-full h-full">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: index * 0.05 }}
        className="relative aspect-[2/3] rounded-2xl overflow-hidden bg-card cursor-pointer select-none"
      >
        <div className="relative w-full h-full">
          {!imageLoaded && (
            <Skeleton className="absolute inset-0 w-full h-full" />
          )}
          <img
            src={posterUrl}
            alt={title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />

          {/* Rating Badge - Always Visible at Top Right */}
          <div className="absolute top-3 right-3 pointer-events-none">
            <Badge
              variant="secondary"
              className="bg-black/70 backdrop-blur-md text-white border-0 px-2.5 py-1 rounded-full flex items-center gap-1.5 text-sm font-medium"
            >
              <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
              {voteAverage?.toFixed(1) || 'N/A'}
            </Badge>
          </div>

          {/* Media Type Badge */}
          {mediaType === 'tv' && (
            <div className="absolute top-3 left-3 pointer-events-none">
              <Badge className="bg-purple-500/90 text-white border-0 text-xs font-medium">
                TV Show
              </Badge>
            </div>
          )}

          {/* Bottom Gradient - Always visible */}
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent rounded-b-2xl pointer-events-none" />
        </div>

        {/* Info - Bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-1.5 pointer-events-none z-10">
          <h3 className="text-white font-semibold text-base line-clamp-2 drop-shadow-lg">
            {title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-white/90">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {year}
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}
