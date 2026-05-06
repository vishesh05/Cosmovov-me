
import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from './Icons';
import { BirthChartAnalysis, UserProfile } from '../types';
import { generateLocalPredictions, PathEvent } from '../services/predictionEngine';


interface HomeInsightsProps {
  analysis: BirthChartAnalysis;
  profile: UserProfile;
}

const getEventIcon = (type: PathEvent['type']) => {
  switch (type) {
    case 'peak': return <Icons.Star className="w-5 h-5 text-gold-500 fill-current" />;
    case 'marriage': return <Icons.Heart className="w-5 h-5 text-pink-500 fill-current" />;
    case 'child': return <Icons.Sun className="w-5 h-5 text-amber-500" />;
    case 'challenge': return <Icons.Activity className="w-5 h-5 text-charcoal-400" />;
    case 'career': return <Icons.Briefcase className="w-5 h-5 text-indigo-500 fill-current" />;
    default: return <Icons.ChevronRight className="w-5 h-5 text-stone-400" />;
  }
};

const getEventColor = (type: PathEvent['type']) => {
  switch (type) {
    case 'peak': return 'bg-gold-50 border-gold-200 text-gold-700 shadow-gold-900/10';
    case 'marriage': return 'bg-pink-50 border-pink-200 text-pink-700 shadow-pink-900/10';
    case 'child': return 'bg-amber-50 border-amber-200 text-amber-700 shadow-amber-900/10';
    case 'challenge': return 'bg-stone-100 border-stone-300 text-stone-700 shadow-stone-900/10';
    case 'career': return 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-indigo-900/10';
    default: return 'bg-white border-stone-200 text-stone-700 shadow-stone-900/10';
  }
};

// Anchor coordinates for the 5 events
const PATH_POSITIONS = [
  { left: '50%', top: '10%' },
  { left: '80%', top: '30%' },
  { left: '20%', top: '50%' },
  { left: '80%', top: '70%' },
  { left: '50%', top: '90%' }
];

const HomeInsights: React.FC<HomeInsightsProps> = ({ analysis, profile }) => {
  const insights = useMemo(() => generateLocalPredictions(analysis, profile), [analysis, profile]);
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);


  const selectedEvent = selectedEventIndex !== null ? insights.pathEvents[selectedEventIndex] : null;

  // Render modal in portal to break out of z-index/transform stacking context 
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="animate-fade-in pb-10">

      {/* 1. Cosmic Insight Highlight */}
      <div className="bg-charcoal-900 rounded-[28px] p-6 text-ivory-50 shadow-2xl shadow-charcoal-900/20 mb-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-700"></div>
        <div className="relative z-10">
          <div className="flex gap-2 items-center text-gold-400 mb-3 opacity-80 text-[10px] uppercase tracking-[0.2em] font-serif font-bold">
            <Icons.Sparkles className="w-3.5 h-3.5" />
            <span>Life Path & Destiny</span>
          </div>
          <p className="font-light text-lg leading-relaxed opacity-90 italic">
            "{insights.cosmicInsight}"
          </p>
        </div>
      </div>



      {/* 2. Interactive Future Life Path (Game-Style Map) */}
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-serif text-charcoal-900 mb-2">Your Timeline</h3>
        <p className="text-xs text-stone-500 font-medium">Map of karmic milestones. Tap to reveal.</p>
      </div>

      <div className="relative w-full h-[450px] mx-auto overflow-hidden">

        {/* SVG Connecting Snake Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
          <path
            d="M 50 10 C 50 20, 80 20, 80 30 C 80 40, 20 40, 20 50 C 20 60, 80 60, 80 70 C 80 80, 50 80, 50 90"
            fill="none"
            stroke="#d4ba75"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 6"
            className="opacity-60"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Interactive Nodes */}
        {insights.pathEvents.map((event, index) => {
          const pos = PATH_POSITIONS[index] || PATH_POSITIONS[0];
          return (
            <button
              key={index}
              onClick={() => setSelectedEventIndex(index)}
              className={`absolute w-14 h-14 -ml-7 -mt-7 rounded-full flex flex-col items-center justify-center border-[3px] shadow-lg transition-transform duration-300 hover:scale-110 active:scale-95 z-10 ${getEventColor(event.type)} animate-fade-in`}
              style={{ left: pos.left, top: pos.top, animationDelay: `${0.1 * index}s` }}
            >
              {getEventIcon(event.type)}
              {/* Optional little age badge below the node */}
              <div className="absolute -bottom-6 bg-white/90 backdrop-blur-sm border border-stone-100 rounded-full px-2 py-0.5 text-[10px] font-bold text-stone-600 shadow-sm whitespace-nowrap">
                {event.isPast ? (
                  <span className="flex items-center gap-1 text-emerald-600">
                    <Icons.Check className="w-2.5 h-2.5" /> Age {event.age}
                  </span>
                ) : `Ages ${event.age}-${event.endAge}`}
              </div>
              {event.isPast && (
                <div className="absolute -top-2 -right-2 bg-emerald-500 text-white rounded-full p-1 shadow-md border border-white">
                  <Icons.Check className="w-2.5 h-2.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Modal Overlay for Event Details (Bottom Sheet on Mobile) */}
      {selectedEvent && mounted && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-charcoal-900/60 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
          onClick={() => setSelectedEventIndex(null)}
        >
          <div
            className="bg-white w-full max-w-sm p-6 shadow-2xl relative transition-transform duration-300 rounded-t-3xl sm:rounded-3xl animate-[slide-up_0.3s_ease-out_forwards]"
            onClick={e => e.stopPropagation()}
            style={{ animationName: 'slideUp' }}
          >
            <style>
              {`
                @keyframes slideUp {
                  from { transform: translateY(100%); opacity: 0; }
                  to { transform: translateY(0); opacity: 1; }
                }
              `}
            </style>

            <div className="w-12 h-1.5 bg-stone-200 rounded-full mx-auto mb-6 sm:hidden"></div>

            <button
              onClick={() => setSelectedEventIndex(null)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-charcoal-900 transition-colors hidden sm:block"
            >
              <Icons.X className="w-5 h-5" />
            </button>

            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto border-[3px] shadow-sm ${getEventColor(selectedEvent.type)}`}>
              {getEventIcon(selectedEvent.type)}
            </div>

            <div className="text-center mb-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Icons.Sparkles className="w-3.5 h-3.5 text-gold-400 opacity-70" />
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.2em]">Cosmic Potential</span>
                <Icons.Sparkles className="w-3.5 h-3.5 text-gold-400 opacity-70" />
              </div>
              <h4 className="font-serif text-2xl text-charcoal-900 leading-tight mb-3">
                {selectedEvent.title}
              </h4>
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-stone-50 rounded-xl border border-stone-100 text-sm font-medium whitespace-nowrap overflow-hidden shadow-sm">
                <span className="text-stone-500">{selectedEvent.year}</span>
                <div className="w-1 h-1 flex-shrink-0 rounded-full bg-gold-400 opacity-50"></div>
                <span className={selectedEvent.isPast ? 'text-emerald-600' : 'text-gold-600'}>
                  {selectedEvent.isPast ? 'Verified Milestone' : `Ages ${selectedEvent.age}-${selectedEvent.endAge}`}
                </span>
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-gold-50/50 to-stone-50 rounded-2xl border border-gold-100 shadow-inner pointer-events-none"></div>
              <p className="relative text-sm text-stone-700 leading-relaxed text-center px-5 py-6 rounded-2xl">
                {selectedEvent.description}
              </p>
            </div>

            <div className="mb-2 text-center px-2">
              <p className="text-[10px] text-stone-400 leading-relaxed italic opacity-80">
                * The cosmos reveals potentials, not absolutes. This window highlights a highly probable manifestation subject to individual karma.
              </p>
            </div>

            <button
              onClick={() => setSelectedEventIndex(null)}
              className="w-full mt-6 py-3.5 bg-charcoal-900 text-ivory-50 rounded-2xl font-semibold shadow-md active:scale-[0.98] transition-all"
            >
              Close Insight
            </button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default HomeInsights;
