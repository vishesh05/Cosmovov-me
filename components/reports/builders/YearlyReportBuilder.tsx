import React from 'react';
import { Icons } from '../../Icons';
import { BirthChartAnalysis, UserProfile } from '../../../types';
import {
  generateYearlySectionOverview,
  generateYearlySectionTransits,
  generateYearlySectionMonths,
  generateYearlySectionAuspiciousDates,
  generateYearlySectionRemedies
} from '../../../services/reportGenerator';
import { calculateCurrentPlanets, ZODIAC_SIGNS } from '../../../services/astrologyEngine';

export const initYearlyReport = (analysis: BirthChartAnalysis, profile: UserProfile) => {
  const currentYear = new Date().getFullYear();
  const mahadasha = analysis?.dashas?.[0]?.planet || 'Jupiter';
  
  // Calculate Jupiter and Saturn transits (Mock logic since actual transit engine might not be complete)
  // We'll extract basic info available from the analysis or mock it if unavailable.
  const moonSign = analysis?.planetaryDetails?.find?.(p => p.name === 'Moon')?.rashi || 'Aries';
  const ascSign = analysis?.planetaryDetails?.find?.(p => p.name === 'Ascendant')?.rashi || 'Aries';

  const initialSections = [
    {
      id: 'year_overview',
      title: 'Year Overview',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'text'
    },
    {
      id: 'transits',
      title: 'Jupiter & Saturn Transit Impact',
      visualComponent: (() => {
         // Live transit calculation
         let jupiterSign = 'Taurus';
         let saturnSign = 'Pisces';
         let jupHouseFromAsc = 0;
         let satHouseFromAsc = 0;
         try {
            const currentPlanets = calculateCurrentPlanets(new Date());
            const jup = currentPlanets.find(p => p.name === 'Jupiter');
            const sat = currentPlanets.find(p => p.name === 'Saturn');
            if (jup) jupiterSign = jup.rashi;
            if (sat) saturnSign = sat.rashi;
            const ascIdx = ZODIAC_SIGNS.indexOf(ascSign);
            const jupIdx = ZODIAC_SIGNS.indexOf(jupiterSign);
            const satIdx = ZODIAC_SIGNS.indexOf(saturnSign);
            jupHouseFromAsc = ascIdx >= 0 && jupIdx >= 0 ? ((jupIdx - ascIdx + 12) % 12) + 1 : 0;
            satHouseFromAsc = ascIdx >= 0 && satIdx >= 0 ? ((satIdx - ascIdx + 12) % 12) + 1 : 0;
         } catch(e) { }

         return (
            <div className="space-y-4">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 flex flex-col items-center text-center shadow-sm">
                     <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mb-3 font-serif font-bold text-2xl shadow-sm border border-amber-200">♃</div>
                     <h4 className="font-bold text-charcoal-800 text-[15px]">Jupiter Transit</h4>
                     <p className="text-xs text-amber-700 mt-1 font-bold">{jupiterSign}</p>
                     {jupHouseFromAsc > 0 && <p className="text-[10px] mt-2 text-stone-500 font-medium">In your <span className="font-bold text-amber-700">{jupHouseFromAsc}{jupHouseFromAsc === 1 ? 'st' : jupHouseFromAsc === 2 ? 'nd' : jupHouseFromAsc === 3 ? 'rd' : 'th'}</span> House</p>}
                  </div>
                  <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 flex flex-col items-center text-center shadow-sm">
                     <div className="w-12 h-12 bg-stone-100 text-stone-600 rounded-full flex items-center justify-center mb-3 font-serif font-bold text-2xl shadow-sm border border-stone-200">♄</div>
                     <h4 className="font-bold text-charcoal-800 text-[15px]">Saturn Transit</h4>
                     <p className="text-xs text-stone-600 mt-1 font-bold">{saturnSign}</p>
                     {satHouseFromAsc > 0 && <p className="text-[10px] mt-2 text-stone-500 font-medium">In your <span className="font-bold text-stone-700">{satHouseFromAsc}{satHouseFromAsc === 1 ? 'st' : satHouseFromAsc === 2 ? 'nd' : satHouseFromAsc === 3 ? 'rd' : 'th'}</span> House</p>}
                  </div>
               </div>
               <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 text-center">
                  <p className="text-[10px] text-stone-400 font-medium">Transit positions calculated for today's date</p>
               </div>
            </div>
         );
      })(),
      interpretationText: null,
      isLoading: true,
      type: 'toons',
      renderToons: (data: any[]) => (
         <div className="space-y-4">
            {data.map((item, idx) => (
              <div key={idx} className="bg-white p-6 rounded-2xl border border-stone-100 shadow-sm relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-1 h-full bg-amber-400" />
                 <h4 className="font-serif font-bold text-charcoal-800 text-[15px] mb-2 uppercase tracking-wide">{item.planet} Impact</h4>
                 <p className="text-[15px] text-stone-600 leading-[1.8] font-medium">{item.impact}</p>
              </div>
            ))}
         </div>
      )
    },
    {
      id: 'dasha_timeline',
      title: 'Active Dasha Period',
      visualComponent: (() => {
         const dashas = (analysis?.dashas || []) as any[];
         const currentDasha = dashas[0] as any;
         const nextDasha = dashas[1] as any;
         if (!currentDasha) return null;

         // Calculate progress through current Mahadasha
         const startDate = currentDasha.startDate ? new Date(currentDasha.startDate) : new Date();
         const endDate = currentDasha.endDate ? new Date(currentDasha.endDate) : new Date(Date.now() + 365*24*60*60*1000*7);
         const now = new Date();
         const totalMs = endDate.getTime() - startDate.getTime();
         const elapsedMs = now.getTime() - startDate.getTime();
         const progress = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));
         const yearsRemaining = Math.max(0, Math.round((endDate.getTime() - now.getTime()) / (365.25*24*60*60*1000) * 10) / 10);

         return (
            <div className="space-y-4">
               <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                     <p className="text-[10px] text-indigo-500 uppercase tracking-widest font-bold">Current Mahadasha</p>
                     <span className="text-[10px] text-stone-400 font-medium">{progress}% complete</span>
                  </div>
                  <h3 className="text-2xl font-serif text-indigo-700 font-bold tracking-wide mb-3">{currentDasha.planet}</h3>
                  <div className="w-full h-2.5 bg-indigo-200 rounded-full overflow-hidden">
                     <div className="h-full bg-gradient-to-r from-indigo-400 to-indigo-600 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
                  </div>
                  <p className="text-xs text-stone-500 mt-2">~{yearsRemaining} years remaining</p>
               </div>
               {currentDasha.subDashas && currentDasha.subDashas.length > 0 && (
                  <div className="bg-white rounded-xl p-4 border border-stone-100 shadow-sm">
                     <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-3">Active Antardasha (Sub-Period)</p>
                     <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-charcoal-800">{currentDasha.subDashas[0]?.planet || 'N/A'}</span>
                        <span className="text-[10px] text-stone-400">→</span>
                        {currentDasha.subDashas.slice(1, 4).map((sd: any, i: number) => (
                           <span key={i} className="text-xs text-stone-500 bg-stone-50 px-2 py-0.5 rounded border border-stone-100">{sd.planet}</span>
                        ))}
                     </div>
                  </div>
               )}
               {nextDasha && (
                  <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 text-center">
                     <p className="text-[10px] text-stone-400 font-medium">Next Mahadasha: <span className="font-bold text-charcoal-700">{nextDasha.planet}</span></p>
                  </div>
               )}
            </div>
         );
      })(),
      interpretationText: null,
      isLoading: false,
      type: 'text'
    },
    {
      id: 'monthly',
      title: 'Month by Month Forecast',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'toons',
      renderToons: (data: any[]) => {
         return (
           <div className="space-y-3">
             {data.map((item, idx) => (
               <details key={idx} className="group bg-white border border-stone-100 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden shadow-sm">
                 <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-stone-50 transition-colors">
                   <div className="flex items-center gap-4">
                     <span className="font-serif font-bold text-charcoal-800 w-24 tracking-wide">{item.month}</span>
                     <div className="flex gap-1">
                        {[1,2,3,4,5].map(star => (
                           <span key={star}>
                             <Icons.Star className={`w-3 h-3 ${star <= parseInt(item.rating) ? 'text-amber-500 fill-amber-500' : 'text-stone-300'}`} />
                           </span>
                        ))}
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 bg-amber-50 px-2 py-1 rounded border border-amber-100">{item.theme}</span>
                      <Icons.ChevronDown className="w-4 h-4 text-stone-400 group-open:rotate-180 transition-transform" />
                   </div>
                 </summary>
                 <div className="p-4 pt-0 text-[14px] font-medium text-stone-600 border-t border-stone-100 bg-stone-50 leading-[1.8]">
                    {item.forecast}
                 </div>
               </details>
             ))}
           </div>
         );
      }
    },
    {
      id: 'auspicious_dates',
      title: 'Key Auspicious Dates',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'toons',
      renderToons: (data: any[]) => (
         <div className="grid grid-cols-2 gap-3">
            {data.map((item, idx) => (
              <div key={idx} className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl shadow-sm text-center sm:text-left">
                 <p className="text-emerald-700 font-serif font-bold text-[15px] mb-1">{item.date}</p>
                 <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 mb-2">{item.activity}</p>
                 <p className="text-[13px] text-stone-600 leading-relaxed font-medium">{item.reason}</p>
              </div>
            ))}
         </div>
      )
    },
    {
      id: 'remedies',
      title: 'Yearly Remedies',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'toons',
      renderToons: (data: any[]) => (
         <div className="space-y-3">
            {data.map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start bg-white p-5 rounded-2xl border border-stone-100 hover:shadow-md transition-all shadow-sm">
                 <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 mt-0.5 border border-amber-100"><Icons.Sparkles className="w-5 h-5" /></div>
                 <div>
                   <p className="font-serif font-bold text-[15px] text-charcoal-800 mb-1">{item.remedy}</p>
                   <p className="text-[14px] tracking-wide text-stone-600 leading-[1.6] font-medium">{item.instruction}</p>
                 </div>
              </div>
            ))}
         </div>
      )
    }
  ];

  return { initialSections, currentYear, mahadasha, moonSign, ascSign };
};

export const loadYearlyReportAI = async (configData: any, setSections: any) => {
  const { currentYear, mahadasha, moonSign, ascSign } = configData;
  
  const runSection = async (id: string, fetchFn: () => Promise<any>) => {
    try {
      const text = await fetchFn();
      setSections((prev: any[]) => prev.map(s => s.id === id ? { ...s, interpretationText: text, isLoading: false } : s));
    } catch (err) {
      console.error(`Failed to load section ${id}`, err);
      setSections((prev: any[]) => prev.map(s => s.id === id ? { ...s, interpretationText: "Interpretation temporarily unavailable.", isLoading: false } : s));
    }
  };

  // Mocks for now, this would normally connect to a transit engine
  const jupTransitionHouse = 5;
  const satTransitionHouse = 11;

  await runSection('year_overview', () => generateYearlySectionOverview(currentYear, mahadasha, jupTransitionHouse, satTransitionHouse));
  await runSection('transits', () => generateYearlySectionTransits(jupTransitionHouse, 9, satTransitionHouse, 3));
  
  const dashaChanges = "Saturn Antardasha ends in October";
  await runSection('monthly', () => generateYearlySectionMonths(currentYear, moonSign, mahadasha, dashaChanges));
  
  await runSection('auspicious_dates', () => generateYearlySectionAuspiciousDates(currentYear, moonSign, ascSign, mahadasha));
  
  await runSection('remedies', () => generateYearlySectionRemedies(jupTransitionHouse, satTransitionHouse, mahadasha));
};
