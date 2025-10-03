"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

const messages = [
  "Ready for space training? 🚀",
  "Did you know the ISS travels at 28,000 km/h?",
  "Let's explore Earth from above!",
  "Astronauts train for years before going to space!",
  "The Cupola has the best view in the universe!",
  "Keep going, space explorer! 🌟",
]

export default function AstronautAssistant() {
  const [message, setMessage] = useState(messages[0])
  const [showMessage, setShowMessage] = useState(false)

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setMessage(messages[Math.floor(Math.random() * messages.length)])
      setShowMessage(true)
      setTimeout(() => setShowMessage(false), 4000)
    }, 15000)

    return () => {
      clearInterval(messageInterval)
    }
  }, [])

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="relative">
        <Image
          src="/astronaut-mascot.png"
          alt="Astronaut Assistant"
          width={100}
          height={100}
          className="drop-shadow-2xl animate-float"
        />
        {showMessage && (
          <div className="absolute -top-20 right-0 whitespace-nowrap bg-white text-black px-4 py-2 rounded-full text-sm font-bold shadow-xl animate-fade-in max-w-xs">
            {message}
            <div className="absolute -bottom-2 right-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white" />
          </div>
        )}
      </div>
    </div>
  )
}
