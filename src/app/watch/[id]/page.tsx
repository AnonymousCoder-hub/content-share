'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import MovieCard from '@/components/MovieCard'
import PlayerSelector, { Player } from '@/components/PlayerSelector'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Star, Clock, Calendar, ExternalLink, Play, Tv, Film, ChevronDown } from 'lucide-react'
import { useContinueWatching } from '@/hooks/useContinueWatching'

interface MovieDetails {
  id: number
  title: string
  overview: string
  backdropPath: string | null
  posterPath: string | null
  voteAverage: number
  releaseDate: string
  runtime: number
  genres: Array<{ id: number; name: string }>
  imdbId?: string
  numberOfSeasons?: number
  numberOfEpisodes?: number
  seasons?: Array<{
    season_number: number
    episode_count: number
    name: string
    poster_path: string | null
  }>
}

interface Episode {
  id: number
  episode_number: number
  name: string
  overview: string
  still_path: string | null
  runtime: number | null
  air_date: string
}

interface SimilarMovie {
  id: number
  title: string
  posterPath: string | null
  voteAverage: number
  releaseDate: string
}

export default function WatchPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { addItem } = useContinueWatching()
  const hasAddedToContinueWatching = useRef(false)

  const [movie, setMovie] = useState<MovieDetails | null>(null)
  const [similarMovies, setSimilarMovies] = useState<SimilarMovie[]>([])
  const [loading, setLoading] = useState(true)
  const [trailerKey, setTrailerKey] = useState<string | null>(null)

  // Player state
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [playerUrl, setPlayerUrl] = useState<string>('')

  // TV show state
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)
  const [episodes, setEpisodes] = useState<Episode[]>([])
  const [loadingEpisodes, setLoadingEpisodes] = useState(false)

  const mediaType = searchParams.get('type') || 'movie'
  const seasonParam = searchParams.get('s')
  const episodeParam = searchParams.get('e')

  // Initialize season and episode from URL params
  useEffect(() => {
    if (seasonParam) {
      const s = parseInt(seasonParam, 10)
      if (!isNaN(s) && s > 0) {
        setSeason(s)
      }
    }
    if (episodeParam) {
      const e = parseInt(episodeParam, 10)
      if (!isNaN(e) && e > 0) {
        setEpisode(e)
      }
    }
  }, [seasonParam, episodeParam])

  // Fetch episodes for a season
  const fetchEpisodes = async (tmdbId: string, seasonNum: number) => {
    setLoadingEpisodes(true)
    try {
      const response = await fetch(`/api/tv/${tmdbId}?season=${seasonNum}`)
      if (!response.ok) throw new Error('Failed to fetch episodes')

      const data = await response.json()
      setEpisodes(data.episodes || [])
    } catch (error) {
      console.error('Error fetching episodes:', error)
      setEpisodes([])
    } finally {
      setLoadingEpisodes(false)
    }
  }

  useEffect(() => {
    const fetchContentData = async () => {
      try {
        const resolvedParams = params instanceof Promise ? await params : params
        const contentId = resolvedParams.id

        const apiUrl = mediaType === 'tv' ? `/api/tv/${contentId}` : `/api/movie/${contentId}`

        const response = await fetch(apiUrl)
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          console.error('API Error:', errorData)
          throw new Error('Failed to fetch content data')
        }

        const data = await response.json()

        const contentData = mediaType === 'tv' ? data.tv : data.movie
        if (contentData) {
          const mappedContent = {
            id: contentData.id,
            title: contentData.title || contentData.name || 'Unknown',
            overview: contentData.overview || '',
            backdropPath: contentData.backdrop_path,
            posterPath: contentData.poster_path,
            voteAverage: contentData.vote_average,
            releaseDate: contentData.release_date || contentData.first_air_date || '',
            runtime: contentData.runtime || (contentData.episode_run_time?.[0]) || 0,
            genres: contentData.genres || [],
            imdbId: contentData.external_ids?.imdb_id || '',
            numberOfSeasons: contentData.number_of_seasons || 0,
            numberOfEpisodes: contentData.number_of_episodes || 0,
            seasons: contentData.seasons || []
          }
          setMovie(mappedContent)

          // Extract trailer from videos
          const videosData = data.videos
          if (videosData?.results) {
            // Find the first trailer (type: 'Trailer' and site: 'YouTube')
            const trailer = videosData.results.find(
              (v: any) => v.type === 'Trailer' && v.site === 'YouTube'
            )
            if (trailer) {
              setTrailerKey(trailer.key)
            }
          }

          // Fetch episodes for TV shows
          if (mediaType === 'tv') {
            fetchEpisodes(contentId, season)
          }
        }

        const similarData = mediaType === 'tv' ? data.similar : data.similar
        if (similarData?.results) {
          const mappedSimilar = similarData.results.map((m: any) => ({
            id: m.id,
            title: m.title || m.name || 'Unknown',
            posterPath: m.poster_path,
            voteAverage: m.vote_average,
            releaseDate: m.release_date || m.first_air_date || ''
          }))
          setSimilarMovies(mappedSimilar)
        }
      } catch (error) {
        console.error('Error fetching content data:', error)
      } finally {
        setLoading(false)
      }
    }

    const loadContent = async () => {
      try {
        const resolvedParams = params instanceof Promise ? await params : params
        const contentId = resolvedParams.id
        if (contentId) {
          fetchContentData()
        }
      } catch (error) {
        console.error('Error resolving params:', error)
        setLoading(false)
      }
    }

    loadContent()
  }, [params, searchParams, mediaType])

  // Update player URL when player, season, or episode changes
  useEffect(() => {
    if (movie && selectedPlayer && movie.imdbId) {
      const url = selectedPlayer.getUrl(
        movie.imdbId,
        movie.id.toString(),
        mediaType as 'movie' | 'tv',
        season,
        episode
      )

      // Validate URL before setting it
      if (url && url.startsWith('http')) {
        setPlayerUrl(url)
      } else {
        console.error('Invalid player URL:', url)
        setPlayerUrl('')
      }
    }
  }, [movie, selectedPlayer, season, episode, mediaType])

  // Remove sandbox attribute when switching to non-sandboxed player
  useEffect(() => {
    if (iframeRef.current && selectedPlayer && !selectedPlayer.useSandbox) {
      // Force remove sandbox attribute
      iframeRef.current.removeAttribute('sandbox')
    }
  }, [selectedPlayer])

  // Add to continue watching when content loads with player (only once)
  useEffect(() => {
    if (movie && selectedPlayer && movie.imdbId && !hasAddedToContinueWatching.current) {
      const watchingItem: any = {
        id: movie.id,
        title: movie.title,
        posterPath: movie.posterPath,
        mediaType: mediaType as 'movie' | 'tv',
        lastWatched: new Date().toISOString(),
        progress: 0
      }

      if (mediaType === 'tv') {
        watchingItem.season = season
        watchingItem.episode = episode
      }

      addItem(watchingItem)
      hasAddedToContinueWatching.current = true
    }
  }, [movie, selectedPlayer, mediaType, season, episode, addItem])

  // Fetch episodes when season changes
  useEffect(() => {
    if (movie && mediaType === 'tv' && movie.id) {
      fetchEpisodes(movie.id.toString(), season)
    }
  }, [season, movie, mediaType])



  const handlePlayerChange = (player: Player) => {
    setSelectedPlayer(player)
  }

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-16">
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
          <h1 className="text-2xl font-bold mb-4">Content not found</h1>
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

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
        <Navigation />

        <div className="pt-16">
        {/* Video Player */}
        <div className="relative w-full bg-black" style={{ height: '56.25vw', maxHeight: '80vh' }}>
          {/* Back Button Overlay */}
          <div className="absolute top-4 left-4 z-20">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="text-white hover:bg-white/10 backdrop-blur-md bg-black/30"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </div>

          {/* Player Selector Overlay */}
          {movie.imdbId && (
            <div className="absolute top-4 right-4 z-20">
              <PlayerSelector
                imdbId={movie.imdbId}
                tmdbId={movie.id.toString()}
                mediaType={mediaType as 'movie' | 'tv'}
                season={season}
                episode={episode}
                onPlayerChange={handlePlayerChange}
              />
            </div>
          )}

          {/* TV Show Current Info Overlay */}
          {mediaType === 'tv' && movie && (
            <div className="absolute top-4 left-4 z-20">
              <div className="flex items-center gap-2 bg-black/70 backdrop-blur-md border border-white/20 rounded-lg px-4 py-2">
                <Tv className="w-4 h-4 text-white/70" />
                <span className="text-white text-sm font-medium">S{season}</span>
                <span className="text-white/40">:</span>
                <span className="text-white text-sm font-medium">E{episode}</span>
              </div>
            </div>
          )}

          {/* Iframe Player */}
          {playerUrl && selectedPlayer ? (
            selectedPlayer.useSandbox ? (
              <iframe
                key={`sandbox-${selectedPlayer.id}-${playerUrl}`}
                src={playerUrl}
                className="absolute inset-0 w-full h-full border-0"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="origin"
                sandbox={selectedPlayer.sandboxPermissions}
              />
            ) : (
              <iframe
                ref={iframeRef}
                key={`nosandbox-${selectedPlayer.id}-${playerUrl}`}
                src={playerUrl}
                className="absolute inset-0 w-full h-full border-0"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
                allowFullScreen
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                referrerPolicy="origin"
              />
            )
          ) : (
            <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
              <div className="text-center">
                {movie.imdbId ? (
                  <>
                    <Skeleton className="w-32 h-32 mx-auto mb-4 rounded-full" />
                    <p className="text-white/70">Loading player...</p>
                  </>
                ) : (
                  <>
                    <Film className="w-16 h-16 mx-auto mb-4 text-white/30" />
                    <p className="text-white/70">Player not available</p>
                    <p className="text-white/50 text-sm mt-2">IMDB ID not found for this content</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* TV Show Episode Selection */}
        {mediaType === 'tv' && movie && (
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-4"
            >
              {/* Season Selector */}
              <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
                <h2 className="text-xl font-bold">Episodes</h2>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-card border border-border rounded-lg px-2 sm:px-3 py-2 flex-shrink-0 max-w-[200px] sm:max-w-[300px]">
                  <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">Season:</span>
                  <select
                    value={season}
                    onChange={(e) => {
                      const newSeason = Number(e.target.value)
                      setSeason(newSeason)
                      setEpisode(1)
                    }}
                    className="bg-transparent text-xs sm:text-sm font-medium outline-none cursor-pointer flex-1 min-w-0 truncate appearance-none"
                  >
                    {movie.seasons
                      ?.filter((s) => s.season_number > 0)
                      .map((s) => (
                        <option key={s.season_number} value={s.season_number} className="bg-gray-900">
                          {s.name || `Season ${s.season_number}`}
                        </option>
                      ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                </div>
              </div>

              {/* Episodes List */}
              {loadingEpisodes ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-card rounded-lg">
                      <Skeleton className="w-20 h-14 sm:w-28 sm:h-20 rounded-lg flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : episodes.length > 0 ? (
                <div className="flex flex-col gap-2 max-h-[500px] overflow-y-auto overflow-x-hidden pr-2">
                  {episodes.map((ep) => (
                    <button
                      key={ep.id}
                      onClick={() => setEpisode(ep.episode_number)}
                      className={`flex gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg transition-all duration-200 text-left touch-pan-y w-full ${
                        episode === ep.episode_number
                          ? 'bg-primary/10 border-primary/30'
                          : 'bg-card hover:bg-accent/50 border-transparent'
                      } border`}
                    >
                      {/* Episode Still Image */}
                      <div className="w-20 h-14 sm:w-28 sm:h-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                        {ep.still_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                            alt={`Episode ${ep.episode_number}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground/50">
                            <Play className="w-8 h-8" />
                          </div>
                        )}
                      </div>

                      {/* Episode Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-muted-foreground flex-shrink-0">
                            {ep.episode_number}.
                          </span>
                          <h3 className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px] md:max-w-[400px]">{ep.name || `Episode ${ep.episode_number}`}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
                          {ep.overview || 'No description available.'}
                        </p>
                        {ep.runtime && (
                          <span className="text-xs text-muted-foreground/70">
                            {ep.runtime}m
                          </span>
                        )}
                      </div>

                      {/* Playing Indicator */}
                      {episode === ep.episode_number && (
                        <div className="flex items-center justify-center w-8 h-8 bg-primary rounded-full flex-shrink-0">
                          <Play className="w-4 h-4 text-primary-foreground fill-current" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No episodes available for this season
                </div>
              )}
            </motion.div>
          </div>
        )}

        {/* Content Info with Video Background */}
        <div className="relative">
          {/* Video Background */}
          {trailerKey ? (
            <div className="absolute inset-0 -z-10 overflow-hidden">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0`}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[177.78vh] h-[56.25vw] min-w-full min-h-full pointer-events-none"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
              {/* Dark overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
            </div>
          ) : movie.backdropPath ? (
            <div className="absolute inset-0 -z-10">
              <img
                src={`https://image.tmdb.org/t/p/original${movie.backdropPath}`}
                alt=""
                className="w-full h-full object-cover opacity-30"
              />
              {/* Dark overlay for readability */}
              <div className="absolute inset-0 bg-gradient-to-b from-background via-background/90 to-background" />
            </div>
          ) : null}

          {/* Content */}
          <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-6"
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">{movie.title}</h1>
                  {mediaType === 'tv' && (
                    <Badge className="bg-purple-500/90 text-white border-0">TV Show</Badge>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <Badge className="bg-white/10 backdrop-blur-md text-white border-0 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                    <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                    {movie.voteAverage?.toFixed(1) || 'N/A'}
                  </Badge>
                  {movie.releaseDate && (
                    <Badge className="bg-white/10 backdrop-blur-md text-white border-0 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(movie.releaseDate).getFullYear()}
                    </Badge>
                  )}
                  {movie.runtime > 0 && (
                    <Badge className="bg-white/10 backdrop-blur-md text-white border-0 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {formatRuntime(movie.runtime)}
                    </Badge>
                  )}
                  {mediaType === 'tv' && movie.numberOfSeasons > 0 && (
                    <Badge className="bg-white/10 backdrop-blur-md text-white border-0 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                      <Tv className="w-3.5 h-3.5" />
                      {movie.numberOfSeasons} Season{movie.numberOfSeasons > 1 ? 's' : ''}
                    </Badge>
                  )}
                  {movie.imdbId && (
                    <a
                      href={`https://www.imdb.com/title/${movie.imdbId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-white/50 hover:text-white/70 flex items-center gap-1 transition-colors"
                    >
                      <span>IMDb</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Overview */}
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Overview</h2>
              <p className="text-foreground/80 leading-relaxed text-base sm:text-lg">
                {movie.overview || 'No overview available.'}
              </p>
            </div>

            {/* Genres */}
            {movie.genres && movie.genres.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Genres</h3>
                <div className="flex flex-wrap gap-2">
                  {movie.genres.map((genre) => (
                    <Badge
                      key={genre.id}
                      variant="secondary"
                      className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-full"
                    >
                      {genre.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Similar Content */}
            {similarMovies.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Similar {mediaType === 'tv' ? 'TV Shows' : 'Movies'}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {similarMovies.slice(0, 12).map((item) => (
                    <MovieCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      posterPath={item.posterPath}
                      voteAverage={item.voteAverage}
                      releaseDate={item.releaseDate}
                      mediaType={mediaType as 'movie' | 'tv'}
                    />
                  ))}
                </div>
              </div>
            )}
          </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Force dynamic rendering to avoid build-time prerendering issues
export const dynamic = 'force-dynamic'

