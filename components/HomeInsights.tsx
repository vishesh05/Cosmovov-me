
import React, { useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from './Icons';
import { BirthChartAnalysis, UserProfile } from '../types';
import { generateAIPathMilestones, generateModalInsight, generateLocalPredictions, PathEvent, LocalInsights } from '../services/predictionEngine';


interface HomeInsightsProps {
  analysis: BirthChartAnalysis;
  profile: UserProfile;
}

const getEventIcon = (type: PathEvent['type']) => {
  switch (type) {
    case 'peak': return <Icons.Star className="w-5 h-5 text-gold-500 fill-current" />;
    case 'marriage': return <Icons.Heart className="w-5 h-5 text-pink-500 fill-current" />;
    case 'child': return <Icons.Flower className="w-5 h-5 text-amber-500" />;
    case 'challenge': return <Icons.Lightning className="w-5 h-5 text-slate-500" />;
    case 'spiritual': return <Icons.MoonStar className="w-5 h-5 text-violet-500" />;
    default: return <Icons.ChevronRight className="w-5 h-5 text-stone-400" />;
  }
};

const getNodeStyles = (type: PathEvent['type'], isCurrent: boolean) => {
  let sizeClass = "w-[44px] h-[44px] -ml-[22px] -mt-[22px]";
  let colorClass = "bg-white border-stone-200 text-stone-700 shadow-stone-900/10";
  let glowClass = "";

  switch (type) {
    case 'peak':
      sizeClass = "w-[52px] h-[52px] -ml-[26px] -mt-[26px]";
      colorClass = "bg-[#F4C542] border-gold-200 text-gold-900 shadow-gold-500/30";
      glowClass = "animate-[pulse_3s_ease-in-out_infinite]";
      break;
    case 'marriage':
      sizeClass = "w-[44px] h-[44px] -ml-[22px] -mt-[22px]";
      colorClass = "bg-[#E8719A] border-pink-200 text-pink-900 shadow-pink-500/30";
      glowClass = "shadow-[0_0_15px_rgba(232,113,154,0.3)]";
      break;
    case 'child':
      sizeClass = "w-[44px] h-[44px] -ml-[22px] -mt-[22px]";
      colorClass = "bg-[#F4A142] border-amber-200 text-amber-900 shadow-amber-500/20";
      glowClass = "";
      break;
    case 'challenge':
      sizeClass = "w-[38px] h-[38px] -ml-[19px] -mt-[19px]";
      colorClass = "bg-[#6B7A99] border-slate-300 text-white shadow-slate-900/10";
      glowClass = "";
      break;
    case 'spiritual':
      sizeClass = "w-[44px] h-[44px] -ml-[22px] -mt-[22px]";
      colorClass = "bg-[#9B6FD4] border-violet-200 text-white shadow-violet-500/30";
      glowClass = "animate-[pulse_4s_ease-in-out_infinite]";
      break;
  }

  const base = `absolute rounded-full flex flex-col items-center justify-center border-[3px] shadow-lg transition-all duration-300 hover:scale-[1.15] active:scale-95 z-10`;
  const currentAnim = isCurrent ? "animate-[nodeBreathing_2s_ease-in-out_infinite] z-20" : "";
  
  return `${base} ${sizeClass} ${colorClass} ${glowClass} ${currentAnim}`;
};

const getEventColor = (type: PathEvent['type']) => {
  switch (type) {
    case 'peak': return 'bg-[#F4C542] border-gold-200 text-gold-900 shadow-gold-900/10';
    case 'marriage': return 'bg-[#E8719A] border-pink-200 text-pink-900 shadow-pink-900/10';
    case 'child': return 'bg-[#F4A142] border-amber-200 text-amber-900 shadow-amber-900/10';
    case 'challenge': return 'bg-[#6B7A99] border-slate-300 text-white shadow-stone-900/10';
    case 'spiritual': return 'bg-[#9B6FD4] border-violet-200 text-white shadow-indigo-900/10';
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

// --- Cache helpers ---
function getCacheKey(profile: UserProfile): string {
  return `cosmovoc_path_${profile.name}_${profile.date}_${profile.location}`;
}

function loadCachedInsights(profile: UserProfile): LocalInsights | null {
  try {
    const cached = localStorage.getItem(getCacheKey(profile));
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed.pathEvents && parsed.pathEvents.length >= 5) return parsed;
    }
  } catch { /* ignore */ }
  return null;
}

function saveCachedInsights(profile: UserProfile, insights: LocalInsights): void {
  try {
    localStorage.setItem(getCacheKey(profile), JSON.stringify(insights));
  } catch { /* ignore */ }
}

function getCurrentMahaDasha(dashas: any[]): { lord: string, endDate: string } {
    const now = new Date();
    for (const d of dashas) {
        if (new Date(d.startDate) <= now && new Date(d.endDate) >= now) {
            const y = d.endDate.split('-')[0];
            const startY = d.startDate.split('-')[0];
            return { lord: d.planet, endDate: `${startY}-${y}` };
        }
    }
    return { lord: 'Unknown', endDate: '' };
}

const HomeInsights: React.FC<HomeInsightsProps> = ({ analysis, profile }) => {
  const [insights, setInsights] = useState<LocalInsights | null>(null);
  const [isLoadingMilestones, setIsLoadingMilestones] = useState(true);
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | null>(null);
  const [modalInsightText, setModalInsightText] = useState<string | null>(null);
  const [isLoadingModal, setIsLoadingModal] = useState(false);

  const selectedEvent = selectedEventIndex !== null && insights ? insights.pathEvents[selectedEventIndex] : null;

  // Portal mount state
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load milestones (cached → AI → fallback)
  useEffect(() => {
    let cancelled = false;

    const loadMilestones = async () => {
      // 1. Try cache first for instant render
      const cached = loadCachedInsights(profile);
      if (cached) {
        setInsights(cached);
        setIsLoadingMilestones(false);
      }

      // 2. Call AI in background (will update if successful)
      try {
        const aiInsights = await generateAIPathMilestones(analysis, profile);
        if (!cancelled && aiInsights.pathEvents.length >= 5) {
          setInsights(aiInsights);
          saveCachedInsights(profile, aiInsights);
        }
      } catch {
        // If no cache either, use sync fallback
        if (!cancelled && !cached) {
          const fallback = generateLocalPredictions(analysis, profile);
          setInsights(fallback);
        }
      } finally {
        if (!cancelled) setIsLoadingMilestones(false);
      }
    };

    loadMilestones();
    return () => { cancelled = true; };
  }, [analysis, profile]);

  // Handle node tap → fetch modal insight
  const handleNodeTap = async (index: number) => {
    setSelectedEventIndex(index);
    setModalInsightText(null);

    if (!insights) return;
    const event = insights.pathEvents[index];

    setIsLoadingModal(true);
    try {
      const text = await generateModalInsight(event, analysis, profile);
      setModalInsightText(text);
    } catch {
      setModalInsightText(event.description);
    } finally {
      setIsLoadingModal(false);
    }
  };

  const handleCloseModal = () => {
    setSelectedEventIndex(null);
    setModalInsightText(null);
  };

  const navigateToChat = () => {
      if (selectedEvent) {
          localStorage.setItem('astroveda_chat_pre_prompt', `I'd like to ask about my upcoming ${selectedEvent.title} phase (ages ${selectedEvent.age}-${selectedEvent.endAge}).`);
          window.dispatchEvent(new CustomEvent('navigate_to_chat'));
      }
  };

  // Find Current Node Index
  const currentYear = new Date().getFullYear();
  let parsedYear = new Date(profile.date).getFullYear();
  if (isNaN(parsedYear)) parsedYear = currentYear - 25;
  const currentAge = currentYear - parsedYear;

  let activeIndex = insights?.pathEvents.findIndex(e => e.endAge >= currentAge);
  if (activeIndex === -1 && insights?.pathEvents) activeIndex = insights.pathEvents.length - 1;
  if (activeIndex === undefined) activeIndex = 0;

  const activeDasha = useMemo(() => getCurrentMahaDasha(analysis.dashas), [analysis]);

  return (
    <div className="animate-fade-in pb-10">
      <style>{`
        @keyframes nodeBreathing {
          0%, 100% { transform: scale(1.05); }
          50% { transform: scale(1.15); }
        }
      `}</style>
      {/* 1. Cosmic Insight Highlight */}
      <div className="bg-charcoal-900 rounded-[28px] p-6 text-ivory-50 shadow-2xl shadow-charcoal-900/20 mb-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-full blur-2xl -mr-10 -mt-10 transition-transform group-hover:scale-110 duration-700"></div>
        <div className="relative z-10">
          <div className="flex gap-2 items-center text-gold-400 mb-3 opacity-80 text-[10px] uppercase tracking-[0.2em] font-serif font-bold">
            <Icons.Sparkles className="w-3.5 h-3.5" />
            <span>Life Path & Destiny</span>
          </div>
          <p className="font-light text-lg leading-relaxed opacity-90 italic mb-4">
            "{insights?.cosmicInsight || 'Reading your cosmic blueprint...'}"
          </p>
          {activeDasha.lord !== 'Unknown' && (
              <div className="text-[10px] text-stone-400 font-medium tracking-wide uppercase">
                  Active Dasha: <span className="text-gold-400">{activeDasha.lord}</span> · {activeDasha.endDate}
              </div>
          )}
        </div>
      </div>



      {/* 2. Interactive Future Life Path (Game-Style Map) */}
      <div className="mb-6 text-center">
        <h3 className="text-2xl font-serif text-charcoal-900 mb-2">Your Timeline</h3>
        <p className="text-xs text-stone-500 font-medium">Map of karmic milestones. Tap to reveal.</p>
      </div>

      <div className="relative w-full h-[550px] mx-auto overflow-hidden">

        {/* SVG Connecting Snake Line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 100 100">
           <defs>
            <linearGradient id="pathGradient" x1="50%" y1="0%" x2="50%" y2="100%">
              <stop offset="0%" stopColor="#3A3A4A" />
              <stop offset="40%" stopColor="#F4C542" />
              <stop offset="100%" stopColor="#d4ba75" />
            </linearGradient>
          </defs>
          <path
            d="M 50 10 C 50 20, 80 20, 80 30 C 80 40, 20 40, 20 50 C 20 60, 80 60, 80 70 C 80 80, 50 80, 50 90"
            fill="none"
            stroke="url(#pathGradient)"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="4 8"
            className="opacity-70"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* Interactive Nodes OR Skeleton Placeholders */}
        {isLoadingMilestones ? (
          // Shimmer skeleton nodes
          PATH_POSITIONS.map((pos, index) => (
            <div
              key={index}
              className="absolute w-14 h-14 -ml-7 -mt-7 rounded-full bg-stone-100 border-[3px] border-stone-200 animate-pulse"
              style={{ left: pos.left, top: pos.top }}
            >
              <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-white/90 border border-stone-100 rounded-full px-4 py-0.5 w-16 h-4 animate-pulse"></div>
            </div>
          ))
        ) : (
          insights?.pathEvents.map((event, index) => {
            const pos = PATH_POSITIONS[index] || PATH_POSITIONS[0];
            const isCurrent = index === activeIndex;
            return (
              <div key={index} className="absolute flex flex-col items-center" style={{ left: pos.left, top: pos.top }}>
                  {isCurrent && (
                      <div className="absolute -top-[30px] whitespace-nowrap text-[8px] font-bold text-stone-400 bg-white/80 px-2 py-0.5 rounded-full border border-stone-200 tracking-wider">
                          YOU ARE HERE
                      </div>
                  )}
                  <button
                    onClick={() => handleNodeTap(index)}
                    className={getNodeStyles(event.type, isCurrent)}
                    style={{ animationDelay: `${0.1 * index}s` }}
                  >
                    {!['challenge', 'spiritual'].includes(event.type) && <div className="absolute inset-0 bg-white/30 rounded-full"></div>}
                    {getEventIcon(event.type)}
                  </button>
                  <div className="absolute w-32 flex flex-col items-center top-[10px] pointer-events-none">
                      <div className="bg-white/90 backdrop-blur-sm border border-stone-100 rounded-full px-2 py-0.5 text-[10px] font-bold text-stone-600 shadow-sm whitespace-nowrap mt-4">
                        Ages {event.age}-{event.endAge}
                      </div>
                      <div className="text-[10px] text-stone-500 font-medium text-center mt-1 leading-tight tracking-wide drop-shadow-sm">
                          {event.title}
                      </div>
                  </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Overlay for Event Details (Bottom Sheet on Mobile) */}
      {selectedEvent && mounted && createPortal(
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center bg-charcoal-900/60 backdrop-blur-md transition-opacity duration-300 animate-fade-in"
          onClick={handleCloseModal}
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
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-charcoal-900 transition-colors hidden sm:block"
            >
              <Icons.X className="w-5 h-5" />
            </button>

            <div className={`w-[60px] h-[60px] rounded-full flex items-center justify-center mb-4 mx-auto border-[3px] shadow-lg ${getEventColor(selectedEvent.type)}`}>
              <div className="scale-150 opacity-90">{getEventIcon(selectedEvent.type)}</div>
            </div>

            <div className="text-center mb-6">
              <h4 className="font-serif text-[28px] text-charcoal-900 leading-tight mb-2">
                {selectedEvent.title}
              </h4>
               {selectedEvent.dashaActive && (
                <div className="mb-4">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Active Dasha: </span>
                  <span className="text-xs font-bold text-charcoal-700 bg-stone-100 px-2 py-0.5 rounded-md">{selectedEvent.dashaActive}</span>
                </div>
              )}
              <div className="inline-flex items-center gap-3 px-4 py-2 bg-stone-50 rounded-xl border border-stone-100 text-sm font-medium whitespace-nowrap overflow-hidden shadow-sm mt-1">
                <span className="text-stone-500">{selectedEvent.year} - {selectedEvent.endYear}</span>
                <div className="w-1 h-1 flex-shrink-0 rounded-full bg-gold-400 opacity-50"></div>
                <span className="text-gold-600">Ages {selectedEvent.age}-{selectedEvent.endAge}</span>
              </div>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 bg-gradient-to-br from-gold-50/50 to-stone-50 rounded-2xl border border-gold-100 shadow-inner pointer-events-none"></div>
              <div className="relative text-[15px] text-stone-700 leading-relaxed text-center px-5 py-6 rounded-2xl min-h-[80px] flex items-center justify-center">
                {isLoadingModal ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-400" style={{ animation: 'softPulse 1.6s ease-in-out infinite' }}></span>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-400" style={{ animation: 'softPulse 1.6s ease-in-out 0.3s infinite' }}></span>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-gold-400" style={{ animation: 'softPulse 1.6s ease-in-out 0.6s infinite' }}></span>
                    </div>
                    <span className="text-[10px] text-stone-400 font-medium tracking-wide uppercase">Jyoti is reading this phase...</span>
                    <style>{`
                      @keyframes softPulse {
                        0%, 100% { opacity: 0.3; }
                        50% { opacity: 1; }
                      }
                    `}</style>
                  </div>
                ) : (
                  <p>{modalInsightText || selectedEvent.description}</p>
                )}
              </div>
            </div>

            <button
                onClick={navigateToChat}
                className="w-full mt-2 py-3 border border-stone-200 bg-stone-50 text-stone-600 rounded-2xl font-medium text-sm hover:bg-stone-100 transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Icons.Message className="w-4 h-4" /> Ask Jyoti about this phase
            </button>

            <button
              onClick={handleCloseModal}
              className="w-full mt-3 py-3.5 bg-charcoal-900 text-ivory-50 rounded-2xl font-semibold shadow-md active:scale-[0.98] transition-all"
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
