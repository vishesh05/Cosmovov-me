
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { Astrologer } from '../types';

interface LiveCallScreenProps {
  astrologer: Astrologer;
  onEnd: () => void;
}

const LiveCallScreen: React.FC<LiveCallScreenProps> = ({ astrologer, onEnd }) => {
  const [timer, setTimer] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-charcoal-900 text-ivory-50 animate-fade-in relative overflow-hidden">
      {/* Background Decorative Rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/10 rounded-full animate-pulse pointer-events-none"></div>
      
      {/* Top Header */}
      <div className="pt-16 px-6 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 mb-4">
           <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
           <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold-400">Live Consultation</span>
        </div>
        <div className="relative inline-block mb-10">
          <div className="absolute inset-0 bg-gold-500/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="w-32 h-32 rounded-[40px] border-4 border-white/10 overflow-hidden relative z-10 mx-auto rotate-3">
             <img src={astrologer.imageUrl} alt={astrologer.name} className="w-full h-full object-cover -rotate-3 scale-110" />
          </div>
        </div>
        <h2 className="text-3xl font-serif mb-2 tracking-tight">{astrologer.name}</h2>
        <p className="text-sm font-light text-ivory-200/60 mb-8">{astrologer.expertise.slice(0, 2).join(' | ')}</p>
        
        <div className="text-4xl font-serif text-white mb-2">
          {formatTime(timer)}
        </div>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gold-500 opacity-60">
           ₹{Math.max(astrologer.callRatePerMin, Math.ceil(timer/60) * astrologer.callRatePerMin)} billed
        </p>
      </div>

      {/* Controls */}
      <div className="mt-auto pb-20 px-10 relative z-10">
        <div className="flex justify-between items-center mb-16">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all ${isMuted ? 'bg-white text-charcoal-900' : 'bg-white/10 text-white border-white/20'}`}
          >
            <Icons.Mic className={`${isMuted ? 'text-red-500' : ''}`} />
          </button>
          
          <button 
            onClick={() => setIsSpeaker(!isSpeaker)}
            className={`w-16 h-16 rounded-full flex items-center justify-center border transition-all ${isSpeaker ? 'bg-white text-charcoal-900' : 'bg-white/10 text-white border-white/20'}`}
          >
            <Icons.Grid /> {/* Using grid icon for speaker as a close visual approximation if speaker icon missing */}
          </button>
        </div>

        <button 
          onClick={onEnd}
          className="w-full bg-red-500 text-white py-5 rounded-[24px] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-2xl shadow-red-500/20"
        >
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
             <Icons.X />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">End Session</span>
        </button>
      </div>
      
      {/* Subtle Noise */}
      <div className="absolute inset-0 bg-noise opacity-10 pointer-events-none"></div>
    </div>
  );
};

export default LiveCallScreen;
