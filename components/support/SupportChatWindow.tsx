
import React, { useState, useEffect, useRef } from 'react';
import { Icons } from '../Icons';

export interface SupportMessage {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: Date;
  attachment?: {
    type: 'image' | 'file';
    url: string;
    name: string;
  };
}

interface Props {
  initialCategory: string;
  userRole: 'user' | 'astrologer'; // To style differently if needed
  onBack: () => void;
}

const SupportChatWindow: React.FC<Props> = ({ initialCategory, userRole, onBack }) => {
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial Greeting
  useEffect(() => {
    const greeting: SupportMessage = {
      id: 'init',
      sender: 'agent',
      text: `Hello! You've connected with ${userRole === 'astrologer' ? 'Partner Support' : 'Customer Care'}. I see you have a query regarding "${initialCategory}". How can I assist you today?`,
      timestamp: new Date()
    };
    setMessages([greeting]);
  }, [initialCategory, userRole]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = (text: string = input, attachment?: SupportMessage['attachment']) => {
    if ((!text.trim() && !attachment)) return;

    const userMsg: SupportMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: text,
      timestamp: new Date(),
      attachment
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate Agent Reply
    setTimeout(() => {
      setIsTyping(false);
      const replies = [
        "I understand. Let me check that for you.",
        "Could you provide the transaction ID?",
        "I've forwarded this to the technical team.",
        "Is there anything else I can help with?"
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      
      const agentMsg: SupportMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'agent',
        text: randomReply,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, agentMsg]);
    }, 2000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const url = URL.createObjectURL(file);
    
    handleSend(`Uploaded: ${file.name}`, {
      type: isImage ? 'image' : 'file',
      url: url,
      name: file.name
    });
  };

  return (
    <div className="flex flex-col h-full bg-ivory-50 animate-fade-in relative">
      {/* Header */}
      <div className="px-6 py-4 bg-white/90 backdrop-blur-md border-b border-stone-100 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 -ml-2 text-stone-400 hover:text-charcoal-900 transition-colors">
            <Icons.ChevronLeft />
          </button>
          <div>
            <h2 className="text-sm font-bold text-charcoal-900">Support Chat</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">Agent Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}>
            {msg.attachment && (
              <div className="mb-1">
                {msg.attachment.type === 'image' ? (
                  <img src={msg.attachment.url} alt="upload" className="max-w-[200px] rounded-2xl border border-stone-200 shadow-sm" />
                ) : (
                  <div className="bg-white border border-stone-200 p-3 rounded-xl flex items-center gap-2">
                    <Icons.Grid className="w-4 h-4 text-stone-400" />
                    <span className="text-xs text-charcoal-700 underline">{msg.attachment.name}</span>
                  </div>
                )}
              </div>
            )}
            <div className={`px-4 py-3 text-xs max-w-[85%] leading-relaxed shadow-sm ${
              msg.sender === 'user' 
                ? 'bg-charcoal-900 text-ivory-50 rounded-2xl rounded-tr-none' 
                : 'bg-white border border-stone-200 text-charcoal-800 rounded-2xl rounded-tl-none'
            }`}>
              {msg.text}
            </div>
            <span className="text-[8px] text-stone-300 mt-1 uppercase tracking-widest px-1">
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ))}
        {isTyping && (
          <div className="flex items-center gap-1.5 h-8 px-4">
            <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce"></div>
            <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce delay-100"></div>
            <div className="w-1.5 h-1.5 bg-stone-300 rounded-full animate-bounce delay-200"></div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-stone-200 shrink-0">
        <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-2xl px-2 py-1.5 shadow-inner">
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-stone-400 hover:text-gold-600 transition-colors"
          >
            {/* Paperclip/Plus Icon proxy */}
            <Icons.Plus className="w-5 h-5" /> 
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileUpload} 
            accept="image/*,.pdf,.doc,.docx"
          />
          
          <input 
            type="text" 
            placeholder="Describe your issue..."
            className="flex-1 bg-transparent py-2.5 outline-none text-xs text-charcoal-900 font-medium placeholder-stone-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim()}
            className="p-3 bg-charcoal-900 text-gold-400 rounded-xl shadow-lg active:scale-90 disabled:opacity-30 disabled:grayscale transition-all"
          >
            <Icons.Send className="scale-90" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SupportChatWindow;
