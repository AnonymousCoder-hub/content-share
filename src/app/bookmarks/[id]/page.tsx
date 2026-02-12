/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Folder, ArrowLeft, Trash2, Film } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useBookmarks } from '@/hooks/useBookmarks'
import MovieCard from '@/components/MovieCard'
import { toast } from 'sonner'

export default function BookmarkListPage() {
  const params = useParams()
  const router = useRouter()
  const { lists, removeItemFromList, deleteList, isInitialized } = useBookmarks()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !isInitialized) {
    return (
      <div className="min-h-screen bg-background">
        <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  const listId = params.id as string
  const list = lists.find((l) => l.id === listId)

  if (!list) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <Folder className="w-12 h-12 text-muted-foreground/50" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Bookmark list not found</h1>
          <Button onClick={() => router.push('/bookmarks')} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bookmarks
          </Button>
        </div>
      </div>
    )
  }

  const handleDeleteList = () => {
    if (confirm(`Are you sure you want to delete "${list.name}"?`)) {
      deleteList(listId)
      toast.success('Bookmark list deleted')
      router.push('/bookmarks')
    }
  }

  return (
    <div className="min-h-screen bg-background pb-16">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/bookmarks')}
                className="hover:bg-accent hover:scale-110 active:scale-95 transition-all duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Folder className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold">{list.name}</h1>
                  <p className="text-sm text-muted-foreground">
                    {list.items.length} {list.items.length === 1 ? 'item' : 'items'}
                  </p>
                </div>
              </div>
            </div>
            {list.items.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeleteList}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 hover:scale-110 active:scale-95 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete List
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {list.items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
              <Folder className="w-12 h-12 text-blue-500/50" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">List is empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Add movies and TV shows to this list by clicking the bookmark button on any page.
            </p>
            <Button
              onClick={() => router.push('/')}
              className="hover:scale-105 active:scale-95 transition-all duration-200"
            >
              Explore Movies & Shows
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {list.items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="relative group"
              >
                <MovieCard
                  id={item.id}
                  title={item.title}
                  posterPath={item.posterPath}
                  voteAverage={item.voteAverage}
                  releaseDate={item.releaseDate}
                  index={index}
                  mediaType={item.mediaType}
                />
                {/* Delete Button - always visible */}
                <button
                  onClick={() => {
                    removeItemFromList(list.id, item.id)
                    toast.success('Removed from list')
                  }}
                  className="absolute top-0 right-0 p-1.5 bg-black/60 hover:bg-red-500/90 active:bg-red-600 hover:scale-105 active:scale-95 rounded-tr-xl rounded-bl-lg transition-all duration-200 z-10"
                  title="Remove from list"
                >
                  <Trash2 className="w-3.5 h-3.5 text-white/90 group-hover:text-white" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}
