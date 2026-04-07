import { NextResponse } from "next/server"

function quickAnalyze(text: string): { verdict: "LIKELY FAKE" | "LIKELY REAL" | "UNCERTAIN"; confidence: number } {
  const lowerText = text.toLowerCase()

  const fakeKeywords = [
    "breaking",
    "shocking",
    "unbelievable",
    "viral",
    "share now",
    "exposed",
    "secret",
    "they don't want",
    "must watch",
    "100% true",
    "miracle",
  ]

  const credibleKeywords = [
    "according to",
    "research shows",
    "study finds",
    "experts say",
    "official",
    "press release",
    "data suggests",
    "verified",
    "fact-checked",
  ]

  const fakeCount = fakeKeywords.filter((kw) => lowerText.includes(kw)).length
  const credibleCount = credibleKeywords.filter((kw) => lowerText.includes(kw)).length
  const exclamationCount = (text.match(/!/g) || []).length

  let confidence = 50 + credibleCount * 8 - fakeCount * 10 - exclamationCount * 2
  confidence = Math.max(15, Math.min(90, confidence))

  let verdict: "LIKELY FAKE" | "LIKELY REAL" | "UNCERTAIN" = "UNCERTAIN"
  if (confidence >= 60) {
    verdict = "LIKELY REAL"
  } else if (confidence <= 40) {
    verdict = "LIKELY FAKE"
  }

  return { verdict, confidence: Math.round(confidence) }
}

export async function POST(request: Request) {
  try {
    const { text1, text2, language = "en" } = await request.json()

    if (!text1 || !text2) {
      return NextResponse.json({ error: "Both articles are required" }, { status: 400 })
    }

    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 600))

    const result1 = quickAnalyze(text1)
    const result2 = quickAnalyze(text2)

    return NextResponse.json({
      article1: result1,
      article2: result2,
    })
  } catch (error) {
    console.error("Comparison error:", error)
    return NextResponse.json({ error: "Comparison failed", message: String(error) }, { status: 500 })
  }
}
