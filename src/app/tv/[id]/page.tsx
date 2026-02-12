'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import MovieCard from '@/components/MovieCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { BookmarkDialog } from '@/components/BookmarkDialog'
import { useFavorites } from '@/hooks/useFavorites'
import { useBookmarks } from '@/hooks/useBookmarks'
import { toast } from 'sonner'
import {
  Play,
  Star,
  Calendar,
  Clock,
  Globe,
  ArrowLeft,
  User,
  Film,
  TrendingUp,
  Layers,
  Tv,
  Heart,
  Share2,
  Plus,
  X
} from 'lucide-react'

const TMDB_API_KEY = '7967738a03ec215c7d6d675faba9c973'

interface TVShowDetails {
  id: number
  name: string
  overview: string
  backdropPath: string | null
  posterPath: string | null
  voteAverage: number
  voteCount: number
  firstAirDate: string
  episodeRunTime: number[]
  genres: Array<{ id: number; name: string }>
  originalLanguage: string
  status: string
  tagline: string
  numberOfSeasons: number
  numberOfEpisodes: number
  imdbId: string | null
}

interface Cast {
  id: number
  name: string
  character: string
  profilePath: string | null
  order: number
}

interface Crew {
  id: number
  name: string
  job: string
  profilePath: string | null
}

interface Video {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
}

interface SimilarTVShow {
  id: number
  name: string
  posterPath: string | null
  voteAverage: number
  firstAirDate: string
}

export default function TVShowDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [tvShow, setTVShow] = useState<TVShowDetails | null>(null)
  const [cast, setCast] = useState<Cast[]>([])
  const [crew, setCrew] = useState<Crew[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [similarTVShows, setSimilarTVShows] = useState<SimilarTVShow[]>([])
  const [loading, setLoading] = useState(true)
  const [showTrailerModal, setShowTrailerModal] = useState(false)

  // Favorites and Bookmarks
  const { isFavorite, toggleFavorite } = useFavorites()
  const { isInitialized: favoritesInitialized } = useFavorites()
  const { isInitialized: bookmarksInitialized } = useBookmarks()

  useEffect(() => {
    const fetchTVShowDetails = async () => {
      try {
        const resolvedParams = params instanceof Promise ? await params : params
        const tvId = resolvedParams.id

        const response = await fetch(`/api/tv/${tvId}`)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('API Error:', errorData)
          throw new Error('Failed to fetch TV show details')
        }

        const data = await response.json()

        if (data.tv) {
          const mappedTVShow = {
            id: data.tv.id,
            name: data.tv.name || 'Unknown',
            overview: data.tv.overview || '',
            backdropPath: data.tv.backdrop_path,
            posterPath: data.tv.poster_path,
            voteAverage: data.tv.vote_average,
            voteCount: data.tv.vote_count || 0,
            firstAirDate: data.tv.first_air_date || '',
            episodeRunTime: data.tv.episode_run_time || [],
            genres: data.tv.genres || [],
            originalLanguage: data.tv.original_language || '',
            status: data.tv.status || '',
            tagline: data.tv.tagline || '',
            numberOfSeasons: data.tv.number_of_seasons || 0,
            numberOfEpisodes: data.tv.number_of_episodes || 0,
            imdbId: data.tv.external_ids?.imdb_id || null
          }
          setTVShow(mappedTVShow)
        }

        if (data.credits?.cast) {
          const mappedCast = data.credits.cast.map((c: any) => ({
            id: c.id,
            name: c.name,
            character: c.character,
            profilePath: c.profile_path,
            order: c.order
          }))
          setCast(mappedCast)
        }

        if (data.credits?.crew) {
          const mappedCrew = data.credits.crew.map((c: any) => ({
            id: c.id,
            name: c.name,
            job: c.job,
            profilePath: c.profile_path
          }))
          setCrew(mappedCrew)
        }

        if (data.videos?.results) {
          setVideos(data.videos.results)
        }

        if (data.similar?.results) {
          const mappedSimilar = data.similar.results.map((m: any) => ({
            id: m.id,
            name: m.name || 'Unknown',
            posterPath: m.poster_path,
            voteAverage: m.vote_average,
            firstAirDate: m.first_air_date || ''
          }))
          setSimilarTVShows(mappedSimilar)
        }
      } catch (error) {
        console.error('Error fetching TV show details:', error)
      } finally {
        setLoading(false)
      }
    }

    const loadTVShow = async () => {
      try {
        const resolvedParams = params instanceof Promise ? await params : params
        const tvId = resolvedParams.id
        if (tvId) {
          fetchTVShowDetails()
        }
      } catch (error) {
        console.error('Error resolving params:', error)
        setLoading(false)
      }
    }

    loadTVShow()
  }, [params])

  const trailer = videos.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official
  ) || videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer')

  const creators = crew.filter((c) => c.job === 'Creator')
  const writers = crew.filter((c) => c.job === 'Screenplay' || c.job === 'Writer')

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
    return `$${num}`
  }

  const formatRuntime = (minutes: number[]) => {
    if (!minutes || minutes.length === 0) return 'N/A'
    const avgMins = Math.round(minutes.reduce((a, b) => a + b, 0) / minutes.length)
    const hours = Math.floor(avgMins / 60)
    const mins = avgMins % 60
    return `${hours}h ${mins}m`
  }

  const handleShare = async () => {
    if (!tvShow || !tvShow.imdbId) {
      toast.error('IMDb link not available for this content')
      return
    }

    const imdbUrl = `https://www.imdb.com/title/${tvShow.imdbId}`

    try {
      await navigator.clipboard.writeText(imdbUrl)
      toast.success('IMDb link copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const handleLike = () => {
    if (!tvShow) return
    
    const isFav = toggleFavorite({
      id: tvShow.id,
      title: tvShow.name,
      posterPath: tvShow.posterPath,
      mediaType: 'tv',
      voteAverage: tvShow.voteAverage,
      releaseDate: tvShow.firstAirDate
    })

    if (isFav) {
      toast.success('Added to favourites!')
    } else {
      toast.info('Removed from favourites')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20">
          <Skeleton className="w-full h-[60vh] sm:h-[70vh]" />
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-32 w-full" />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-[2/3]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!tvShow) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">TV show not found</h1>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const backdropUrl = tvShow.backdropPath
    ? `https://image.tmdb.org/t/p/original${tvShow.backdropPath}`
    : null
  const posterUrl = tvShow.posterPath
    ? `https://image.tmdb.org/t/p/w500${tvShow.posterPath}`
    : null

  const isLiked = favoritesInitialized && isFavorite(tvShow.id)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="relative">
        <div className="relative h-[50vh] sm:h-[60vh] overflow-hidden bg-black">
          {backdropUrl && (
            <img
              src={backdropUrl}
              alt={tvShow.name}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        </div>

        <div className="relative -mt-20 sm:-mt-24 max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 pb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col lg:flex-row gap-8"
          >
            <div className="flex-shrink-0 mx-auto lg:mx-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="relative w-64 sm:w-80 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl"
              >
                {posterUrl ? (
                  <img
                    src={posterUrl}
                    alt={tvShow.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Film className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </motion.div>
            </div>

            <div className="flex-1 space-y-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Button
                  variant="ghost"
                  onClick={() => router.back()}
                  className="text-foreground/70 hover:text-foreground mb-4 hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="space-y-2"
              >
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  {tvShow.name}
                </h1>
                {tvShow.tagline && (
                  <p className="text-lg text-foreground/70 italic">
                    "{tvShow.tagline}"
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap items-center gap-3"
              >
                <Badge className="bg-purple-500/90 backdrop-blur-md text-white border-0 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  {tvShow.voteAverage?.toFixed(1) || 'N/A'}
                </Badge>
                <Badge className="bg-white/10 backdrop-blur-md text-white border-0 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {tvShow.firstAirDate ? new Date(tvShow.firstAirDate).getFullYear() : 'N/A'}
                </Badge>
                {tvShow.episodeRunTime && tvShow.episodeRunTime.length > 0 && (
                  <Badge className="bg-white/10 backdrop-blur-md text-white border-0 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatRuntime(tvShow.episodeRunTime)}
                  </Badge>
                )}
                {tvShow.originalLanguage && (
                  <Badge className="bg-white/10 backdrop-blur-md text-white border-0 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    {tvShow.originalLanguage.toUpperCase()}
                  </Badge>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-2"
              >
                {tvShow.genres.map((genre) => (
                  <Badge
                    key={genre.id}
                    variant="secondary"
                    className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full"
                  >
                    {genre.name}
                  </Badge>
                ))}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-wrap items-center gap-3 pt-2"
              >
                <Link href={`/watch/${tvShow.id}?type=tv`}>
                  <Button
                    size="lg"
                    className="bg-white text-black hover:bg-white/90 rounded-full px-8 h-12 text-base font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Play className="w-5 h-5 mr-2 fill-current" />
                    Watch Now
                  </Button>
                </Link>
                {trailer && (
                  <Button
                    size="lg"
                    onClick={() => setShowTrailerModal(true)}
                    className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border-0 rounded-full px-8 h-12 text-base font-semibold transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Play className="w-5 h-5 mr-2" />
                    Watch Trailer
                  </Button>
                )}
                <BookmarkDialog
                  item={{
                    id: tvShow.id,
                    title: tvShow.name,
                    posterPath: tvShow.posterPath,
                    mediaType: 'tv',
                    voteAverage: tvShow.voteAverage,
                    releaseDate: tvShow.firstAirDate
                  }}
                >
                  <Button
                    size="lg"
                    variant="secondary"
                    className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border-0 rounded-full h-12 px-4 transition-all duration-200 hover:scale-105 active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                  </Button>
                </BookmarkDialog>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleLike}
                  className={`bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border-0 rounded-full h-12 px-4 transition-all duration-200 hover:scale-105 active:scale-95 ${isLiked ? 'text-red-500' : ''}`}
                >
                  {isLiked ? <Heart className="w-5 h-5 fill-current" /> : <Heart className="w-5 h-5" />}
                </Button>
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleShare}
                  className="bg-white/10 backdrop-blur-md text-white hover:bg-white/20 border-0 rounded-full h-12 px-4 transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <Share2 className="w-5 h-5" />
                </Button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="space-y-3"
              >
                <h2 className="text-xl font-semibold">Overview</h2>
                <p className="text-foreground/80 leading-relaxed text-base sm:text-lg">
                  {tvShow.overview || 'No overview available.'}
                </p>
              </motion.div>

              {(tvShow.numberOfSeasons > 0 || tvShow.numberOfEpisodes > 0 || tvShow.episodeRunTime.length > 0 || tvShow.status || tvShow.firstAirDate) && (
                <>
                  <Separator className="my-6" />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
                  >
                    {tvShow.numberOfSeasons > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="relative group"
                      >
                        <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/20 rounded-2xl p-4 backdrop-blur-sm hover:bg-gradient-to-br hover:from-white/10 hover:to-white/[0.05] hover:border-white/30 transition-all duration-300">
                          <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Layers className="w-5 h-5 text-white/80" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider font-medium">Seasons</p>
                              <p className="text-sm sm:text-base font-semibold text-white">{tvShow.numberOfSeasons}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {tvShow.numberOfEpisodes > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="relative group"
                      >
                        <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/20 rounded-2xl p-4 backdrop-blur-sm hover:bg-gradient-to-br hover:from-white/10 hover:to-white/[0.05] hover:border-white/30 transition-all duration-300">
                          <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Tv className="w-5 h-5 text-white/80" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider font-medium">Episodes</p>
                              <p className="text-sm sm:text-base font-semibold text-white">{tvShow.numberOfEpisodes}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {tvShow.episodeRunTime && tvShow.episodeRunTime.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.2 }}
                        className="relative group"
                      >
                        <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/20 rounded-2xl p-4 backdrop-blur-sm hover:bg-gradient-to-br hover:from-white/10 hover:to-white/[0.05] hover:border-white/30 transition-all duration-300">
                          <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Clock className="w-5 h-5 text-white/80" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider font-medium">Runtime</p>
                              <p className="text-sm sm:text-base font-semibold text-white">{formatRuntime(tvShow.episodeRunTime)}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {tvShow.status && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.25 }}
                        className="relative group"
                      >
                        <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/20 rounded-2xl p-4 backdrop-blur-sm hover:bg-gradient-to-br hover:from-white/10 hover:to-white/[0.05] hover:border-white/30 transition-all duration-300">
                          <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Film className="w-5 h-5 text-white/80" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider font-medium">Status</p>
                              <p className="text-sm sm:text-base font-semibold text-white">{tvShow.status}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {tvShow.firstAirDate && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="relative group"
                      >
                        <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/20 rounded-2xl p-4 backdrop-blur-sm hover:bg-gradient-to-br hover:from-white/10 hover:to-white/[0.05] hover:border-white/30 transition-all duration-300">
                          <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <Calendar className="w-5 h-5 text-white/80" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider font-medium">First Aired</p>
                              <p className="text-sm sm:text-base font-semibold text-white">{new Date(tvShow.firstAirDate).getFullYear()}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {cast.length > 0 && (
        <section className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
              <User className="w-5 h-5" />
              Top Cast
            </h2>
            <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
            {cast.slice(0, 15).map((person, index) => (
              <motion.div
                key={person.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className="flex-shrink-0 flex flex-col items-center space-y-2 cursor-pointer group"
              >
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-muted border-2 border-border group-hover:border-primary/50 transition-colors">
                  {person.profilePath ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w185${person.profilePath}`}
                      alt={person.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <div className="text-center min-w-[64px] sm:min-w-[80px]">
                  <h3 className="font-medium text-xs sm:text-sm line-clamp-1">{person.name}</h3>
                  <p className="text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{person.character}</p>
                </div>
              </motion.div>
            ))}
          </div>
          </motion.div>
        </section>
      )}

      {similarTVShows.length > 0 && (
        <section className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold mb-6">Similar TV Shows</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {similarTVShows.map((m, index) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MovieCard
                  id={m.id}
                  title={m.name}
                  posterPath={m.posterPath}
                  voteAverage={m.voteAverage}
                  releaseDate={m.firstAirDate}
                  index={index}
                  mediaType="tv"
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      <AnimatePresence>
        {showTrailerModal && trailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setShowTrailerModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-5xl aspect-video"
            >
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
                className="w-full h-full rounded-2xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
            <button
              onClick={() => setShowTrailerModal(false)}
              className="absolute top-4 right-4 text-white hover:text-white/80 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
