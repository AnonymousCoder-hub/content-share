/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { motion } from 'framer-motion'
import Navigation from '@/components/Navigation'
import { Bell, Sparkles, Rocket, CheckCircle2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning'
  icon: any
  date: string
  isNew: boolean
}

export default function NotificationsPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const notifications: Notification[] = [
    {
      id: '1',
      title: 'Welcome to FireFlix V2! 🎉',
      message: 'We\'ve completely redesigned FireFlix from the ground up with a brand new sleek interface, improved performance, and exciting new features. Explore the new look and feel!',
      type: 'success',
      icon: Sparkles,
      date: 'Just now',
      isNew: true,
    },
    {
      id: '2',
      title: 'New Settings Page',
      message: 'Access all your preferences in one place. Customize your theme, manage bookmarks and favorites, and configure your viewing experience.',
      type: 'info',
      icon: Rocket,
      date: 'Just now',
      isNew: true,
    },
  ]

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-[1800px] mx-auto">
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </div>
      </div>
    )
  }

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-gradient-to-br from-green-500/10 to-emerald-500/5 border-green-500/20'
      case 'warning':
        return 'bg-gradient-to-br from-yellow-500/10 to-amber-500/5 border-yellow-500/20'
      default:
        return 'bg-gradient-to-br from-blue-500/10 to-cyan-500/5 border-blue-500/20'
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-500'
      case 'warning':
        return 'text-yellow-500'
      default:
        return 'text-blue-500'
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="pt-24 pb-12">
        <div className="max-w-[1800px] mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mb-8"
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-accent hover:scale-110 active:scale-95 transition-all duration-200 mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -20, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 15 }}
                className="relative"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-primary" />
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 15 }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-background"
                />
              </motion.div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold">Notifications</h1>
                <p className="text-muted-foreground mt-1">
                  Stay updated with the latest from FireFlix
                </p>
              </div>
            </div>
          </motion.div>

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications.map((notification, index) => {
              const Icon = notification.icon
              return (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  className={`relative overflow-hidden rounded-2xl border backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${getTypeStyles(notification.type)}`}
                >
                  {/* Background pattern */}
                  <div className="absolute inset-0 opacity-5">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-current rounded-full blur-3xl" />
                  </div>

                  <div className="relative p-6 sm:p-8">
                    <div className="flex gap-4 sm:gap-6">
                      {/* Icon */}
                      <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200, damping: 15 }}
                        className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center ${getIconColor(notification.type)}`}
                      >
                        <Icon className="w-6 h-6 sm:w-7 sm:h-7" />
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <h3 className="text-lg sm:text-xl font-semibold text-foreground">
                            {notification.title}
                          </h3>
                          {notification.isNew && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ delay: index * 0.1 + 0.3, type: 'spring', stiffness: 200, damping: 15 }}
                              className="flex-shrink-0 px-2.5 py-1 text-xs font-semibold bg-primary text-primary-foreground rounded-full"
                            >
                              NEW
                            </motion.span>
                          )}
                        </div>
                        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed mb-3">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground/70">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{notification.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Shimmer effect on hover */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full"
                    whileHover={{ translateX: '200%' }}
                    transition={{ duration: 0.8 }}
                  />
                </motion.div>
              )
            })}
          </div>

          {/* Empty State (hidden for now) */}
          {notifications.length === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <Bell className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground">You're all caught up!</p>
            </motion.div>
          )}

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center"
          >
            <p className="text-xs text-muted-foreground/60">
              Notifications help you stay informed about updates and new features
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
