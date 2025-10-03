"use client"

import { useState, useEffect, useRef } from "react"
import { Volume2, VolumeX } from "lucide-react"
import { Button } from "@/components/ui/button"

export function BackgroundMusic() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    setIsMounted(true)

    const initAudio = async () => {
      const fallbackDataUri =
        "data:audio/mp3;base64,SUQzBAAAAAAAF1RTU0UAAAAPAAADTGF2ZjU2LjI0LjEwMAAAAAAAAAAAAAAA//tQxAADBQAFIAsAEgAAAgAAA//9/wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==" // very small silent-ish mp3 fragment

      let src = "/space-ambient.mp3"
      try {
        const res = await fetch(src, { method: "HEAD" })
        if (!res.ok) {
          console.warn("/space-ambient.mp3 missing, using fallback data URI")
          src = fallbackDataUri
        }
      } catch {
        console.warn("Failed to reach /space-ambient.mp3, using fallback data URI")
        src = fallbackDataUri
      }

      audioRef.current = new Audio(src)
      audioRef.current.loop = true
      audioRef.current.volume = 0.3
    }

    initAudio()

    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const toggleMusic = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch((err) => {
        console.log("Audio play failed:", err)
      })
    }
    setIsPlaying(!isPlaying)
  }

  if (!isMounted) return null

  return (
    <Button
      onClick={toggleMusic}
      size="icon"
      variant="ghost"
      className="fixed top-6 right-6 z-50 h-12 w-12 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 text-white"
      aria-label={isPlaying ? "Mute music" : "Play music"}
    >
      {isPlaying ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
    </Button>
  )
}
