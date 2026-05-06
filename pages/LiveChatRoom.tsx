
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../components/Icons';
import { Astrologer, ChatMessage } from '../types';

interface LiveChatRoomProps {
  astrologer: Astrologer;
  onEnd: () => void;
}

const LiveChatRoom: React.FC<LiveChatRoomProps> = ({ astrologer, onEnd }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [timer, setTimer] = useState(0);
  const [isAstroTyping, setIsAstroTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    
    // Initial Greeting from Astrologer
    setTimeout(() => {
      sendAstroMessage(`Namaste! I am ${astrologer.name}. I am looking into your chart now. What is your primary concern today?`);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAstroTyping]);

  const sendAstroMessage = (text: string) => {
    setIsAstroTyping(true);
    setTimeout(() => {
      setIsAstroTyping(false);
      const msg: ChatMessage = {
        id: Date.now().toString(),
        sender: 'astrologer',
        text,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, msg]);
    }, 2000);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Random auto-response
    if (messages.length < 5) {
      setTimeout(() => {
        sendAstroMessage("Understood. Let me check your 10th house for career insights...");
      }, 3000);
    }
  };

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-ivory-100 overflow-hidden animate-fade-in">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10 shrink-0 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-stone-100">
            <img src={astrologer.imageUrl} alt={astrologer.name} className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-charcoal-900">{astrologer.name}</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] text-stone-400 font-bold uppercase tracking-widest">In Consultation</span>
            </div>
          </div>
        </div>
        <button onClick={onEnd} className="p-2 text-stone-400 hover:text-red-500 transition-colors">
          <Icons.X />
        </button>
      </div>

      {/* Billing Banner */}
      <div className="bg-charcoal-900 text-gold-400 px-6 py-2 flex justify-between items-center z-10">
        <div className="flex items-center gap-2">
          <Icons.Clock className="w-3 h-3" />
          <span className="text-[10px] font-bold uppercase tracking-widest">{formatTime(timer)}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-widest">Rate: ₹{astrologer.chatRatePerMin}/min</span>
          <div className="h-3 w-[1px] bg-gold-400/20"></div>
          <span className="text-[10px] font-bold uppercase tracking-widest">Total: ₹{Math.max(astrologer.chatRatePerMin, Math.ceil(timer/60) * astrologer.chatRatePerMin)}</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 no-scrollbar bg-noise relative">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
            <div className={`px-4 py-3 text-xs max-w-[85%] leading-relaxed ${
              msg.sender === 'user' ? 'bg-charcoal-900 text-ivory-50 rounded-2xl rounded-tr-none' : 'bg-white border border-stone-200 text-charcoal-800 rounded-2xl rounded-tl-none'
            }`}>
              {msg.text}
            </div>
            <span className="text-[8px] text-stone-400 mt-1 uppercase tracking-widest px-1">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isAstroTyping && (
          <div className="flex items-center gap-1.5 h-8 animate-fade-in">
            <div className="w-1 h-1 bg-stone-300 rounded-full animate-bounce"></div>
            <div className="w-1 h-1 bg-stone-300 rounded-full animate-bounce delay-100"></div>
            <div className="w-1 h-1 bg-stone-300 rounded-full animate-bounce delay-200"></div>
            <span className="text-[9px] text-stone-300 italic ml-1">Acharya is typing...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white border-t border-stone-200 pb-10">
        <div className="flex items-center gap-3 bg-stone-50 border border-stone-200 rounded-2xl px-4 py-1.5 shadow-inner">
          <input 
            type="text" 
            placeholder="Type your message..."
            className="flex-1 bg-transparent py-2 outline-none text-xs text-charcoal-900 font-medium"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 bg-gold-500 text-white rounded-xl shadow-lg shadow-gold-500/20 active:scale-90 disabled:opacity-30 disabled:grayscale transition-all"
          >
            <Icons.Send className="scale-75" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveChatRoom;
