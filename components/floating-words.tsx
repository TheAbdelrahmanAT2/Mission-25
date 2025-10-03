"use client"

import { useEffect, useState } from "react"

const spaceWords = [
  "ORBIT",
  "GRAVITY",
  "COSMOS",
  "STELLAR",
  "NEBULA",
  "GALAXY",
  "ASTRONAUT",
  "MISSION",
  "EXPLORE",
  "DISCOVERY",
]

export function FloatingWords() {
  const [words, setWords] = useState<Array<{ text: string; x: number; y: number; delay: number; duration: number }>>([])

  useEffect(() => {
    const generatedWords = spaceWords.map((word, index) => ({
      text: word,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: index * 0.5,
      duration: 20 + Math.random() * 10,
    }))
    setWords(generatedWords)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {words.map((word, index) => (
        <div
          key={index}
          className="absolute text-white/5 font-bold text-4xl md:text-6xl tracking-wider animate-float"
          style={{
            left: `${word.x}%`,
            top: `${word.y}%`,
            animationDelay: `${word.delay}s`,
            animationDuration: `${word.duration}s`,
          }}
        >
          {word.text}
        </div>
      ))}
    </div>
  )
}
