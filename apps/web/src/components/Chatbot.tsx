'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Mic, Volume2, Loader2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/authStore';
import { LANGUAGES as GLOBAL_LANGUAGES } from '@/lib/translations';

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

export const Chatbot = () => {
  const { language: globalLang, setLanguage: setGlobalLang } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Namaste! How can I help you today? Please ask your health or symptom questions.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentLangObj = LANG_MAPPING[globalLang || 'en-US'] || LANG_MAPPING['en-US'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

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

  // Handle Vernacular Speech Synthesis (Voice Output)
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const cleanText = text.replace(/[*#_`]/g, '').replace(/\n+/g, '. ').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = currentLangObj.ttsCode;
      utterance.rate = 0.92;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const langPrefix = currentLangObj.ttsCode.slice(0, 2).toLowerCase();
        let bestVoice = voices.find(v => v.lang.toLowerCase().startsWith(langPrefix) || v.lang.toLowerCase().includes(langPrefix));
        if (bestVoice) {
          utterance.voice = bestVoice;
        }
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleClose = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsOpen(false);
  };

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim()) return;
    
    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: textToSend.trim() };
    setMessages(prev => [...prev, userMessage]);
    if (!overrideInput) setInput('');
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '';
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          language: globalLang || 'en-US',
          history: messages.map(m => ({ role: m.sender === 'bot' ? 'assistant' : 'user', content: m.text }))
        })
      });

      if (!res.ok) throw new Error('Failed to fetch response');
      const data = await res.json();
      
      const botMessage: Message = { id: (Date.now() + 1).toString(), sender: 'bot', text: data.reply };
      setMessages(prev => [...prev, botMessage]);
      speakText(data.reply); // Auto-speak response in target vernacular language

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: 'I am currently offline or experiencing a network error. Please try again later.' }]);
    } finally {
      setLoading(false);
    }
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
                  <h3 className="font-semibold text-white text-sm">AI Medical Triage</h3>
                  <p className="text-xs text-emerald-300 font-mono-tech">Powered by Groq • Vernacular Voice Active</p>
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
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <button 
                    onClick={() => speakText(msg.text)} 
                    aria-label="Read text aloud in selected vernacular language"
                    className="mr-2 self-end mb-1 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
                    title={`Read Aloud (${currentLangObj.name})`}
                  >
                    <Volume2 size={14} aria-hidden="true" />
                  </button>
                )}
                <div
                  className={`max-w-[75%] p-3 text-sm leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-2xl rounded-br-sm shadow-md'
                      : 'bg-slate-800 text-slate-200 border border-white/5 rounded-2xl rounded-bl-sm shadow-md'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-800 border border-white/5 rounded-2xl rounded-bl-sm p-3 flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-400" aria-hidden="true" />
                  <span className="text-xs text-gray-400">Translating & Generating Voice ({currentLangObj.name})…</span>
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
