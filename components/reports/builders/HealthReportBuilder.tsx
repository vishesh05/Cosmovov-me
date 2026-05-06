import React from 'react';
import { Icons } from '../../Icons';
import { BirthChartAnalysis, UserProfile } from '../../../types';
import {
  generateHealthSectionVitality,
  generateHealthSectionStrengths,
  generateHealthSectionChallenges,
  generateHealthSectionCurrentPeriod,
  generateHealthSectionMind,
  generateHealthSectionLifestyle,
  generateHealthSectionRemedies
} from '../../../services/reportGenerator';
import { ZODIAC_SIGNS, RASHI_LORDS } from '../../../services/astrologyEngine';

export const initHealthReport = (analysis: BirthChartAnalysis, profile: UserProfile) => {
  const asc = analysis?.planetaryDetails?.find?.(p => p.name === 'Ascendant');
  const dasha = analysis?.dashas?.[0]?.planet || 'Venus';

  // Calculate Health Signifiers
  const ascRashi = asc?.rashi || 'Aries';
  const ascIdx = ZODIAC_SIGNS.indexOf(ascRashi);
  const ascLord = RASHI_LORDS[ascIdx] || 'Mars';
  const ascLordPlanet = analysis?.planetaryDetails?.find?.(p => p.name === ascLord);
  const sixthHouseSign = ZODIAC_SIGNS[(ascIdx + 5) % 12];
  const sixthLord = RASHI_LORDS[ZODIAC_SIGNS.indexOf(sixthHouseSign)];
  const sixthLordPlanet = analysis?.planetaryDetails?.find?.(p => p.name === sixthLord);
  const sunPlanet = analysis?.planetaryDetails?.find?.(p => p.name === 'Sun');
  
  const initialSections = [
    {
      id: 'health_signifiers',
      title: 'Vitality Signifiers',
      visualComponent: (
         <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
               <div className="bg-sky-50 rounded-2xl p-4 border border-sky-100 text-center shadow-sm">
                  <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-sky-200"><Icons.Activity className="w-4 h-4" /></div>
                  <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold mb-1">Asc Lord</p>
                  <p className="font-bold text-charcoal-800 text-sm">{ascLord}</p>
                  <p className="text-[9px] text-stone-500">{ascLordPlanet?.rashi || '—'}</p>
               </div>
               <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100 text-center shadow-sm">
                  <div className="w-10 h-10 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-rose-200"><Icons.Heart className="w-4 h-4" /></div>
                  <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold mb-1">6th Lord</p>
                  <p className="font-bold text-charcoal-800 text-sm">{sixthLord}</p>
                  <p className="text-[9px] text-stone-500">{sixthLordPlanet?.rashi || '—'}</p>
               </div>
               <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center shadow-sm">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-amber-200"><Icons.Sun className="w-4 h-4" /></div>
                  <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold mb-1">Sun (Vitality)</p>
                  <p className="font-bold text-charcoal-800 text-sm">{sunPlanet?.rashi || 'N/A'}</p>
                  <p className="text-[9px] text-stone-500">Vitality Indicator</p>
               </div>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 text-center">
               <p className="text-[10px] text-stone-400 font-medium">6th House Sign: <span className="font-bold text-charcoal-700">{sixthHouseSign}</span> (Diseases & Recovery)</p>
            </div>
         </div>
      ),
      interpretationText: null,
      isLoading: false,
      type: 'text'
    },
    {
      id: 'vitality',
      title: 'Core Vitality & Constitution',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'text'
    },
    {
      id: 'strengths',
      title: 'Physical Strengths',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'toons',
      renderToons: (data: any[]) => (
         <div className="grid grid-cols-1 gap-3">
             {data.map((item, idx) => (
              <div key={idx} className="bg-sky-50 border border-sky-100 p-5 rounded-xl flex items-start gap-4 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-full bg-sky-100 border border-sky-200 text-sky-600 flex items-center justify-center flex-shrink-0 shadow-sm"><Icons.Activity className="w-6 h-6" /></div>
                  <div>
                     <h4 className="font-serif font-bold text-charcoal-800 text-[16px] mb-1.5">{item.area}</h4>
                     <p className="text-[14px] text-stone-600 leading-[1.6] font-medium">{item.description}</p>
                  </div>
               </div>
            ))}
         </div>
      )
    },
    {
      id: 'challenges',
      title: 'Areas of Self-Care',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'toons',
      renderToons: (data: any[]) => (
         <div className="grid grid-cols-1 gap-3">
             {data.map((item, idx) => (
              <div key={idx} className="bg-white border text-left border-stone-100 border-l-4 border-l-rose-400 p-5 rounded-xl flex items-start gap-4 shadow-sm hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center flex-shrink-0"><Icons.Heart className="w-6 h-6" /></div>
                  <div>
                     <h4 className="font-serif font-bold text-charcoal-800 text-[16px] mb-1.5">{item.area}</h4>
                     <p className="text-[14px] text-stone-600 leading-[1.6] font-medium">{item.advice}</p>
                  </div>
               </div>
            ))}
         </div>
      )
    },
    {
      id: 'current_period',
      title: 'Current Energy Cycle',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'text'
    },
    {
      id: 'mind',
      title: 'Mental Equilibrium',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'text'
    },
    {
      id: 'lifestyle',
      title: 'Lifestyle Optimization',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'toons',
      renderToons: (data: any[]) => (
         <div className="space-y-3">
            {data.map((item, idx) => {
               let IconCmp = Icons.Activity;
               let bgColor = "bg-white border border-stone-100";
               let iconColor = "text-amber-600 bg-amber-50 border-amber-100";
               
               if (item.category.toLowerCase().includes('sleep')) { IconCmp = Icons.Moon; bgColor="bg-indigo-50 border border-indigo-100"; iconColor="text-indigo-500 bg-indigo-100 border-indigo-200"; }
               if (item.category.toLowerCase().includes('diet')) { IconCmp = Icons.Coffee; bgColor="bg-emerald-50 border border-emerald-100"; iconColor="text-emerald-600 bg-emerald-100 border-emerald-200"; }
               if (item.category.toLowerCase().includes('routine')) { IconCmp = Icons.Calendar; bgColor="bg-amber-50 border border-amber-100"; iconColor="text-amber-600 bg-amber-100 border-amber-200"; }

               return (
                  <div key={idx} className={`p-5 rounded-2xl flex items-start sm:items-center gap-4 shadow-sm hover:shadow-md transition-all ${bgColor}`}>
                     <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 border shadow-sm ${iconColor}`}>
                        <IconCmp className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">{item.category}</p>
                        <h4 className="font-serif font-bold text-charcoal-800 text-[16px] mb-1">{item.recommendation}</h4>
                        <p className="text-[13px] text-stone-600 leading-[1.6] font-medium">{item.detail}</p>
                     </div>
                  </div>
               )
            })}
         </div>
      )
    },
    {
      id: 'remedies',
      title: 'Wellness Remedies',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'toons',
      renderToons: (data: any[]) => (
         <div className="space-y-4 text-sm">
             {data.map((item, idx) => (
              <div key={idx} className="flex gap-4 bg-white border text-left border-stone-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                 <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center flex-shrink-0 mt-0.5 text-[12px] font-bold">{idx + 1}</div>
                 <div>
                    <h4 className="font-serif font-bold text-charcoal-800 text-[16px] mb-1">{item.remedy}</h4>
                    <p className="text-stone-600 leading-[1.6] text-[14px] font-medium">{item.instruction}</p>
                 </div>
              </div>
            ))}
         </div>
      )
    }
  ];

  return { initialSections, asc, dasha };
};

export const loadHealthReportAI = async (configData: any, setSections: any) => {
  const { asc, dasha } = configData;
  
  const runSection = async (id: string, fetchFn: () => Promise<any>) => {
    try {
      const text = await fetchFn();
      setSections((prev: any[]) => prev.map(s => s.id === id ? { ...s, interpretationText: text, isLoading: false } : s));
    } catch (err) {
      console.error(`Failed to load section ${id}`, err);
      setSections((prev: any[]) => prev.map(s => s.id === id ? { ...s, interpretationText: "Interpretation temporarily unavailable.", isLoading: false } : s));
    }
  };

  await runSection('vitality', () => generateHealthSectionVitality(asc?.rashi || 'Aries', 'Mars', 'Taurus', 'Pitta'));
  await runSection('strengths', () => generateHealthSectionStrengths('Sun, Mars'));
  await runSection('challenges', () => generateHealthSectionChallenges('Virgo', 'Mercury', '12th', 'Moon'));
  await runSection('current_period', () => generateHealthSectionCurrentPeriod(dasha, 'Saturn', 4));
  await runSection('mind', () => generateHealthSectionMind('Taurus', 'Rohini', 'Cancer'));
  await runSection('lifestyle', () => generateHealthSectionLifestyle('Fire', 'Taurus', 'Mars'));
  await runSection('remedies', () => generateHealthSectionRemedies('Rohini', 'Fire', 'Moon'));
};
