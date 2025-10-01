"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BackgroundMusic } from "@/components/background-music"
import { AnimatedStars } from "@/components/animated-stars"
import { FloatingWords } from "@/components/floating-words"
import { ProgressBar } from "@/components/progress-bar"

export default function HomePage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    country: "",
    language: "English",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.age && formData.country) {
      // Store user data in sessionStorage
      sessionStorage.setItem("userData", JSON.stringify(formData))
      setIsSubmitting(true)

      // Show progress bar for 3 seconds before navigating
      setTimeout(() => {
        router.push("/nbl-training")
      }, 3000)
    }
  }

  if (isSubmitting) {
    return <ProgressBar />
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#000000]">
      {/* Background Music Component */}
      <BackgroundMusic />

      {/* Animated Stars Background */}
      <AnimatedStars />

      <FloatingWords />

      {/* Earth and ISS Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-40"
        style={{
          backgroundImage: "url(/iss-earth.jpeg)",
          backgroundPosition: "right center",
        }}
      />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#000000] via-[#000814]/90 to-transparent" />

      {/* Content */}
      <div className="relative z-10 flex min-h-screen items-center justify-start px-8 md:px-16 lg:px-24">
        <div className="max-w-2xl space-y-8 animate-fade-in">
          <div className="flex gap-8 text-xs font-mono text-cyan-400/90 tracking-wider">
            <span className="flex flex-col">
              <span className="text-2xl font-bold text-white">25</span>
              <span className="text-[10px] text-cyan-400/70">YEARS</span>
            </span>
            <span className="flex flex-col">
              <span className="text-2xl font-bold text-white">16</span>
              <span className="text-[10px] text-cyan-400/70">SUNSETS DAILY</span>
            </span>
            <span className="flex flex-col">
              <span className="text-2xl font-bold text-white">3.5M</span>
              <span className="text-[10px] text-cyan-400/70">PHOTOS</span>
            </span>
          </div>

          <div className="space-y-6">
            <h1 className="text-8xl md:text-9xl font-bold text-white tracking-tighter leading-none">Mission 25</h1>
            <p className="text-2xl md:text-3xl text-slate-200 leading-relaxed text-balance font-light">
              Let's Start Your Journey in the{" "}
              <span className="text-white font-medium">International Space Station</span>
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                type="text"
                placeholder="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 backdrop-blur-md text-base hover:bg-white/10 transition-colors focus:bg-white/10"
              />
              <Input
                type="number"
                placeholder="Age"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
                min="1"
                max="120"
                className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 backdrop-blur-md text-base hover:bg-white/10 transition-colors focus:bg-white/10"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 backdrop-blur-md text-base hover:bg-white/10 transition-colors">
                  <SelectValue placeholder="Select Country" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  <SelectItem value="egypt">Egypt</SelectItem>
                  <SelectItem value="usa">United States</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="japan">Japan</SelectItem>
                  <SelectItem value="russia">Russia</SelectItem>
                  <SelectItem value="canada">Canada</SelectItem>
                  <SelectItem value="france">France</SelectItem>
                  <SelectItem value="germany">Germany</SelectItem>
                  <SelectItem value="italy">Italy</SelectItem>
                  <SelectItem value="china">China</SelectItem>
                  <SelectItem value="india">India</SelectItem>
                  <SelectItem value="brazil">Brazil</SelectItem>
                  <SelectItem value="australia">Australia</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={formData.language}
                onValueChange={(value) => setFormData({ ...formData, language: value })}
              >
                <SelectTrigger className="h-14 bg-white/5 border-white/10 text-white placeholder:text-white/40 backdrop-blur-md text-base hover:bg-white/10 transition-colors">
                  <SelectValue placeholder="Language" />
                </SelectTrigger>
                <SelectContent className="bg-slate-900 border-slate-700 text-white">
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Arabic">Arabic</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                  <SelectItem value="Japanese">Japanese</SelectItem>
                  <SelectItem value="Chinese">Chinese</SelectItem>
                  <SelectItem value="Russian">Russian</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              type="submit"
              size="lg"
              className="h-16 px-20 text-lg font-medium bg-cyan-600 hover:bg-cyan-500 text-white rounded-full shadow-2xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-300 hover:scale-105 border border-cyan-400/20"
            >
              INITIATE MISSION
            </Button>
          </form>

          <div className="pt-8 text-xs text-slate-400 font-mono space-y-1">
            <p className="text-cyan-400/80 font-semibold tracking-wider">TEAM ZERO-G</p>
            <p className="text-[10px] text-slate-500">ISS 25th Anniversary Challenge • NASA Space Apps 2025</p>
          </div>
        </div>
      </div>
    </main>
  )
}
