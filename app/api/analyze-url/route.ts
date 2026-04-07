import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { url, language = "en" } = await request.json()

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Simulate URL analysis - in production, you would fetch and parse the URL
    await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000))

    // Extract domain for source checking
    let domain = ""
    try {
      domain = new URL(url).hostname.replace("www.", "")
    } catch {
      return NextResponse.json({ error: "Invalid URL" }, { status: 400 })
    }

    // Check if domain is from trusted sources
    const trustedDomains = [
      "thehindu.com",
      "indianexpress.com",
      "ndtv.com",
      "timesofindia.indiatimes.com",
      "hindustantimes.com",
      "economictimes.indiatimes.com",
      "livemint.com",
      "thewire.in",
      "scroll.in",
      "deccanherald.com",
      "news18.com",
      "indiatoday.in",
      "pti.in",
      "ani.in",
      "bbc.com",
      "reuters.com",
    ]

    const isTrusted = trustedDomains.some((td) => domain.includes(td))

    const confidence = isTrusted ? 70 + Math.floor(Math.random() * 20) : 30 + Math.floor(Math.random() * 30)
    const verdict = confidence >= 60 ? "LIKELY REAL" : confidence <= 40 ? "LIKELY FAKE" : "UNCERTAIN"

    return NextResponse.json({
      verdict,
      confidence,
      breakdown: {
        source: isTrusted ? 85 + Math.floor(Math.random() * 10) : 30 + Math.floor(Math.random() * 20),
        domain: isTrusted ? 90 : 40,
        reputation: isTrusted ? 80 + Math.floor(Math.random() * 15) : 25 + Math.floor(Math.random() * 20),
        security: url.startsWith("https") ? 90 : 50,
      },
      sentiment: "neutral",
      sentimentScore: 0,
      keywordsFound: [],
      sourcesChecked: [domain],
      details: [
        isTrusted
          ? `${domain} is recognized as a trusted news source.`
          : `${domain} is not in our database of verified news sources.`,
        url.startsWith("https")
          ? "The URL uses secure HTTPS connection."
          : "Warning: The URL does not use secure HTTPS connection.",
      ],
    })
  } catch (error) {
    console.error("URL analysis error:", error)
    return NextResponse.json({ error: "URL analysis failed", message: String(error) }, { status: 500 })
  }
}
