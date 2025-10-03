"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ArrowRight, Timer, Trophy } from "lucide-react"
import Image from "next/image"

export default function NBLTrainingPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<{ name: string; age: string; language: string } | null>(null)
  const [weightlessness, setWeightlessness] = useState(50)
  const [isComplete, setIsComplete] = useState(false)
  const [timeLeft, setTimeLeft] = useState(45)
  const [score, setScore] = useState(0)
  const [targetZone, setTargetZone] = useState({ min: 48, max: 52 })
  const [gameStarted, setGameStarted] = useState(false)
  const [level, setLevel] = useState(1)
  const [obstaclePosition, setObstaclePosition] = useState(30)

  useEffect(() => {
    const data = sessionStorage.getItem("userData")
    if (data) {
      setUserData(JSON.parse(data))
    } else {
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    if (!gameStarted || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setGameStarted(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [gameStarted, timeLeft])

  useEffect(() => {
    if (!gameStarted) return

    const moveTarget = setInterval(() => {
      setTargetZone((prev) => {
        const range = Math.max(2, 5 - level * 0.5)
        const center = 45 + Math.random() * 10
        return {
          min: center - range,
          max: center + range,
        }
      })
    }, 3000)

    return () => clearInterval(moveTarget)
  }, [gameStarted, level])

  useEffect(() => {
    if (!gameStarted) return

    const moveObstacle = setInterval(() => {
      setObstaclePosition(Math.random() * 80 + 10)
    }, 2000)

    return () => clearInterval(moveObstacle)
  }, [gameStarted])

  useEffect(() => {
    if (!gameStarted) return

    if (weightlessness >= targetZone.min && weightlessness <= targetZone.max) {
      setIsComplete(true)
      const accuracy = 100 - Math.abs(weightlessness - (targetZone.min + targetZone.max) / 2)
      setScore((prev) => prev + Math.floor(accuracy / 10))
    } else {
      setIsComplete(false)
    }
  }, [weightlessness, targetZone, gameStarted])

  useEffect(() => {
    if (score >= level * 50) {
      setLevel((prev) => prev + 1)
    }
  }, [score, level])

  const startGame = () => {
    setGameStarted(true)
    setTimeLeft(45)
    setScore(0)
    setLevel(1)
    setTargetZone({ min: 48, max: 52 })
  }

  const getAstronautPosition = () => {
    return `${85 - weightlessness * 0.7}%`
  }

  if (!userData) return null

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a2847] to-[#0a0e27] text-white relative overflow-hidden font-space-grotesk">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="stars-small"></div>
        <div className="stars-medium"></div>
        <div className="stars-large"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2 font-orbitron">NBL TRAINING</h1>
          <p className="text-lg text-cyan-400">Master Neutral Buoyancy Control</p>
        </div>

        <div className="max-w-3xl mx-auto mb-6 grid grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-900/40 to-purple-700/40 backdrop-blur-xl rounded-xl p-4 border border-purple-500/30 text-center">
            <Timer className="h-6 w-6 mx-auto mb-2 text-purple-400" />
            <div className="text-3xl font-bold font-orbitron">{timeLeft}s</div>
            <div className="text-xs text-purple-300">Time Left</div>
          </div>
          <div className="bg-gradient-to-br from-cyan-900/40 to-cyan-700/40 backdrop-blur-xl rounded-xl p-4 border border-cyan-500/30 text-center">
            <Trophy className="h-6 w-6 mx-auto mb-2 text-cyan-400" />
            <div className="text-3xl font-bold font-orbitron">{score}</div>
            <div className="text-xs text-cyan-300">Score</div>
          </div>
          <div className="bg-gradient-to-br from-green-900/40 to-green-700/40 backdrop-blur-xl rounded-xl p-4 border border-green-500/30 text-center">
            <div className="text-2xl mb-2">⭐</div>
            <div className="text-3xl font-bold font-orbitron">L{level}</div>
            <div className="text-xs text-green-300">Level</div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div
              className="relative mx-auto rounded-3xl overflow-hidden shadow-2xl"
              style={{
                width: "100%",
                maxWidth: "700px",
                height: "600px",
                background: "linear-gradient(180deg, rgba(100, 200, 255, 0.15) 0%, rgba(0, 150, 255, 0.4) 100%)",
                border: "3px solid rgba(100, 200, 255, 0.3)",
                transform: "perspective(1000px) rotateX(2deg)",
              }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(200, 240, 255, 0.4) 0%, rgba(100, 200, 255, 0.2) 50%, transparent 100%)",
                }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] animate-shimmer" />
              </div>

              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0, 180, 255, 0.1) 0%, rgba(0, 120, 200, 0.3) 50%, rgba(0, 80, 150, 0.5) 100%)",
                }}
              />

              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div
                  className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(100,200,255,0.15)_50%)] animate-pulse"
                  style={{ backgroundSize: "100% 40px" }}
                />
              </div>

              {gameStarted && (
                <div
                  className="absolute left-1/4 w-16 h-16 bg-red-500/30 border-2 border-red-500 rounded-full transition-all duration-1000"
                  style={{ top: `${obstaclePosition}%` }}
                />
              )}

              <div
                className="absolute left-1/2 -translate-x-1/2 transition-all duration-700 ease-out z-20"
                style={{
                  top: getAstronautPosition(),
                }}
              >
                <div className="relative">
                  <Image
                    src="/astronaut-mascot.png"
                    alt="Astronaut"
                    width={120}
                    height={120}
                    className="drop-shadow-2xl"
                  />
                  {isComplete && gameStarted && (
                    <>
                      <div className="absolute -top-4 -right-2 text-2xl animate-float-up opacity-70">💧</div>
                      <div className="absolute -top-8 left-2 text-xl animate-float-up-delayed opacity-60">💧</div>
                      <div className="absolute -bottom-2 -left-4 text-lg animate-float-up opacity-50">💧</div>
                    </>
                  )}
                </div>
              </div>

              <div className="absolute left-4 top-0 h-full flex flex-col justify-between py-8 text-sm text-cyan-300/60 font-mono z-10">
                <span>0m</span>
                <span>5m</span>
                <span>10m</span>
                <span>15m</span>
                <span>20m</span>
              </div>

              <div className="absolute top-6 right-6 z-10">
                {gameStarted ? (
                  isComplete ? (
                    <div className="bg-green-500/20 border-2 border-green-400 rounded-full px-6 py-3 backdrop-blur-sm animate-pulse">
                      <span className="text-green-400 font-bold text-lg font-orbitron">✓ PERFECT!</span>
                    </div>
                  ) : (
                    <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-full px-6 py-3 backdrop-blur-sm">
                      <span className="text-yellow-400 font-bold text-lg font-orbitron">
                        {weightlessness < targetZone.min ? "↓ TOO LOW" : "↑ TOO HIGH"}
                      </span>
                    </div>
                  )
                ) : (
                  <div className="bg-blue-500/20 border-2 border-blue-400 rounded-full px-6 py-3 backdrop-blur-sm">
                    <span className="text-blue-400 font-bold text-lg font-orbitron">READY</span>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-8 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/30">
              <div className="flex items-center justify-between mb-4">
                <label className="text-2xl font-bold text-white font-orbitron">Buoyancy Control</label>
                <span className="text-3xl font-bold text-cyan-400 font-orbitron">{weightlessness}%</span>
              </div>
              <Slider
                value={[weightlessness]}
                onValueChange={(value) => setWeightlessness(value[0])}
                min={0}
                max={100}
                step={1}
                className="py-4"
                disabled={!gameStarted}
              />
              <div className="flex justify-between text-sm text-slate-400 mt-2">
                <span>Sink</span>
                <span className="text-green-400 font-bold font-orbitron">
                  Target: {targetZone.min}-{targetZone.max}%
                </span>
                <span>Float</span>
              </div>
            </div>

            {!gameStarted && (
              <Button
                onClick={startGame}
                size="lg"
                className="w-full mt-6 h-16 text-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 font-bold shadow-lg font-orbitron"
              >
                {timeLeft === 45 ? "START TRAINING" : "TRY AGAIN"}
              </Button>
            )}

            <div className="mt-6 bg-cyan-900/20 border border-cyan-700/50 rounded-xl p-6 text-center backdrop-blur-sm">
              <div className="text-4xl mb-3">💡</div>
              <p className="text-lg text-cyan-100">7 hours underwater training = 1 hour spacewalk</p>
            </div>

            <Button
              onClick={() => {
                const finalScore = Math.min(score, 50)
                const currentScore = Number.parseInt(sessionStorage.getItem("totalScore") || "0")
                sessionStorage.setItem("totalScore", String(Math.min(currentScore + finalScore, 100)))
                router.push("/cupola")
              }}
              disabled={score < 30}
              size="lg"
              className="w-full mt-6 h-16 text-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg font-orbitron"
            >
              {score >= 30 ? (
                <>
                  Continue to Cupola
                  <ArrowRight className="ml-2 h-6 w-6" />
                </>
              ) : (
                `Score ${30 - score} more points to continue`
              )}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
