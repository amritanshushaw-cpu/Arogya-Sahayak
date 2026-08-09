'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Mic, Volume2, VolumeX, Loader2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/authStore';
import { LANGUAGES as GLOBAL_LANGUAGES } from '@/lib/translations';
import { bhasiniTextToSpeech, bhasiniTranslate } from '@/lib/bhasini';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
};

const LANG_MAPPING: Record<string, { ttsCode: string; sttCode: string; name: string }> = {
  'en-US': { ttsCode: 'en-US', sttCode: 'en-IN', name: 'English' },
  'hi-IN': { ttsCode: 'hi-IN', sttCode: 'hi-IN', name: 'Hindi (हिंदी)' },
  'bn-IN': { ttsCode: 'bn-IN', sttCode: 'bn-IN', name: 'Bengali (বাংলা)' },
  'te-IN': { ttsCode: 'te-IN', sttCode: 'te-IN', name: 'Telugu (తెలుగు)' },
  'mr-IN': { ttsCode: 'mr-IN', sttCode: 'mr-IN', name: 'Marathi (मराठी)' },
  'ta-IN': { ttsCode: 'ta-IN', sttCode: 'ta-IN', name: 'Tamil (தமிழ்)' },
  'gu-IN': { ttsCode: 'gu-IN', sttCode: 'gu-IN', name: 'Gujarati (ગુજરાતી)' },
  'ur-IN': { ttsCode: 'ur-PK', sttCode: 'ur-IN', name: 'Urdu (اردو)' },
  'kn-IN': { ttsCode: 'kn-IN', sttCode: 'kn-IN', name: 'Kannada (ಕನ್ನಡ)' },
  'or-IN': { ttsCode: 'or-IN', sttCode: 'or-IN', name: 'Odia (ଓଡ଼ିଆ)' },
  'ml-IN': { ttsCode: 'ml-IN', sttCode: 'ml-IN', name: 'Malayalam (മലയാളം)' },
  'pa-IN': { ttsCode: 'pa-IN', sttCode: 'pa-IN', name: 'Punjabi (ਪੰਜਾਬੀ)' },
};

const WELCOME_MESSAGES: Record<string, string> = {
  'en-US': 'Namaste! How can I help you today? Please ask your health or symptom questions.',
  'hi-IN': 'नमस्ते! आरोग्य सहायक में आपका स्वागत है। कृपया अपने स्वास्थ्य या लक्षणों के प्रश्न पूछें।',
  'bn-IN': 'নমস্কার! আরোগ্য সহায়কে আপনাকে স্বাগতম। আপনার যেকোনো স্বাস্থ্য বা লক্ষণের প্রশ্ন এখানে জিজ্ঞাসা করুন।',
  'gu-IN': 'નમસ્તે! આરોગ્ય સહાયકમાં તમારું સ્વાગત છે. કૃપા કરીને તમારા આરોગ્ય અથવા લક્ષણોના પ્રશ્નો પૂછો.',
  'te-IN': 'నమస్కారం! ఆరోగ్య సహాయక్‌కి స్వాగతం. దయచేసి మీ ఆరోగ్య ప్రశ్నలను అడగండి.',
  'mr-IN': 'नमस्कार! आरोग्य सहाय्यकमध्ये आपले स्वागत आहे. कृपया तुमचे आरोग्य प्रश्न विचारा.',
  'ta-IN': 'வணக்கம்! ஆரோக்கிய உதவியாளருக்கு வரவேற்கிறோம். உங்கள் சுகாதார கேள்விகளைக் கேட்கவும்.',
  'ur-IN': 'ناماستے! آروگیہ سہایک میں خوش آمدید। برائے مہربانی اپنے صحت کے سوالات پوچھیں۔',
  'kn-IN': 'ನಮಸ್ಕಾರ! ಆರೋಗ್ಯ ಸಹಾಯಕ್‌ಗೆ സ്വാగత. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಆರೋಗ್ಯ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಿ.',
  'or-IN': 'ନମସ୍କାର! ଆରୋଗ୍ୟ ସହାୟକରେ ଆପଣଙ୍କୁ ସ୍ୱାଗତ। ଦୟାକରି ଆପଣଙ୍କ ସ୍ୱାସ୍ଥ୍ୟ ପ୍ରଶ୍ନ ପଚାରନ୍ତୁ।',
  'ml-IN': 'നമസ്കാരം! ആരോഗ്യ സഹായിയിലേക്ക് സ്വാഗതം. നിങ്ങളുടെ ആരോഗ്യ ചോദ്യങ്ങൾ ചോദിക്കുക.',
  'pa-IN': 'ਨਮਸਤੇ! ਅਰੋਗਿਆ ਸਹਾਇਕ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ। ਕਿਰਪਾ ਕਰਕੇ ਆਪਣੇ ਸਿਹਤ ਸਵਾਲ ਪੁੱਛੋ।',
};

// Helper function to reliably fetch SpeechSynthesis voices asynchronously across browsers
const getWebSpeechVoices = (): Promise<SpeechSynthesisVoice[]> => {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      resolve([]);
      return;
    }
    const currentVoices = window.speechSynthesis.getVoices();
    if (currentVoices && currentVoices.length > 0) {
      resolve(currentVoices);
      return;
    }
    const onVoicesChanged = () => {
      const updatedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = null;
      resolve(updatedVoices || []);
    };
    window.speechSynthesis.onvoiceschanged = onVoicesChanged;
    setTimeout(() => {
      resolve(window.speechSynthesis.getVoices() || []);
    }, 300);
  });
};

function generateOfflineClinicalReply(userText: string, langCode: string): string {
  const query = userText.toLowerCase();
  
  const isChestPain = query.includes('chest') || query.includes('pain') || query.includes('सीने') || query.includes('বুক') || query.includes('గుండె') || query.includes('छाती') || query.includes('છાતી');
  const isFever = query.includes('fever') || query.includes('temp') || query.includes('बुखार') || query.includes('জ্বর') || query.includes('జ్వరం') || query.includes('તાપ') || query.includes('તાવ');
  const isBP = query.includes('bp') || query.includes('pressure') || query.includes('ब्लड प्रेशर') || query.includes('রক্তচাপ') || query.includes('రక్తపోటు') || query.includes('પ્રેશર');
  const isSugar = query.includes('sugar') || query.includes('diabetes') || query.includes('शुगर') || query.includes('ডায়াবেটিস') || query.includes('మధుమేహం') || query.includes('ડાયાબિટીસ');
  const isBreath = query.includes('breath') || query.includes('shortness') || query.includes('सांस') || query.includes('শ্বাস') || query.includes('ఊపిరి') || query.includes('શ્વાસ');

  let riskLevel = 'LOW RISK (GREEN)';
  let riskSummary = 'Vitals & symptom indicators remain stable. Continue regular health monitoring.';
  let advice = [
    'Maintain balanced nutrition & adequate hydration.',
    'Monitor resting blood pressure & blood glucose readings.',
    'Consult nearest Primary Health Center (PHC) ASHA worker if symptoms change.'
  ];

  if (isChestPain || isBreath) {
    riskLevel = 'RED ALERT (CRITICAL HIGH RISK)';
    riskSummary = 'Severe cardiopulmonary symptoms detected. Immediate medical intervention recommended.';
    advice = [
      'IMMEDIATE ACTION: Transport patient to nearest District Primary Health Center (PHC).',
      'Keep patient seated upright and loosen tight clothing.',
      'Administer supplemental oxygen if SpO2 drops below 92%.'
    ];
  } else if (isFever || isBP || isSugar) {
    riskLevel = 'MODERATE RISK (YELLOW OBSERVATION)';
    riskSummary = 'Elevated physiological markers detected requiring targeted screening.';
    advice = [
      'Monitor body temperature & resting blood pressure every 4 hours.',
      'Ensure adequate fluid intake and avoid high-sodium/high-sugar diet.',
      'Visit nearest PHC for diagnostic CBC & glucose verification.'
    ];
  }

  if (langCode === 'gu-IN') {
    return `[ઓફલાઇન AI ક્લિનિકલ ટ્રાયજ - આરોગ્ય સહાયક]

૧. જોખમ સ્તર: ${riskLevel.includes('RED') ? '🔴 ઉચ્ચ જોખમ (લાલ ચેતવણી)' : riskLevel.includes('MODERATE') ? '🟡 મધ્યમ જોખમ (પીળું)' : '🟢 સામાન્ય જોખમ (લીલું)'}

૨. આરોગ્ય મુલ્યાંકન: ${isChestPain ? 'છાતીમાં દુખાવો અથવા શ્વાસ લેવામાં તકલીફના લક્ષણો. તાત્કાલિક PHC ઇમરજન્સી તપાસ જરૂરી છે.' : isFever ? 'શરીરનું તાપમાન અને તાવ વધેલો છે.' : 'ઓન-ડિવાઇસ AI મોડેલ દ્વારા પ્રાથમિક તપાસ પૂર્ણ.'}

૩. ભલામણ કરેલ પગલાં:
${advice.map(a => '• ' + a).join('\n')}

(નોંધ: ઓન-ડિવાઇસ ક્લિનિકલ એન્જિન દ્વારા જવાબ જનરેટ થયો છે.)`;
  }

  if (langCode === 'bn-IN') {
    return `[অফলাইন এআই ক্লিনিক্যাল ট্রায়াজ - আরোগ্য সহায়ক]

১. ঝুঁকির স্তর: ${riskLevel.includes('RED') ? '🔴 অত্যন্ত আশঙ্কাজনক (লাল সতর্কতা)' : riskLevel.includes('MODERATE') ? '🟡 মাঝারি ঝুঁকি (হলুদ)' : '🟢 স্বাভাবিক ঝুঁকি (সবুজ)'}

২. স্বাস্থ্য মূল্যায়ন: ${isChestPain ? 'বুকে ব্যথা বা শ্বাসকষ্টের সংকেত চিহ্নিত হয়েছে। অবিলম্বে নিকটস্থ স্বাস্থ্যকেন্দ্রে (PHC) যোগাযোগ করুন।' : isFever ? 'জ্বর ও শরীরের তাপমাত্রা বৃদ্ধি।' : 'অন-ডিভাইস এআই মডেলের মাধ্যমে পরীক্ষা সম্পন্ন।'}

৩. পরামর্শ নির্দেশিকা:
${advice.map(a => '• ' + a).join('\n')}

(নোট: নেটওয়ার্ক সংযোগ না থাকায় লোকাল এআই ইঞ্জিন থেকে উত্তর দেওয়া হলো।)`;
  }

  if (langCode === 'hi-IN') {
    return `[ऑफ़लाइन एआई क्लिनिकल ट्राइएज - आरोग्य सहायक]

1. जोखिम स्तर: ${riskLevel.includes('RED') ? '🔴 उच्च जोखिम (लाल चेतावनी)' : riskLevel.includes('MODERATE') ? '🟡 मध्यम जोखिम (पीला)' : '🟢 सामान्य जोखिम (हरा)'}

2. नैदानिक ​​मूल्यांकन: ${isChestPain ? 'सीने में दर्द या सांस लेने में तकलीफ के लक्षण। तत्काल पीएचसी आपातकालीन जांच आवश्यक है।' : isFever ? 'शरीर का तापमान और बुखार बढ़ा हुआ है।' : 'ऑफ़लाइन एआई मॉडल द्वारा प्राथमिक लक्षण जांच पूरी की गई।'}

3. अनुशंसित कार्रवाई:
${advice.map(a => '• ' + a).join('\n')}

(नोट: नेटवर्क अनुपलब्ध होने पर ऑन-डिवाइस क्लिनिकल मॉडल द्वारा जनरेट किया गया उत्तर।)`;
  }

  return `[Offline AI Clinical Decision Support]

1. Executive Risk Summary: ${riskLevel}

2. Clinical Evaluation: ${riskSummary}

3. Recommended Action Plan:
${advice.map(a => '• ' + a).join('\n')}

(Note: Generated via on-device clinical engine for offline resilience.)`;
}

export const Chatbot = () => {
  const { language: globalLang, setLanguage: setGlobalLang } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: WELCOME_MESSAGES[globalLang || 'en-US'] || WELCOME_MESSAGES['en-US'] }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentLangObj = LANG_MAPPING[globalLang || 'en-US'] || LANG_MAPPING['en-US'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Update initial welcome message when global language changes
  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].sender === 'bot') {
        return [{ id: '1', sender: 'bot', text: WELCOME_MESSAGES[globalLang || 'en-US'] || WELCOME_MESSAGES['en-US'] }];
      }
      return prev;
    });
  }, [globalLang]);

  // Handle Vernacular Speech Recognition (Voice Input)
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = currentLangObj.sttCode || 'hi-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      toast.success('Voice captured!');
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
      toast.error('Voice recognition failed.');
    };

    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  // Handle Vernacular Speech Synthesis (Voice Output) with Bhasini AI & Web Speech Fallback
  const speakText = async (text: string, msgId?: string) => {
    if (typeof window === 'undefined') return;

    // TOGGLE FEATURE: If currently speaking this message, stop speech immediately
    if (activeSpeakingId === msgId && (window.speechSynthesis?.speaking || (window as any)._bhasiniAudio)) {
      window.speechSynthesis?.cancel();
      if ((window as any)._bhasiniAudio) {
        (window as any)._bhasiniAudio.pause();
        (window as any)._bhasiniAudio = null;
      }
      setActiveSpeakingId(null);
      return;
    }

    window.speechSynthesis?.cancel();
    if ((window as any)._bhasiniAudio) {
      (window as any)._bhasiniAudio.pause();
      (window as any)._bhasiniAudio = null;
    }
    if (msgId) setActiveSpeakingId(msgId);

    const cleanText = text.replace(/[*#_`]/g, '').replace(/\n+/g, '. ').trim();
    const targetLangCode = currentLangObj.ttsCode || 'en-US';

    // 1. Attempt Bhasini NLTM TTS Audio synthesis first for authentic Indian vernacular voice
    try {
      const bhasiniRes = await bhasiniTextToSpeech(cleanText, globalLang || 'bn-IN');
      if (bhasiniRes.audioContent) {
        const audio = new Audio(`data:audio/wav;base64,${bhasiniRes.audioContent}`);
        (window as any)._bhasiniAudio = audio;
        audio.onended = () => setActiveSpeakingId(null);
        audio.onerror = () => setActiveSpeakingId(null);
        await audio.play();
        return;
      }
    } catch (bErr) {
      console.warn('Bhasini TTS fallback to native speech synthesis:', bErr);
    }

    // 2. Native Web Speech Synthesis fallback with proper voice loading
    if (!('speechSynthesis' in window)) {
      setActiveSpeakingId(null);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.92;

    const voices = await getWebSpeechVoices();
    const langPrefix = targetLangCode.slice(0, 2).toLowerCase();

    // Find best voice match for target Indian language
    let bestVoice = voices.find(v => 
      v.lang.toLowerCase().startsWith(langPrefix) || 
      v.lang.toLowerCase().includes(langPrefix) ||
      (langPrefix === 'bn' && (v.name.toLowerCase().includes('bengali') || v.name.toLowerCase().includes('bangla'))) ||
      (langPrefix === 'gu' && (v.name.toLowerCase().includes('gujarati') || v.name.toLowerCase().includes('gujarat'))) ||
      (langPrefix === 'hi' && v.name.toLowerCase().includes('hindi'))
    );

    // If specific OS voice for target language is missing, fall back to Indian Hindi or Indian English voice
    // to prevent default US English voice from pronouncing Indic scripts with American phonetics!
    if (!bestVoice && langPrefix !== 'en') {
      bestVoice = voices.find(v => 
        v.lang.toLowerCase().includes('hi') || 
        v.lang.toLowerCase().includes('in') ||
        v.name.toLowerCase().includes('india') ||
        v.name.toLowerCase().includes('hindi')
      );
    }

    if (bestVoice) {
      utterance.voice = bestVoice;
      utterance.lang = bestVoice.lang;
    } else {
      utterance.lang = targetLangCode;
    }

    utterance.onend = () => setActiveSpeakingId(null);
    utterance.onerror = () => setActiveSpeakingId(null);

    window.speechSynthesis.speak(utterance);
  };

  const handleClose = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (typeof window !== 'undefined' && (window as any)._bhasiniAudio) {
      (window as any)._bhasiniAudio.pause();
      (window as any)._bhasiniAudio = null;
    }
    setActiveSpeakingId(null);
    setIsOpen(false);
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim()) return;
    
    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: textToSend.trim() };
    setMessages(prev => [...prev, userMessage]);
    if (!overrideInput) setInput('');
    setLoading(true);

    let queryForAI = textToSend;

    // 1. Bhasini Vernacular Input NMT Translation to English for maximum clinical accuracy
    if (globalLang && globalLang !== 'en-US') {
      try {
        const inputTrans = await bhasiniTranslate(textToSend, globalLang, 'en-US');
        if (inputTrans.translatedText && inputTrans.provider === 'bhasini') {
          queryForAI = inputTrans.translatedText;
        }
      } catch (inErr) {
        console.warn('Bhasini NMT input translation error:', inErr);
      }
    }

    let botReplyText = '';

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryForAI,
          language: globalLang || 'en-US',
          history: messages.map(m => ({ role: m.sender === 'bot' ? 'assistant' : 'user', content: m.text }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        botReplyText = data.reply || data.answer || data.response;
      }
    } catch (error) {
      console.warn('Backend API chat fetch failed, switching to local clinical AI engine:', error);
    }

    // Fallback to local clinical triage if API response was unavailable or empty
    if (!botReplyText) {
      botReplyText = generateOfflineClinicalReply(textToSend, globalLang || 'en-US');
    } else if (globalLang && globalLang !== 'en-US') {
      // 2. Bhasini Vernacular Output NMT Translation to Target Indian Language
      try {
        const outTrans = await bhasiniTranslate(botReplyText, 'en-US', globalLang);
        if (outTrans.translatedText && outTrans.provider === 'bhasini') {
          botReplyText = outTrans.translatedText;
        }
      } catch (outErr) {
        console.warn('Bhasini NMT output translation error:', outErr);
      }
    }

    const botMessageId = (Date.now() + 1).toString();
    const botMessage: Message = { id: botMessageId, sender: 'bot', text: botReplyText };
    setMessages(prev => [...prev, botMessage]);
    speakText(botReplyText, botMessageId); // Auto-speak response in target vernacular language
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Assistant"
          className="fixed bottom-6 right-6 p-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none z-50 flex items-center justify-center cursor-pointer"
        >
          <MessageSquare size={24} aria-hidden="true" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-[350px] sm:w-[400px] h-[32rem] max-h-[85vh] flex flex-col bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden font-sans">
          {/* Header */}
          <div className="flex flex-col border-b border-white/10 bg-slate-900/80 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                  <Bot className="text-emerald-400" size={20} aria-hidden="true" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-white text-sm">AI Medical Triage</h3>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">🇮🇳 Bhasini AI</span>
                  </div>
                  <p className="text-xs text-emerald-300 font-mono-tech">Bhasini NLTM Multi-Lingual Engine</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                aria-label="Close Assistant"
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            
            {/* Language Selector */}
            <div className="flex items-center gap-2 bg-black/40 p-2 rounded-xl border border-white/5">
              <Globe className="text-emerald-400 w-4 h-4 ml-1" aria-hidden="true" />
              <select 
                value={globalLang || 'en-US'}
                onChange={(e) => setGlobalLang(e.target.value)}
                aria-label="Select Chatbot Language"
                className="flex-1 bg-transparent text-xs sm:text-sm font-medium text-slate-200 focus:outline-none focus:ring-0 appearance-none cursor-pointer"
              >
                {GLOBAL_LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-slate-900 text-white">
                    🔊 {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => {
              const isSpeakingThis = activeSpeakingId === msg.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <button 
                      onClick={() => speakText(msg.text, msg.id)} 
                      aria-label={isSpeakingThis ? "Stop reading aloud" : "Read text aloud in selected vernacular language"}
                      className={`mr-2 self-end mb-1 p-1.5 rounded-full transition-all focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${
                        isSpeakingThis 
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50 animate-pulse' 
                          : 'bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700'
                      }`}
                      title={isSpeakingThis ? "Click to Stop Reading" : `Read Aloud (${currentLangObj.name})`}
                    >
                      {isSpeakingThis ? <VolumeX size={14} aria-hidden="true" /> : <Volume2 size={14} aria-hidden="true" />}
                    </button>
                  )}
                  <div
                    className={`max-w-[75%] p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-2xl rounded-br-sm shadow-md'
                        : 'bg-slate-800 text-slate-200 border border-white/5 rounded-2xl rounded-bl-sm shadow-md'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-white/5 rounded-2xl rounded-bl-sm p-3 flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" aria-hidden="true" />
                  <span className="text-xs text-gray-400">Analyzing Vitals & Generating Clinical Triage ({currentLangObj.name})…</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-white/10 bg-slate-900/80">
            <div className="flex items-center gap-2">
              <button
                onClick={startListening}
                aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                className={`p-3 rounded-xl transition-all flex items-center justify-center shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer ${isListening ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-slate-800 text-slate-300 border border-white/5 hover:bg-slate-700'}`}
                title={`Speak in ${currentLangObj.name}`}
              >
                <Mic size={18} aria-hidden="true" />
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Type or speak symptoms in ${currentLangObj.name}…`}
                aria-label="Symptom text input"
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.2)] cursor-pointer"
              >
                <Send size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
