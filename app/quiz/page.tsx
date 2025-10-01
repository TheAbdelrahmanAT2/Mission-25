"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { CheckCircle2, XCircle, Award, Rocket, Globe, Droplets, Camera, Clock } from "lucide-react"
import SpaceBackground3D from "@/components/space-background-3d"

interface Question {
  id: number
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

const questions: Question[] = [
  {
    id: 1,
    question: "What is the primary purpose of training in the Neutral Buoyancy Laboratory?",
    options: [
      "To learn swimming",
      "To simulate weightlessness for spacewalk training",
      "To test diving equipment",
      "To study marine life",
    ],
    correctAnswer: 1,
    explanation: "The NBL simulates the weightless environment of space, allowing astronauts to practice spacewalks.",
  },
  {
    id: 2,
    question: "How many windows does the Cupola module have?",
    options: ["3 windows", "5 windows", "7 windows", "10 windows"],
    correctAnswer: 2,
    explanation: "The Cupola has 7 windows - six around the sides and one large 80cm window in the center.",
  },
  {
    id: 3,
    question: "How many photos have astronauts taken from the ISS?",
    options: ["500,000", "1 million", "3.5 million", "10 million"],
    correctAnswer: 2,
    explanation: "Astronauts have captured over 3.5 million photos of Earth from the ISS.",
  },
  {
    id: 4,
    question: "What does ECOSTRESS data help with on Earth?",
    options: ["Weather prediction", "Agricultural water management", "Earthquake detection", "Ocean temperature"],
    correctAnswer: 1,
    explanation: "ECOSTRESS helps farmers optimize irrigation and manage water resources efficiently.",
  },
  {
    id: 5,
    question: "How long does it take the ISS to complete one orbit around Earth?",
    options: ["30 minutes", "60 minutes", "90 minutes", "120 minutes"],
    correctAnswer: 2,
    explanation: "The ISS completes one full orbit around Earth every 90 minutes, traveling at 17,500 mph.",
  },
]

const questionIcons = [Rocket, Globe, Camera, Droplets, Clock]

export default function QuizPage() {
  const router = useRouter()
  const [userData, setUserData] = useState<{ name: string; age: string; language: string } | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState(0)
  const [quizComplete, setQuizComplete] = useState(false)

  useEffect(() => {
    const data = sessionStorage.getItem("userData")
    if (data) {
      setUserData(JSON.parse(data))
    } else {
      router.push("/")
    }
  }, [router])

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return
    setSelectedAnswer(answerIndex)
  }

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return

    setShowExplanation(true)

    if (selectedAnswer === questions[currentQuestion].correctAnswer) {
      setScore(score + 1)
      const currentScore = Number.parseInt(sessionStorage.getItem("totalScore") || "0")
      sessionStorage.setItem("totalScore", String(currentScore + 20))
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setSelectedAnswer(null)
      setShowExplanation(false)
    } else {
      setQuizComplete(true)
    }
  }

  const handleViewCertificate = () => {
    router.push("/certificate")
  }

  if (!userData) return null

  if (quizComplete) {
    const percentage = Math.round((score / questions.length) * 100)

    return (
      <main className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] text-white flex items-center justify-center p-4 relative font-space-grotesk">
        <SpaceBackground3D />
        <Card className="max-w-2xl w-full p-8 md:p-12 bg-slate-900/50 border-slate-700/50 backdrop-blur text-center space-y-8 relative z-10">
          <div className="flex justify-center">
            <Award className="h-32 w-32 text-yellow-400 animate-bounce" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold font-orbitron">Mission Complete!</h1>

          <div className="space-y-6">
            <p className="text-2xl text-blue-200">
              <span className="text-blue-400 font-bold text-3xl">{userData.name}</span>
            </p>

            <div className="py-8">
              <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 font-orbitron">
                {percentage}%
              </div>
              <p className="text-xl text-muted-foreground mt-4">
                {score} / {questions.length} Correct
              </p>
            </div>

            <div className="p-8 bg-gradient-to-r from-blue-950/50 to-purple-950/50 border-2 border-blue-500/30 rounded-xl">
              <Award className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
              <h3 className="font-bold text-2xl text-yellow-400 mb-2 font-orbitron">Achievement Unlocked</h3>
              <p className="text-lg text-blue-100">Junior Astronaut Explorer</p>
            </div>
          </div>

          <Button
            onClick={handleViewCertificate}
            size="lg"
            className="w-full h-16 text-xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-bold font-orbitron"
          >
            View Your Certificate
          </Button>
        </Card>
      </main>
    )
  }

  const question = questions[currentQuestion]
  const isCorrect = selectedAnswer === question.correctAnswer
  const QuestionIcon = questionIcons[currentQuestion]

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#0a0e27] via-[#1a1f3a] to-[#0a0e27] text-white relative font-space-grotesk">
      <SpaceBackground3D />
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="mb-8 text-center space-y-4">
          <QuestionIcon className="h-16 w-16 mx-auto text-blue-400" />
          <h1 className="text-4xl md:text-5xl font-bold text-white font-orbitron">Knowledge Check</h1>
          <p className="text-xl text-blue-200">
            {currentQuestion + 1} / {questions.length}
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <Card className="max-w-2xl mx-auto p-8 bg-slate-900/70 border-slate-700/50 backdrop-blur">
          <h2 className="text-2xl md:text-3xl font-semibold mb-8 leading-relaxed text-center text-white">
            {question.question}
          </h2>

          <div className="space-y-4 mb-6">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswer === index
              const showCorrect = showExplanation && index === question.correctAnswer
              const showIncorrect = showExplanation && isSelected && !isCorrect

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showExplanation}
                  className={`w-full p-5 text-left text-lg rounded-xl border-2 transition-all ${
                    showCorrect
                      ? "bg-green-500/20 border-green-500 scale-105"
                      : showIncorrect
                        ? "bg-red-500/20 border-red-500"
                        : isSelected
                          ? "bg-blue-500/20 border-blue-500"
                          : "bg-slate-800/50 border-slate-700 hover:border-slate-600 hover:bg-slate-800"
                  } ${showExplanation ? "cursor-not-allowed" : "cursor-pointer"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{option}</span>
                    {showCorrect && <CheckCircle2 className="h-6 w-6 text-green-500" />}
                    {showIncorrect && <XCircle className="h-6 w-6 text-red-500" />}
                  </div>
                </button>
              )
            })}
          </div>

          {showExplanation && (
            <div
              className={`p-6 rounded-xl mb-6 animate-fade-in ${
                isCorrect ? "bg-green-500/20 border-2 border-green-500/50" : "bg-red-500/20 border-2 border-red-500/50"
              }`}
            >
              <p className="font-bold text-xl mb-3 text-white font-orbitron">{isCorrect ? "Correct!" : "Not quite!"}</p>
              <p className="text-base text-white/90 leading-relaxed">{question.explanation}</p>
            </div>
          )}

          <div className="flex gap-4">
            {!showExplanation ? (
              <Button
                onClick={handleSubmitAnswer}
                disabled={selectedAnswer === null}
                size="lg"
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold font-orbitron"
              >
                Submit Answer
              </Button>
            ) : (
              <Button
                onClick={handleNextQuestion}
                size="lg"
                className="w-full h-14 text-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold font-orbitron"
              >
                {currentQuestion < questions.length - 1 ? "Next Question" : "View Results"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </main>
  )
}
