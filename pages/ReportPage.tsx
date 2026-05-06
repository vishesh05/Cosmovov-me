import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import ReportSection from '../components/reports/ReportSection';
import { ReportCacheService } from '../services/reportCacheService';
import ErrorBoundary from '../components/ErrorBoundary';
import { BirthChartAnalysis, UserProfile } from '../types';

import {
  generateLifeSectionCosmicIdentity,
  generateLifeSectionLifePath,
  generateLifeSectionStrengths,
  generateLifeSectionChallenges,
  generateLifeSectionDasha,
  generateLifeSectionKarmic,
  generateLifeSectionAdvice
} from '../services/reportGenerator';
import { calculateShadbala, ZODIAC_SIGNS, RASHI_LORDS } from '../services/astrologyEngine';

import { initYearlyReport, loadYearlyReportAI } from '../components/reports/builders/YearlyReportBuilder';
import { initKundliReport, loadKundliReportAI } from '../components/reports/builders/KundliReportBuilder';
import { initLoveReport, loadLoveReportAI } from '../components/reports/builders/LoveReportBuilder';
import { initCareerReport, loadCareerReportAI } from '../components/reports/builders/CareerReportBuilder';
import { initHealthReport, loadHealthReportAI } from '../components/reports/builders/HealthReportBuilder';

interface ReportPageProps {
  reportType: string;
  profile: UserProfile;
  analysis: BirthChartAnalysis;
  onBack: () => void;
}

const ReportPage: React.FC<ReportPageProps> = ({ reportType, profile, analysis, onBack }) => {
  const [sections, setSections] = useState<any[]>([]);
  const [isFullyLoaded, setIsFullyLoaded] = useState(false);
  const [cacheTimestamp, setCacheTimestamp] = useState<string | null>(null);

  const getReportTitle = () => {
    switch (reportType) {
      case 'life': return 'Life Report';
      case 'yearly': return 'Yearly Forecast';
      case 'kundli': return 'Birth Chart (Kundli)';
      case 'love': return 'Love & Compatibility';
      case 'career': return 'Career & Wealth';
      case 'health': return 'Health & Wellness';
      default: return 'Premium Report';
    }
  };

  const initLifeReport = () => {
    const ascendant = analysis?.planetaryDetails?.find?.(p => p.name === 'Ascendant')?.rashi || 'Aries';
    const moon = analysis?.planetaryDetails?.find?.(p => p.name === 'Moon')?.rashi || 'Aries';
    const sun = analysis?.planetaryDetails?.find?.(p => p.name === 'Sun')?.rashi || 'Aries';
    const atmakaraka = [...(analysis?.planetaryDetails || [])]
      .filter(p => !['Ascendant', 'Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto'].includes(p.name))
      .sort((a,b) => b.degreeInRashi - a.degreeInRashi)[0]?.name || 'Sun';

    const initialSections = [
      {
        id: 'cosmic_identity',
        title: 'Cosmic Identity',
        visualComponent: (() => {
            // Find dignities
            const dignities = analysis?.planetaryDetails?.filter(p => p.dignity === 'exalted' || p.dignity === 'debilitated' || p.rashi === RASHI_LORDS.find((_, i) => ZODIAC_SIGNS[i] === p.rashi)) || [];
            
            return (
              <div className="space-y-6">
                <div className="flex justify-between items-center text-center px-2">
                   <div><div className="w-12 h-12 mx-auto bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-3 shadow-sm border border-amber-100"><Icons.Sun className="w-5 h-5" /></div><p className="text-[11px] font-bold text-charcoal-700 uppercase tracking-wide">{sun} Sun</p></div>
                   <div><div className="w-12 h-12 mx-auto bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mb-3 shadow-sm border border-indigo-100"><Icons.Moon className="w-5 h-5" /></div><p className="text-[11px] font-bold text-charcoal-700 uppercase tracking-wide">{moon} Moon</p></div>
                   <div><div className="w-12 h-12 mx-auto bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mb-3 shadow-sm border border-rose-100"><Icons.Star className="w-5 h-5" /></div><p className="text-[11px] font-bold text-charcoal-700 uppercase tracking-wide">{ascendant} Rising</p></div>
                   <div><div className="w-12 h-12 mx-auto bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-3 shadow-sm border border-emerald-100"><Icons.User className="w-5 h-5" /></div><p className="text-[11px] font-bold text-charcoal-700 uppercase tracking-wide">{atmakaraka} Soul</p></div>
                </div>
                {dignities.length > 0 && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-100 mt-4 text-left">
                     <h4 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-2"><Icons.Sparkles className="w-3 h-3"/> Key Dignities</h4>
                     <div className="space-y-2">
                        {dignities.map((d, i) => (
                           <div key={i} className="flex justify-between items-center text-sm border-b border-amber-200/50 pb-1 last:border-0 last:pb-0">
                              <span className="font-bold text-charcoal-800">{d.name}</span>
                              <span className="text-amber-700 text-xs font-medium bg-amber-200/50 px-2 py-0.5 rounded">
                                 {d.dignity === 'exalted' ? 'Exalted (High Power)' : d.dignity === 'debilitated' ? 'Debilitated (Challenged)' : 'In Own Sign (Strong)'}
                              </span>
                           </div>
                        ))}
                     </div>
                  </div>
                )}
              </div>
            );
        })(),
        interpretationText: null,
        isLoading: true,
        type: 'text'
      },
      {
        id: 'life_path',
        title: 'Life Path & Purpose',
        visualComponent: null, // Visual handled by previous section implicitly
        interpretationText: null,
        isLoading: true,
        type: 'text'
      },
      {
        id: 'strengths',
        title: 'Your Strengths',
        visualComponent: (() => {
           let shadbalaUI = null;
           try {
             const shadbalaResults = calculateShadbala(analysis, profile);
             const sortedShadbala = [...shadbalaResults].sort((a,b) => b.total - a.total);
             
             shadbalaUI = (
               <div className="mb-6">
                 <h4 className="text-xs font-bold text-charcoal-600 uppercase tracking-widest text-center mb-4">Planetary Power Breakdown (Shadbala)</h4>
                 <div className="space-y-3">
                     {sortedShadbala.map((sb, idx) => {
                        const percentage = Math.min(100, Math.round((sb.total / 600) * 100));
                        return (
                          <div key={idx} className="bg-stone-50 rounded-xl p-3 border border-stone-100 flex items-center justify-between gap-4">
                             <div className="w-16 text-xs font-bold text-charcoal-800">{sb.planet}</div>
                             <div className="flex-1 h-2 bg-stone-200 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: `${percentage}%` }}></div>
                             </div>
                             <div className="w-12 text-right text-xs font-bold text-emerald-600">{Math.round(sb.total)}</div>
                          </div>
                        )
                     })}
                 </div>
               </div>
             );
           } catch(e) { }
           return shadbalaUI;
        })(),
        interpretationText: null,
        isLoading: true,
        type: 'toons',
        renderToons: (data: any[]) => (
          <div className="space-y-4">
            {data.map((item, idx) => (
              <div key={idx} className="bg-emerald-50 p-4 rounded-xl flex gap-4 items-start border border-emerald-100 shadow-sm">
                 <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-emerald-200"><Icons.Star className="w-4 h-4" /></div>
                 <div>
                   <h4 className="font-bold text-charcoal-800 text-sm mb-1">{item.strengthTitle} ({item.planetName})</h4>
                   <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
                 </div>
              </div>
            ))}
          </div>
        )
      },
      {
        id: 'challenges',
        title: 'Challenges & Growth',
        visualComponent: null,
        interpretationText: null,
        isLoading: true,
        type: 'toons',
        renderToons: (data: any[]) => (
          <div className="space-y-4">
            {data.map((item, idx) => (
              <div key={idx} className="bg-rose-50 p-4 rounded-xl flex gap-4 items-start border border-rose-100 shadow-sm">
                 <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-500 flex items-center justify-center flex-shrink-0 mt-0.5 border border-rose-200"><Icons.Activity className="w-4 h-4" /></div>
                 <div>
                   <h4 className="font-bold text-charcoal-800 text-sm mb-1">{item.challengeTitle} ({item.planetName})</h4>
                   <p className="text-xs text-stone-600 leading-relaxed">{item.description}</p>
                 </div>
              </div>
            ))}
          </div>
        )
      },
      {
        id: 'dasha',
        title: 'Current Dasha Era',
        visualComponent: (
            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
                <div className="absolute -right-12 -top-12 w-48 h-48 text-indigo-400 opacity-[0.06] rotate-45 pointer-events-none">
                    <Icons.MandalaBackground />
                </div>
                <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-2">Current Major Period</p>
                <div className="flex items-end gap-3 relative z-10">
                   <h3 className="text-3xl font-serif text-indigo-700 tracking-wide">{analysis?.dashas?.[0]?.planet || 'Jupiter'}</h3>
                   <span className="text-stone-500 text-sm mb-1.5 font-medium">Mahadasha</span>
                </div>
            </div>
        ),
        interpretationText: null,
        isLoading: true,
        type: 'text'
      },
      {
        id: 'karmic',
        title: 'Karmic Lessons',
        visualComponent: null,
        interpretationText: null,
        isLoading: true,
        type: 'text'
      },
      {
        id: 'advice',
        title: 'Life Advice',
        visualComponent: null,
        interpretationText: null,
        isLoading: true,
        type: 'text'
      }
    ];

    setSections(initialSections);
    return { initialSections, ascendant, moon, sun, atmakaraka };
  };

  const loadLifeReportAI = async (configData: any) => {
    const { ascendant, moon, sun, atmakaraka } = configData;
    
    // Sequential execution wrapper
    const runSection = async (id: string, fetchFn: () => Promise<any>) => {
      try {
        const text = await fetchFn();
        setSections(prev => prev.map(s => s.id === id ? { ...s, interpretationText: text, isLoading: false } : s));
      } catch (err) {
        setSections(prev => prev.map(s => s.id === id ? { ...s, interpretationText: "Interpretation temporarily unavailable.", isLoading: false } : s));
      }
    };

    // Run sequentially
    await runSection('cosmic_identity', () => generateLifeSectionCosmicIdentity(ascendant, moon, sun, atmakaraka));
    
    const ascLordHouse = '1st';
    const ninthHouseSign = 'Sagittarius';
    const ninthLordHouse = '9th';
    await runSection('life_path', () => generateLifeSectionLifePath(ascLordHouse, ninthHouseSign, ninthLordHouse, atmakaraka));
    
    const topPlanets = [{name: 'Jupiter', score: 32}, {name: 'Venus', score: 30}, {name: 'Mercury', score: 28}];
    await runSection('strengths', () => generateLifeSectionStrengths(topPlanets));

    const bottomPlanets = [{name: 'Saturn', score: 20}, {name: 'Mars', score: 21}];
    await runSection('challenges', () => generateLifeSectionChallenges(bottomPlanets));

    await runSection('dasha', () => generateLifeSectionDasha('Jupiter', 'Saturn', '2028-05-10'));
    await runSection('karmic', () => generateLifeSectionKarmic('Aries', 1, 'Libra', 7));
    await runSection('advice', () => generateLifeSectionAdvice(ascendant, 'Jupiter', '11th', '6th'));

  };

  const executeInitAndLoad = async () => {
      let configData: any;
      let initializer: any;
      let loader: any;

      switch(reportType) {
         case 'life':
           initializer = () => initLifeReport();
           loader = loadLifeReportAI;
           break;
         case 'yearly':
           initializer = () => {
              const res = initYearlyReport(analysis, profile);
              setSections(res.initialSections);
              return res;
           };
           loader = loadYearlyReportAI;
           break;
         case 'kundli':
           initializer = () => {
              const res = initKundliReport(analysis, profile);
              setSections(res.initialSections);
              return res;
           };
           loader = loadKundliReportAI;
           break;
         case 'love':
           initializer = () => {
              const res = initLoveReport(analysis, profile);
              setSections(res.initialSections);
              return res;
           };
           loader = loadLoveReportAI;
           break;
         case 'career':
           initializer = () => {
              const res = initCareerReport(analysis, profile);
              setSections(res.initialSections);
              return res;
           };
           loader = loadCareerReportAI;
           break;
         case 'health':
           initializer = () => {
              const res = initHealthReport(analysis, profile);
              setSections(res.initialSections);
              return res;
           };
           loader = loadHealthReportAI;
           break;
         default:
           setSections([{ id: 'placeholder', title: 'Coming Soon', visualComponent: null, interpretationText: 'This report is being built.', isLoading: false }]);
           setIsFullyLoaded(true);
           return;
      }

      configData = initializer();
      
      const userId = `${profile.name}_${profile.date}`.replace(/\s+/g, '');
      const cached = ReportCacheService.get(reportType, userId);

      if (cached) {
         const texts = cached.texts || {};
         // Graceful fallback for older cache formats that saved the full sections array
         if (cached.sections && !cached.texts) {
            cached.sections.forEach((s: any) => { texts[s.id] = s.interpretationText; });
         }

         const restoredSections = configData.initialSections.map((sec: any) => ({
             ...sec,
             interpretationText: texts[sec.id] || sec.interpretationText,
             isLoading: false
         }));
         setSections(restoredSections);
         setCacheTimestamp(cached.timestamp);
         setIsFullyLoaded(true);
      } else {
         await loader(configData, setSections);
         setIsFullyLoaded(true);
      }
  };

  useEffect(() => {
    setIsFullyLoaded(false);
    setCacheTimestamp(null);
    executeInitAndLoad();
  }, [reportType, profile, analysis]);

  // Save to cache when fully loaded
  useEffect(() => {
    if (isFullyLoaded && sections.length > 0 && sections[0].id !== 'placeholder') {
      const userId = `${profile.name}_${profile.date}`.replace(/\s+/g, '');
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (!cacheTimestamp) {
         // Only serialize text, do NOT cache React components or functions
         const texts: Record<string, any> = {};
         sections.forEach(sec => {
            if (sec.interpretationText) {
               texts[sec.id] = sec.interpretationText;
            }
         });
         ReportCacheService.set(reportType, userId, { texts, timestamp });
         setCacheTimestamp(timestamp);
      }
    }
  }, [isFullyLoaded]);

  const handleRefresh = () => {
     const userId = `${profile.name}_${profile.date}`.replace(/\s+/g, '');
     ReportCacheService.clear(reportType, userId);
     setCacheTimestamp(null);
     setIsFullyLoaded(false);
     executeInitAndLoad();
  };

  return (
    <ErrorBoundary>
      <div className="flex-1 overflow-y-auto relative bg-stone-50 animate-[fadeInScale_0.6s_ease-out] text-charcoal-900">
        
        {/* Header */}
        <div className="sticky top-0 z-40 px-6 py-4 flex items-center justify-between bg-white/90 backdrop-blur-md border-b border-stone-200 shadow-sm">
           <button onClick={onBack} className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-charcoal-700 border border-stone-200 hover:bg-stone-200 active:scale-95 transition-all">
             <Icons.ChevronLeft />
           </button>
           <div className="text-center">
              <h1 className="font-serif text-charcoal-900 font-bold text-lg tracking-wide">{getReportTitle()}</h1>
              <p className="text-[10px] uppercase tracking-widest text-amber-600 font-bold">Premium Edition</p>
           </div>
           <button onClick={handleRefresh} className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-charcoal-700 border border-stone-200 hover:bg-stone-200 active:scale-95 transition-all">
             <Icons.RefreshCcw className="w-4 h-4" />
           </button>
        </div>

        {/* Hero Banner Area */}
        <div className="relative pt-10 pb-10 px-6 bg-gradient-to-b from-white to-stone-50 border-b border-stone-100 overflow-hidden">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] text-amber-500 opacity-[0.06] transform translate-x-1/4 -translate-y-1/4 pointer-events-none">
                <Icons.MandalaBackground />
            </div>
            <div className="absolute bottom-0 left-0 w-64 h-64 text-amber-500 opacity-[0.04] transform -translate-x-1/3 translate-y-1/3 pointer-events-none">
                <Icons.MandalaBackground />
            </div>
            <div className="flex flex-col items-center text-center relative z-10 max-w-2xl mx-auto">
               <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-6 border border-amber-200 shadow-sm">
                  <Icons.Sparkles className="w-10 h-10 text-amber-500" />
               </div>
               <h2 className="text-3xl font-serif text-charcoal-900 mb-4 tracking-wide leading-tight">Sacred Astrological<br/><span className="text-amber-600">Reading</span></h2>
               <p className="text-stone-500 text-[15px] max-w-sm mb-6 leading-[1.8] font-medium">
                 A deeply authentic and spiritual analysis drawn from ancient Vedic principles, formulated exclusively for {profile.name}.
               </p>
               {cacheTimestamp && (
                  <div className="px-5 py-2.5 bg-emerald-50 rounded-full border border-emerald-200 text-[11px] font-bold tracking-wide text-emerald-700 shadow-sm flex items-center gap-2">
                     <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                     Generated today at {cacheTimestamp}
                  </div>
               )}
            </div>
        </div>

        <div className="p-6 pb-24 max-w-2xl mx-auto relative z-10 mt-2">
          {/* Sections */}
          {sections.map(sec => (
            <ReportSection
              key={sec.id}
              title={sec.title}
              visualComponent={sec.visualComponent}
              interpretationText={sec.interpretationText}
              isLoading={sec.isLoading}
              type={sec.type}
              renderToons={sec.renderToons}
            />
          ))}

          {/* Footers / CTA */}
          {isFullyLoaded && (
            <div className="mt-12 flex flex-col gap-4">
               <button className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-95 transition-all text-[15px]">
                  <Icons.Download className="w-5 h-5" /> Save Beautiful Manuscript
               </button>
               <button className="w-full py-4 bg-white border border-stone-200 text-charcoal-800 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-stone-50 active:scale-95 transition-all text-[15px]">
                  <Icons.Share2 className="w-5 h-5" /> Share Sacred Insight
               </button>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default ReportPage;
