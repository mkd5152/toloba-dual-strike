"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Target, AlertCircle, Flame } from "lucide-react"

type NotificationType = "FOUR" | "SIX" | "WICKET"

interface CricketNotification {
  id: string
  type: NotificationType
  timestamp: Date
  teamName?: string
  message?: string
}

interface LiveCricketNotificationsProps {
  notifications: Array<{
    id: string
    type: NotificationType
    teamName?: string
    message?: string
  }>
}

export default function LiveCricketNotifications({ notifications }: LiveCricketNotificationsProps) {

  const getNotificationConfig = (type: NotificationType) => {
    switch (type) {
      case "SIX":
        return {
          icon: Flame,
          gradient: "from-orange-500 via-red-500 to-pink-600",
          textGradient: "from-yellow-300 via-orange-400 to-red-500",
          borderColor: "border-orange-400",
          shadowColor: "shadow-orange-500/50",
          glowColor: "shadow-[0_0_50px_rgba(251,146,60,0.6)]",
          emoji: "🔥",
          particleCount: 50,
        }
      case "FOUR":
        return {
          icon: Target,
          gradient: "from-blue-500 via-cyan-500 to-teal-400",
          textGradient: "from-cyan-300 via-blue-400 to-teal-400",
          borderColor: "border-cyan-400",
          shadowColor: "shadow-cyan-500/50",
          glowColor: "shadow-[0_0_40px_rgba(6,182,212,0.5)]",
          emoji: "⚡",
          particleCount: 30,
        }
      case "WICKET":
        return {
          icon: AlertCircle,
          gradient: "from-red-600 via-rose-600 to-pink-600",
          textGradient: "from-red-300 via-rose-400 to-pink-400",
          borderColor: "border-red-500",
          shadowColor: "shadow-red-500/50",
          glowColor: "shadow-[0_0_60px_rgba(220,38,38,0.7)]",
          emoji: "💥",
          particleCount: 40,
        }
    }
  }

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence mode="sync">
        {notifications.map((notification, index) => {
          const config = getNotificationConfig(notification.type)
          const Icon = config.icon

          return (
            <motion.div
              key={notification.id}
              initial={{
                scale: 0,
                y: "50vh",
                x: "-50%",
                opacity: 0,
                rotate: -180
              }}
              animate={{
                scale: [0, 1.5, 1.2, 1],
                y: ["50vh", "20vh", "25vh"],
                x: "-50%",
                opacity: [0, 1, 1, 0],
                rotate: [0, 10, -10, 0]
              }}
              exit={{
                scale: 0.5,
                opacity: 0,
                y: "-20vh",
                transition: { duration: 0.5 }
              }}
              transition={{
                duration: 3.5,
                times: [0, 0.3, 0.6, 1],
                ease: "easeOut"
              }}
              className="absolute left-1/2 top-0"
              style={{ zIndex: 100 - index }}
            >
              {/* Glow effect background */}
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className={`absolute inset-0 blur-3xl bg-gradient-to-r ${config.gradient} ${config.glowColor} rounded-full`}
              />

              {/* Main notification card */}
              <div className={`relative bg-gradient-to-br ${config.gradient} p-1 rounded-3xl ${config.shadowColor} shadow-2xl border-4 ${config.borderColor}`}>
                <div className="bg-slate-900/95 backdrop-blur-xl rounded-[20px] px-12 py-8 min-w-[400px]">
                  {/* Icon and emoji */}
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <motion.div
                      animate={{
                        rotate: [0, 360],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                        scale: { duration: 0.5, repeat: Infinity, repeatType: "reverse" }
                      }}
                    >
                      <Icon className="w-16 h-16 text-white" />
                    </motion.div>
                    <motion.span
                      animate={{
                        scale: [1, 1.3, 1],
                        rotate: [0, 20, -20, 0]
                      }}
                      transition={{
                        duration: 0.6,
                        repeat: Infinity,
                        repeatType: "reverse"
                      }}
                      className="text-6xl"
                    >
                      {config.emoji}
                    </motion.span>
                  </div>

                  {/* Main text */}
                  <motion.div
                    animate={{
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 0.5,
                      repeat: Infinity,
                      repeatType: "reverse"
                    }}
                    className="text-center"
                  >
                    <h1 className={`text-8xl font-black tracking-wider bg-gradient-to-r ${config.textGradient} bg-clip-text text-transparent drop-shadow-2xl`}>
                      {notification.type}!
                    </h1>
                    {notification.teamName && (
                      <p className="text-2xl font-bold text-white/90 mt-2">
                        {notification.teamName}
                      </p>
                    )}
                    {notification.message && (
                      <p className="text-lg font-semibold text-white/70 mt-1">
                        {notification.message}
                      </p>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* Particle effects */}
              {[...Array(config.particleCount)].map((_, i) => {
                const angle = (360 / config.particleCount) * i
                const distance = 200 + Math.random() * 100

                return (
                  <motion.div
                    key={i}
                    initial={{
                      x: 0,
                      y: 0,
                      scale: 0,
                      opacity: 1
                    }}
                    animate={{
                      x: Math.cos(angle * Math.PI / 180) * distance,
                      y: Math.sin(angle * Math.PI / 180) * distance,
                      scale: [0, 1, 0],
                      opacity: [1, 1, 0]
                    }}
                    transition={{
                      duration: 1.5,
                      delay: 0.3 + Math.random() * 0.3,
                      ease: "easeOut"
                    }}
                    className={`absolute left-1/2 top-1/2 w-3 h-3 rounded-full bg-gradient-to-r ${config.gradient}`}
                  />
                )
              })}

              {/* Ripple effect */}
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={`ripple-${i}`}
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{
                    scale: [0, 3, 4],
                    opacity: [0.6, 0.2, 0]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.4,
                    ease: "easeOut"
                  }}
                  className={`absolute inset-0 border-4 ${config.borderColor} rounded-full`}
                />
              ))}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
