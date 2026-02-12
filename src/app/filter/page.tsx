'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import MovieCard from '@/components/MovieCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Film,
  Tv,
  Calendar,
  Star,
  TrendingUp,
  Filter as FilterIcon,
  X,
  ChevronDown,
} from 'lucide-react'

interface MovieResult {
  id: number
  title: string
  posterPath: string | null
  voteAverage: number
  releaseDate: string
}

const GENRES = {
  movie: [
    { id: 28, name: 'Action' },
    { id: 12, name: 'Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 14, name: 'Fantasy' },
    { id: 36, name: 'History' },
    { id: 27, name: 'Horror' },
    { id: 10402, name: 'Music' },
    { id: 9648, name: 'Mystery' },
    { id: 10749, name: 'Romance' },
    { id: 878, name: 'Science Fiction' },
    { id: 10770, name: 'TV Movie' },
    { id: 53, name: 'Thriller' },
    { id: 10752, name: 'War' },
    { id: 37, name: 'Western' },
  ],
  tv: [
    { id: 10759, name: 'Action & Adventure' },
    { id: 16, name: 'Animation' },
    { id: 35, name: 'Comedy' },
    { id: 80, name: 'Crime' },
    { id: 99, name: 'Documentary' },
    { id: 18, name: 'Drama' },
    { id: 10751, name: 'Family' },
    { id: 10762, name: 'Kids' },
    { id: 9648, name: 'Mystery' },
    { id: 10763, name: 'News' },
    { id: 10764, name: 'Reality' },
    { id: 10765, name: 'Sci-Fi & Fantasy' },
    { id: 10766, name: 'Soap' },
    { id: 10767, name: 'Talk' },
    { id: 10768, name: 'War & Politics' },
    { id: 37, name: 'Western' },
  ],
}

const SORT_OPTIONS = [
  { value: 'popularity.desc', label: 'Most Popular' },
  { value: 'popularity.asc', label: 'Least Popular' },
  { value: 'vote_average.desc', label: 'Highest Rated' },
  { value: 'vote_average.asc', label: 'Lowest Rated' },
  { value: 'primary_release_date.desc', label: 'Newest First' },
  { value: 'primary_release_date.asc', label: 'Oldest First' },
  { value: 'revenue.desc', label: 'Highest Revenue' },
  { value: 'revenue.asc', label: 'Lowest Revenue' },
]

const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((year) => ({
  value: year.toString(),
  label: year.toString(),
}))

export default function FilterPage() {
  const [mediaType, setMediaType] = useState<'movie' | 'tv'>('movie')
  const [selectedGenre, setSelectedGenre] = useState<string>('all')
  const [selectedYear, setSelectedYear] = useState<string>('all')
  const [minRating, setMinRating] = useState<number>(0)
  const [sortBy, setSortBy] = useState<string>('popularity.desc')
  const [results, setResults] = useState<MovieResult[]>([])
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)

  const fetchFilteredResults = async (resetPage = false) => {
    setLoading(true)
    try {
      const currentPage = resetPage ? 1 : page
      const params = new URLSearchParams({
        api_key: '7967738a03ec215c7d6d675faba9c973',
        page: currentPage.toString(),
        sort_by: sortBy,
      })

      if (selectedGenre && selectedGenre !== 'all') params.append('with_genres', selectedGenre)
      if (selectedYear && selectedYear !== 'all') params.append('primary_release_year', selectedYear)
      if (minRating > 0) params.append('vote_average.gte', minRating.toString())

      const endpoint = mediaType === 'movie' ? 'discover/movie' : 'discover/tv'
      const response = await fetch(
        `https://api.themoviedb.org/3/${endpoint}?${params.toString()}`
      )

      if (!response.ok) throw new Error('Failed to fetch results')

      const data = await response.json()
      const mappedResults = (data.results || []).map((item: any) => ({
        id: item.id,
        title: item.title || item.name || 'Unknown',
        posterPath: item.poster_path,
        voteAverage: item.vote_average || 0,
        releaseDate: item.release_date || item.first_air_date || '',
      }))

      if (resetPage) {
        setResults(mappedResults)
        setPage(1)
      } else {
        setResults((prev) => [...prev, ...mappedResults])
      }

      setTotalPages(data.total_pages || 0)
    } catch (error) {
      console.error('Error fetching filtered results:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchFilteredResults(true)
    }, 500)

    return () => clearTimeout(delayDebounce)
  }, [mediaType, selectedGenre, selectedYear, minRating, sortBy])

  const handleResetFilters = () => {
    setSelectedGenre('all')
    setSelectedYear('all')
    setMinRating(0)
    setSortBy('popularity.desc')
    setPage(1)
  }

  const activeFiltersCount = [selectedGenre, selectedYear, minRating > 0 ? minRating : null].filter(
    Boolean
  ).length

  const currentGenres = GENRES[mediaType]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-12">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <FilterIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-bold">Discover</h1>
                  <p className="text-muted-foreground">
                    Find your next favorite {mediaType === 'movie' ? 'movie' : 'show'}
                  </p>
                </div>
              </div>

              {activeFiltersCount > 0 && (
                <Button
                  variant="outline"
                  onClick={handleResetFilters}
                  className="gap-2"
                >
                  <X className="w-4 h-4" />
                  Reset Filters ({activeFiltersCount})
                </Button>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                  {mediaType === 'movie' ? <Film className="w-4 h-4" /> : <Tv className="w-4 h-4" />}
                  Type
                </label>
                <Select value={mediaType} onValueChange={(value) => setMediaType(value as 'movie' | 'tv')}>
                  <SelectTrigger className="bg-card border-border/50">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/50">
                    <SelectItem value="movie">
                      <div className="flex items-center gap-2">
                        <Film className="w-4 h-4" />
                        Movies
                      </div>
                    </SelectItem>
                    <SelectItem value="tv">
                      <div className="flex items-center gap-2">
                        <Tv className="w-4 h-4" />
                        TV Shows
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/70">Genre</label>
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="bg-card border-border/50">
                    <SelectValue placeholder="All genres" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/50 max-h-[300px] overflow-y-auto">
                    <SelectItem value="all">All genres</SelectItem>
                    {currentGenres.map((genre) => (
                      <SelectItem key={genre.id} value={genre.id.toString()}>
                        {genre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Year
                </label>
                <Select value={selectedYear} onValueChange={setSelectedYear}>
                  <SelectTrigger className="bg-card border-border/50">
                    <SelectValue placeholder="All years" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/50 max-h-[300px] overflow-y-auto">
                    <SelectItem value="all">All years</SelectItem>
                    {YEARS.map((year) => (
                      <SelectItem key={year.value} value={year.value}>
                        {year.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Min Rating: {minRating}
                </label>
                <div className="bg-card border border-border/50 rounded-lg p-3">
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.5"
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>0</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground/70 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Sort By
                </label>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-card border-border/50">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border/50 max-h-[300px] overflow-y-auto">
                    {SORT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeFiltersCount > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex flex-wrap gap-2"
              >
                {selectedGenre !== 'all' &&  (
                  <Badge variant="secondary" className="gap-1 pr-2">
                    Genre: {currentGenres.find((g) => g.id.toString() === selectedGenre)?.name}
                    <button onClick={() => setSelectedGenre('all')} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {selectedYear !== 'all' &&  (
                  <Badge variant="secondary" className="gap-1 pr-2">
                    Year: {selectedYear}
                    <button onClick={() => setSelectedYear('all')} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
                {minRating > 0 && (
                  <Badge variant="secondary" className="gap-1 pr-2">
                    Rating: {minRating}+
                    <button onClick={() => setMinRating(0)} className="ml-1 hover:text-destructive">
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                )}
              </motion.div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {loading && results.length === 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="space-y-3">
                    <Skeleton className="aspect-[2/3] rounded-xl" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="flex items-center justify-between mb-6">
                  <p className="text-muted-foreground">{results.length} results found</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  {results.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="flex-shrink-0"
                    >
                      <MovieCard
                        id={item.id}
                        title={item.title}
                        posterPath={item.posterPath}
                        voteAverage={item.voteAverage}
                        releaseDate={item.releaseDate}
                        index={index}
                        mediaType={mediaType}
                      />
                    </motion.div>
                  ))}
                </div>

                {page < totalPages && (
                  <div className="flex justify-center mt-8">
                    <Button
                      onClick={() => {
                        setPage(page + 1)
                        fetchFilteredResults()
                      }}
                      disabled={loading}
                      className="gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                          Loading...
                        </>
                      ) : (
                        <>
                          Load More
                          <ChevronDown className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <FilterIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">No results found</h3>
                <p className="text-muted-foreground mb-6">
                  Try adjusting your filters to find what you're looking for
                </p>
                <Button onClick={handleResetFilters}>Reset All Filters</Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}
