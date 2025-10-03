"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { ArrowRight, Search, Loader2, MapPin, Zap } from "lucide-react"
import { EarthGlobe } from "@/components/earth-globe"
import { ErrorBoundary } from "@/components/error-boundary"
import { cities, CityInfo } from "@/lib/cities"
import Image from "next/image"

interface EarthImage {
  url: string
  title: string
  year: string
  description: string
  country: string
  stats: {
    altitude: string
    speed: string
    orbit: string
    photos: string
  }
}

const countryData: Record<
  string,
  {
    name: string
    flag: string
    images: string[]
    descriptions: string[]
    years: string[]
  }
> = {
  egypt: {
    name: "Egypt",
    flag: "🇪🇬",
    images: ["/egypt-cupola.jpg"],
    descriptions: [
      "The Nile River illuminates Egypt like a golden ribbon across the desert. Cairo's bright lights mark one of Africa's largest cities. This imagery helps monitor urban expansion and agricultural patterns.",
      "Egypt's distinctive Nile Delta glows brilliantly at night. Scientists use these images to track water usage, urban growth, and light pollution effects on the ecosystem.",
    ],
    years: ["2017", "2019", "2021", "2023"],
  },
  usa: {
    name: "United States",
    flag: "🇺🇸",
    images: ["/usa-night.jpg"],
    descriptions: [
      "The sprawling metropolis glows across the continent. City grids and highways create intricate light patterns visible from space, helping urban planners understand growth.",
      "Coastal cities illuminate the shoreline in this stunning view. These images help researchers study energy consumption and urban heat island effects.",
    ],
    years: ["2018", "2020", "2022", "2024"],
  },
  japan: {
    name: "Japan",
    flag: "🇯🇵",
    images: ["/japan-night.jpg"],
    descriptions: [
      "Tokyo's vast urban landscape spreads across the Kanto Plain. The city's efficient lighting creates unique patterns that help researchers study sustainable city planning.",
      "Japan's island nation glows brilliantly at night. Dense population centers and transportation networks are clearly visible, providing insights into urban development.",
    ],
    years: ["2016", "2019", "2021", "2023"],
  },
  uk: {
    name: "United Kingdom",
    flag: "🇬🇧",
    images: ["/uk-night.jpg"],
    descriptions: [
      "London's Thames River winds through the illuminated city. Historic landmarks and modern developments create a unique nighttime signature visible from orbit.",
      "The British Isles glow with interconnected cities. These images help monitor urban sprawl and environmental impact across the region.",
    ],
    years: ["2017", "2020", "2022", "2024"],
  },
  france: {
    name: "France",
    flag: "🇫🇷",
    images: ["/france-night.jpg"],
    descriptions: [
      "Paris radiates from the Seine River, with the Eiffel Tower's lights marking the city center. This view showcases Europe's cultural heritage from space.",
      "France's cities create a network of lights across the countryside. Agricultural regions and urban centers are clearly distinguished in these orbital photographs.",
    ],
    years: ["2018", "2020", "2022", "2024"],
  },
  germany: {
    name: "Germany",
    flag: "🇩🇪",
    images: ["/germany-night.jpg"],
    descriptions: [
      "Berlin's grid pattern and historic landmarks shine through the night. The city's development and green spaces are visible in this ISS capture.",
      "Germany's industrial heartland glows with activity. These images help researchers understand the balance between urban development and environmental conservation.",
    ],
    years: ["2017", "2019", "2021", "2023"],
  },
  brazil: {
    name: "Brazil",
    flag: "🇧🇷",
    images: ["/brazil-night.jpg"],
    descriptions: [
      "Rio de Janeiro's coastline curves beautifully along the Atlantic. The city's beaches and mountains create a stunning nighttime view from orbit.",
      "Brazil's vibrant cities illuminate the South American coast. These images help monitor coastal development and environmental changes.",
    ],
    years: ["2016", "2019", "2021", "2024"],
  },
  australia: {
    name: "Australia",
    flag: "🇦🇺",
    images: ["/australia-night.jpg"],
    descriptions: [
      "Sydney Harbor's iconic shape is outlined by city lights. The Opera House and surrounding areas create a distinctive pattern visible from space.",
      "Australia's coastal cities stand out against the dark interior. These images help researchers study urban concentration and resource distribution.",
    ],
    years: ["2018", "2020", "2022", "2024"],
  },
  india: {
    name: "India",
    flag: "🇮🇳",
    images: ["/india-night.jpg"],
    descriptions: [
      "The Ganges River valley glows with millions of lights. India's rapid urbanization is clearly visible in these nighttime orbital photographs.",
      "India's cities create a brilliant tapestry of light across the subcontinent. These images help track development and energy usage patterns.",
    ],
    years: ["2017", "2019", "2022", "2024"],
  },
  china: {
    name: "China",
    flag: "🇨🇳",
    images: ["/china-night.jpg"],
    descriptions: [
      "Shanghai's Yangtze River delta blazes with activity. The world's largest cities create stunning light patterns visible from the ISS.",
      "China's urban centers illuminate the landscape. These images provide insights into the world's most rapid urbanization process.",
    ],
    years: ["2016", "2018", "2021", "2023"],
  },
}

export default function CupolaPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<{ name: string; age: string; country: string; language: string } | null>(
    null,
  )
  const [step, setStep] = useState(1)
  const [cityInput, setCityInput] = useState("")
  const [yearInput, setYearInput] = useState("")
  const [selectedCountry, setSelectedCountry] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [currentImage, setCurrentImage] = useState<EarthImage | null>(null)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(3)
  const [globeKey, setGlobeKey] = useState(0)

  useEffect(() => {
    const data = sessionStorage.getItem("userData")
    if (data) {
      const parsed = JSON.parse(data)
      setUserData(parsed)
      setSelectedCountry(parsed.country || "egypt")
    } else {
      router.push("/")
    }
  }, [router])

  const handleCitySelect = (city: CityInfo) => {
    // Build an image and description using existing data or fallback
    const year = new Date().getFullYear().toString()
    const image: EarthImage = {
      url: city.image || "/iss-earth.jpeg",
      title: `${city.name} from Orbit` ,
      year,
      description: city.description,
      country: city.country,
      stats: {
        altitude: "408 km",
        speed: "28,000 km/h",
        orbit: "90 min",
        photos: "3.5M+",
      },
    }
    setCurrentImage(image)
    setScore(25)
    setStep(2)
  }

  if (!userData) return null

  return (
  <main className="min-h-screen bg-gradient-to-b from-[#000000] via-[#001122] to-[#000000] text-white relative overflow-hidden font-space-grotesk flex flex-col">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="stars-small"></div>
        <div className="stars-medium"></div>
        <div className="stars-large"></div>
      </div>

      <div className="container mx-auto px-4 pt-8 pb-6 relative z-10 flex flex-col flex-1">
        <div className="mb-6 text-center space-y-4">
          <div className="flex justify-center gap-6 items-center mb-6">
            <Image
              src="/egypt-cupola.jpg"
              alt="ISS Cupola Window"
              width={120}
              height={120}
              className="rounded-2xl shadow-2xl border-2 border-cyan-500/50"
            />
            <div className="text-6xl">🪟</div>
            <Image
              src="/usa-night.jpg"
              alt="Earth from Cupola"
              width={120}
              height={120}
              className="rounded-2xl shadow-2xl border-2 border-cyan-500/50"
            />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-orbitron">THE CUPOLA</h1>
          <p className="text-xl text-cyan-400 font-light">Earth's Largest Space Window</p>
          <div className="inline-flex items-center gap-2 bg-purple-900/40 px-6 py-3 rounded-full border border-purple-500/50">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span className="font-bold font-orbitron">Score: {score}</span>
          </div>
        </div>

        <div className="max-w-6xl mx-auto w-full flex-1 flex flex-col">
          {step === 1 && (
            <Card className="p-4 md:p-6 bg-slate-900/40 border-slate-700/40 backdrop-blur-xl flex flex-col flex-1">
              <div className="text-center mb-6 space-y-3">
                <MapPin className="h-12 w-12 mx-auto mb-2 text-cyan-400" />
                <h3 className="text-2xl font-bold font-orbitron">INTERACTIVE ORBITAL SCAN</h3>
                <p className="text-slate-300 max-w-2xl mx-auto">
                  Rotate the 3D Earth and select a highlighted city to capture an orbital observation through the Cupola.
                </p>
                <div className="inline-flex items-center gap-2 bg-purple-900/30 px-4 py-2 rounded-full text-sm text-cyan-300">
                  Click a glowing point to continue the mission
                </div>
              </div>
              {/* Globe display area centered within remaining vertical space */}
              <div className="w-full flex-1 min-h-[480px] rounded-xl overflow-hidden border border-cyan-800/40 bg-black/40 relative flex flex-col items-center justify-center">
                <div className="flex-1 relative w-full flex items-center justify-center py-4">
                  <div className="relative w-full h-full px-2 flex items-center justify-center">
                    <div className="relative aspect-square w-full max-w-[600px] h-auto mx-auto">
                      <ErrorBoundary
                        key={globeKey}
                        fallback={(error: Error, reset: () => void) => (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/70 p-6 text-center rounded-xl">
                            <div className="text-red-400 font-orbitron">Globe Module Error</div>
                            <div className="text-xs text-red-300 max-w-sm font-mono opacity-80">
                              {error.message}
                            </div>
                            <button
                              onClick={() => {
                                reset();
                                setTimeout(() => setGlobeKey((k) => k + 1), 50);
                              }}
                              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 rounded-md text-white text-sm font-semibold"
                            >
                              Retry Globe
                            </button>
                          </div>
                        )}
                      >
                        <EarthGlobe key={globeKey} onCitySelect={handleCitySelect} fill />
                      </ErrorBoundary>
                    </div>
                  </div>
                </div>
                <div className="absolute top-3 left-3 text-xs text-cyan-300 bg-slate-800/70 px-3 py-1 rounded-full font-mono z-20 shadow-md">
                  Cities Loaded: {cities.length}
                </div>
              </div>
            </Card>
          )}

          {step === 2 && currentImage && (
            <div className="animate-fade-in">
              <Card className="p-8 bg-gradient-to-b from-slate-900/60 to-slate-950/60 border-slate-700/40 backdrop-blur-xl">
                <div className="relative">
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl bg-black">
                    <div className="absolute top-3 left-3 w-6 h-6 bg-slate-700 rounded-full border-4 border-slate-600 z-10 shadow-lg" />
                    <div className="absolute top-3 right-3 w-6 h-6 bg-slate-700 rounded-full border-4 border-slate-600 z-10 shadow-lg" />
                    <div className="absolute bottom-3 left-3 w-6 h-6 bg-slate-700 rounded-full border-4 border-slate-600 z-10 shadow-lg" />
                    <div className="absolute bottom-3 right-3 w-6 h-6 bg-slate-700 rounded-full border-4 border-slate-600 z-10 shadow-lg" />

                    <div className="absolute top-0 left-0 w-32 h-full bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
                    <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

                    <Image
                      src={currentImage.url || "/placeholder.svg"}
                      alt={currentImage.title}
                      width={1200}
                      height={800}
                      className="w-full h-[500px] md:h-[600px] object-cover"
                      priority
                    />

                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

                    <div className="absolute inset-0 pointer-events-none opacity-20">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-cyan-400" />
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-px bg-cyan-400" />
                    </div>
                  </div>
                </div>

                <div className="mt-8 space-y-6">
                  <h3 className="text-3xl md:text-4xl font-bold text-center text-white">{currentImage.title}</h3>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-800/50 rounded-xl text-center border border-slate-700/50">
                      <div className="text-3xl mb-1">📅</div>
                      <div className="text-2xl font-bold text-cyan-400">{currentImage.year}</div>
                      <div className="text-xs text-slate-400 mt-1">Year</div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl text-center border border-slate-700/50">
                      <div className="text-3xl mb-1">📏</div>
                      <div className="text-2xl font-bold text-blue-400">{currentImage.stats.altitude}</div>
                      <div className="text-xs text-slate-400 mt-1">Altitude</div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl text-center border border-slate-700/50">
                      <div className="text-3xl mb-1">⚡</div>
                      <div className="text-2xl font-bold text-purple-400">{currentImage.stats.speed}</div>
                      <div className="text-xs text-slate-400 mt-1">Speed</div>
                    </div>
                    <div className="p-4 bg-slate-800/50 rounded-xl text-center border border-slate-700/50">
                      <div className="text-3xl mb-1">🔄</div>
                      <div className="text-2xl font-bold text-green-400">{currentImage.stats.orbit}</div>
                      <div className="text-xs text-slate-400 mt-1">Orbit Time</div>
                    </div>
                  </div>

                  <div className="p-6 bg-gradient-to-r from-cyan-950/50 to-blue-950/50 border border-cyan-800/40 rounded-xl">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl">🤖</div>
                      <p className="text-lg text-slate-200 leading-relaxed flex-1">{currentImage.description}</p>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="flex justify-center mt-8">
                <Button
                  onClick={() => {
                    const finalScore = Math.min(score, 25)
                    const currentScore = Number.parseInt(sessionStorage.getItem("totalScore") || "0")
                    sessionStorage.setItem("totalScore", String(Math.min(currentScore + finalScore, 100)))
                    router.push("/benefits")
                  }}
                  size="lg"
                  className="h-16 px-12 text-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 font-bold shadow-lg font-orbitron"
                >
                  Continue Mission
                  <ArrowRight className="ml-2 h-6 w-6" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
