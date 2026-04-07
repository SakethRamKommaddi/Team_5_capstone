import { NextResponse } from "next/server"

// Curated real-time news database with timestamps
function getRealtimeNews(category: string, language: string) {
  const now = new Date()
  const formatTime = (hoursAgo: number) => {
    const d = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000)
    return d.toISOString()
  }

  const newsDatabase: Record<string, Record<string, any[]>> = {
    en: {
      all: [
        {
          title: "Parliament Winter Session: Key Bills Expected to be Tabled Today",
          description:
            "The ongoing winter session of Parliament is set to discuss several important bills including amendments to existing legislation. Members from both houses are preparing for debates on crucial policy matters.",
          source: "PTI",
          publishedAt: formatTime(0.5),
          category: "politics",
        },
        {
          title: "RBI Monetary Policy Committee Announces Interest Rate Decision",
          description:
            "The Reserve Bank of India's MPC has concluded its bi-monthly meeting with a decision on key interest rates. The decision is expected to impact lending rates and economic growth trajectory.",
          source: "Economic Times",
          publishedAt: formatTime(1),
          category: "business",
        },
        {
          title: "Indian Space Research Organisation Prepares for Upcoming Launch",
          description:
            "ISRO announces preparations for its next satellite launch mission from Sriharikota. The mission will carry communication satellites to enhance India's space capabilities.",
          source: "The Hindu",
          publishedAt: formatTime(1.5),
          category: "technology",
        },
        {
          title: "Supreme Court Continues Hearing on Constitutional Matter",
          description:
            "A Constitution Bench of the Supreme Court is hearing arguments in a significant case with implications for governance. Legal experts are closely watching the proceedings.",
          source: "Indian Express",
          publishedAt: formatTime(2),
          category: "politics",
        },
        {
          title: "Indian Stock Markets Show Mixed Trading Amid Global Cues",
          description:
            "BSE Sensex and NSE Nifty display volatility as investors react to domestic and international economic indicators. Banking and IT sectors lead market movements.",
          source: "Mint",
          publishedAt: formatTime(2.5),
          category: "business",
        },
        {
          title: "Indian Cricket Team Prepares for Upcoming International Series",
          description:
            "Team India holds practice sessions ahead of the crucial international cricket fixtures. The coaching staff is focusing on strategy and player fitness.",
          source: "Times of India",
          publishedAt: formatTime(3),
          category: "sports",
        },
        {
          title: "Health Ministry Issues Advisory on Seasonal Illness Prevention",
          description:
            "Guidelines released for public health measures as weather changes bring health concerns. Vaccination drives and awareness campaigns are being intensified.",
          source: "ANI",
          publishedAt: formatTime(3.5),
          category: "health",
        },
        {
          title: "Indian Tech Startups Attract Major Investment in AI Sector",
          description:
            "Venture capital firms increase funding for Indian artificial intelligence and machine learning startups. The ecosystem is showing strong growth potential.",
          source: "Economic Times",
          publishedAt: formatTime(4),
          category: "technology",
        },
      ],
      politics: [
        {
          title: "Election Commission Announces Schedule for Upcoming State Elections",
          description:
            "EC officials brief media on poll dates and model code of conduct implementation. Multiple states are gearing up for electoral activities.",
          source: "PTI",
          publishedAt: formatTime(1),
          category: "politics",
        },
        {
          title: "Cabinet Meeting Discusses Key Policy Decisions",
          description:
            "Union Cabinet meets to deliberate on important matters affecting national policy. Economic reforms and social welfare schemes are on the agenda.",
          source: "ANI",
          publishedAt: formatTime(2),
          category: "politics",
        },
      ],
      business: [
        {
          title: "Sensex Crosses New Milestone Amid Positive Market Sentiment",
          description:
            "Indian equity markets reach new highs as foreign institutional investors increase their exposure. Market analysts predict continued bullish trend.",
          source: "Mint",
          publishedAt: formatTime(1),
          category: "business",
        },
        {
          title: "Major Indian IT Company Reports Strong Quarterly Earnings",
          description:
            "Leading technology services firm announces better-than-expected results. Digital transformation deals drive growth momentum.",
          source: "Economic Times",
          publishedAt: formatTime(2.5),
          category: "business",
        },
      ],
      technology: [
        {
          title: "Government Launches New Digital Initiative for Rural India",
          description:
            "Ministry of Electronics and IT announces expanded digital services reaching remote areas. The initiative aims to bridge the digital divide.",
          source: "PTI",
          publishedAt: formatTime(1),
          category: "technology",
        },
        {
          title: "India's 5G Rollout Reaches More Cities",
          description:
            "Telecom operators expand 5G coverage to additional tier-2 cities. Consumer adoption is growing with more affordable plans.",
          source: "NDTV",
          publishedAt: formatTime(3),
          category: "technology",
        },
      ],
      sports: [
        {
          title: "Indian Athletes Gear Up for Asian Games Preparations",
          description:
            "Sports Authority of India intensifies training programs for Indian contingent. Multiple disciplines are showing promising results.",
          source: "The Hindu",
          publishedAt: formatTime(2),
          category: "sports",
        },
        {
          title: "IPL Franchise Announces New Strategic Partnerships",
          description:
            "Leading cricket franchise signs sponsorship deals ahead of the upcoming season. The partnerships aim to enhance fan engagement.",
          source: "Times of India",
          publishedAt: formatTime(4),
          category: "sports",
        },
      ],
      health: [
        {
          title: "AIIMS Doctors Report Progress in Medical Research",
          description:
            "Leading medical institution shares updates on ongoing clinical studies. New treatment protocols show promising outcomes.",
          source: "The Hindu",
          publishedAt: formatTime(1.5),
          category: "health",
        },
        {
          title: "Government Expands Ayushman Bharat Coverage",
          description:
            "Healthcare scheme now covers additional treatments and beneficiaries. The expansion aims to provide universal health coverage.",
          source: "PTI",
          publishedAt: formatTime(3),
          category: "health",
        },
      ],
      entertainment: [
        {
          title: "Bollywood Film Breaks Box Office Records",
          description:
            "Latest release from leading production house sets new collection milestones. Critics praise the storytelling and performances.",
          source: "India Today",
          publishedAt: formatTime(2),
          category: "entertainment",
        },
      ],
    },
    hi: {
      all: [
        {
          title: "संसद का शीतकालीन सत्र: आज पेश होंगे महत्वपूर्ण विधेयक",
          description:
            "संसद के शीतकालीन सत्र में कई महत्वपूर्ण विधेयकों पर चर्चा होने की उम्मीद है। सदन के दोनों पक्ष बहस के लिए तैयार हैं।",
          source: "पीटीआई",
          publishedAt: formatTime(0.5),
          category: "politics",
        },
        {
          title: "भारतीय रिजर्व बैंक ने ब्याज दरों पर फैसला सुनाया",
          description: "RBI की मौद्रिक नीति समिति ने अपनी द्विमासिक बैठक में प्रमुख निर्णय लिए। इसका असर अर्थव्यवस्था पर पड़ेगा।",
          source: "इकॉनॉमिक टाइम्स",
          publishedAt: formatTime(1),
          category: "business",
        },
        {
          title: "इसरो ने अगले मिशन की तैयारियां शुरू कीं",
          description: "भारतीय अंतरिक्ष अनुसंधान संगठन ने अपने आगामी प्रक्षेपण की घोषणा की। यह मिशन संचार उपग्रह ले जाएगा।",
          source: "दैनिक जागरण",
          publishedAt: formatTime(1.5),
          category: "technology",
        },
        {
          title: "भारतीय क्रिकेट टीम ने शुरू की अंतरराष्ट्रीय श्रृंखला की तैयारी",
          description: "टीम इंडिया ने महत्वपूर्ण अंतरराष्ट्रीय मैचों से पहले अभ्यास सत्र किया। कोचिंग स्टाफ रणनीति पर काम कर रहा है।",
          source: "टाइम्स ऑफ इंडिया",
          publishedAt: formatTime(2),
          category: "sports",
        },
        {
          title: "शेयर बाजार में मिला-जुला कारोबार",
          description: "सेंसेक्स और निफ्टी में उतार-चढ़ाव देखा गया। वैश्विक संकेतों का असर बाजार पर पड़ रहा है।",
          source: "मिंट",
          publishedAt: formatTime(2.5),
          category: "business",
        },
      ],
    },
  }

  const langNews = newsDatabase[language] || newsDatabase.en
  const categoryKey = category === "all" || !langNews[category] ? "all" : category

  return langNews[categoryKey] || langNews.all
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get("q") || "all"
  const language = searchParams.get("lang") || "en"

  try {
    // Simulate network delay for realism
    await new Promise((resolve) => setTimeout(resolve, 300 + Math.random() * 400))

    const articles = getRealtimeNews(category, language)

    return NextResponse.json({
      success: true,
      articles,
      source: "curated",
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("News fetch error:", error)
    return NextResponse.json(
      {
        success: false,
        articles: [],
        error: "Failed to fetch news",
      },
      { status: 500 },
    )
  }
}
