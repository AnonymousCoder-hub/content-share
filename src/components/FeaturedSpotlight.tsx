'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, Star, TrendingUp, Zap, Flame, Sparkles, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface FeaturedSpotlightProps {
  title: string
  backdropPath: string | null
  voteAverage: number
  year: number
  description: string
  id: number
  mediaType: 'movie' | 'tv'
  accentColor: string
  gradientFrom: string
  gradientTo: string
}

export default function FeaturedSpotlight({
  title,
  backdropPath,
  voteAverage,
  year,
  description,
  id,
  mediaType,
  accentColor,
  gradientFrom,
  gradientTo
}: FeaturedSpotlightProps) {
  const backdropUrl = backdropPath
    ? `https://image.tmdb.org/t/p/original${backdropPath}`
    : null

  const href = mediaType === 'tv' ? `/tv/${id}` : `/movie/${id}`

  return (
    <motion.section
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.8 }}
      className="relative my-16 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8"
    >
      {/* Main Container with Z-scheme Design */}
      <div className="relative">
        {/* Background with diagonal cut */}
        <div className={`absolute inset-0 rounded-3xl overflow-hidden transform -rotate-1 scale-[1.02] bg-gradient-to-br ${gradientFrom} ${gradientTo} opacity-20`} />
        <div className={`absolute inset-0 rounded-3xl overflow-hidden transform rotate-1 scale-[1.01] bg-gradient-to-bl ${gradientTo} ${gradientFrom} opacity-10`} />

        {/* Content */}
        <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-br ${gradientFrom} ${gradientTo} p-[1px]`}>
          <div className="relative bg-background rounded-3xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Image Side with Black Shard Effect */}
              <div className="relative aspect-[16/9] lg:aspect-auto overflow-hidden">
                {backdropUrl && (
                  <>
                    <img
                      src={backdropUrl}
                      alt={title}
                      className="w-full h-full object-cover"
                    />
                    {/* Diagonal Black Shard Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                    {/* Additional shard effect */}
                    <div
                      className="absolute top-0 right-0 w-1/2 h-full bg-black/30"
                      style={{
                        clipPath: 'polygon(30% 0, 100% 0, 100% 100%, 0% 100%)'
                      }}
                    />
                  </>
                )}
              </div>

              {/* Content Side */}
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      className={`${accentColor} text-white border-0 px-4 py-1.5 rounded-full text-sm font-semibold`}
                    >
                      Featured
                    </Badge>
                    <Badge className="bg-white/10 backdrop-blur-md text-white border-0 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                      {voteAverage?.toFixed(1) || 'N/A'}
                    </Badge>
                    <Badge className="bg-white/10 backdrop-blur-md text-white border-0 px-3 py-1.5 rounded-full">
                      {year}
                    </Badge>
                    {mediaType === 'tv' && (
                      <Badge className="bg-purple-500/90 text-white border-0 text-xs font-medium">
                        TV Show
                      </Badge>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
                    {title}
                  </h2>

                  {/* Description */}
                  <p className="text-foreground/80 leading-relaxed text-base sm:text-lg line-clamp-3">
                    {description}
                  </p>

                  {/* Buttons */}
                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Link href={href}>
                      <Button
                        size="lg"
                        className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white hover:opacity-90 rounded-full px-8 h-12 text-base font-semibold transition-all duration-200 hover:scale-105 shadow-lg`}
                      >
                        <Play className="w-5 h-5 mr-2 fill-current" />
                        Watch Now
                      </Button>
                    </Link>
                    <Link href={href}>
                      <Button
                        variant="outline"
                        size="lg"
                        className="rounded-full px-8 h-12 text-base font-semibold transition-all duration-200 hover:scale-105"
                      >
                        More Info
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Bottom Accent Line */}
            <div className={`h-1 w-full bg-gradient-to-r ${gradientFrom} ${gradientTo}`} />
          </div>
        </div>
      </div>
    </motion.section>
  )
}
