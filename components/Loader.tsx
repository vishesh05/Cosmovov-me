import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';

const defaultMessages = [
  "Aligning planetary positions...",
  "Consulting ancient scriptures...",
  "Mapping your celestial journey...",
  "Evaluating karmic patterns...",
  "Translating cosmic energies...",
  "Unlocking the Akashic records...",
];

const Loader: React.FC<{ text?: string }> = ({ text }) => {
  const [msgIndex, setMsgIndex] = useState(0);
  const [fade, setFade] = useState(true);

  // Auto-cycle generic messages if the text is one of the generic default ones.
  useEffect(() => {
    if (text && text !== "Analyzing Cosmos..." && text !== "Synchronizing with Cosmos...") {
        return; // Fixed specialized text passed down, don't cycle
    }
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setMsgIndex((prev) => (prev + 1) % defaultMessages.length);
        setFade(true);
      }, 400); // Sync with opacity transition
    }, 2800);
    return () => clearInterval(interval);
  }, [text]);

  const displayMessage = (text && text !== "Analyzing Cosmos..." && text !== "Synchronizing with Cosmos...") 
    ? text 
    : defaultMessages[msgIndex];

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-8 relative z-10 pb-20">
      
      {/* Background ambient glow to give depth */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none flex items-center justify-center z-0">
          <div className="w-[70vw] h-[70vw] max-w-[400px] max-h-[400px] bg-gold-400/10 rounded-full blur-[80px] animate-pulse"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center">
          {/* Detailed Astrolabe SVG */}
          <div className="relative w-48 h-48 flex items-center justify-center mb-10">
            {/* Core Glow */}
            <div className="absolute w-14 h-14 bg-gold-400 rounded-full blur-2xl opacity-50 animate-[pulse_4s_ease-in-out_infinite]"></div>
            
            {/* Outer dotted orbit (Fast Forward) */}
            <svg className="absolute inset-0 w-full h-full animate-[spin_20s_linear_infinite]" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="58" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold-500/30" strokeDasharray="3 6" />
              <circle cx="60" cy="2" r="3" fill="currentColor" className="text-gold-400 shadow-[0_0_8px_rgba(212,175,55,0.8)]" />
              <circle cx="60" cy="118" r="1.5" fill="currentColor" className="text-gold-600/60" />
            </svg>

            {/* Inner continuous orbit (Slow Reverse) with "Planetary" Nodes */}
            <svg className="absolute inset-0 w-full h-full animate-[spin_14s_linear_infinite_reverse]" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="45" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-stone-300/60" />
              <circle cx="15" cy="60" r="4.5" fill="none" stroke="currentColor" strokeWidth="1" className="text-charcoal-800" />
              <circle cx="15" cy="60" r="2" fill="currentColor" className="text-gold-500" />
              <circle cx="105" cy="60" r="3" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-gold-500/80" />
            </svg>

            {/* Innermost tick ring (Very Slow Forward) */}
            <svg className="absolute inset-0 w-full h-full animate-[spin_35s_linear_infinite]" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="32" fill="none" stroke="currentColor" strokeWidth="1" className="text-gold-500/20" strokeDasharray="1 8" />
              <g className="text-gold-600/40">
                  <path d="M60 22 L60 28 M60 92 L60 98 M22 60 L28 60 M92 60 L98 60" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            </svg>

            {/* Center static element with pulsing star */}
            <div className="absolute w-20 h-20 border border-gold-400/30 rounded-full flex items-center justify-center bg-white/40 backdrop-blur-md shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                <div className="absolute inset-0 rounded-full border border-white/50 m-1"></div>
                <Icons.Sparkles className="w-7 h-7 text-gold-500 animate-[pulse_2.5s_ease-in-out_infinite] opacity-90" />
            </div>
          </div>

          <div className="h-10 flex flex-col items-center justify-center overflow-hidden w-full max-w-[280px]">
            <p 
              className={`text-gold-600/90 text-[10px] font-bold tracking-[0.25em] uppercase text-center transition-all duration-500 drop-shadow-sm ${fade ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}`}
            >
              {displayMessage}
            </p>
          </div>
      </div>
    </div>
  );
};

export default Loader;