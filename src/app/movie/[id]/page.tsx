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
  DollarSign,
  Heart,
  Share2,
  Plus,
  Check,
  X
} from 'lucide-react'

const TMDB_API_KEY = '7967738a03ec215c7d6d675faba9c973'

interface MovieDetails {
  id: number
  title: string
  overview: string
  backdropPath: string | null
  posterPath: string | null
  voteAverage: number
  voteCount: number
  releaseDate: string
  runtime: number
  genres: Array<{ id: number; name: string }>
  originalLanguage: string
  status: string
  tagline: string
  budget: number
  revenue: number
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

interface SimilarMovie {
  id: number
  title: string
  posterPath: string | null
  voteAverage: number
  releaseDate: string
}

interface Collection {
  id: number
  name: string
  posterPath: string | null
  backdropPath: string | null
}

interface CollectionMovie {
  id: number
  title: string
  posterPath: string | null
  voteAverage: number
  releaseDate: string
}

export default function MovieDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [cast, setCast] = useState<Cast[]>([])
  const [crew, setCrew] = useState<Crew[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [similarMovies, setSimilarMovies] = useState<SimilarMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [showTrailerModal, setShowTrailerModal] = useState(false)
  const [collection, setCollection] = useState<Collection | null>(null)
  const [collectionMovies, setCollectionMovies] = useState<CollectionMovie[]>([])

  // Favorites and Bookmarks
  const { isFavorite, toggleFavorite } = useFavorites()
  const { isInitialized: favoritesInitialized } = useFavorites()
  const { isInitialized: bookmarksInitialized } = useBookmarks()

  useEffect(() => {
    const fetchMovieDetails = async () => {
      try {
        const resolvedParams = await params as { id: string }
        const movieId = resolvedParams.id

        const response = await fetch(`/api/movie/${movieId}`)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('API Error:', errorData)
          throw new Error('Failed to fetch movie details')
        }

        const data = await response.json()

        if (data.movie) {
          const mappedMovie = {
            id: data.movie.id,
            title: data.movie.title || data.movie.name || 'Unknown',
            overview: data.movie.overview || '',
            backdropPath: data.movie.backdrop_path,
            posterPath: data.movie.poster_path,
            voteAverage: data.movie.vote_average,
            voteCount: data.movie.vote_count || 0,
            releaseDate: data.movie.release_date || data.movie.first_air_date || '',
            runtime: data.movie.runtime || 0,
            genres: data.movie.genres || [],
            originalLanguage: data.movie.original_language || '',
            status: data.movie.status || '',
            tagline: data.movie.tagline || '',
            budget: data.movie.budget || 0,
            revenue: data.movie.revenue || 0,
            imdbId: data.movie.external_ids?.imdb_id || null
          }
          setMovie(mappedMovie)

          if (data.collection) {
            setCollection({
              id: data.collection.id,
              name: data.collection.name,
              posterPath: data.collection.poster_path,
              backdropPath: data.collection.backdrop_path
            })

            const collectionParts = (data.collection.parts || []).map((part: any) => ({
              id: part.id,
              title: part.title || part.name || 'Unknown',
              posterPath: part.poster_path,
              voteAverage: part.vote_average,
              releaseDate: part.release_date || ''
            }))
            setCollectionMovies(collectionParts)
          }
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
            title: m.title || m.name || 'Unknown',
            posterPath: m.poster_path,
            voteAverage: m.vote_average,
            releaseDate: m.release_date || m.first_air_date || ''
          }))
          setSimilarMovies(mappedSimilar)
        }
      } catch (error) {
        console.error('Error fetching movie details:', error)
      } finally {
        setLoading(false)
      }
    }

    const loadMovie = async () => {
      try {
        const resolvedParams = params instanceof Promise ? await params : params
        const movieId = resolvedParams.id
        if (movieId) {
          fetchMovieDetails()
        }
      } catch (error) {
        console.error('Error resolving params:', error)
        setLoading(false)
      }
    }

    loadMovie()
  }, [params])

  const trailer = videos.find(
    (v) => v.site === 'YouTube' && v.type === 'Trailer' && v.official
  ) || videos.find((v) => v.site === 'YouTube' && v.type === 'Trailer')

  const director = crew.find((c) => c.job === 'Director')
  const writers = crew.filter((c) => c.job === 'Screenplay' || c.job === 'Writer')

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `$${(num / 1000000000).toFixed(1)}B`
    if (num >= 1000000) return `$${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `$${(num / 1000).toFixed(1)}K`
    return `$${num}`
  }

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const handleShare = async () => {
    if (!movie || !movie.imdbId) {
      toast.error('IMDb link not available for this content')
      return
    }

    const imdbUrl = `https://www.imdb.com/title/${movie.imdbId}`

    try {
      await navigator.clipboard.writeText(imdbUrl)
      toast.success('IMDb link copied to clipboard!')
    } catch (err) {
      toast.error('Failed to copy link')
    }
  }

  const handleLike = () => {
    if (!movie) return
    
    const isFav = toggleFavorite({
      id: movie.id,
      title: movie.title,
      posterPath: movie.posterPath,
      mediaType: 'movie',
      voteAverage: movie.voteAverage,
      releaseDate: movie.releaseDate
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

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Movie not found</h1>
          <Button onClick={() => router.push('/')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  const backdropUrl = movie.backdropPath
    ? `https://image.tmdb.org/t/p/original${movie.backdropPath}`
    : null
  const posterUrl = movie.posterPath
    ? `https://image.tmdb.org/t/p/w500${movie.posterPath}`
    : null

  const isLiked = favoritesInitialized && isFavorite(movie.id)

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <div className="relative">
        <div className="relative h-[50vh] sm:h-[60vh] overflow-hidden bg-black">
          {backdropUrl && (
            <img
              src={backdropUrl}
              alt={movie.title}
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
                    alt={movie.title}
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
                  {movie.title}
                </h1>
                {movie.tagline && (
                  <p className="text-lg text-foreground/70 italic">
                    "{movie.tagline}"
                  </p>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-wrap items-center gap-3"
              >
                <Badge className="bg-white/10 backdrop-blur-md text-white border-0 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  {movie.voteAverage?.toFixed(1) || 'N/A'}
                </Badge>
                <Badge className="bg-white/10 backdrop-blur-md text-white border-0 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : 'N/A'}
                </Badge>
                {movie.runtime > 0 && (
                  <Badge className="bg-white/10 backdrop-blur-md text-white border-0 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {formatRuntime(movie.runtime)}
                  </Badge>
                )}
                {movie.originalLanguage && (
                  <Badge className="bg-white/10 backdrop-blur-md text-white border-0 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" />
                    {movie.originalLanguage.toUpperCase()}
                  </Badge>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-2"
              >
                {movie.genres.map((genre) => (
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
                <Link href={`/watch/${movie.id}?type=movie`}>
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
                    id: movie.id,
                    title: movie.title,
                    posterPath: movie.posterPath,
                    mediaType: 'movie',
                    voteAverage: movie.voteAverage,
                    releaseDate: movie.releaseDate
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
                  {movie.overview || 'No overview available.'}
                </p>
              </motion.div>

              {(director || writers.length > 0) && (
                <>
                  <Separator className="my-6" />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="grid grid-cols-1 sm:grid-cols-2 gap-6"
                  >
                    {director && (
                      <div>
                        <h3 className="text-sm text-muted-foreground mb-1">Director</h3>
                        <p className="font-medium">{director.name}</p>
                      </div>
                    )}
                    {writers.length > 0 && (
                      <div>
                        <h3 className="text-sm text-muted-foreground mb-1">Writer{writers.length > 1 ? 's' : ''}</h3>
                        <p className="font-medium">{writers.map((w) => w.name).join(', ')}</p>
                      </div>
                    )}
                  </motion.div>
                </>
              )}

              {(movie.budget > 0 || movie.revenue > 0 || movie.runtime > 0 || movie.status) && (
                <>
                  <Separator className="my-6" />
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4"
                  >
                    {movie.budget > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.1 }}
                        className="relative group"
                      >
                        <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/20 rounded-2xl p-4 backdrop-blur-sm hover:bg-gradient-to-br hover:from-white/10 hover:to-white/[0.05] hover:border-white/30 transition-all duration-300">
                          <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <DollarSign className="w-5 h-5 text-white/80" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider font-medium">Budget</p>
                              <p className="text-sm sm:text-base font-semibold text-white">{formatNumber(movie.budget)}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {movie.revenue > 0 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3, delay: 0.15 }}
                        className="relative group"
                      >
                        <div className="relative bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/20 rounded-2xl p-4 backdrop-blur-sm hover:bg-gradient-to-br hover:from-white/10 hover:to-white/[0.05] hover:border-white/30 transition-all duration-300">
                          <div className="flex flex-col items-center text-center space-y-2">
                            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                              <TrendingUp className="w-5 h-5 text-white/80" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider font-medium">Revenue</p>
                              <p className="text-sm sm:text-base font-semibold text-white">{formatNumber(movie.revenue)}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {movie.runtime > 0 && (
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
                              <p className="text-sm sm:text-base font-semibold text-white">{formatRuntime(movie.runtime)}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {movie.status && (
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
                              <p className="text-sm sm:text-base font-semibold text-white">{movie.status}</p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {movie.releaseDate && (
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
                              <p className="text-[10px] sm:text-xs text-white/60 uppercase tracking-wider font-medium">Year</p>
                              <p className="text-sm sm:text-base font-semibold text-white">{new Date(movie.releaseDate).getFullYear()}</p>
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

      {/* Collection Section */}
      {collection && collectionMovies.length > 0 && (
        <section className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold mb-6">
            {collection.name.toLowerCase().endsWith('collection')
              ? collection.name
              : `${collection.name} Collection`}
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {collectionMovies.map((m, index) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MovieCard
                  id={m.id}
                  title={m.title}
                  posterPath={m.posterPath}
                  voteAverage={m.voteAverage}
                  releaseDate={m.releaseDate}
                  index={index}
                  mediaType="movie"
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Similar Movies Section */}
      {similarMovies.length > 0 && (
        <section className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-2xl font-bold mb-6">Similar Movies</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {similarMovies.map((m, index) => (
              <motion.div
                key={m.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <MovieCard
                  id={m.id}
                  title={m.title}
                  posterPath={m.posterPath}
                  voteAverage={m.voteAverage}
                  releaseDate={m.releaseDate}
                  index={index}
                  mediaType="movie"
                />
              </motion.div>
            ))}
          </div>
        </section>
      )}

      {/* Trailer Modal */}
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
