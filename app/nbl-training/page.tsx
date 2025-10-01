"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { ArrowRight } from "lucide-react"

export default function NBLTrainingPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<{ name: string; age: string; language: string } | null>(null)
  const [weightlessness, setWeightlessness] = useState(50)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    const data = sessionStorage.getItem("userData")
    if (data) {
      setUserData(JSON.parse(data))
    } else {
      router.push("/")
    }
  }, [router])

  useEffect(() => {
    if (weightlessness >= 45 && weightlessness <= 55) {
      setIsComplete(true)
    } else {
      setIsComplete(false)
    }
  }, [weightlessness])

  const getAstronautPosition = () => {
    // Map 0-100 to 85%-15% (inverted so lower values sink, higher values float)
    return `${85 - weightlessness * 0.7}%`
  }

  if (!userData) return null

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a2847] to-[#0a0e27] text-white relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="stars-small"></div>
        <div className="stars-medium"></div>
        <div className="stars-large"></div>
      </div>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">NBL Training</h1>
          <p className="text-lg text-cyan-400">Achieve Neutral Buoyancy</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Water Tank Container with 3D perspective */}
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
              {/* Water surface effect */}
              <div
                className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(200, 240, 255, 0.4) 0%, rgba(100, 200, 255, 0.2) 50%, transparent 100%)",
                }}
              >
                <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.1)_50%,transparent_100%)] animate-shimmer" />
              </div>

              {/* Water gradient layers for depth */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(0, 180, 255, 0.1) 0%, rgba(0, 120, 200, 0.3) 50%, rgba(0, 80, 150, 0.5) 100%)",
                }}
              />

              {/* Animated water ripples */}
              <div className="absolute inset-0 opacity-30 pointer-events-none">
                <div
                  className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(100,200,255,0.15)_50%)] animate-pulse"
                  style={{ backgroundSize: "100% 40px" }}
                />
              </div>

              {/* Cute Astronaut */}
              <div
                className="absolute left-1/2 -translate-x-1/2 transition-all duration-700 ease-out z-20"
                style={{
                  top: getAstronautPosition(),
                }}
              >
                <div className="relative">
                  <div className="text-8xl drop-shadow-2xl filter">🧑‍🚀</div>
                  {/* Bubbles around astronaut */}
                  {isComplete && (
                    <>
                      <div className="absolute -top-4 -right-2 text-2xl animate-float-up opacity-70">💧</div>
                      <div className="absolute -top-8 left-2 text-xl animate-float-up-delayed opacity-60">💧</div>
                      <div className="absolute -bottom-2 -left-4 text-lg animate-float-up opacity-50">💧</div>
                    </>
                  )}
                </div>
              </div>

              {/* Depth markers on the side */}
              <div className="absolute left-4 top-0 h-full flex flex-col justify-between py-8 text-sm text-cyan-300/60 font-mono z-10">
                <span>0m</span>
                <span>5m</span>
                <span>10m</span>
                <span>15m</span>
                <span>20m</span>
              </div>

              {/* Status indicator */}
              <div className="absolute top-6 right-6 z-10">
                {isComplete ? (
                  <div className="bg-green-500/20 border-2 border-green-400 rounded-full px-6 py-3 backdrop-blur-sm">
                    <span className="text-green-400 font-bold text-lg">✓ NEUTRAL</span>
                  </div>
                ) : weightlessness < 45 ? (
                  <div className="bg-red-500/20 border-2 border-red-400 rounded-full px-6 py-3 backdrop-blur-sm">
                    <span className="text-red-400 font-bold text-lg">↓ SINKING</span>
                  </div>
                ) : (
                  <div className="bg-yellow-500/20 border-2 border-yellow-400 rounded-full px-6 py-3 backdrop-blur-sm">
                    <span className="text-yellow-400 font-bold text-lg">↑ FLOATING</span>
                  </div>
                )}
              </div>
            </div>

            {/* Weightlessness Slider - matching Photoshop design */}
            <div className="mt-8 bg-gradient-to-r from-slate-900/80 to-slate-800/80 backdrop-blur-xl rounded-2xl p-8 border border-cyan-500/30">
              <div className="flex items-center justify-between mb-4">
                <label className="text-2xl font-bold text-white">Weightlessness</label>
                <span className="text-3xl font-bold text-cyan-400">{weightlessness}%</span>
              </div>
              <Slider
                value={[weightlessness]}
                onValueChange={(value) => setWeightlessness(value[0])}
                min={0}
                max={100}
                step={1}
                className="py-4"
              />
              <div className="flex justify-between text-sm text-slate-400 mt-2">
                <span>Heavy</span>
                <span className="text-green-400 font-bold">Neutral (45-55)</span>
                <span>Light</span>
              </div>
            </div>

            {/* Info card */}
            <div className="mt-6 bg-cyan-900/20 border border-cyan-700/50 rounded-xl p-6 text-center backdrop-blur-sm">
              <div className="text-4xl mb-3">💡</div>
              <p className="text-lg text-cyan-100">7 hours underwater training = 1 hour spacewalk</p>
            </div>

            {/* Continue button */}
            <Button
              onClick={() => router.push("/cupola")}
              disabled={!isComplete}
              size="lg"
              className="w-full mt-6 h-16 text-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-lg"
            >
              {isComplete ? (
                <>
                  Continue to Cupola
                  <ArrowRight className="ml-2 h-6 w-6" />
                </>
              ) : (
                "Achieve Neutral Buoyancy First"
              )}
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
