'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Mic, Volume2, Loader2, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
};

const LANGUAGES = [
  { code: 'English', label: 'English' },
  { code: 'Hindi', label: 'हिंदी (Hindi)' },
  { code: 'Bengali', label: 'বাংলা (Bengali)' },
  { code: 'Telugu', label: 'తెలుగు (Telugu)' },
  { code: 'Marathi', label: 'मराठी (Marathi)' },
  { code: 'Tamil', label: 'தமிழ் (Tamil)' },
  { code: 'Urdu', label: 'اردو (Urdu)' },
  { code: 'Gujarati', label: 'ગુજરાતી (Gujarati)' },
  { code: 'Kannada', label: 'ಕನ್ನಡ (Kannada)' },
  { code: 'Odia', label: 'ଓଡ଼ିଆ (Odia)' },
  { code: 'Malayalam', label: 'മലയാളം (Malayalam)' },
  { code: 'Punjabi', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'Assamese', label: 'অসমীয়া (Assamese)' },
];

export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Namaste! How can I help you today? Please select your language above.' }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('English');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Handle Speech Recognition (Input)
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error('Voice input is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    // Use a generic language mapping based on selection if possible, else default to hi-IN or en-IN
    const langMap: Record<string, string> = {
      'Hindi': 'hi-IN', 'Bengali': 'bn-IN', 'Telugu': 'te-IN', 'Marathi': 'mr-IN',
      'Tamil': 'ta-IN', 'Gujarati': 'gu-IN', 'Kannada': 'kn-IN', 'Malayalam': 'ml-IN',
      'English': 'en-IN'
    };
    recognition.lang = langMap[language] || 'en-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
      toast.error('Voice recognition failed.');
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // Handle Speech Synthesis (Output)
  const speakText = (text: string) => {
    const langMap: Record<string, string> = {
      'Hindi': 'hi', 'Bengali': 'bn', 'Telugu': 'te', 'Marathi': 'mr',
      'Tamil': 'ta', 'Gujarati': 'gu', 'Kannada': 'kn', 'Malayalam': 'ml',
      'English': 'en', 'Urdu': 'ur', 'Odia': 'or', 'Punjabi': 'pa', 'Assamese': 'as'
    };
    const langCode = langMap[language] || 'hi';
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      
      const cleanText = text.replace(/[*#_`]/g, '').replace(/\n+/g, '. ').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      const targetLang = langCode === 'en' ? 'en-US' : `${langCode}-IN`;
      utterance.lang = targetLang;
      utterance.rate = 0.92;

      const voices = window.speechSynthesis.getVoices();
      if (voices && voices.length > 0) {
        const prefix = langCode.toLowerCase();
        let bestVoice = voices.find(v => v.lang.toLowerCase().startsWith(prefix) || v.lang.toLowerCase().includes(prefix));
        if (bestVoice) {
          utterance.voice = bestVoice;
        }
      }

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleClose = () => {
    if ((window as any).currentAudio) {
      (window as any).currentAudio.pause();
    }
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
          language: language,
          history: messages.map(m => ({ role: m.sender === 'bot' ? 'assistant' : 'user', content: m.text }))
        })
      });

      if (!res.ok) throw new Error('Failed to fetch response');
      const data = await res.json();
      
      const botMessage: Message = { id: (Date.now() + 1).toString(), sender: 'bot', text: data.reply };
      setMessages(prev => [...prev, botMessage]);
      speakText(data.reply); // Auto-speak response

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
          className="fixed bottom-6 right-6 p-4 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:outline-none z-50 flex items-center justify-center"
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
                  <p className="text-xs text-emerald-300 font-mono-tech">Powered by Groq</p>
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
              <Globe className="text-gray-400 w-4 h-4 ml-1" aria-hidden="true" />
              <select 
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                aria-label="Select Language"
                className="flex-1 bg-transparent text-sm text-gray-200 focus:outline-none focus:ring-1 focus:ring-emerald-500 rounded-md appearance-none"
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.code} value={lang.code} className="bg-slate-800">{lang.label}</option>
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
                    aria-label="Read text aloud"
                    className="mr-2 self-end mb-1 p-1.5 rounded-full bg-slate-800 text-slate-400 hover:text-emerald-400 hover:bg-slate-700 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
                    title="Read Aloud"
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
                  <span className="text-xs text-gray-400">Translating & Thinking…</span>
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
                className={`p-3 rounded-xl transition-all flex items-center justify-center shrink-0 focus-visible:ring-2 focus-visible:ring-emerald-500 ${isListening ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse' : 'bg-slate-800 text-slate-300 border border-white/5 hover:bg-slate-700'}`}
                title="Speak"
              >
                <Mic size={18} aria-hidden="true" />
              </button>
              
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your symptoms…"
                aria-label="Symptom text input"
                className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              />
              
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                aria-label="Send message"
                className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-400 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
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
