"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronDown, ChevronUp, Flame, Sprout, CloudRain, Building2, Waves, AlertTriangle, Globe } from "lucide-react"

interface Benefit {
  id: number
  title: string
  description: string
  impact: string
  Icon: any
  image: string
  color: string
}

const benefits: Benefit[] = [
  {
    id: 1,
    title: "Wildfire Monitoring",
    description: "Real-time tracking from space",
    impact: "Saved thousands of lives worldwide",
    Icon: Flame,
    image: "/wildfire-from-space-satellite-view.jpg",
    color: "from-orange-600 to-red-600",
  },
  {
    id: 2,
    title: "Smart Farming",
    description: "ECOSTRESS optimizes irrigation",
    impact: "30% water efficiency improvement",
    Icon: Sprout,
    image: "/agricultural-fields-from-space-green-crops.jpg",
    color: "from-green-600 to-emerald-600",
  },
  {
    id: 3,
    title: "Hurricane Tracking",
    description: "Early warning systems",
    impact: "Critical evacuation time",
    Icon: CloudRain,
    image: "/hurricane-from-space-satellite-view.jpg",
    color: "from-blue-600 to-cyan-600",
  },
  {
    id: 4,
    title: "Urban Planning",
    description: "Heat island detection",
    impact: "Reduced energy consumption",
    Icon: Building2,
    image: "/city-lights-at-night-from-space.jpg",
    color: "from-purple-600 to-pink-600",
  },
  {
    id: 5,
    title: "Ocean Health",
    description: "Coral reef monitoring",
    impact: "Protected marine ecosystems",
    Icon: Waves,
    image: "/ocean-and-coral-reefs-from-space.jpg",
    color: "from-teal-600 to-blue-600",
  },
  {
    id: 6,
    title: "Disaster Response",
    description: "Rapid damage assessment",
    impact: "Faster emergency response",
    Icon: AlertTriangle,
    image: "/disaster-area-from-space-satellite.jpg",
    color: "from-red-600 to-orange-600",
  },
  {
    id: 7,
    title: "Climate Research",
    description: "Long-term Earth observation",
    impact: "Informed global policy",
    Icon: Globe,
    image: "/earth-from-space-showing-climate.jpg",
    color: "from-green-600 to-blue-600",
  },
]

export default function BenefitsPage() {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartY = useRef(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const scrollToIndex = (index: number) => {
    if (index < 0 || index >= benefits.length || isTransitioning) return
    setIsTransitioning(true)
    setCurrentIndex(index)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault()
    if (isTransitioning) return

    if (e.deltaY > 0 && currentIndex < benefits.length - 1) {
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
      if (diff > 0 && currentIndex < benefits.length - 1) {
        scrollToIndex(currentIndex + 1)
      } else if (diff < 0 && currentIndex > 0) {
        scrollToIndex(currentIndex - 1)
      }
    }
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

  const currentBenefit = benefits[currentIndex]

  return (
    <main ref={containerRef} className="h-screen w-screen overflow-hidden bg-black text-white relative">
      <div
        className="absolute inset-0 transition-all duration-500 ease-out"
        style={{
          backgroundImage: `url(${currentBenefit.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {/* Dark overlay for readability */}
        <div className={`absolute inset-0 bg-gradient-to-b ${currentBenefit.color} opacity-80`} />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col justify-between p-6 md:p-12">
        {/* Top: Progress dots */}
        <div className="flex justify-center gap-2">
          {benefits.map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToIndex(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentIndex ? "w-8 bg-white" : "w-1 bg-white/40"
              }`}
              aria-label={`Go to benefit ${i + 1}`}
            />
          ))}
        </div>

        {/* Center: Main content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 animate-fade-in">
          <currentBenefit.Icon className="h-20 w-20 md:h-24 md:w-24 animate-pulse" strokeWidth={1.5} />

          <h2 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight max-w-4xl">{currentBenefit.title}</h2>

          <p className="text-xl md:text-2xl lg:text-3xl font-light max-w-2xl">{currentBenefit.description}</p>

          <div className="inline-block px-6 py-3 bg-white/20 backdrop-blur-md rounded-full border border-white/30">
            <p className="text-base md:text-lg font-semibold">{currentBenefit.impact}</p>
          </div>
        </div>

        {/* Bottom: Navigation */}
        <div className="flex flex-col items-center gap-4">
          {currentIndex < benefits.length - 1 ? (
            <>
              <button
                onClick={() => scrollToIndex(currentIndex + 1)}
                className="animate-bounce"
                aria-label="Next benefit"
              >
                <ChevronDown className="h-10 w-10" />
              </button>
              <p className="text-sm opacity-70">Swipe up or scroll</p>
            </>
          ) : (
            <Button
              onClick={() => router.push("/quiz")}
              size="lg"
              className="h-14 px-12 text-lg bg-white text-black hover:bg-white/90 font-bold"
            >
              Take the Quiz
            </Button>
          )}
        </div>
      </div>

      {/* Up arrow when not at top */}
      {currentIndex > 0 && (
        <button
          onClick={() => scrollToIndex(currentIndex - 1)}
          className="absolute top-6 left-1/2 -translate-x-1/2 opacity-50 hover:opacity-100 transition-opacity"
          aria-label="Previous benefit"
        >
          <ChevronUp className="h-8 w-8" />
        </button>
      )}
    </main>
  )
}
