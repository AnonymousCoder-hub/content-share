'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Bookmark, BookmarkCheck, FolderPlus, Folder, Plus } from 'lucide-react'
import { useBookmarks, BookmarkItem } from '@/hooks/useBookmarks'
import { ScrollArea } from '@/components/ui/scroll-area'
import { toast } from 'sonner'

interface BookmarkDialogProps {
  item: BookmarkItem
  children: React.ReactNode
}

export function BookmarkDialog({ item, children }: BookmarkDialogProps) {
  const { lists, createList, addItemToList, isItemInList } = useBookmarks()
  const [open, setOpen] = useState(false)
  const [showNewList, setShowNewList] = useState(false)
  const [newListName, setNewListName] = useState('')

  const handleCreateList = () => {
    if (!newListName.trim()) return

    const listId = createList(newListName.trim())
    addItemToList(listId, item)
    setNewListName('')
    setShowNewList(false)
    toast.success(`Added to "${newListName}"`)
  }

  const handleAddToList = (listId: string, listName: string) => {
    if (isItemInList(listId, item.id)) {
      toast.info('Already in this list')
    } else {
      addItemToList(listId, item)
      toast.success(`Added to "${listName}"`)
    }
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bookmark className="w-5 h-5" />
            Save to Bookmarks
          </DialogTitle>
          <DialogDescription>
            Create a new list or add to an existing one
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Create New List */}
          {showNewList ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3"
            >
              <div className="flex gap-2">
                <Input
                  placeholder="List name..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreateList()}
                  autoFocus
                />
                <Button onClick={handleCreateList} size="icon">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowNewList(false)
                  setNewListName('')
                }}
              >
                Cancel
              </Button>
            </motion.div>
          ) : (
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => setShowNewList(true)}
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Create New List
            </Button>
          )}

          {/* Existing Lists */}
          {lists.length > 0 && (
            <>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or add to existing
                  </span>
                </div>
              </div>

              <ScrollArea className="h-[200px]">
                <div className="space-y-2 pr-4">
                  {lists.map((list) => {
                    const isInList = isItemInList(list.id, item.id)
                    return (
                      <Button
                        key={list.id}
                        variant={isInList ? 'secondary' : 'outline'}
                        className="w-full justify-start hover:bg-accent transition-all duration-200"
                        onClick={() => handleAddToList(list.id, list.name)}
                      >
                        {isInList ? (
                          <BookmarkCheck className="w-4 h-4 mr-2 text-green-500" />
                        ) : (
                          <Folder className="w-4 h-4 mr-2" />
                        )}
                        <span className="flex-1 text-left">{list.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {list.items.length}
                        </span>
                      </Button>
                    )
                  })}
                </div>
              </ScrollArea>
            </>
          )}

          {lists.length === 0 && !showNewList && (
            <div className="text-center py-8 text-muted-foreground text-sm">
              <Bookmark className="w-12 h-12 mx-auto mb-3 opacity-20" />
              <p>No bookmark lists yet</p>
              <p>Create your first list to get started</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
