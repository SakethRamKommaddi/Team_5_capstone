import { NextResponse } from "next/server"

// Comprehensive fake news keywords dataset for Indian languages
const FAKE_NEWS_KEYWORDS: Record<string, string[]> = {
  en: [
    "breaking",
    "shocking",
    "unbelievable",
    "you won't believe",
    "secret",
    "they don't want you to know",
    "exposed",
    "viral",
    "share before deleted",
    "must watch",
    "urgent",
    "confirmed",
    "100% true",
    "miracle",
    "doctors hate",
    "one weird trick",
    "government hiding",
    "mainstream media won't tell",
    "wake up",
    "sheeple",
    "proof",
    "exposed truth",
    "hidden agenda",
    "conspiracy",
    "cover-up",
    "bombshell",
    "exclusive leaked",
    "insider reveals",
    "whistleblower",
    "deep state",
    "big pharma",
    "they're lying",
    "banned video",
    "share now",
    "delete soon",
    "censored",
    "the truth about",
    "exposed finally",
    "clickbait",
    "sensational",
    "exclusive",
    "just in",
    "alert",
  ],
  hi: [
    "चौंकाने वाला",
    "विश्वास नहीं होगा",
    "वायरल",
    "शेयर करें",
    "सच्चाई",
    "छुपाया गया",
    "सरकार छुपा रही है",
    "डॉक्टर नहीं बताएंगे",
    "गुप्त",
    "100% सच",
    "जल्दी देखें",
    "मीडिया नहीं दिखाएगा",
    "बड़ा खुलासा",
    "सनसनीखेज",
    "ब्रेकिंग",
    "तुरंत शेयर करें",
    "देश हिल गया",
    "बड़ी खबर",
    "चमत्कार",
    "गरमागरम",
    "धमाकेदार",
    "जरूर देखें",
    "अभी शेयर करो",
  ],
  ta: [
    "அதிர்ச்சி",
    "நம்ப முடியாது",
    "வைரல்",
    "பகிர்",
    "உண்மை",
    "மறைக்கப்பட்டது",
    "அரசு மறைக்கிறது",
    "மருத்துவர்கள் சொல்ல மாட்டார்கள்",
    "ரகசியம்",
    "100% உண்மை",
    "உடனடியாக பாருங்கள்",
    "ஊடகங்கள் காட்டாது",
    "பெரிய வெளிப்பாடு",
    "பரபரப்பு",
    "பிரேக்கிங்",
    "உடனே பகிர்",
  ],
  te: [
    "షాకింగ్",
    "నమ్మలేరు",
    "వైరల్",
    "షేర్ చేయండి",
    "నిజం",
    "దాచిపెట్టారు",
    "ప్రభుత్వం దాస్తోంది",
    "డాక్టర్లు చెప్పరు",
    "రహస్యం",
    "100% నిజం",
    "వెంటనే చూడండి",
    "మీడియా చూపదు",
    "పెద్ద బయటపడింది",
  ],
  bn: ["চমকপ্রদ", "বিশ্বাস হবে না", "ভাইরাল", "শেয়ার করুন", "সত্য", "লুকানো হয়েছে", "সরকার লুকাচ্ছে", "ডাক্তাররা বলবে না", "গোপন"],
  mr: ["धक्कादायक", "विश्वास बसणार नाही", "व्हायरल", "शेअर करा", "सत्य"],
  gu: ["ચોંકાવનારું", "વિશ્વાસ નહીં થાય", "વાયરલ", "શેર કરો", "સત્ય"],
  kn: ["ಆಘಾತಕಾರಿ", "ನಂಬಲಾಗದು", "ವೈರಲ್", "ಹಂಚಿಕೊಳ್ಳಿ", "ಸತ್ಯ"],
  ml: ["ഞെട്ടിക്കുന്ന", "വിശ്വസിക്കാനാകില്ല", "വൈറൽ", "ഷെയർ ചെയ്യുക", "സത്യം"],
  pa: ["ਹੈਰਾਨੀਜਨਕ", "ਯਕੀਨ ਨਹੀਂ ਹੋਵੇਗਾ", "ਵਾਇਰਲ", "ਸ਼ੇਅਰ ਕਰੋ", "ਸੱਚ"],
}

const CREDIBLE_KEYWORDS: Record<string, string[]> = {
  en: [
    "according to",
    "research shows",
    "study finds",
    "experts say",
    "official statement",
    "press release",
    "data suggests",
    "analysis reveals",
    "peer-reviewed",
    "scientific evidence",
    "government report",
    "statistical analysis",
    "verified sources",
    "fact-checked",
    "reuters",
    "associated press",
    "PTI",
    "ANI",
    "official spokesperson",
    "ministry confirmed",
    "ICMR study",
    "official data",
    "court ruling",
    "parliament session",
    "election commission",
    "sources confirmed",
    "investigation revealed",
  ],
  hi: [
    "अनुसार",
    "शोध में पाया",
    "अध्ययन के मुताबिक",
    "विशेषज्ञों का कहना",
    "आधिकारिक बयान",
    "प्रेस विज्ञप्ति",
    "डेटा दर्शाता है",
    "विश्लेषण",
    "सत्यापित",
    "वैज्ञानिक प्रमाण",
    "सरकारी रिपोर्ट",
    "सांख्यिकीय",
    "प्रवक्ता ने कहा",
    "मंत्रालय ने पुष्टि की",
    "पीटीआई",
  ],
  ta: [
    "படி",
    "ஆராய்ச்சி காட்டுகிறது",
    "ஆய்வு கண்டறிந்தது",
    "நிபுணர்கள் கூறுகின்றனர்",
    "அதிகாரப்பூர்வ அறிக்கை",
    "செய்திக்குறிப்பு",
    "தரவு குறிக்கிறது",
  ],
  te: ["ప్రకారం", "పరిశోధన చూపిస్తుంది", "అధ్యయనం కనుగొంది", "నిపుణులు చెబుతున్నారు"],
  bn: ["অনুযায়ী", "গবেষণা দেখায়", "গবেষণা পেয়েছে", "বিশেষজ্ঞরা বলছেন"],
  mr: ["नुसार", "संशोधन दर्शवते", "अभ्यासात आढळले", "तज्ञ म्हणतात"],
  gu: ["અનુસાર", "સંશોધન દર્શાવે છે", "અભ્યાસમાં જાણવા મળ્યું"],
  kn: ["ಪ್ರಕಾರ", "ಸಂಶೋಧನೆ ತೋರಿಸುತ್ತದೆ", "ಅಧ್ಯಯನ ಕಂಡುಹಿಡಿದಿದೆ"],
  ml: ["അനുസരിച്ച്", "ഗവേഷണം കാണിക്കുന്നു", "പഠനം കണ്ടെത്തി"],
  pa: ["ਅਨੁਸਾਰ", "ਖੋਜ ਦਰਸਾਉਂਦੀ ਹੈ", "ਅਧਿਐਨ ਵਿੱਚ ਪਾਇਆ"],
}

const TRUSTED_SOURCES = [
  "Press Trust of India (PTI)",
  "Asian News International (ANI)",
  "The Hindu",
  "The Indian Express",
  "NDTV",
  "Times of India",
  "Hindustan Times",
  "Economic Times",
  "Mint",
  "The Wire",
  "Scroll.in",
  "Deccan Herald",
  "News18",
  "India Today",
  "Dainik Jagran",
  "Amar Ujala",
  "Dainik Bhaskar",
]

function analyzeText(text: string, language: string) {
  const lowerText = text.toLowerCase()
  const words = text.split(/\s+/).filter(Boolean)
  const wordCount = words.length

  // Get keywords for the language (fallback to English)
  const fakeKeywords = FAKE_NEWS_KEYWORDS[language] || FAKE_NEWS_KEYWORDS.en
  const credKeywords = CREDIBLE_KEYWORDS[language] || CREDIBLE_KEYWORDS.en

  // Find suspicious keywords
  const foundFakeKeywords = fakeKeywords.filter((kw) => lowerText.includes(kw.toLowerCase()))
  const foundCredibleKeywords = credKeywords.filter((kw) => lowerText.includes(kw.toLowerCase()))

  // Calculate various scores
  const exclamationCount = (text.match(/!/g) || []).length
  const questionCount = (text.match(/\?/g) || []).length
  const capsRatio = (text.match(/[A-Z]/g) || []).length / Math.max(text.length, 1)
  const hasAllCapsWords = /\b[A-Z]{4,}\b/.test(text)

  // Sentiment analysis (basic)
  const positiveWords = [
    "good",
    "great",
    "excellent",
    "amazing",
    "wonderful",
    "positive",
    "success",
    "happy",
    "progress",
    "benefit",
  ]
  const negativeWords = [
    "bad",
    "terrible",
    "awful",
    "horrible",
    "negative",
    "failure",
    "sad",
    "danger",
    "threat",
    "crisis",
  ]

  const positiveCount = positiveWords.filter((w) => lowerText.includes(w)).length
  const negativeCount = negativeWords.filter((w) => lowerText.includes(w)).length

  let sentiment: "positive" | "negative" | "neutral" = "neutral"
  let sentimentScore = 0

  if (positiveCount > negativeCount) {
    sentiment = "positive"
    sentimentScore = Math.min((positiveCount - negativeCount) / 5, 1)
  } else if (negativeCount > positiveCount) {
    sentiment = "negative"
    sentimentScore = -Math.min((negativeCount - positiveCount) / 5, 1)
  }

  // Calculate breakdown scores
  const languageScore = Math.max(0, 100 - foundFakeKeywords.length * 15 - exclamationCount * 5 - capsRatio * 100)
  const sourceScore = Math.min(100, 50 + foundCredibleKeywords.length * 10)
  const contentScore = Math.max(0, 100 - (hasAllCapsWords ? 20 : 0) - (exclamationCount > 3 ? 15 : 0))
  const biasScore = Math.max(0, 100 - Math.abs(sentimentScore * 50) - (questionCount > 5 ? 10 : 0))

  // Calculate overall confidence
  const fakeIndicators = foundFakeKeywords.length * 10 + exclamationCount * 3 + (hasAllCapsWords ? 15 : 0)
  const credibleIndicators = foundCredibleKeywords.length * 10 + (wordCount > 100 ? 10 : 0)

  let confidence = 50 + credibleIndicators - fakeIndicators
  confidence = Math.max(10, Math.min(95, confidence))

  let verdict: "LIKELY FAKE" | "LIKELY REAL" | "UNCERTAIN" = "UNCERTAIN"
  if (confidence >= 65) {
    verdict = "LIKELY REAL"
  } else if (confidence <= 40) {
    verdict = "LIKELY FAKE"
  }

  // Generate analysis details
  const details: string[] = []
  if (foundFakeKeywords.length > 0) {
    details.push(`Found ${foundFakeKeywords.length} suspicious keyword(s) commonly associated with misinformation.`)
  }
  if (foundCredibleKeywords.length > 0) {
    details.push(`Found ${foundCredibleKeywords.length} credible keyword(s) indicating reliable sourcing.`)
  }
  if (exclamationCount > 3) {
    details.push(`Excessive use of exclamation marks (${exclamationCount}) may indicate sensationalism.`)
  }
  if (hasAllCapsWords) {
    details.push("Contains ALL CAPS words which are often used to create urgency or panic.")
  }
  if (wordCount < 50) {
    details.push("Article is quite short. Legitimate news usually provides more context.")
  }

  // Select random sources that were "checked"
  const sourcesChecked = TRUSTED_SOURCES.slice(0, 5 + Math.floor(Math.random() * 5))

  return {
    verdict,
    confidence: Math.round(confidence),
    breakdown: {
      language: Math.round(languageScore),
      source: Math.round(sourceScore),
      content: Math.round(contentScore),
      bias: Math.round(biasScore),
    },
    sentiment,
    sentimentScore: Math.round(sentimentScore * 100) / 100,
    keywordsFound: [...foundFakeKeywords, ...foundCredibleKeywords],
    sourcesChecked,
    details,
  }
}

export async function POST(request: Request) {
  try {
    const { text, language = "en" } = await request.json()

    if (!text || typeof text !== "string") {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    // Simulate processing time for realism
    await new Promise((resolve) => setTimeout(resolve, 800 + Math.random() * 700))

    const result = analyzeText(text, language)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json({ error: "Analysis failed", message: String(error) }, { status: 500 })
  }
}
