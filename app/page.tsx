"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  FileText,
  Globe,
  History,
  LinkIcon,
  Mic,
  MicOff,
  Newspaper,
  Search,
  Shield,
  X,
  XCircle,
  BarChart3,
  Clock,
  RefreshCw,
  Zap,
} from "lucide-react"

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

// Indian Languages Configuration
type Language = "en" | "hi" | "ta" | "te" | "bn" | "mr" | "gu" | "kn" | "ml" | "pa"

const INDIAN_LANGUAGES: Record<Language, { name: string; nativeName: string }> = {
  en: { name: "English", nativeName: "English" },
  hi: { name: "Hindi", nativeName: "हिन्दी" },
  ta: { name: "Tamil", nativeName: "தமிழ்" },
  te: { name: "Telugu", nativeName: "తెలుగు" },
  bn: { name: "Bengali", nativeName: "বাংলা" },
  mr: { name: "Marathi", nativeName: "मराठी" },
  gu: { name: "Gujarati", nativeName: "ગુજરાતી" },
  kn: { name: "Kannada", nativeName: "ಕನ್ನಡ" },
  ml: { name: "Malayalam", nativeName: "മലയാളം" },
  pa: { name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
}

// Sample news for testing
const SAMPLE_NEWS: Record<Language, { fake: string; real: string }> = {
  en: {
    fake: "SHOCKING: Government hiding the truth! You won't believe what they don't want you to know! Share before this gets deleted! 100% confirmed by insider sources. MUST WATCH NOW!!!",
    real: "According to official government data released by the Ministry of Finance, India's GDP growth rate for the current quarter stands at 7.2%, as reported by PTI. The Reserve Bank of India has maintained its growth forecast, citing improvements in manufacturing and service sectors.",
  },
  hi: {
    fake: "चौंकाने वाला: सरकार छुपा रही है बड़ा सच! आप विश्वास नहीं करेंगे! तुरंत शेयर करें वरना यह डिलीट हो जाएगा! 100% सच साबित!!!",
    real: "वित्त मंत्रालय के आधिकारिक आंकड़ों के अनुसार, भारत की GDP वृद्धि दर 7.2% रही है। पीटीआई की रिपोर्ट के मुताबिक, विशेषज्ञों का मानना है कि आर्थिक सुधार जारी है।",
  },
  ta: {
    fake: "அதிர்ச்சி! அரசு மறைக்கும் உண்மை! நம்ப முடியாது! இது நீக்கப்படும் முன் உடனே பகிரவும்! 100% உண்மை!!!",
    real: "மத்திய நிதி அமைச்சகத்தின் அதிகாரப்பூர்வ தரவுகளின்படி, இந்தியாவின் GDP வளர்ச்சி விகிதம் 7.2% ஆக உள்ளது என்று பிடிஐ தெரிவிக்கிறது।",
  },
  te: {
    fake: "షాకింగ్! ప్రభుత్వం దాస్తున్న నిజం! నమ్మలేరు! వెంటనే షేర్ చేయండి! 100% నిజం!!!",
    real: "కేంద్ర ఆర్థిక మంత్రిత్వ శాఖ అధికారిక డేటా ప్రకారం, భారతదేశ GDP వృద్ధి రేటు 7.2%గా ఉందని పిటిఐ నివేదిస్తోంది।",
  },
  bn: {
    fake: "চমকপ্রদ! সরকার লুকাচ্ছে সত্য! বিশ্বাস হবে না! এখনই শেয়ার করুন! 100% সত্য!!!",
    real: "কেন্দ্রীয় অর্থ মন্ত্রকের সরকারি তথ্য অনুসারে, ভারতের GDP বৃদ্ধির হার 7.2% বলে পিটিআই জানিয়েছে।",
  },
  mr: {
    fake: "धक्कादायक! सरकार लपवत आहे सत्य! विश्वास बसणार नाही! लगेच शेअर करा! 100% खरे!!!",
    real: "केंद्रीय अर्थ मंत्रालयाच्या अधिकृत आकडेवारीनुसार, भारताचा GDP वाढीचा दर 7.2% आहे, असे पीटीआयने वृत्त दिले आहे।",
  },
  gu: {
    fake: "ચોંકાવનારું! સરકાર છુપાવે છે સત્ય! વિશ્વાસ નહીં થાય! તરત શેર કરો! 100% સાચું!!!",
    real: "કેન્દ્રીય નાણા મંત્રાલયના સત્તાવાર આંકડા મુજબ, ભારતનો GDP વૃદ્ધિ દર 7.2% છે, એમ પીટીઆઈએ જણાવ્યું છે।",
  },
  kn: {
    fake: "ಆಘಾತಕಾರಿ! ಸರ್ಕಾರ ಮರೆಮಾಚುತ್ತಿದೆ ಸತ್ಯ! ನಂಬಲಾಗದು! ತಕ್ಷಣ ಹಂಚಿ! 100% ನಿಜ!!!",
    real: "ಕೇಂದ್ರ ಹಣಕಾಸು ಸಚಿವಾಲಯದ ಅಧಿಕೃತ ದತ್ತಾಂಶದ ಪ್ರಕಾರ, ಭಾರತದ GDP ಬೆಳವಣಿಗೆ ದರ 7.2% ಎಂದು ಪಿಟಿಐ ವರದಿ ಮಾಡಿದೆ।",
  },
  ml: {
    fake: "ഞെട്ടിക്കുന്ന! സർക്കാർ മറയ്ക്കുന്നു സത്യം! വിശ്വസിക്കാനാകില്ല! ഉടൻ ഷെയർ! 100% സത്യം!!!",
    real: "കേന്ദ്ര ധനകാര്യ മന്ത്രാലയത്തിന്റെ ഔദ്യോഗിക കണക്കുകൾ പ്രകാരം, ഇന്ത്യയുടെ GDP വളർച്ചാ നിരക്ക് 7.2% ആണെന്ന് പിടിഐ റിപ്പോർട്ട് ചെയ്തു।",
  },
  pa: {
    fake: "ਹੈਰਾਨੀਜਨਕ! ਸਰਕਾਰ ਛੁਪਾ ਰਹੀ ਹੈ ਸੱਚ! ਯਕੀਨ ਨਹੀਂ ਹੋਵੇਗਾ! ਤੁਰੰਤ ਸ਼ੇਅਰ ਕਰੋ! 100% ਸੱਚ!!!",
    real: "ਕੇਂਦਰੀ ਵਿੱਤ ਮੰਤਰਾਲੇ ਦੇ ਅਧਿਕਾਰਤ ਅੰਕੜਿਆਂ ਅਨੁਸਾਰ, ਭਾਰਤ ਦੀ GDP ਵਿਕਾਸ ਦਰ 7.2% ਹੈ, ਪੀਟੀਆਈ ਨੇ ਰਿਪੋਰਟ ਕੀਤੀ।",
  },
}

// UI Translations (simplified - keeping essential keys)
const UI_TEXT: Record<Language, Record<string, string>> = {
  en: {
    title: "Fake News Detection System",
    subtitle: "AI-Powered Academic Research Project",
    detection: "Detection",
    liveNews: "Live News",
    urlAnalysis: "URL Analysis",
    batchAnalysis: "Batch",
    comparison: "Compare",
    history: "History",
    analyzeNews: "Analyze News",
    analyzing: "Analyzing...",
    loadSampleFake: "Load Fake Sample",
    loadSampleReal: "Load Real Sample",
    clear: "Clear",
    export: "Export Report",
    share: "Share",
    words: "words",
    minRead: "min read",
    characters: "characters",
    prediction: "Prediction",
    confidence: "Confidence",
    fake: "LIKELY FAKE",
    real: "LIKELY REAL",
    uncertain: "UNCERTAIN",
    fakeWarning:
      "This article shows patterns commonly associated with misinformation. Verify from trusted sources before sharing.",
    realMessage: "This article appears to be legitimate news. However, always cross-check with multiple sources.",
    keywordAnalysis: "Keyword Analysis",
    suspiciousKeywords: "Suspicious Keywords",
    credibleKeywords: "Credible Keywords",
    noneDetected: "None detected",
    fetchLiveNews: "Fetch Live News",
    fetching: "Loading...",
    liveNewsTitle: "Live News Feed",
    liveNewsDesc: "Real-time news from trusted Indian sources",
    selectLanguage: "Select Language",
    analysisResults: "Analysis Results",
    noHistory: "No history yet. Start by analyzing some news articles!",
    sourceVerification: "Source Verification",
    sourcesChecked: "Sources Checked",
    credibilityBreakdown: "Credibility Breakdown",
    autoRefresh: "Auto-refresh in",
    lastUpdated: "Last updated",
    trendingMisinfo: "Trending Misinformation Alerts",
    compareArticles: "Compare Two Articles",
    article1: "Article 1",
    article2: "Article 2",
    compareNow: "Compare",
    comparing: "Comparing...",
    comparisonResult: "Comparison Result",
    copyToClipboard: "Copy to Clipboard",
    copied: "Copied!",
    enterUrl: "Enter news article URL",
    analyzeUrl: "Analyze URL",
    urlNote: "Enter a news URL to analyze its credibility",
    batchDesc: "Analyze multiple news articles at once",
    batchPlaceholder: "Paste news article texts here, one per line...",
    batchResults: "Batch Analysis Results",
    wordCount: "Word Count",
    charCount: "Character Count",
    readingTime: "Est. Reading Time",
    analyze: "Analyze",
    placeholder: "Enter news article text here for analysis...",
    refreshNews: "Refresh News",
    noNews: "No news found. Try refreshing.",
    viewSource: "View Source",
    analyzeThis: "Analyze",
    overallCredibility: "Overall Credibility",
    voiceInput: "Voice Input",
    speakNow: "Speak now...",
    clearHistory: "Clear History",
    footer: "© 2025 Fake News Detection System - Academic Research Project",
  },
  hi: {
    title: "फेक न्यूज़ डिटेक्शन सिस्टम",
    subtitle: "AI-संचालित शैक्षणिक परियोजना",
    detection: "पहचान",
    liveNews: "लाइव न्यूज़",
    urlAnalysis: "URL विश्लेषण",
    batchAnalysis: "बैच",
    comparison: "तुलना",
    history: "इतिहास",
    analyzeNews: "विश्लेषण करें",
    analyzing: "विश्लेषण हो रहा है...",
    loadSampleFake: "फेक नमूना लोड करें",
    loadSampleReal: "असली नमूना लोड करें",
    clear: "साफ़ करें",
    export: "रिपोर्ट निर्यात",
    share: "शेयर",
    words: "शब्द",
    minRead: "मिनट",
    characters: "अक्षर",
    prediction: "भविष्यवाणी",
    confidence: "विश्वास",
    fake: "संभवतः फेक",
    real: "संभवतः असली",
    uncertain: "अनिश्चित",
    fakeWarning: "इस लेख में भ्रामक जानकारी हो सकती है। शेयर करने से पहले सत्यापित करें।",
    realMessage: "यह लेख वैध प्रतीत होता है। फिर भी कई स्रोतों से जांचें।",
    keywordAnalysis: "कीवर्ड विश्लेषण",
    suspiciousKeywords: "संदिग्ध कीवर्ड",
    credibleKeywords: "विश्वसनीय कीवर्ड",
    noneDetected: "कोई नहीं मिला",
    fetchLiveNews: "लाइव न्यूज़ लाएं",
    fetching: "लोड हो रहा है...",
    liveNewsTitle: "लाइव न्यूज़ फीड",
    liveNewsDesc: "विश्वसनीय भारतीय स्रोतों से रीयल-टाइम समाचार",
    selectLanguage: "भाषा चुनें",
    analysisResults: "विश्लेषण परिणाम",
    noHistory: "अभी कोई इतिहास नहीं।",
    sourceVerification: "स्रोत सत्यापन",
    sourcesChecked: "जांचे गए स्रोत",
    credibilityBreakdown: "विश्वसनीयता विश्लेषण",
    autoRefresh: "ऑटो-रिफ्रेश",
    lastUpdated: "अंतिम अपडेट",
    trendingMisinfo: "ट्रेंडिंग गलत सूचना अलर्ट",
    compareArticles: "दो लेखों की तुलना",
    article1: "लेख 1",
    article2: "लेख 2",
    compareNow: "तुलना करें",
    comparing: "तुलना हो रही है...",
    comparisonResult: "तुलना परिणाम",
    copyToClipboard: "कॉपी करें",
    copied: "कॉपी हो गया!",
    enterUrl: "समाचार URL दर्ज करें",
    analyzeUrl: "URL विश्लेषण",
    urlNote: "विश्वसनीयता जांचने के लिए URL दर्ज करें",
    batchDesc: "एक साथ कई लेखों का विश्लेषण करें",
    batchPlaceholder: "यहां टेक्स्ट पेस्ट करें, प्रति पंक्ति एक...",
    batchResults: "बैच विश्लेषण परिणाम",
    wordCount: "शब्द गणना",
    charCount: "अक्षर गणना",
    readingTime: "पढ़ने का समय",
    analyze: "विश्लेषण",
    placeholder: "विश्लेषण के लिए समाचार टेक्स्ट दर्ज करें...",
    refreshNews: "रीफ्रेश करें",
    noNews: "कोई समाचार नहीं मिला।",
    viewSource: "स्रोत देखें",
    analyzeThis: "विश्लेषण",
    overallCredibility: "समग्र विश्वसनीयता",
    voiceInput: "वॉइस इनपुट",
    speakNow: "अभी बोलें...",
    clearHistory: "इतिहास साफ़ करें",
    footer: "© 2025 फेक न्यूज़ डिटेक्शन - शैक्षणिक परियोजना",
  },
  ta: {
    title: "போலி செய்தி கண்டறிதல்",
    subtitle: "AI-இயக்கப்படும் ஆராய்ச்சி",
    detection: "கண்டறிதல்",
    liveNews: "நேரடி செய்திகள்",
    urlAnalysis: "URL பகுப்பாய்வு",
    batchAnalysis: "தொகுதி",
    comparison: "ஒப்பீடு",
    history: "வரலாறு",
    analyzeNews: "பகுப்பாய்வு",
    analyzing: "பகுப்பாய்வு...",
    loadSampleFake: "போலி மாதிரி",
    loadSampleReal: "உண்மை மாதிரி",
    clear: "அழி",
    export: "ஏற்றுமதி",
    share: "பகிர்",
    words: "வார்த்தைகள்",
    minRead: "நிமிடம்",
    characters: "எழுத்துக்கள்",
    prediction: "கணிப்பு",
    confidence: "நம்பகம்",
    fake: "போலி",
    real: "உண்மை",
    uncertain: "நிச்சயமற்ற",
    fakeWarning: "இது போலி செய்தியாக இருக்கலாம்.",
    realMessage: "இது உண்மையான செய்தியாகத் தெரிகிறது.",
    keywordAnalysis: "சொல் பகுப்பாய்வு",
    suspiciousKeywords: "சந்தேகமான சொற்கள்",
    credibleKeywords: "நம்பகமான சொற்கள்",
    noneDetected: "எதுவும் இல்லை",
    fetchLiveNews: "செய்திகள் பெறு",
    fetching: "ஏற்றுகிறது...",
    liveNewsTitle: "நேரடி செய்திகள்",
    liveNewsDesc: "நம்பகமான மூலங்களில் இருந்து செய்திகள்",
    selectLanguage: "மொழி தேர்வு",
    analysisResults: "பகுப்பாய்வு முடிவுகள்",
    noHistory: "வரலாறு இல்லை.",
    sourceVerification: "மூல சரிபார்ப்பு",
    sourcesChecked: "சரிபார்த்த மூலங்கள்",
    credibilityBreakdown: "நம்பகத்தன்மை பகுப்பாய்வு",
    autoRefresh: "தானியங்கு புதுப்பிப்பு",
    lastUpdated: "கடைசியாக புதுப்பிக்கப்பட்டது",
    trendingMisinfo: "தற்போதைய தவறான தகவல்",
    compareArticles: "இரண்டு கட்டுரைகளை ஒப்பிடு",
    article1: "கட்டுரை 1",
    article2: "கட்டுரை 2",
    compareNow: "ஒப்பிடு",
    comparing: "ஒப்பிடுகிறது...",
    comparisonResult: "ஒப்பீட்டு முடிவு",
    copyToClipboard: "நகலெடு",
    copied: "நகலெடுக்கப்பட்டது!",
    enterUrl: "URL நுழைக்கவும்",
    analyzeUrl: "URL பகுப்பாய்வு",
    urlNote: "URL நுழைக்கவும்",
    batchDesc: "பல கட்டுரைகளை பகுப்பாய்வு செய்",
    batchPlaceholder: "இங்கே ஒட்டவும்...",
    batchResults: "தொகுதி முடிவுகள்",
    wordCount: "சொல் எண்ணிக்கை",
    charCount: "எழுத்து எண்ணிக்கை",
    readingTime: "படிக்கும் நேரம்",
    analyze: "பகுப்பாய்வு",
    placeholder: "செய்தி உரையை இங்கே உள்ளிடவும்...",
    refreshNews: "புதுப்பிக்கவும்",
    noNews: "செய்திகள் இல்லை.",
    viewSource: "ஆதாரத்தைக் காண்க",
    analyzeThis: "பகுப்பாய்வு",
    overallCredibility: "ஒட்டுமொத்த நம்பகத்தன்மை",
    voiceInput: "குரல் உள்ளீடு",
    speakNow: "இப்போது பேசு...",
    clearHistory: "வரலாற்றை அழி",
    footer: "© 2025 போலி செய்தி கண்டறிதல்",
  },
  te: {
    title: "నకిలీ వార్తల గుర్తింపు",
    subtitle: "AI-ఆధారిత పరిశోధన",
    detection: "గుర్తింపు",
    liveNews: "లైవ్ వార్తలు",
    urlAnalysis: "URL విశ్లేషణ",
    batchAnalysis: "బ్యాచ్",
    comparison: "పోల్చడం",
    history: "చరిత్ర",
    analyzeNews: "విశ్లేషించు",
    analyzing: "విశ్లేషిస్తోంది...",
    loadSampleFake: "నకిలీ నమూనా",
    loadSampleReal: "నిజమైన నమూనా",
    clear: "క్లియర్",
    export: "ఎక్స్‌పోర్ట్",
    share: "షేర్",
    words: "పదాలు",
    minRead: "నిమిషాలు",
    characters: "అక్షరాలు",
    prediction: "అంచనా",
    confidence: "నమ్మకం",
    fake: "నకిలీ",
    real: "నిజం",
    uncertain: "అనిశ్చితం",
    fakeWarning: "ఇది నకిలీ వార్త కావచ్చు.",
    realMessage: "ఇది నిజమైన వార్తలా కనిపిస్తోంది.",
    keywordAnalysis: "కీవర్డ్ విశ్లేషణ",
    suspiciousKeywords: "అనుమానాస్పద కీవర్డ్లు",
    credibleKeywords: "నమ్మదగిన కీవర్డ్లు",
    noneDetected: "ఏమీ లేదు",
    fetchLiveNews: "వార్తలు తీసుకురండి",
    fetching: "లోడ్...",
    liveNewsTitle: "లైవ్ వార్తలు",
    liveNewsDesc: "నమ్మదగిన మూలాల నుండి వార్తలు",
    selectLanguage: "భాష ఎంచుకోండి",
    analysisResults: "విశ్లేషణ ఫలితాలు",
    noHistory: "చరిత్ర లేదు.",
    sourceVerification: "మూల ధృవీకరణ",
    sourcesChecked: "తనిఖీ చేసిన మూలాలు",
    credibilityBreakdown: "విశ్వసనీయత విశ్లేషణ",
    autoRefresh: "ఆటో-రిఫ్రెష్",
    lastUpdated: "చివరి అప్‌డేట్",
    trendingMisinfo: "ట్రెండింగ్ తప్పుడు సమాచారం",
    compareArticles: "రెండు కథనాలను పోల్చండి",
    article1: "కథనం 1",
    article2: "కథనం 2",
    compareNow: "పోల్చండి",
    comparing: "పోలుస్తోంది...",
    comparisonResult: "పోలిక ఫలితం",
    copyToClipboard: "కాపీ చేయండి",
    copied: "కాపీ అయింది!",
    enterUrl: "URL నమోదు చేయండి",
    analyzeUrl: "URL విశ్లేషించు",
    urlNote: "URL నమోదు చేయండి",
    batchDesc: "అనేక కథనాలను విశ్లేషించండి",
    batchPlaceholder: "ఇక్కడ అతికించండి...",
    batchResults: "బ్యాచ్ ఫలితాలు",
    wordCount: "పద గణన",
    charCount: "అక్షర గణన",
    readingTime: "చదివే సమయం",
    analyze: "విశ్లేషించు",
    placeholder: "వార్తా టెక్స్ట్ ఇక్కడ నమోదు చేయండి...",
    refreshNews: "రిఫ్రెష్",
    noNews: "వార్తలు లేవు.",
    viewSource: "మూలం చూడండి",
    analyzeThis: "విశ్లేషించు",
    overallCredibility: "మొత్తం విశ్వసనీయత",
    voiceInput: "వాయిస్ ఇన్‌పుట్",
    speakNow: "ఇప్పుడు మాట్లాడండి...",
    clearHistory: "చరిత్రను క్లియర్ చేయండి",
    footer: "© 2025 నకిలీ వార్తల గుర్తింపు",
  },
  bn: {
    title: "ভুয়া খবর শনাক্তকরণ",
    subtitle: "AI-চালিত গবেষণা",
    detection: "শনাক্তকরণ",
    liveNews: "লাইভ খবর",
    urlAnalysis: "URL বিশ্লেষণ",
    batchAnalysis: "ব্যাচ",
    comparison: "তুলনা",
    history: "ইতিহাস",
    analyzeNews: "বিশ্লেষণ",
    analyzing: "বিশ্লেষণ...",
    loadSampleFake: "ভুয়া নমুনা",
    loadSampleReal: "সত্য নমুনা",
    clear: "মুছুন",
    export: "রপ্তানি",
    share: "শেয়ার",
    words: "শব্দ",
    minRead: "মিনিট",
    characters: "অক্ষর",
    prediction: "পূর্বাভাস",
    confidence: "আত্মবিশ্বাস",
    fake: "ভুয়া",
    real: "সত্য",
    uncertain: "অনিশ্চিত",
    fakeWarning: "এটি ভুয়া খবর হতে পারে।",
    realMessage: "এটি সত্য খবর বলে মনে হচ্ছে।",
    keywordAnalysis: "কীওয়ার্ড বিশ্লেষণ",
    suspiciousKeywords: "সন্দেহজনক কীওয়ার্ড",
    credibleKeywords: "বিশ্বাসযোগ্য কীওয়ার্ড",
    noneDetected: "কিছু নেই",
    fetchLiveNews: "খবর আনুন",
    fetching: "লোড হচ্ছে...",
    liveNewsTitle: "লাইভ খবর",
    liveNewsDesc: "বিশ্বস্ত উৎস থেকে খবর",
    selectLanguage: "ভাষা নির্বাচন",
    analysisResults: "বিশ্লেষণ ফলাফল",
    noHistory: "ইতিহাস নেই।",
    sourceVerification: "উৎস যাচাই",
    sourcesChecked: "যাচাইকৃত উৎস",
    credibilityBreakdown: "বিশ্বাসযোগ্যতা বিশ্লেষণ",
    autoRefresh: "অটো-রিফ্রেশ",
    lastUpdated: "শেষ আপডেট",
    trendingMisinfo: "ট্রেন্ডিং ভুল তথ্য",
    compareArticles: "দুটি নিবন্ধ তুলনা",
    article1: "নিবন্ধ 1",
    article2: "নিবন্ধ 2",
    compareNow: "তুলনা করুন",
    comparing: "তুলনা হচ্ছে...",
    comparisonResult: "তুলনা ফলাফল",
    copyToClipboard: "কপি করুন",
    copied: "কপি হয়েছে!",
    enterUrl: "URL দিন",
    analyzeUrl: "URL বিশ্লেষণ",
    urlNote: "URL দিন",
    batchDesc: "একাধিক নিবন্ধ বিশ্লেষণ",
    batchPlaceholder: "এখানে পেস্ট করুন...",
    batchResults: "ব্যাচ ফলাফল",
    wordCount: "শব্দ গণনা",
    charCount: "অক্ষর গণনা",
    readingTime: "পড়ার সময়",
    analyze: "বিশ্লেষণ",
    placeholder: "খবরের টেক্সট এখানে দিন...",
    refreshNews: "রিফ্রেশ",
    noNews: "খবর নেই।",
    viewSource: "উৎস দেখুন",
    analyzeThis: "বিশ্লেষণ",
    overallCredibility: "সামগ্রিক বিশ্বাসযোগ্যতা",
    voiceInput: "ভয়েস ইনপুট",
    speakNow: "এখন বলুন...",
    clearHistory: "ইতিহাস মুছুন",
    footer: "© 2025 ভুয়া খবর শনাক্তকরণ",
  },
  mr: {
    title: "खोट्या बातम्या शोध",
    subtitle: "AI-चालित संशोधन",
    detection: "शोध",
    liveNews: "लाइव्ह बातम्या",
    urlAnalysis: "URL विश्लेषण",
    batchAnalysis: "बॅच",
    comparison: "तुलना",
    history: "इतिहास",
    analyzeNews: "विश्लेषण",
    analyzing: "विश्लेषण...",
    loadSampleFake: "खोटे नमुने",
    loadSampleReal: "खरे नमुने",
    clear: "साफ",
    export: "निर्यात",
    share: "शेअर",
    words: "शब्द",
    minRead: "मिनिटे",
    characters: "अक्षरे",
    prediction: "अंदाज",
    confidence: "आत्मविश्वास",
    fake: "खोटी",
    real: "खरी",
    uncertain: "अनिश्चित",
    fakeWarning: "ही खोटी बातमी असू शकते.",
    realMessage: "ही खरी बातमी दिसते.",
    keywordAnalysis: "कीवर्ड विश्लेषण",
    suspiciousKeywords: "संशयास्पद कीवर्ड",
    credibleKeywords: "विश्वासार्ह कीवर्ड",
    noneDetected: "काहीही नाही",
    fetchLiveNews: "बातम्या आणा",
    fetching: "लोड होत आहे...",
    liveNewsTitle: "लाइव्ह बातम्या",
    liveNewsDesc: "विश्वसनीय स्त्रोतांकडून बातम्या",
    selectLanguage: "भाषा निवडा",
    analysisResults: "विश्लेषण परिणाम",
    noHistory: "इतिहास नाही.",
    sourceVerification: "स्रोत पडताळणी",
    sourcesChecked: "तपासलेले स्रोत",
    credibilityBreakdown: "विश्वासार्हता विश्लेषण",
    autoRefresh: "ऑटो-रिफ्रेश",
    lastUpdated: "शेवटचे अपडेट",
    trendingMisinfo: "ट्रेंडिंग चुकीची माहिती",
    compareArticles: "दोन लेख तुलना",
    article1: "लेख 1",
    article2: "लेख 2",
    compareNow: "तुलना",
    comparing: "तुलना करत आहे...",
    comparisonResult: "तुलना परिणाम",
    copyToClipboard: "कॉपी करा",
    copied: "कॉपी झाले!",
    enterUrl: "URL द्या",
    analyzeUrl: "URL विश्लेषण",
    urlNote: "URL द्या",
    batchDesc: "अनेक लेख विश्लेषण",
    batchPlaceholder: "येथे पेस्ट करा...",
    batchResults: "बॅच परिणाम",
    wordCount: "शब्द गणना",
    charCount: "अक्षर गणना",
    readingTime: "वाचन वेळ",
    analyze: "विश्लेषण",
    placeholder: "बातमी मजकूर येथे द्या...",
    refreshNews: "रिफ्रेश",
    noNews: "बातम्या नाहीत.",
    viewSource: "स्रोत पहा",
    analyzeThis: "विश्लेषण",
    overallCredibility: "एकूण विश्वासार्हता",
    voiceInput: "व्हॉइस इनपुट",
    speakNow: "आता बोला...",
    clearHistory: "इतिहास साफ करा",
    footer: "© 2025 खोट्या बातम्या शोध",
  },
  gu: {
    title: "નકલી સમાચાર શોધ",
    subtitle: "AI-સંચાલિત સંશોધન",
    detection: "શોધ",
    liveNews: "લાઇવ સમાચાર",
    urlAnalysis: "URL વિશ્લેષણ",
    batchAnalysis: "બેચ",
    comparison: "સરખામણી",
    history: "ઇતિહાસ",
    analyzeNews: "વિશ્લેષણ",
    analyzing: "વિશ્લેષણ...",
    loadSampleFake: "નકલી નમૂનો",
    loadSampleReal: "સાચો નમૂનો",
    clear: "સાફ",
    export: "નિકાસ",
    share: "શેર",
    words: "શબ્દો",
    minRead: "મિનિટ",
    characters: "અક્ષરો",
    prediction: "આગાહી",
    confidence: "આત્મવિશ્વાસ",
    fake: "નકલી",
    real: "સાચી",
    uncertain: "અનિશ્ચિત",
    fakeWarning: "આ નકલી સમાચાર હોઈ શકે.",
    realMessage: "આ સાચા સમાચાર લાગે છે.",
    keywordAnalysis: "કીવર્ડ વિશ્લેષણ",
    suspiciousKeywords: "શંકાસ્પદ કીવર્ડ",
    credibleKeywords: "વિશ્વસનીય કીવર્ડ",
    noneDetected: "કંઈ નહીં",
    fetchLiveNews: "સમાચાર મેળવો",
    fetching: "લોડ થઈ રહ્યું છે...",
    liveNewsTitle: "લાઇવ સમાચાર",
    liveNewsDesc: "વિશ્વસનીય સ્ત્રોતોમાંથી સમાચાર",
    selectLanguage: "ભાષા પસંદ કરો",
    analysisResults: "વિશ્લેષણ પરિણામો",
    noHistory: "ઇતિહાસ નથી.",
    sourceVerification: "સ્ત્રોત ચકાસણી",
    sourcesChecked: "તપાસેલ સ્ત્રોતો",
    credibilityBreakdown: "વિશ્વસનીયતા વિશ્લેષણ",
    autoRefresh: "ઓટો-રિફ્રેશ",
    lastUpdated: "છેલ્લે અપડેટ",
    trendingMisinfo: "ટ્રેન્ડિંગ ખોટી માહિતી",
    compareArticles: "બે લેખોની સરખામણી",
    article1: "લેખ 1",
    article2: "લેખ 2",
    compareNow: "સરખામણી",
    comparing: "સરખામણી થઈ રહી છે...",
    comparisonResult: "સરખામણી પરિણામ",
    copyToClipboard: "કોપી કરો",
    copied: "કોપી થયું!",
    enterUrl: "URL આપો",
    analyzeUrl: "URL વિશ્લેષણ",
    urlNote: "URL આપો",
    batchDesc: "અનેક લેખોનું વિશ્લેષણ",
    batchPlaceholder: "અહીં પેસ્ટ કરો...",
    batchResults: "બેચ પરિણામો",
    wordCount: "શબ્દ ગણતરી",
    charCount: "અક્ષર ગણતરી",
    readingTime: "વાંચન સમય",
    analyze: "વિશ્લેષણ",
    placeholder: "સમાચાર ટેક્સ્ટ અહીં આપો...",
    refreshNews: "રિફ્રેશ",
    noNews: "સમાચાર નથી.",
    viewSource: "સ્ત્રોત જુઓ",
    analyzeThis: "વિશ્લેષણ",
    overallCredibility: "એકંદર વિશ્વસનીયતા",
    voiceInput: "વોઇસ ઇનપુટ",
    speakNow: "હવે બોલો...",
    clearHistory: "ઇતિહાસ સાફ કરો",
    footer: "© 2025 નકલી સમાચાર શોધ",
  },
  kn: {
    title: "ನಕಲಿ ಸುದ್ದಿ ಪತ್ತೆ",
    subtitle: "AI-ಚಾಲಿತ ಸಂಶೋಧನೆ",
    detection: "ಪತ್ತೆ",
    liveNews: "ಲೈವ್ ಸುದ್ದಿ",
    urlAnalysis: "URL ವಿಶ್ಲೇಷಣೆ",
    batchAnalysis: "ಬ್ಯಾಚ್",
    comparison: "ಹೋಲಿಕೆ",
    history: "ಇತಿಹಾಸ",
    analyzeNews: "ವಿಶ್ಲೇಷಿಸಿ",
    analyzing: "ವಿಶ್ಲೇಷಿಸಲಾಗುತ್ತಿದೆ...",
    loadSampleFake: "ನಕಲಿ ಮಾದರಿ",
    loadSampleReal: "ನಿಜ ಮಾದರಿ",
    clear: "ತೆರವು",
    export: "ರಫ್ತು",
    share: "ಹಂಚಿ",
    words: "ಪದಗಳು",
    minRead: "ನಿಮಿಷ",
    characters: "ಅಕ್ಷರಗಳು",
    prediction: "ಮುನ್ಸೂಚನೆ",
    confidence: "ವಿಶ್ವಾಸ",
    fake: "ನಕಲಿ",
    real: "ನಿಜ",
    uncertain: "ಅನಿಶ್ಚಿತ",
    fakeWarning: "ಇದು ನಕಲಿ ಸುದ್ದಿಯಾಗಿರಬಹುದು.",
    realMessage: "ಇದು ನಿಜವಾದ ಸುದ್ದಿಯಾಗಿ ಕಾಣುತ್ತದೆ.",
    keywordAnalysis: "ಕೀವರ್ಡ್ ವಿಶ್ಲೇಷಣೆ",
    suspiciousKeywords: "ಅನುಮಾನಾಸ್ಪದ ಕೀವರ್ಡ್",
    credibleKeywords: "ವಿಶ್ವಾಸಾರ್ಹ ಕೀವರ್ಡ್",
    noneDetected: "ಏನೂ ಇಲ್ಲ",
    fetchLiveNews: "ಸುದ್ದಿ ಪಡೆಯಿರಿ",
    fetching: "ಲೋಡ್...",
    liveNewsTitle: "ಲೈವ್ ಸುದ್ದಿ",
    liveNewsDesc: "ವಿಶ್ವಾಸಾರ್ಹ ಮೂಲಗಳಿಂದ ಸುದ್ದಿ",
    selectLanguage: "ಭಾಷೆ ಆಯ್ಕೆ",
    analysisResults: "ವಿಶ್ಲೇಷಣೆ ಫಲಿತಾಂಶ",
    noHistory: "ಇತಿಹಾಸ ಇಲ್ಲ.",
    sourceVerification: "ಮೂಲ ಪರಿಶೀಲನೆ",
    sourcesChecked: "ಪರಿಶೀಲಿಸಿದ ಮೂಲಗಳು",
    credibilityBreakdown: "ವಿಶ್ವಾಸಾರ್ಹತೆ ವಿಶ್ಲೇಷಣೆ",
    autoRefresh: "ಆಟೋ-ರಿಫ್ರೆಶ್",
    lastUpdated: "ಕೊನೆಯ ಅಪ್‌ಡೇಟ್",
    trendingMisinfo: "ಟ್ರೇಂಡಿಂಗ್ ತಪ್ಪು ಮಾಹಿತಿ",
    compareArticles: "ಎರಡು ಲೇಖನಗಳ ಹೋಲಿಕೆ",
    article1: "ಲೇಖನ 1",
    article2: "ಲೇಖನ 2",
    compareNow: "ಹೋಲಿಕೆ",
    comparing: "ಹೋಲಿಸಲಾಗುತ್ತಿದೆ...",
    comparisonResult: "ಹೋಲಿಕೆ ಫಲಿತಾಂಶ",
    copyToClipboard: "ನಕಲಿಸಿ",
    copied: "ನಕಲಿಸಲಾಗಿದೆ!",
    enterUrl: "URL ನೀಡಿ",
    analyzeUrl: "URL ವಿಶ್ಲೇಷಿಸಿ",
    urlNote: "URL ನೀಡಿ",
    batchDesc: "ಅನೇಕ ಲೇಖನಗಳ ವಿಶ್ಲೇಷಣೆ",
    batchPlaceholder: "ಇಲ್ಲಿ ಅಂಟಿಸಿ...",
    batchResults: "ಬ್ಯಾಚ್ ಫಲಿತಾಂಶ",
    wordCount: "ಪದ ಎಣಿಕೆ",
    charCount: "ಅಕ್ಷರ ಎಣಿಕೆ",
    readingTime: "ಓದುವ ಸಮಯ",
    analyze: "ವಿಶ್ಲೇಷಿಸಿ",
    placeholder: "ಸುದ್ದಿ ಪಠ್ಯ ಇಲ್ಲಿ ನೀಡಿ...",
    refreshNews: "ರಿಫ್ರೆಶ್",
    noNews: "ಸುದ್ದಿ ಇಲ್ಲ.",
    viewSource: "ಮೂಲ ನೋಡಿ",
    analyzeThis: "ವಿಶ್ಲೇಷಿಸಿ",
    overallCredibility: "ಒಟ್ಟಾರೆ ವಿಶ್ವಾಸಾರ್ಹತೆ",
    voiceInput: "ಧ್ವನಿ ಇನ್‌ಪುಟ್",
    speakNow: "ಈಗ ಮಾತನಾಡಿ...",
    clearHistory: "ಇತಿಹಾಸ ತೆರವುಗೊಳಿಸಿ",
    footer: "© 2025 ನಕಲಿ ಸುದ್ದಿ ಪತ್ತೆ",
  },
  ml: {
    title: "വ്യാജ വാർത്താ കണ്ടെത്തൽ",
    subtitle: "AI-ചാലിത ഗവേഷണം",
    detection: "കണ്ടെത്തൽ",
    liveNews: "ലൈവ് വാർത്ത",
    urlAnalysis: "URL വിശകലനം",
    batchAnalysis: "ബാച്ച്",
    comparison: "താരതമ്യം",
    history: "ചരിത്രം",
    analyzeNews: "വിശകലനം",
    analyzing: "വിശകലനം...",
    loadSampleFake: "വ്യാജ സാമ്പിൾ",
    loadSampleReal: "യഥാർത്ഥ സാമ്പിൾ",
    clear: "മായ്ക്കുക",
    export: "എക്സ്പോർട്ട്",
    share: "പങ്കിടുക",
    words: "വാക്കുകൾ",
    minRead: "മിനിറ്റ്",
    characters: "അക്ഷരങ്ങൾ",
    prediction: "പ്രവചനം",
    confidence: "വിശ്വാസ്യത",
    fake: "വ്യാജം",
    real: "യഥാർത്ഥം",
    uncertain: "അനിശ്ചിതം",
    fakeWarning: "ഇത് വ്യാജ വാർത്തയായിരിക്കാം.",
    realMessage: "ഇത് യഥാർത്ഥ വാർത്തയാണെന്ന് തോന്നുന്നു.",
    keywordAnalysis: "കീവേഡ് വിശകലനം",
    suspiciousKeywords: "സംശയാസ്പദ കീവേഡുകൾ",
    credibleKeywords: "വിശ്വസനീയ കീവേഡുകൾ",
    noneDetected: "ഒന്നുമില്ല",
    fetchLiveNews: "വാർത്ത നേടുക",
    fetching: "ലോഡ് ആകുന്നു...",
    liveNewsTitle: "ലൈവ് വാർത്ത",
    liveNewsDesc: "വിശ്വസനീയ ഉറവിടങ്ങളിൽ നിന്നുള്ള വാർത്തകൾ",
    selectLanguage: "ഭാഷ തിരഞ്ഞെടുക്കുക",
    analysisResults: "വിശകലന ഫലങ്ങൾ",
    noHistory: "ചരിത്രമില്ല.",
    sourceVerification: "ഉറവിട പരിശോധന",
    sourcesChecked: "പരിശോധിച്ച ഉറവിടങ്ങൾ",
    credibilityBreakdown: "വിശ്വാസ്യത വിശകലനം",
    autoRefresh: "ഓട്ടോ-റിഫ്രഷ്",
    lastUpdated: "അവസാനം അപ്ഡേറ്റ്",
    trendingMisinfo: "ട്രെൻഡിംഗ് തെറ്റായ വിവരങ്ങൾ",
    compareArticles: "രണ്ട് ലേഖനങ്ങൾ താരതമ്യം",
    article1: "ലേഖനം 1",
    article2: "ലേഖനം 2",
    compareNow: "താരതമ്യം",
    comparing: "താരതമ്യം ചെയ്യുന്നു...",
    comparisonResult: "താരതമ്യ ഫലം",
    copyToClipboard: "പകർത്തുക",
    copied: "പകർത്തി!",
    enterUrl: "URL നൽകുക",
    analyzeUrl: "URL വിശകലനം",
    urlNote: "URL നൽകുക",
    batchDesc: "നിരവധി ലേഖനങ്ങളുടെ വിശകലനം",
    batchPlaceholder: "ഇവിടെ പേസ്റ്റ് ചെയ്യുക...",
    batchResults: "ബാച്ച് ഫലങ്ങൾ",
    wordCount: "വാക്ക് എണ്ണം",
    charCount: "അക്ഷരം എണ്ണം",
    readingTime: "വായനാ സമയം",
    analyze: "വിശകലനം",
    placeholder: "വാർത്താ ടെക്സ്റ്റ് ഇവിടെ നൽകുക...",
    refreshNews: "പുതുക്കുക",
    noNews: "വാർത്തകളില്ല.",
    viewSource: "ഉറവിടം കാണുക",
    analyzeThis: "വിശകലനം",
    overallCredibility: "മൊത്തത്തിലുള്ള...",
    footer: "© 2025 വ്യാജ വാർത്താ കണ്ടെത്തൽ",
  },
  pa: {
    title: "ਝੂਠੀ ਖ਼ਬਰ ਖੋਜ",
    subtitle: "AI-ਸੰਚਾਲਿਤ ਖੋਜ",
    detection: "ਖੋਜ",
    liveNews: "ਲਾਈਵ ਖ਼ਬਰਾਂ",
    urlAnalysis: "URL ਵਿਸ਼ਲੇਸ਼ਣ",
    batchAnalysis: "ਬੈਚ",
    comparison: "ਤੁਲਨਾ",
    history: "ਇਤਿਹਾਸ",
    analyzeNews: "ਵਿਸ਼ਲੇਸ਼ਣ",
    analyzing: "ਵਿਸ਼ਲੇਸ਼ਣ...",
    loadSampleFake: "ਝੂਠੀ ਨਮੂਨਾ",
    loadSampleReal: "ਸੱਚਾ ਨਮੂਨਾ",
    clear: "ਸਾਫ਼",
    export: "ਨਿਰਯਾਤ",
    share: "ਸ਼ੇਅਰ",
    words: "ਸ਼ਬਦ",
    minRead: "ਮਿੰਟ",
    characters: "ਅੱਖਰ",
    prediction: "ਭਵਿੱਖਬਾਣੀ",
    confidence: "ਭਰੋਸਾ",
    fake: "ਝੂਠੀ",
    real: "ਸੱਚੀ",
    uncertain: "ਅਨਿਸ਼ਚਿਤ",
    fakeWarning: "ਇਹ ਝੂਠੀ ਖ਼ਬਰ ਹੋ ਸਕਦੀ ਹੈ.",
    realMessage: "ਇਹ ਸੱਚੀ ਖ਼ਬਰ ਲੱਗਦੀ ਹੈ.",
    keywordAnalysis: "ਕੀਵਰਡ ਵਿਸ਼ਲੇਸ਼ਣ",
    suspiciousKeywords: "ਸ਼ੱਕੀ ਕੀਵਰਡ",
    credibleKeywords: "ਭਰੋਸੇਯੋਗ ਕੀਵਰਡ",
    noneDetected: "ਕੁਝ ਨਹੀਂ",
    fetchLiveNews: "ਖ਼ਬਰਾਂ ਲਿਆਓ",
    fetching: "ਲੋਡ ਹੋ ਰਿਹਾ...",
    liveNewsTitle: "ਲਾਈਵ ਖ਼ਬਰਾਂ",
    liveNewsDesc: "ਭਰੋਸੇਯੋਗ ਸਰੋਤਾਂ ਤੋਂ ਖ਼ਬਰਾਂ",
    selectLanguage: "ਭਾਸ਼ਾ ਚੁਣੋ",
    analysisResults: "ਵਿਸ਼ਲੇਸ਼ਣ ਨਤੀਜੇ",
    noHistory: "ਇਤਿਹਾਸ ਨਹੀਂ.",
    sourceVerification: "ਸਰੋਤ ਪੁਸ਼ਟੀ",
    sourcesChecked: "ਜਾਂਚੇ ਸਰੋਤ",
    credibilityBreakdown: "ਭਰੋਸੇਯੋਗਤਾ ਵਿਸ਼ਲੇਸ਼ਣ",
    autoRefresh: "ਆਟੋ-ਰਿਫਰੈਸ਼",
    lastUpdated: "ਆਖਰੀ ਅੱਪਡੇਟ",
    trendingMisinfo: "ਟਰੈਂਡਿੰਗ ਗਲਤ ਜਾਣਕਾਰੀ",
    compareArticles: "ਦੋ ਲੇਖਾਂ ਦੀ ਤੁਲਨਾ",
    article1: "ਲੇਖ 1",
    article2: "ਲੇਖ 2",
    compareNow: "ਤੁਲਨਾ",
    comparing: "ਤੁਲਨਾ ਹੋ ਰਹੀ ਹੈ...",
    comparisonResult: "ਤੁਲਨਾ ਨਤੀਜਾ",
    copyToClipboard: "ਕਾਪੀ ਕਰੋ",
    copied: "ਕਾਪੀ ਹੋ ਗਿਆ!",
    enterUrl: "URL ਦਿਓ",
    analyzeUrl: "URL ਵਿਸ਼ਲੇਸ਼ਣ",
    urlNote: "URL ਦਿਓ",
    batchDesc: "ਕਈ ਲੇਖਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ",
    batchPlaceholder: "ਇੱਥੇ ਪੇਸਟ ਕਰੋ...",
    batchResults: "ਬੈਚ ਨਤੀਜੇ",
    wordCount: "ਸ਼ਬਦ ਗਿਣਤੀ",
    charCount: "ਅੱਖਰ ਗਿਣਤੀ",
    readingTime: "ਪੜ੍ਹਨ ਦਾ ਸਮਾਂ",
    analyze: "ਵਿਸ਼ਲੇਸ਼ਣ",
    placeholder: "ਖ਼ਬਰ ਟੈਕਸਟ ਇੱਥੇ ਦਿਓ...",
    refreshNews: "ਰਿਫਰੈਸ਼",
    noNews: "ਖ਼ਬਰਾਂ ਨਹੀਂ.",
    viewSource: "ਸਰੋਤ ਵੇਖੋ",
    analyzeThis: "ਵਿਸ਼ਲੇਸ਼ਣ",
    overallCredibility: "ਕੁੱਲ ਭਰੋਸੇਯੋਗਤਾ",
    voiceInput: "ਵੌਇਸ ਇਨਪੁੱਟ",
    speakNow: "ਹੁਣੇ ਬੋਲੋ...",
    clearHistory: "ਇਤਿਹਾਸ ਸਾਫ਼ ਕਰੋ",
    footer: "© 2025 ਝੂਠੀ ਖ਼ਬਰ ਖੋਜ",
  },
}

interface AnalysisResult {
  verdict: "LIKELY FAKE" | "LIKELY REAL" | "UNCERTAIN"
  confidence: number
  breakdown: { [key: string]: number }
  sentiment: "positive" | "negative" | "neutral"
  sentimentScore: number
  keywordsFound: string[]
  sourcesChecked: string[]
  details: string[]
}

interface HistoryItem {
  text: string
  verdict: AnalysisResult["verdict"]
  confidence: number
  timestamp: string
}

interface NewsItem {
  title: string
  description: string
  source: string
  publishedAt: string
  category?: string
}

export default function Home() {
  const [language, setLanguage] = useState<Language>("en")
  const [activeTab, setActiveTab] = useState("detect")
  const [inputText, setInputText] = useState("")
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [urlInput, setUrlInput] = useState("")
  const [batchInput, setBatchInput] = useState("")
  const [batchResults, setBatchResults] = useState<Array<{ text: string; verdict: string; confidence: number }>>([])
  const [compareText1, setCompareText1] = useState("")
  const [compareText2, setCompareText2] = useState("")
  const [compareResult, setCompareResult] = useState<any>(null)
  const [liveNews, setLiveNews] = useState<NewsItem[]>([])
  const [loadingNews, setLoadingNews] = useState(false)
  const [newsCategory, setNewsCategory] = useState("all")
  const [autoRefreshCountdown, setAutoRefreshCountdown] = useState(60)
  const [isListening, setIsListening] = useState(false)
  const [copied, setCopied] = useState(false)
  const recognitionRef = useRef<any>(null)

  const t = UI_TEXT[language]

  // Load history from localStorage
  useEffect(() => {
    const storedHistory = localStorage.getItem("analysisHistory")
    if (storedHistory) {
      try {
        setHistory(JSON.parse(storedHistory))
      } catch (e) {
        console.error("Failed to parse history:", e)
      }
    }
  }, [])

  // Auto-refresh countdown for live news
  useEffect(() => {
    if (activeTab === "live") {
      const timer = setInterval(() => {
        setAutoRefreshCountdown((prev) => {
          if (prev <= 1) {
            fetchLiveNews()
            return 60
          }
          return prev - 1
        })
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [activeTab, newsCategory, language])

  // Fetch live news on tab change
  useEffect(() => {
    if (activeTab === "live" && liveNews.length === 0) {
      fetchLiveNews()
    }
  }, [activeTab])

  const fetchLiveNews = useCallback(async () => {
    setLoadingNews(true)
    try {
      const response = await fetch(`/api/news?q=${newsCategory}&lang=${language}`)
      if (!response.ok) throw new Error("Failed to fetch news")
      const data = await response.json()
      if (data.success && data.articles) {
        setLiveNews(data.articles)
      }
    } catch (error) {
      console.error("Failed to fetch live news:", error)
    } finally {
      setLoadingNews(false)
      setAutoRefreshCountdown(60)
    }
  }, [newsCategory, language])

  const startVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.")
      return
    }

    setIsListening(true)
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    recognitionRef.current = new SpeechRecognition()
    recognitionRef.current.continuous = false
    recognitionRef.current.lang = language === "en" ? "en-IN" : `${language}-IN`
    recognitionRef.current.interimResults = false

    recognitionRef.current.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInputText((prev) => prev + " " + transcript)
      setIsListening(false)
    }

    recognitionRef.current.onerror = () => setIsListening(false)
    recognitionRef.current.onend = () => setIsListening(false)
    recognitionRef.current.start()
  }

  const analyzeNews = async () => {
    if (!inputText.trim()) return
    setIsAnalyzing(true)
    setResult(null)

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: inputText, language }),
      })
      const data: AnalysisResult = await response.json()
      setResult(data)

      // Save to history
      const newItem: HistoryItem = {
        text: inputText.slice(0, 100) + (inputText.length > 100 ? "..." : ""),
        verdict: data.verdict,
        confidence: data.confidence,
        timestamp: new Date().toLocaleString(),
      }
      const newHistory = [newItem, ...history.slice(0, 9)]
      setHistory(newHistory)
      localStorage.setItem("analysisHistory", JSON.stringify(newHistory))
    } catch (error) {
      console.error("Analysis failed:", error)
      setResult({
        verdict: "UNCERTAIN",
        confidence: 0,
        breakdown: {},
        sentiment: "neutral",
        sentimentScore: 0,
        keywordsFound: [],
        sourcesChecked: [],
        details: ["An error occurred during analysis. Please try again."],
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeUrl = async () => {
    if (!urlInput.trim()) return
    setIsAnalyzing(true)
    setResult(null)

    try {
      const response = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput, language }),
      })
      const data: AnalysisResult = await response.json()
      setResult(data)
    } catch (error) {
      console.error("URL analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const analyzeBatch = async () => {
    if (!batchInput.trim()) return
    setIsAnalyzing(true)
    setBatchResults([])

    const texts = batchInput.split("\n").filter(Boolean)
    const results = []

    for (const text of texts.slice(0, 5)) {
      // Limit to 5 items
      try {
        const response = await fetch("/api/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language }),
        })
        const data = await response.json()
        results.push({ text: text.slice(0, 50) + "...", verdict: data.verdict, confidence: data.confidence })
      } catch {
        results.push({ text: text.slice(0, 50) + "...", verdict: "UNCERTAIN", confidence: 0 })
      }
    }
    setBatchResults(results)
    setIsAnalyzing(false)
  }

  const compareArticles = async () => {
    if (!compareText1.trim() || !compareText2.trim()) return
    setIsAnalyzing(true)
    setCompareResult(null)

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text1: compareText1, text2: compareText2, language }),
      })
      const data = await response.json()
      setCompareResult(data)
    } catch (error) {
      console.error("Comparison failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const loadSample = (type: "fake" | "real") => {
    const sample = SAMPLE_NEWS[language]
    setInputText(type === "fake" ? sample.fake : sample.real)
    setResult(null)
  }

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(`Verdict: ${result.verdict}\nConfidence: ${result.confidence}%`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("analysisHistory")
  }

  const analyzeNewsItem = (newsItem: NewsItem) => {
    setInputText(newsItem.title + "\n\n" + newsItem.description)
    setActiveTab("detect")
  }

  const getVerdictColor = (verdict: string) => {
    if (verdict === "LIKELY FAKE") return "text-red-500"
    if (verdict === "LIKELY REAL") return "text-green-500"
    return "text-yellow-500"
  }

  const getVerdictBg = (verdict: string) => {
    if (verdict === "LIKELY FAKE") return "bg-red-500"
    if (verdict === "LIKELY REAL") return "bg-green-500"
    return "bg-yellow-500"
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-cyan-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">{t.title}</h1>
                <p className="text-xs text-muted-foreground">{t.subtitle}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value as Language)}
                className="bg-muted border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              >
                {Object.entries(INDIAN_LANGUAGES).map(([code, lang]) => (
                  <option key={code} value={code}>
                    {lang.nativeName}
                  </option>
                ))}
              </select>
              <Button variant="outline" size="sm" onClick={() => setShowHistory(!showHistory)}>
                <History className="w-4 h-4 mr-2" />
                {t.history}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid grid-cols-5 gap-2 bg-muted/50 p-1 rounded-lg">
                <TabsTrigger value="detect" className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.detection}</span>
                </TabsTrigger>
                <TabsTrigger value="url" className="flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.urlAnalysis}</span>
                </TabsTrigger>
                <TabsTrigger value="batch" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.batchAnalysis}</span>
                </TabsTrigger>
                <TabsTrigger value="compare" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.comparison}</span>
                </TabsTrigger>
                <TabsTrigger value="live" className="flex items-center gap-2">
                  <Newspaper className="w-4 h-4" />
                  <span className="hidden sm:inline">{t.liveNews}</span>
                  {liveNews.length > 0 && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />}
                </TabsTrigger>
              </TabsList>

              {/* Detection Tab */}
              <TabsContent value="detect" className="space-y-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Search className="w-5 h-5 text-primary" />
                      {t.analyzeNews}
                    </CardTitle>
                    <CardDescription>{t.placeholder}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="relative">
                      <Textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        placeholder={t.placeholder}
                        className="min-h-[150px] bg-muted border-border resize-none pr-12"
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        className="absolute right-2 top-2"
                        onClick={startVoiceInput}
                        disabled={isListening}
                      >
                        {isListening ? (
                          <MicOff className="w-5 h-5 text-destructive animate-pulse" />
                        ) : (
                          <Mic className="w-5 h-5 text-muted-foreground" />
                        )}
                      </Button>
                    </div>

                    {/* Text Stats */}
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <span>
                        {t.wordCount}: {inputText.split(/\s+/).filter(Boolean).length}
                      </span>
                      <span>
                        {t.charCount}: {inputText.length}
                      </span>
                      <span>
                        {t.readingTime}: {Math.ceil(inputText.split(/\s+/).filter(Boolean).length / 200)} {t.minRead}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        onClick={analyzeNews}
                        disabled={isAnalyzing || !inputText.trim()}
                        className="flex-1 min-w-[120px]"
                      >
                        {isAnalyzing ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            {t.analyzing}
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            {t.analyze}
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => loadSample("fake")}
                        className="text-red-500 border-red-500/50"
                      >
                        <AlertTriangle className="w-4 h-4 mr-2" />
                        {t.loadSampleFake}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => loadSample("real")}
                        className="text-green-500 border-green-500/50"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {t.loadSampleReal}
                      </Button>
                      <Button
                        variant="ghost"
                        onClick={() => {
                          setInputText("")
                          setResult(null)
                        }}
                      >
                        <X className="w-4 h-4 mr-2" />
                        {t.clear}
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Analysis Result */}
                {result && (
                  <Card className="border-border bg-card overflow-hidden">
                    <div className={`h-2 ${getVerdictBg(result.verdict)}`} />
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span className="flex items-center gap-2">
                          {result.verdict === "LIKELY FAKE" ? (
                            <XCircle className="w-6 h-6 text-red-500" />
                          ) : result.verdict === "LIKELY REAL" ? (
                            <CheckCircle className="w-6 h-6 text-green-500" />
                          ) : (
                            <AlertTriangle className="w-6 h-6 text-yellow-500" />
                          )}
                          <span className={getVerdictColor(result.verdict)}>
                            {result.verdict === "LIKELY FAKE"
                              ? t.fake
                              : result.verdict === "LIKELY REAL"
                                ? t.real
                                : t.uncertain}
                          </span>
                        </span>
                        <Badge
                          variant={
                            result.verdict === "LIKELY FAKE"
                              ? "destructive"
                              : result.verdict === "LIKELY REAL"
                                ? "default"
                                : "secondary"
                          }
                        >
                          {result.confidence}% {t.confidence}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Credibility Breakdown */}
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <BarChart3 className="w-4 h-4" />
                          {t.credibilityBreakdown}
                        </h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {Object.entries(result.breakdown).map(([key, value]) => (
                            <div key={key} className="text-center p-3 bg-muted rounded-lg">
                              <div className="text-2xl font-bold text-primary">{value}%</div>
                              <div className="text-xs text-muted-foreground capitalize">{key}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{t.overallCredibility}</span>
                          <span>{result.confidence}%</span>
                        </div>
                        <Progress value={result.confidence} className="h-3" />
                      </div>

                      {/* Sources Checked */}
                      {result.sourcesChecked.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Globe className="w-4 h-4" />
                            {t.sourcesChecked}
                          </h4>
                          <div className="flex flex-wrap gap-2">
                            {result.sourcesChecked.map((source, i) => (
                              <Badge key={i} variant="secondary">
                                {source}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Details */}
                      {result.details.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-semibold">{t.analysisResults}</h4>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {result.details.map((detail, i) => (
                              <li key={i} className="flex items-start gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                                {detail}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={copyToClipboard}>
                          <Copy className="w-4 h-4 mr-2" />
                          {copied ? t.copied : t.copyToClipboard}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* URL Analysis Tab */}
              <TabsContent value="url" className="space-y-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <LinkIcon className="w-5 h-5 text-primary" />
                      {t.urlAnalysis}
                    </CardTitle>
                    <CardDescription>{t.urlNote}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Input
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder={t.enterUrl}
                      className="bg-muted border-border"
                    />
                    <Button onClick={analyzeUrl} disabled={isAnalyzing || !urlInput.trim()} className="w-full">
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          {t.analyzing}
                        </>
                      ) : (
                        <>
                          <LinkIcon className="w-4 h-4 mr-2" />
                          {t.analyzeUrl}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
                {result && activeTab === "url" && (
                  <Card className="border-border bg-card overflow-hidden">
                    <div className={`h-2 ${getVerdictBg(result.verdict)}`} />
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <span className={`text-xl font-bold ${getVerdictColor(result.verdict)}`}>
                          {result.verdict === "LIKELY FAKE"
                            ? t.fake
                            : result.verdict === "LIKELY REAL"
                              ? t.real
                              : t.uncertain}
                        </span>
                        <Badge>
                          {result.confidence}% {t.confidence}
                        </Badge>
                      </div>
                      {result.details.map((d, i) => (
                        <p key={i} className="text-sm text-muted-foreground">
                          {d}
                        </p>
                      ))}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Batch Analysis Tab */}
              <TabsContent value="batch" className="space-y-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      {t.batchAnalysis}
                    </CardTitle>
                    <CardDescription>{t.batchDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={batchInput}
                      onChange={(e) => setBatchInput(e.target.value)}
                      placeholder={t.batchPlaceholder}
                      className="min-h-[150px] bg-muted border-border"
                    />
                    <Button onClick={analyzeBatch} disabled={isAnalyzing || !batchInput.trim()} className="w-full">
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          {t.analyzing}
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          {t.analyze}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
                {batchResults.length > 0 && (
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle>{t.batchResults}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {batchResults.map((r, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                            <span className="text-sm truncate max-w-[200px]">{r.text}</span>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  r.verdict === "LIKELY FAKE"
                                    ? "destructive"
                                    : r.verdict === "LIKELY REAL"
                                      ? "default"
                                      : "secondary"
                                }
                              >
                                {r.verdict === "LIKELY FAKE"
                                  ? t.fake
                                  : r.verdict === "LIKELY REAL"
                                    ? t.real
                                    : t.uncertain}
                              </Badge>
                              <span className="text-sm">{r.confidence}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Compare Tab */}
              <TabsContent value="compare" className="space-y-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      {t.compareArticles}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t.article1}</label>
                        <Textarea
                          value={compareText1}
                          onChange={(e) => setCompareText1(e.target.value)}
                          placeholder={t.placeholder}
                          className="min-h-[120px] bg-muted border-border"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">{t.article2}</label>
                        <Textarea
                          value={compareText2}
                          onChange={(e) => setCompareText2(e.target.value)}
                          placeholder={t.placeholder}
                          className="min-h-[120px] bg-muted border-border"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={compareArticles}
                      disabled={isAnalyzing || !compareText1.trim() || !compareText2.trim()}
                      className="w-full"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          {t.comparing}
                        </>
                      ) : (
                        <>
                          <BarChart3 className="w-4 h-4 mr-2" />
                          {t.compareNow}
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
                {compareResult && (
                  <Card className="border-border bg-card">
                    <CardHeader>
                      <CardTitle>{t.comparisonResult}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg text-center">
                          <h4 className="font-semibold mb-2">{t.article1}</h4>
                          <div className={`text-lg font-bold ${getVerdictColor(compareResult.article1.verdict)}`}>
                            {compareResult.article1.verdict === "LIKELY FAKE"
                              ? t.fake
                              : compareResult.article1.verdict === "LIKELY REAL"
                                ? t.real
                                : t.uncertain}
                          </div>
                          <div className="text-2xl font-bold text-primary">{compareResult.article1.confidence}%</div>
                        </div>
                        <div className="p-4 bg-muted rounded-lg text-center">
                          <h4 className="font-semibold mb-2">{t.article2}</h4>
                          <div className={`text-lg font-bold ${getVerdictColor(compareResult.article2.verdict)}`}>
                            {compareResult.article2.verdict === "LIKELY FAKE"
                              ? t.fake
                              : compareResult.article2.verdict === "LIKELY REAL"
                                ? t.real
                                : t.uncertain}
                          </div>
                          <div className="text-2xl font-bold text-primary">{compareResult.article2.confidence}%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              {/* Live News Tab */}
              <TabsContent value="live" className="space-y-6">
                <Card className="border-border bg-card">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <Newspaper className="w-5 h-5 text-primary" />
                        {t.liveNewsTitle}
                      </span>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {t.autoRefresh}: {autoRefreshCountdown}s
                      </div>
                    </CardTitle>
                    <CardDescription>{t.liveNewsDesc}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex gap-2 flex-wrap">
                      {["all", "politics", "business", "technology", "sports", "health"].map((cat) => (
                        <Button
                          key={cat}
                          variant={newsCategory === cat ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            setNewsCategory(cat)
                            fetchLiveNews()
                          }}
                        >
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </Button>
                      ))}
                      <Button variant="ghost" size="sm" onClick={fetchLiveNews} disabled={loadingNews}>
                        <RefreshCw className={`w-4 h-4 mr-2 ${loadingNews ? "animate-spin" : ""}`} />
                        {t.refreshNews}
                      </Button>
                    </div>

                    {loadingNews ? (
                      <div className="flex items-center justify-center py-12">
                        <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : liveNews.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground">{t.noNews}</div>
                    ) : (
                      <div className="space-y-4">
                        {liveNews.map((news, i) => (
                          <div key={i} className="p-4 bg-muted rounded-lg space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-semibold text-foreground">{news.title}</h4>
                              {news.category && (
                                <Badge variant="secondary" className="shrink-0">
                                  {news.category}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{news.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="font-medium text-primary">{news.source}</span>
                                <span>•</span>
                                <span>{new Date(news.publishedAt).toLocaleString()}</span>
                              </div>
                              <Button variant="ghost" size="sm" onClick={() => analyzeNewsItem(news)}>
                                <Search className="w-4 h-4 mr-2" />
                                {t.analyzeThis}
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* History Sidebar */}
          {showHistory && (
            <div className="w-80 shrink-0">
              <Card className="border-border bg-card sticky top-24">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">{t.history}</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearHistory}>
                    <X className="w-4 h-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t.noHistory}</p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((item, i) => (
                        <div key={i} className="p-3 bg-muted rounded-lg space-y-1">
                          <p className="text-sm truncate">{item.text}</p>
                          <div className="flex items-center justify-between">
                            <Badge
                              variant={
                                item.verdict === "LIKELY FAKE"
                                  ? "destructive"
                                  : item.verdict === "LIKELY REAL"
                                    ? "default"
                                    : "secondary"
                              }
                              className="text-xs"
                            >
                              {item.verdict === "LIKELY FAKE"
                                ? t.fake
                                : item.verdict === "LIKELY REAL"
                                  ? t.real
                                  : t.uncertain}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{item.confidence}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-muted-foreground">{t.footer}</div>
      </footer>
    </div>
  )
}
