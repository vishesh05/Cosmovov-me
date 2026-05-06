
import React from 'react';
import { Icons } from './Icons';
import { Astrologer } from '../types';

export const AstrologerCard: React.FC<{
  astrologer: Astrologer;
  onSelect: () => void;
  onChat: (e: React.MouseEvent) => void;
  onCall: (e: React.MouseEvent) => void;
}> = ({ astrologer, onSelect, onChat, onCall }) => {

  const getIconForSkill = (skill: string) => {
    const s = skill.toLowerCase();
    if (s.includes('vedic')) return <Icons.Scroll className="w-2.5 h-2.5" />;
    if (s.includes('kp') || s.includes('nadi')) return <Icons.Search className="w-2.5 h-2.5" />;
    if (s.includes('vastu')) return <Icons.Compass className="w-2.5 h-2.5" />;
    if (s.includes('career')) return <Icons.Briefcase className="w-2.5 h-2.5" />;
    if (s.includes('finance') || s.includes('wealth')) return <Icons.Wallet className="w-2.5 h-2.5" />;
    if (s.includes('marriage') || s.includes('match') || s.includes('love')) return <Icons.Heart className="w-2.5 h-2.5" />;
    if (s.includes('education')) return <Icons.Book className="w-2.5 h-2.5" />;
    return <Icons.Sparkles className="w-2.5 h-2.5" />;
  };

  return (
    <div
      onClick={onSelect}
      className="bg-white rounded-[32px] p-5 border border-stone-100 shadow-[0_8px_30px_-5px_rgba(0,0,0,0.04)] flex gap-4 relative overflow-hidden active:scale-[0.98] transition-all group"
    >
      {/* Profile Image & Status */}
      <div className="relative shrink-0">
        <div className="w-24 h-24 rounded-[28px] overflow-hidden border border-stone-100 shadow-sm bg-stone-50">
          <img src={astrologer.imageUrl} alt={astrologer.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>

        {/* Enhanced Status Indicator */}
        <div className={`absolute -bottom-2 inset-x-0 flex justify-center`}>
          {astrologer.status === 'online' ? (
            <div className="bg-green-500 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 border border-white shadow-sm">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              Live
            </div>
          ) : astrologer.status === 'busy' ? (
            <div className="bg-orange-500 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex items-center gap-1 border border-white shadow-sm">
              <Icons.Clock className="w-2 h-2" />
              Busy
            </div>
          ) : (
            <div className="bg-stone-400 text-white text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-white shadow-sm">
              Offline
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pt-1">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-base font-bold text-charcoal-900 truncate pr-2">{astrologer.name}</h3>
          <div className="flex items-center gap-1 bg-gold-50 px-2 py-0.5 rounded-lg text-gold-600 shrink-0">
            <Icons.Star className="w-3 h-3 fill-current" />
            <span className="text-[10px] font-bold">{astrologer.rating}</span>
          </div>
        </div>

        {/* Skills as Chips with Icons - Replaces text line */}
        <div className="flex flex-wrap gap-1.5 mb-3">
          {astrologer.expertise.slice(0, 3).map(skill => (
            <span key={skill} className="flex items-center gap-1 px-2 py-1 rounded-lg bg-stone-50 border border-stone-100 text-[9px] font-bold text-stone-500 uppercase tracking-wide">
              {getIconForSkill(skill)}
              {skill}
            </span>
          ))}
          {astrologer.expertise.length > 3 && (
            <span className="px-1.5 py-1 rounded-lg bg-stone-50 border border-stone-100 text-[9px] font-bold text-stone-400">+{astrologer.expertise.length - 3}</span>
          )}
        </div>

        <div className="flex items-center gap-4 text-stone-400 mb-3">
          <div className="flex items-center gap-1">
            <Icons.Briefcase className="w-3 h-3 opacity-60" />
            <span className="text-[10px] font-semibold">{astrologer.experienceYears} yrs</span>
          </div>
          <div className="flex items-center gap-1">
            <Icons.Users className="w-3 h-3 opacity-60" />
            <span className="text-[10px] font-semibold">{astrologer.reviewCount} reviews</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onChat}
            disabled={astrologer.status === 'offline'}
            className="flex-1 bg-white border border-charcoal-900 text-charcoal-900 h-10 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all active:scale-95 disabled:opacity-30 disabled:border-stone-200 flex items-center justify-center gap-2 hover:bg-stone-50"
          >
            <Icons.Message className="w-3 h-3" />
            ₹{astrologer.chatRatePerMin}/min
          </button>
          <button
            onClick={onCall}
            disabled={astrologer.status === 'offline'}
            className="flex-1 bg-charcoal-900 text-ivory-50 h-10 rounded-xl text-[10px] font-bold uppercase tracking-[0.15em] transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2 shadow-lg shadow-charcoal-900/20"
          >
            <Icons.Mic className="w-3 h-3 text-gold-400" />
            ₹{astrologer.callRatePerMin}/min
          </button>
        </div>
      </div>

      {astrologer.status === 'busy' && astrologer.waitTimeMinutes && (
        <div className="absolute top-0 right-0">
          <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-bl-xl text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm">
            <Icons.Clock className="w-3 h-3" />
            Wait: {astrologer.waitTimeMinutes}m
          </div>
        </div>
      )}
    </div>
  );
};

export const CategoryChips: React.FC<{
  categories: string[];
  active: string;
  onSelect: (cat: string) => void
}> = ({ categories, active, onSelect }) => (
  <div className="flex-1 flex gap-2 overflow-x-auto no-scrollbar pb-1 px-1">
    {categories.map(cat => (
      <button
        key={cat}
        onClick={() => onSelect(cat)}
        className={`px-5 py-2.5 rounded-2xl text-[9px] font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${active === cat ? 'bg-charcoal-900 text-gold-400 border-charcoal-900 shadow-md scale-105' : 'bg-white text-stone-400 border-stone-200 hover:border-gold-300 hover:text-charcoal-900'
          }`}
      >
        {cat}
      </button>
    ))}
  </div>
);

export const CallConfirmationModal: React.FC<{
  astrologer: Astrologer;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void
}> = ({ astrologer, isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[32px] w-full max-w-[320px] p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gold-400"></div>
        <div className="text-center">
          <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-gold-500">
            <Icons.Mic className="scale-125" />
          </div>
          <h3 className="text-xl font-serif text-charcoal-900 mb-2">Confirm Live Call</h3>
          <p className="text-sm text-stone-500 font-light mb-6">
            You are about to start a live consultation with <span className="font-bold text-charcoal-800">{astrologer.name}</span>.
          </p>
          <div className="bg-ivory-50 rounded-2xl p-4 mb-8 border border-stone-100">
            <span className="block text-[10px] text-stone-400 uppercase tracking-widest mb-1">Billing Rate</span>
            <span className="text-2xl font-serif text-charcoal-900">₹{astrologer.callRatePerMin}</span>
            <span className="text-sm text-stone-400">/min</span>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              className="w-full bg-charcoal-900 text-ivory-50 py-4 rounded-xl font-bold text-xs uppercase tracking-widest transition-all active:scale-95 shadow-xl shadow-charcoal-900/10"
            >
              Start Call
            </button>
            <button
              onClick={onClose}
              className="w-full text-stone-400 py-3 text-[10px] font-bold uppercase tracking-widest hover:text-charcoal-900 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
