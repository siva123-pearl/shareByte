
import React, { useState, useEffect, useRef } from 'react';
import { getGeminiStream } from '../services/geminiService';
import { ChatMessage, GroundingSource } from '../types';

const AIAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I am your ShareBite AI Assistant. I can help you find nearby donation centers, track mobile vans, or verify food safety. How can I assist you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setIsLoading(true);

    try {
      let location = undefined;
      try {
        const pos = await new Promise<GeolocationPosition>((res, rej) => 
          navigator.geolocation.getCurrentPosition(res, rej)
        );
        location = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      } catch (e) {
        console.warn('Geolocation disabled');
      }

      const stream = await getGeminiStream(userMessage, location);
      let fullText = '';
      let sources: GroundingSource[] = [];

      // Add placeholder for model response
      setMessages(prev => [...prev, { role: 'model', text: '' }]);

      for await (const chunk of stream) {
        const chunkText = chunk.text || '';
        fullText += chunkText;
        
        if (chunk.candidates?.[0]?.groundingMetadata?.groundingChunks) {
          const chunks = chunk.candidates[0].groundingMetadata.groundingChunks;
          sources = chunks.map((c: any) => {
            if (c.maps) return { title: c.maps.title, uri: c.maps.uri };
            if (c.web) return { title: c.web.title, uri: c.web.uri };
            return null;
          }).filter(Boolean) as GroundingSource[];
        }

        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { 
            role: 'model', 
            text: fullText,
            sources: sources.length > 0 ? sources : undefined
          };
          return newMessages;
        });
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Sorry, I encountered an error connecting to the ShareBite protocol network.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-slate-100 ring-1 ring-slate-200/50">
      <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-emerald-500 p-2.5 rounded-xl shadow-lg shadow-emerald-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h3 className="font-black text-sm tracking-tight">AI PROTOCOL</h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">ShareBite Core</p>
          </div>
        </div>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
          <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse delay-75"></div>
          <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse delay-150"></div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/30">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2`}>
            <div className={`max-w-[85%] p-4 rounded-2xl text-sm leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-slate-900 text-white rounded-tr-none shadow-xl' 
                : 'bg-white text-slate-800 shadow-sm border border-slate-100 rounded-tl-none font-medium'
            }`}>
              <p className="whitespace-pre-wrap">{msg.text || (isLoading && idx === messages.length - 1 ? '...' : '')}</p>
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[9px] font-black text-slate-400 mb-2 uppercase tracking-widest">Verification Context:</p>
                  <div className="flex flex-wrap gap-2">
                    {msg.sources.map((s, i) => (
                      <a key={i} href={s.uri} target="_blank" rel="noopener noreferrer" className="text-[10px] bg-slate-50 border border-slate-100 px-2 py-1 rounded-md text-emerald-600 hover:bg-emerald-50 transition-colors flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        {s.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && !messages[messages.length - 1].text && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 rounded-tl-none flex gap-1.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-3">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Command input..."
            className="flex-1 bg-slate-50 border-slate-100 rounded-xl px-5 py-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none font-medium"
          />
          <button 
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-emerald-600 p-3 rounded-xl text-white hover:bg-emerald-700 transition-all disabled:opacity-50 active:scale-95"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIAssistant;
