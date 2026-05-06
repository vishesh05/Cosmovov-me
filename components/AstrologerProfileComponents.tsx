
import React from 'react';
import { Icons } from './Icons';
import { Astrologer, Review } from '../types';

export const AstrologerHeaderCard: React.FC<{ astrologer: Astrologer; onBack: () => void }> = ({ astrologer, onBack }) => (
  <div className="relative h-[460px] shrink-0 overflow-hidden">
    <img src={astrologer.imageUrl} className="w-full h-full object-cover object-top" alt={astrologer.name} />
    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/40 to-transparent"></div>

    {/* Top Nav Overlay */}
    <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-20">
      <button onClick={onBack} className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-xl text-white border border-white/20 active:scale-90 transition-transform">
        <Icons.ChevronLeft />
      </button>
      {/* 
         Removed Plus (Follow) and Three Dots (Menu) buttons 
         to focus user action on the bottom interaction bar.
      */}
    </div>

    {/* Bottom Info Overlay */}
    <div className="absolute bottom-24 left-6 right-6 z-10 animate-fade-in text-white">
      <div className="flex flex-wrap gap-2 mb-3">
        <div className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-white/20 backdrop-blur-md ${astrologer.status === 'online' ? 'bg-green-500/90' :
            astrologer.status === 'busy' ? 'bg-orange-500/90' : 'bg-stone-500/90'
          }`}>
          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
          {astrologer.status}
        </div>
        {astrologer.isVerified && (
          <div className="bg-blue-500/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest border border-white/20 flex items-center gap-1">
            <Icons.Sparkles className="w-2 h-2" /> Verified
          </div>
        )}
      </div>

      <h1 className="text-3xl font-serif mb-2 leading-tight tracking-tight drop-shadow-md text-white">{astrologer.name}</h1>

      <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-ivory-100/90">
        <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
          <Icons.Star className="w-3.5 h-3.5 text-gold-400 fill-current" />
          <span className="text-white font-bold">{astrologer.rating}</span>
          <span className="text-[10px] opacity-80">({astrologer.reviewCount})</span>
        </div>
        <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
          <Icons.Briefcase className="w-3.5 h-3.5 text-gold-400" />
          <span>{astrologer.experienceYears} Yrs Exp</span>
        </div>
        <div className="flex items-center gap-1 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/10">
          <Icons.Users className="w-3.5 h-3.5 text-gold-400" />
          <span>{(astrologer.totalConsultations / 1000).toFixed(1)}k+ Consults</span>
        </div>
      </div>
    </div>
  </div>
);

export const AstrologerBioSection: React.FC<{ text: string }> = ({ text }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const words = text.split(' ');
  const shouldTruncate = words.length > 30;
  const displayText = !isExpanded && shouldTruncate ? words.slice(0, 30).join(' ') + '...' : text;

  return (
    <section className="px-6 py-8">
      <h2 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">About Scholar</h2>
      <div className="relative">
        <p className="text-sm text-charcoal-800 leading-relaxed font-light transition-all">
          {displayText}
        </p>
        {shouldTruncate && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gold-600 font-bold text-[10px] uppercase tracking-widest mt-2 hover:underline"
          >
            {isExpanded ? 'Read Less' : 'Read Full Bio'}
          </button>
        )}
      </div>
    </section>
  );
};

export const ExpertiseChipsGrid: React.FC<{
  title: string;
  chips: string[];
  variant?: 'gold' | 'stone';
  highlighted?: string[];
}> = ({ title, chips, variant = 'stone', highlighted = [] }) => {
  const getIconForSkill = (skill: string) => {
    const s = skill.toLowerCase();
    if (s.includes('vedic')) return <Icons.Scroll className="w-3.5 h-3.5" />; // Authentic/Old
    if (s.includes('kp') || s.includes('nadi')) return <Icons.Search className="w-3.5 h-3.5" />; // Precision
    if (s.includes('vastu')) return <Icons.Compass className="w-3.5 h-3.5" />; // Direction
    if (s.includes('career')) return <Icons.Briefcase className="w-3.5 h-3.5" />;
    if (s.includes('finance') || s.includes('wealth')) return <Icons.Wallet className="w-3.5 h-3.5" />;
    if (s.includes('marriage') || s.includes('match') || s.includes('love')) return <Icons.Heart className="w-3.5 h-3.5" />;
    if (s.includes('education')) return <Icons.Book className="w-3.5 h-3.5" />;
    return <Icons.Sparkles className="w-3.5 h-3.5" />; // Default
  };

  return (
    <section className="px-6 py-4">
      <h2 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-4">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {chips.map(chip => {
          const isHighlighted = highlighted.includes(chip);
          return (
            <span key={chip} className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-2 ${isHighlighted ? 'bg-gold-50 border-gold-200 text-gold-700 shadow-sm' :
                variant === 'gold' ? 'bg-gold-50/30 border-gold-100 text-gold-800' : 'bg-white border-stone-100 text-charcoal-700'
              }`}>
              {getIconForSkill(chip)}
              {chip}
            </span>
          );
        })}
      </div>
    </section>
  );
};

export const EducationExperienceCard: React.FC<{ astrologer: Astrologer }> = ({ astrologer }) => (
  <section className="px-6 py-6 grid grid-cols-1 gap-4">
    <div className="bg-white p-5 rounded-[28px] border border-stone-100 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400">
          <Icons.Briefcase className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Experience</h3>
      </div>
      <div className="pl-11 border-l-2 border-stone-50 space-y-4">
        <div>
          <p className="text-sm font-bold text-charcoal-900">{astrologer.experienceYears}+ Years</p>
          <p className="text-[10px] text-stone-400 mt-0.5">Professional practice in Vedic sciences</p>
        </div>
        <div>
          <p className="text-xs font-medium text-charcoal-700">Specialization</p>
          <p className="text-[11px] text-stone-500 leading-relaxed mt-1">High precision in timing of events and practical Vastu rectification without demolition.</p>
        </div>
      </div>
    </div>

    <div className="bg-white p-5 rounded-[28px] border border-stone-100 shadow-sm">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-stone-400">
          <Icons.History className="w-4 h-4" />
        </div>
        <h3 className="text-xs font-bold text-charcoal-900 uppercase tracking-wider">Education</h3>
      </div>
      <div className="pl-11 border-l-2 border-stone-50 space-y-4">
        {astrologer.education.map((edu, i) => (
          <div key={i}>
            <p className="text-xs font-bold text-charcoal-900">{edu.degree}</p>
            <p className="text-[10px] text-stone-400">{edu.institute}{edu.year ? ` • ${edu.year}` : ''}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const RatingsSummaryWidget: React.FC<{ breakdown: { [key: number]: number }; total: number; average: number }> = ({ breakdown, total, average }) => (
  <section className="px-6 py-6">
    <h2 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6">Ratings & Breakdown</h2>
    <div className="flex gap-8 items-center">
      <div className="text-center">
        <div className="text-5xl font-serif text-charcoal-900 mb-1">{average}</div>
        <div className="flex justify-center gap-0.5 text-gold-400 mb-2">
          {[...Array(5)].map((_, i) => <React.Fragment key={i}><Icons.Star className="w-3 h-3 fill-current" /></React.Fragment>)}
        </div>
        <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{total} reviews</div>
      </div>
      <div className="flex-1 space-y-1.5">
        {[5, 4, 3, 2, 1].map(star => (
          <div key={star} className="flex items-center gap-3">
            <span className="text-[9px] font-bold text-stone-400 w-2">{star}</span>
            <div className="flex-1 h-1.5 bg-stone-50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gold-400 rounded-full transition-all duration-1000"
                style={{ width: `${breakdown[star]}%` }}
              ></div>
            </div>
            <span className="text-[8px] font-bold text-stone-300 w-6 text-right">{breakdown[star]}%</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export const ReviewTile: React.FC<{ review: Review }> = ({ review }) => (
  <div className="bg-white p-5 rounded-[24px] border border-stone-50 shadow-[0_4px_15px_-3px_rgba(0,0,0,0.02)] mb-4 animate-fade-in">
    <div className="flex justify-between items-start mb-3">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold text-charcoal-900">{review.userName}</span>
          <div className="flex gap-0.5 text-gold-400">
            {[...Array(5)].map((_, i) => (
              <React.Fragment key={i}>
                <Icons.Star className={`w-2 h-2 ${i < review.rating ? 'fill-current' : 'opacity-20'}`} />
              </React.Fragment>
            ))}
          </div>
        </div>
        <span className="text-[9px] text-stone-300 font-bold uppercase tracking-widest">{review.date}</span>
      </div>
      {review.tags && (
        <div className="flex gap-1">
          {review.tags.slice(0, 1).map(tag => (
            <span key={tag} className="text-[8px] font-bold uppercase tracking-widest bg-green-50 text-green-600 px-2 py-0.5 rounded border border-green-100">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
    <p className="text-[11px] text-stone-600 font-light leading-relaxed italic">"{review.comment}"</p>
  </div>
);
