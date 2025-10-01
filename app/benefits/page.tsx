"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Bookmark, Share2, Volume2, VolumeX } from "lucide-react"

interface Video {
  id: number
  title: string
  description: string
  impact: string
  videoUrl: string
  likes: number
  comments: number
  saves: number
  shares: number
}

const videos: Video[] = [
  {
    id: 1,
    title: "Wildfire Monitoring",
    description: "Real-time tracking from space saves lives",
    impact: "Saved thousands of lives worldwide",
    videoUrl: "/wildfire-from-space-satellite-view.jpg",
    likes: 20500,
    comments: 228,
    saves: 1228,
    shares: 490,
  },
  {
    id: 2,
    title: "Smart Farming",
    description: "ECOSTRESS optimizes irrigation",
    impact: "30% water efficiency improvement",
    videoUrl: "/agricultural-fields-from-space-green-crops.jpg",
    likes: 18300,
    comments: 156,
    saves: 892,
    shares: 345,
  },
  {
    id: 3,
    title: "Hurricane Tracking",
    description: "Early warning systems",
    impact: "Critical evacuation time",
    videoUrl: "/hurricane-from-space-satellite-view.jpg",
    likes: 25100,
    comments: 412,
    saves: 1567,
    shares: 678,
  },
  {
    id: 4,
    title: "Urban Planning",
    description: "Heat island detection",
    impact: "Reduced energy consumption",
    videoUrl: "/city-lights-at-night-from-space.jpg",
    likes: 15700,
    comments: 189,
    saves: 743,
    shares: 298,
  },
  {
    id: 5,
    title: "Ocean Health",
    description: "Coral reef monitoring",
    impact: "Protected marine ecosystems",
    videoUrl: "/ocean-and-coral-reefs-from-space.jpg",
    likes: 22400,
    comments: 301,
    saves: 1134,
    shares: 521,
  },
]

export default function BenefitsPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [userLiked, setUserLiked] = useState<Record<number, boolean>>({})
  const [userSaved, setUserSaved] = useState<Record<number, boolean>>({})
  const [videoStats, setVideoStats] = useState<Record<number, Video>>(
    videos.reduce((acc, v) => ({ ...acc, [v.id]: v }), {}),
  )
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    audioRef.current = new Audio("/space-ambient.mp3")
    audioRef.current.loop = true
    audioRef.current.volume = 0.3
    if (!isMuted) {
      audioRef.current.play().catch(() => {})
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(() => {})
      }
    }
  }, [isMuted])

  const scrollToIndex = (index: number) => {
    if (index < 0 || index >= videos.length || isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    if (isTransitioning) return

    if (e.deltaY > 0 && currentIndex < videos.length - 1) {
      scrollToIndex(currentIndex + 1)
    } else if (e.deltaY < 0 && currentIndex > 0) {
      scrollToIndex(currentIndex - 1)
    }
  }

  const handleTouchStart = (e: TouchEvent) => {
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: TouchEvent) => {
    const touchEndY = e.changedTouches[0].clientY
    const diff = touchStartY.current - touchEndY

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < videos.length - 1) {
        scrollToIndex(currentIndex + 1)
      } else if (diff < 0 && currentIndex > 0) {
        scrollToIndex(currentIndex - 1)
      }
    }
  }

  const handleLike = (id: number) => {
    setUserLiked((prev) => {
      const newLiked = { ...prev, [id]: !prev[id] }
      setVideoStats((prevStats) => ({
        ...prevStats,
        [id]: {
          ...prevStats[id],
          likes: prevStats[id].likes + (newLiked[id] ? 1 : -1),
        },
      }))
      return newLiked
    })
  }

  const handleSave = (id: number) => {
    setUserSaved((prev) => {
      const newSaved = { ...prev, [id]: !prev[id] }
      setVideoStats((prevStats) => ({
        ...prevStats,
        [id]: {
          ...prevStats[id],
          saves: prevStats[id].saves + (newSaved[id] ? 1 : -1),
        },
      }))
      return newSaved
    })
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    container.addEventListener("wheel", handleWheel, { passive: false })
    container.addEventListener("touchstart", handleTouchStart)
    container.addEventListener("touchend", handleTouchEnd)

    return () => {
      container.removeEventListener("wheel", handleWheel)
      container.removeEventListener("touchstart", handleTouchStart)
      container.removeEventListener("touchend", handleTouchEnd)
    }
  }, [currentIndex, isTransitioning])

  const currentVideo = videoStats[videos[currentIndex].id]

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  return (
    <main
      ref={containerRef}
      className="h-screen w-screen overflow-hidden bg-black text-white relative font-space-grotesk"
    >
      <div
        className="absolute inset-0 transition-all duration-500 ease-out"
        style={{
          backgroundImage: `url(${currentVideo.videoUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div className="absolute right-4 bottom-32 flex flex-col gap-6 z-20">
        <button
          onClick={() => handleLike(currentVideo.id)}
          className="flex flex-col items-center gap-1 transition-transform hover:scale-110 active:scale-95"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
              userLiked[currentVideo.id] ? "bg-red-500/40" : "bg-white/20"
            }`}
          >
            <Heart className={`h-7 w-7 ${userLiked[currentVideo.id] ? "fill-red-500 text-red-500" : "text-white"}`} />
          </div>
          <span className="text-sm font-bold text-white drop-shadow-lg">{formatNumber(currentVideo.likes)}</span>
        </button>

        <button className="flex flex-col items-center gap-1 transition-transform hover:scale-110 active:scale-95">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
          <span className="text-sm font-bold text-white drop-shadow-lg">{formatNumber(currentVideo.comments)}</span>
        </button>

        <button
          onClick={() => handleSave(currentVideo.id)}
          className="flex flex-col items-center gap-1 transition-transform hover:scale-110 active:scale-95"
        >
          <div
            className={`w-14 h-14 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
              userSaved[currentVideo.id] ? "bg-yellow-500/40" : "bg-white/20"
            }`}
          >
            <Bookmark
              className={`h-7 w-7 ${userSaved[currentVideo.id] ? "fill-yellow-500 text-yellow-500" : "text-white"}`}
            />
          </div>
          <span className="text-sm font-bold text-white drop-shadow-lg">{formatNumber(currentVideo.saves)}</span>
        </button>

        <button className="flex flex-col items-center gap-1 transition-transform hover:scale-110 active:scale-95">
          <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
            <Share2 className="h-7 w-7 text-white" />
          </div>
          <span className="text-sm font-bold text-white drop-shadow-lg">{formatNumber(currentVideo.shares)}</span>
        </button>
      </div>

      <button
        onClick={() => setIsMuted(!isMuted)}
        className="absolute top-6 left-6 z-20 w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center hover:bg-white/30 transition-all"
      >
        {isMuted ? <VolumeX className="h-6 w-6 text-white" /> : <Volume2 className="h-6 w-6 text-white" />}
      </button>

      <div className="relative h-full flex flex-col justify-end p-6 pb-32">
        <div className="max-w-md space-y-3 animate-fade-in">
          <h2 className="text-3xl font-bold leading-tight font-orbitron drop-shadow-lg">{currentVideo.title}</h2>
          <p className="text-lg font-light drop-shadow-lg">{currentVideo.description}</p>
          <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <p className="text-sm font-semibold">{currentVideo.impact}</p>
          </div>
        </div>

        {currentIndex === videos.length - 1 && (
          <Button
            onClick={() => router.push("/quiz")}
            size="lg"
            className="mt-6 h-14 px-12 text-lg bg-white text-black hover:bg-white/90 font-bold font-orbitron"
          >
            Take the Quiz
          </Button>
        )}
      </div>

      <div className="absolute top-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
        {videos.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToIndex(i)}
            className={`h-1 rounded-full transition-all duration-300 ${
              i === currentIndex ? "w-8 bg-white" : "w-1 bg-white/40"
            }`}
            aria-label={`Go to video ${i + 1}`}
          />
        ))}
      </div>
    </main>
  )
}
