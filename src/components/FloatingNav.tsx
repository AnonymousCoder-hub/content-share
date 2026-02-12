'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, Filter, Settings, ChevronUp } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function FloatingNav() {
  const [isExpanded, setIsExpanded] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { icon: Home, label: 'Home', href: '/' },
    { icon: Filter, label: 'Filter', href: '/filter' },
    { icon: Settings, label: 'Settings', href: '/settings' },
  ]

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const handleNavClick = (href: string) => {
    setIsExpanded(false)
  }

  return (
    <>
      {/* Backdrop - closes nav when clicked */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleExpanded}
            className="fixed inset-0 z-40 pointer-events-auto"
            transition={{ duration: 0.2 }}
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-8 left-0 right-0 z-50 flex justify-center pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={isExpanded ? 'expanded' : 'collapsed'}
            initial={{
              height: 12,
              width: 160,
              borderRadius: 9999,
            }}
            animate={{
              height: isExpanded ? 72 : 12,
              width: isExpanded ? 240 : 160,
              borderRadius: 9999,
            }}
            exit={{
              height: 12,
              width: 160,
              borderRadius: 9999,
            }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 30,
            }}
            onClick={toggleExpanded}
            className="relative cursor-pointer pointer-events-auto"
          >
            {/* Glassmorphic capsule */}
            <motion.div
              className="absolute inset-0 bg-white/20 dark:bg-white/10 backdrop-blur-xl border border-white/30 dark:border-white/20 shadow-2xl rounded-full"
              whileHover={{
                scale: isExpanded ? 1 : 1.02,
              }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              {!isExpanded ? (
                // Collapsed state - white line
                <motion.div
                  initial={{ width: 40, height: 2 }}
                  animate={{ width: 40, height: 2 }}
                  whileHover={{ width: 60 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="bg-white/90 dark:bg-white/80 rounded-full"
                />
              ) : (
                // Expanded state - circular icons with thin borders
                <div className="flex items-center justify-center gap-4 px-6">
                  {navItems.map((item, index) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleNavClick(item.href)
                        }}
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0 }}
                          transition={{
                            delay: index * 0.08,
                            type: 'spring',
                            stiffness: 400,
                            damping: 25
                          }}
                          className="relative"
                        >
                          {/* Circular button with thin border */}
                          <div className={`
                            w-12 h-12 rounded-full flex items-center justify-center
                            border border-white/40 dark:border-white/30
                            transition-all duration-300
                            ${isActive
                              ? 'bg-white/20 border-white/60'
                              : 'bg-white/10 hover:bg-white/20'
                            }
                          `}>
                            <Icon
                              className={`w-5 h-5 transition-colors ${
                                isActive ? 'text-white' : 'text-white/80 hover:text-white'
                              }`}
                            />
                          </div>
                          {isActive && (
                            <motion.div
                              layoutId="activeIndicator"
                              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
                              initial={false}
                              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                          )}
                        </motion.div>
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </>
  )
}
