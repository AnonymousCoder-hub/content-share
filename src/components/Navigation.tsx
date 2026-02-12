'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Home, Film, TrendingUp, Star, Menu, X, User, Loader2, Calendar, Heart, Bookmark, Settings, Bell, Download } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSettings } from '@/hooks/useSettings'

interface SearchResult {
  id: number
  title?: string
  name?: string
  poster_path: string | null
  vote_average: number
  release_date?: string
  first_air_date?: string
  media_type: string
  popularity?: number
  vote_count?: number
}

export default function Navigation() {
  const router = useRouter()
  const { settings, mounted } = useSettings()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchDropdown, setShowSearchDropdown] = useState(false)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, width: 288 })
  const searchContainerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Update dropdown position - responsive for all screens
  const updateDropdownPosition = useCallback(() => {
    if (searchInputRef.current) {
      const rect = searchInputRef.current.getBoundingClientRect()
      const viewportWidth = window.innerWidth
      const margin = 16
      
      // On mobile (< 640px), use full width minus margins
      // On larger screens, cap at 288px
      let dropdownWidth: number
      if (viewportWidth < 640) {
        dropdownWidth = viewportWidth - (margin * 2)
      } else {
        dropdownWidth = Math.min(288, viewportWidth - (margin * 2))
      }
      
      // Align dropdown with the input's right edge
      let leftPos = rect.right - dropdownWidth
      
      // Keep within viewport
      if (leftPos < margin) {
        leftPos = margin
      }
      
      setDropdownPosition({
        top: rect.bottom + 8,
        left: leftPos,
        width: dropdownWidth
      })
    }
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Update dropdown position on resize and when dropdown shows
  useEffect(() => {
    if (showSearchDropdown) {
      updateDropdownPosition()
      window.addEventListener('resize', updateDropdownPosition)
      return () => window.removeEventListener('resize', updateDropdownPosition)
    }
  }, [showSearchDropdown, updateDropdownPosition])

  // Handle search with debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (searchQuery.trim().length >= 2) {
      setIsSearching(true)
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          const region = settings.region || 'US'
          const response = await fetch(
            `https://api.themoviedb.org/3/search/multi?api_key=7967738a03ec215c7d6d675faba9c973&query=${encodeURIComponent(searchQuery)}&region=${region}`
          )
          const data = await response.json()
          
          // Filter movies and TV, then sort by popularity (most popular first)
          const filteredResults = (data.results || [])
            .filter((item: SearchResult) => item.media_type === 'movie' || item.media_type === 'tv')
            .sort((a: SearchResult, b: SearchResult) => (b.popularity || 0) - (a.popularity || 0))
            .slice(0, 8)
          
          setSearchResults(filteredResults)
          setShowSearchDropdown(true)
        } catch (error) {
          console.error('Search error:', error)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }, 300)
    } else {
      setSearchResults([])
      setShowSearchDropdown(false)
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, settings.region])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      const clickedOnSearchContainer = searchContainerRef.current?.contains(target)
      const clickedOnDropdown = dropdownRef.current?.contains(target)
      
      if (!clickedOnSearchContainer && !clickedOnDropdown) {
        setShowSearchDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      setShowSearchDropdown(false)
      router.push(`/search?query=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const handleResultClick = (result: SearchResult) => {
    setShowSearchDropdown(false)
    setSearchQuery('')
    if (result.media_type === 'movie') {
      router.push(`/movie/${result.id}`)
    } else if (result.media_type === 'tv') {
      router.push(`/tv/${result.id}`)
    }
  }

  const handleNavClick = (href: string) => {
    setIsMobileMenuOpen(false)
    if (href.startsWith('/')) {
      router.push(href)
    }
  }

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Heart, label: 'Favourites', href: '/favourites' },
    { icon: Bookmark, label: 'Bookmarks', href: '/bookmarks' },
  ]

  const getYear = (date?: string) => {
    return date ? new Date(date).getFullYear() : 'N/A'
  }

  const getTitle = (item: SearchResult) => {
    return item.title || item.name || 'Unknown'
  }

  // Search Dropdown Component (rendered via portal)
  const SearchDropdown = () => {
    if (typeof document === 'undefined') return null
    
    return createPortal(
      <AnimatePresence>
        {showSearchDropdown && (
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              width: dropdownPosition.width
            }}
            className="bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl z-[9999]"
          >
            {isSearching ? (
              <div className="p-4 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              </div>
            ) : searchResults.length > 0 ? (
              <>
                <div className="px-3 py-2 border-b border-border/50">
                  <p className="text-xs text-muted-foreground font-medium truncate">
                    Results for "{searchQuery}"
                  </p>
                </div>
                <div className="max-h-[260px] overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/50 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border">
                  {searchResults.map((result) => (
                    <button
                      key={result.id}
                      onClick={() => handleResultClick(result)}
                      className="w-full px-3 py-2 hover:bg-accent transition-colors flex items-center gap-2.5 text-left"
                    >
                      <div className="flex-shrink-0 w-9 h-12 rounded overflow-hidden bg-muted">
                        {result.poster_path ? (
                          <img
                            src={`https://image.tmdb.org/t/p/w200${result.poster_path}`}
                            alt={getTitle(result)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="w-3.5 h-3.5 text-muted-foreground/50" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0 py-0.5">
                        <h3 className="font-medium text-sm line-clamp-1">
                          {getTitle(result)}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                          <Badge variant="secondary" className="h-4 px-1.5 py-0 text-[9px] font-medium">
                            {result.media_type === 'movie' ? 'Movie' : 'TV'}
                          </Badge>
                          <span className="flex items-center gap-0.5">
                            <Calendar className="w-2.5 h-2.5" />
                            {getYear(result.release_date || result.first_air_date)}
                          </span>
                          {result.vote_average > 0 && (
                            <span className="flex items-center gap-0.5">
                              <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                              {result.vote_average.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="px-3 py-2 border-t border-border/50">
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full text-center text-xs text-primary hover:text-primary/80 font-medium"
                  >
                    View all results →
                  </button>
                </div>
              </>
            ) : searchQuery.trim().length >= 2 ? (
              <div className="p-4 text-center">
                <Search className="w-7 h-7 mx-auto text-muted-foreground/50 mb-2" />
                <p className="text-xs text-muted-foreground">No results found</p>
              </div>
            ) : (
              <div className="p-3">
                <p className="text-xs text-muted-foreground mb-2">Popular</p>
                <div className="flex flex-wrap gap-1.5">
                  {['Dune', 'Oppenheimer', 'Barbie', 'Batman', 'Avatar'].map((term) => (
                    <button
                      key={term}
                      onClick={() => setSearchQuery(term)}
                      className="px-2.5 py-1 bg-secondary/80 hover:bg-accent rounded-full text-xs font-medium transition-colors"
                    >
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )
  }

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-background/95 backdrop-blur-xl border-b border-border/50'
            : 'bg-gradient-to-b from-black/60 to-transparent'
        }`}
      >
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2 group">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2"
              >
                <img src="/logo.png" alt="FireFlix" className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl" />
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-foreground/80 hover:text-foreground hover:bg-white/10 active:bg-white/20 active:scale-95 transition-all duration-200"
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.label}
                  </Button>
                </Link>
              ))}
            </div>

            {/* Right Section */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {/* Search Bar */}
              <div className="relative" ref={searchContainerRef}>
                <form onSubmit={handleSearchSubmit}>
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-foreground transition-colors" />
                    <Input
                      ref={searchInputRef}
                      type="search"
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => {
                        updateDropdownPosition()
                        if (searchQuery.trim().length >= 2) {
                          setShowSearchDropdown(true)
                        }
                      }}
                      className="pl-10 pr-4 h-9 bg-white/10 border-white/10 text-foreground placeholder:text-muted-foreground/70 focus:bg-white/15 focus:border-white/20 transition-all duration-200 rounded-full w-40 sm:w-52 focus:w-64 sm:focus:w-72 [&::-webkit-search-cancel-button]:appearance-none [&::-webkit-search-cancel-button]:hidden"
                    />
                    {isSearching && (
                      <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground animate-spin" />
                    )}
                    {!isSearching && searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery('')
                          setShowSearchDropdown(false)
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Notifications Button - Only show if enabled */}
              {settings.notificationsEnabled && (
                <Link href="/notifications" className="shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-foreground/80 hover:text-foreground hover:bg-white/10 hover:scale-105 active:scale-95 transition-all duration-200 relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                  </Button>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden text-foreground/80 hover:text-foreground hover:bg-white/10 shrink-0"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <AnimatePresence mode="wait">
                  {isMobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl overflow-hidden"
            >
              <div className="px-4 py-4 space-y-2">
                {navItems.map((item, index) => (
                  <motion.div
                    key={item.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.2 }}
                  >
                    <button
                      onClick={() => handleNavClick(item.href)}
                      className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-accent active:bg-accent/80 transition-all duration-200 active:scale-95"
                    >
                      <item.icon className="w-5 h-5 text-foreground/70" />
                      <span className="text-foreground/90">{item.label}</span>
                    </button>
                  </motion.div>
                ))}
                {/* Import Players - only in hamburger menu, NOT in desktop navbar */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.2 }}
                >
                  <button
                    onClick={() => handleNavClick('/import-players')}
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl hover:bg-accent active:bg-accent/80 transition-all duration-200 active:scale-95"
                  >
                    <Download className="w-5 h-5 text-foreground/70" />
                    <span className="text-foreground/90">Import Players</span>
                  </button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* Render Search Dropdown via Portal */}
      <SearchDropdown />
    </>
  )
}
