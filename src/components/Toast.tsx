/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Check, Link, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

interface ToastProps {
  message: string
  isVisible: boolean
  onClose: () => void
  icon?: 'link' | 'check'
}

export function Toast({ message, isVisible, onClose, icon = 'link' }: ToastProps) {
  const [progress, setProgress] = useState(100)

  useEffect(() => {
    if (isVisible) {
      setProgress(100)
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev <= 0) {
            clearInterval(interval)
            return 0
          }
          return prev - 2
        })
      }, 100)

      const timeout = setTimeout(() => {
        onClose()
      }, 5000)

      return () => {
        clearInterval(interval)
        clearTimeout(timeout)
      }
    }
  }, [isVisible, onClose])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed bottom-8 right-8 z-50"
        >
          <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-4 min-w-[320px] max-w-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                {icon === 'link' ? (
                  <Link className="w-5 h-5 text-primary" />
                ) : (
                  <Check className="w-5 h-5 text-green-500" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{message}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 flex-shrink-0"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 h-1 bg-muted rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: '100%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
