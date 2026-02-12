'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bookmark, Folder, FolderPlus, Trash2, ChevronRight, Film } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useBookmarks } from '@/hooks/useBookmarks'
import MovieCard from '@/components/MovieCard'
import { toast } from 'sonner'
import Navigation from '@/components/Navigation'
import FloatingNav from '@/components/FloatingNav'

export default function BookmarksPage() {
  const router = useRouter()
  const { lists, createList, deleteList, removeItemFromAllLists, isInitialized } = useBookmarks()
  const [mounted, setMounted] = useState(false)
  const [showNewListDialog, setShowNewListDialog] = useState(false)
  const [newListName, setNewListName] = useState('')

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCreateList = () => {
    if (!newListName.trim()) return
    createList(newListName.trim())
    setNewListName('')
    setShowNewListDialog(false)
    toast.success('Bookmark list created!')
  }

  const handleDeleteList = (listId: string, listName: string) => {
    if (confirm(`Are you sure you want to delete "${listName}"?`)) {
      deleteList(listId)
      toast.success('Bookmark list deleted')
    }
  }

  if (!mounted || !isInitialized) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </div>
        <FloatingNav />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      {/* Content */}
      <main className="flex-1 pt-8">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Bookmark className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">My Bookmarks</h1>
                  <p className="text-sm text-muted-foreground">
                    {lists.length} {lists.length === 1 ? 'list' : 'lists'}
                  </p>
                </div>
              </div>
              <Dialog open={showNewListDialog} onOpenChange={setShowNewListDialog}>
                <DialogTrigger asChild>
                  <Button
                    className="hover:scale-105 active:scale-95 transition-all duration-200"
                  >
                    <FolderPlus className="w-4 h-4 mr-2" />
                    New List
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Bookmark List</DialogTitle>
                    <DialogDescription>
                      Give your bookmark list a name to get started
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <Input
                      placeholder="List name..."
                      value={newListName}
                      onChange={(e) => setNewListName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                      autoFocus
                    />
                    <Button onClick={handleCreateList} className="w-full">
                      Create List
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {lists.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center"
            >
              <div className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-6">
                <Bookmark className="w-12 h-12 text-blue-500/50" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No bookmark lists yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md">
                Create bookmark lists to organize your favorite movies and TV shows.
              </p>
              <Button
                onClick={() => setShowNewListDialog(true)}
                className="hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <FolderPlus className="w-4 h-4 mr-2" />
                Create Your First List
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lists.map((list, listIndex) => (
                <motion.div
                  key={list.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: listIndex * 0.1 }}
                  className="group"
                >
                  <Link href={`/bookmarks/${list.id}`}>
                    <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:bg-card/80 hover:border-border transition-all duration-300 hover:scale-[1.02] cursor-pointer">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                            <Folder className="w-6 h-6 text-blue-500" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold group-hover:text-blue-500 transition-colors">
                              {list.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {list.items.length} {list.items.length === 1 ? 'item' : 'items'}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                      </div>

                      {/* Preview Grid */}
                      {list.items.length > 0 && (
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          {list.items.slice(0, 3).map((item) => (
                            <div key={item.id} className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
                              {item.posterPath ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w200${item.posterPath}`}
                                  alt={item.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Film className="w-6 h-6 text-muted-foreground/50" />
                                </div>
                              )}
                            </div>
                          ))}
                          {list.items.length > 3 && (
                            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted flex items-center justify-center">
                              <span className="text-sm font-semibold text-muted-foreground">
                                +{list.items.length - 3}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Created {new Date(list.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>

      <FloatingNav />
    </div>
  )
}
