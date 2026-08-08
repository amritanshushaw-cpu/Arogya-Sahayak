'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, User, Bot } from 'lucide-react';

type Message = {
  id: string;
  sender: 'bot' | 'user';
  text: string;
};

// Very basic multilingual triage logic
export const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'bot', text: 'Hello! Are you experiencing any symptoms? (Namaste! Kya aapko koi lakshan mehsoos ho rahe hain?)' }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'hi' : 'en');
  };

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simple bot logic based on input keywords
    setTimeout(() => {
      let botResponse = '';
      const lowercaseInput = input.toLowerCase();

      if (language === 'en') {
        if (lowercaseInput.includes('fever') || lowercaseInput.includes('temperature')) {
          botResponse = 'Do you have a fever? Is it above 101F? Have you taken any medication?';
        } else if (lowercaseInput.includes('cough')) {
          botResponse = 'How long have you had the cough? Is it dry or with mucus?';
        } else {
          botResponse = 'I see. Please consult a healthcare worker for a proper assessment. In an emergency, seek immediate medical help.';
        }
      } else {
        // Hindi basic responses
        if (lowercaseInput.includes('bukhar') || lowercaseInput.includes('fever')) {
          botResponse = 'Kya aapko bukhar hai? Kya yeh 101F se upar hai? Kya aapne koi dawai li hai?';
        } else if (lowercaseInput.includes('khasi') || lowercaseInput.includes('cough')) {
          botResponse = 'Aapko khasi kab se hai? Sukhi khasi hai ya balgam wali?';
        } else {
          botResponse = 'Thik hai. Kripya sahi janch ke liye kisi swasthya karyakarta se sampark karein. Aapatkalin sthiti mein turant chikitsiye madad lein.';
        }
      }

      setMessages(prev => [...prev, { id: Date.now().toString(), sender: 'bot', text: botResponse }]);
    }, 1000);
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
          className="fixed bottom-6 right-6 p-4 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-indigo-500/25 transition-all z-50 flex items-center justify-center"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-80 sm:w-96 h-[32rem] max-h-[80vh] flex flex-col bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/10 bg-slate-900/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <Bot className="text-indigo-400" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-white text-sm">Triage Assistant</h3>
                <p className="text-xs text-indigo-300">Multilingual Support</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
               <button 
                onClick={toggleLanguage}
                className="text-xs px-2 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-slate-300 transition-colors"
              >
                {language === 'en' ? 'EN' : 'HI'}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] p-3 rounded-2xl ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-slate-800 text-slate-200 border border-white/5 rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm">{msg.text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-white/10 bg-slate-900/50">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={language === 'en' ? "Type a symptom..." : "Koi lakshan type karein..."}
                className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 disabled:hover:bg-indigo-600 transition-colors flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
