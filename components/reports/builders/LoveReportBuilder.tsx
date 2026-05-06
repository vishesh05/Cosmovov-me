import React from 'react';
import { Icons } from '../../Icons';
import { BirthChartAnalysis, UserProfile } from '../../../types';
import {
  generateLoveSectionNature,
  generateLoveSectionMarriage,
  generateLoveSectionTiming,
  generateLoveSectionChallenges,
  generateLoveSectionRemedies
} from '../../../services/reportGenerator';
import { ZODIAC_SIGNS, RASHI_LORDS } from '../../../services/astrologyEngine';

export const initLoveReport = (analysis: BirthChartAnalysis, profile: UserProfile) => {
  const venus = analysis?.planetaryDetails?.find?.(p => p.name === 'Venus');
  const moon = analysis?.planetaryDetails?.find?.(p => p.name === 'Moon');
  const dasha = analysis?.dashas?.[0]?.planet || 'Venus';
  const age = Math.floor((new Date().getTime() - new Date(profile.date).getTime()) / 31557600000);

  // Calculate Love Signifiers
  const ascRashi = analysis?.planetaryDetails?.find?.(p => p.name === 'Ascendant')?.rashi || 'Aries';
  const ascIdx = ZODIAC_SIGNS.indexOf(ascRashi);
  const seventhHouseSign = ZODIAC_SIGNS[(ascIdx + 6) % 12];
  const seventhLord = RASHI_LORDS[ZODIAC_SIGNS.indexOf(seventhHouseSign)];
  const seventhLordPlanet = analysis?.planetaryDetails?.find?.(p => p.name === seventhLord);

  // Darakaraka = planet with lowest degree (excluding nodes)
  const sortedByDeg = [...(analysis?.planetaryDetails || [])]
      .filter(p => !['Ascendant', 'Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto'].includes(p.name))
      .sort((a,b) => a.degreeInRashi - b.degreeInRashi);
  const darakaraka = sortedByDeg[0]?.name || 'Venus';
  const darakarakaPlanet = analysis?.planetaryDetails?.find?.(p => p.name === darakaraka);

  const initialSections = [
    {
      id: 'love_signifiers',
      title: 'Relationship Signifiers',
      visualComponent: (
         <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
               <div className="bg-rose-50 rounded-2xl p-4 border border-rose-100 text-center shadow-sm">
                  <div className="w-10 h-10 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-rose-200"><Icons.Heart className="w-4 h-4" /></div>
                  <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold mb-1">7th Lord</p>
                  <p className="font-bold text-charcoal-800 text-sm">{seventhLord}</p>
                  <p className="text-[9px] text-stone-500">{seventhLordPlanet?.rashi || '—'}</p>
               </div>
               <div className="bg-pink-50 rounded-2xl p-4 border border-pink-100 text-center shadow-sm">
                  <div className="w-10 h-10 bg-pink-100 text-pink-500 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-pink-200 text-lg font-bold">♀</div>
                  <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold mb-1">Venus</p>
                  <p className="font-bold text-charcoal-800 text-sm">{venus?.rashi || 'N/A'}</p>
                  <p className="text-[9px] text-stone-500">Natural Karka</p>
               </div>
               <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 text-center shadow-sm">
                  <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2 shadow-sm border border-amber-200"><Icons.Star className="w-4 h-4" /></div>
                  <p className="text-[9px] text-stone-400 uppercase tracking-widest font-bold mb-1">Darakaraka</p>
                  <p className="font-bold text-charcoal-800 text-sm">{darakaraka}</p>
                  <p className="text-[9px] text-stone-500">{darakarakaPlanet?.rashi || '—'}</p>
               </div>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 text-center">
               <p className="text-[10px] text-stone-400 font-medium">7th House Sign: <span className="font-bold text-charcoal-700">{seventhHouseSign}</span></p>
            </div>
         </div>
      ),
      interpretationText: null,
      isLoading: false,
      type: 'text'
    },
    {
      id: 'love_nature',
      title: 'Your Romantic Nature',
      visualComponent: (
         <div className="flex gap-6 justify-center items-center py-6">
            <div className="text-center">
               <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-100 text-rose-500 flex items-center justify-center mx-auto mb-3 shadow-sm relative">
                  <span className="absolute font-bold text-xl text-rose-500">♀</span>
               </div>
               <p className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">Venus in {venus?.rashi}</p>
            </div>
            <div className="text-stone-300">✦</div>
            <div className="text-center">
               <div className="w-16 h-16 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-500 flex items-center justify-center mx-auto mb-3 shadow-sm relative">
                  <span className="absolute font-bold text-xl text-indigo-500">☾</span>
               </div>
               <p className="text-[11px] font-bold text-stone-500 uppercase tracking-widest">Moon in {moon?.rashi}</p>
            </div>
         </div>
      ),
      interpretationText: null,
      isLoading: true,
      type: 'text'
    },
    {
      id: 'marriage_prospects',
      title: 'Marriage & Partnership',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'text'
    },
    {
      id: 'timing',
      title: 'Favorable Timing',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'toons',
      renderToons: (data: any[]) => (
         <div className="space-y-6">
            {data.map((item, idx) => (
               <div key={idx}>
                  <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 mb-4 shadow-sm relative overflow-hidden">
                     <p className="text-[10px] font-bold uppercase tracking-widest text-rose-500 mb-1">Primary Window</p>
                     <h3 className="font-serif font-bold text-2xl text-charcoal-800 mb-2">{item.primaryWindow} Age</h3>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1 mt-4">Secondary Window</p>
                     <p className="font-bold text-stone-600">{item.earlyWindow}</p>
                  </div>
                  <p className="text-[15px] font-medium text-stone-600 leading-[1.8] bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">{item.explanation}</p>
               </div>
            ))}
         </div>
      )
    },
    {
      id: 'challenges',
      title: 'Growth & Challenges',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'text'
    },
    {
      id: 'remedies',
      title: 'Relationship Remedies',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'toons',
      renderToons: (data: any[]) => (
         <div className="space-y-4 text-[15px]">
            {data.map((item, idx) => (
              <div key={idx} className="bg-white border text-left border-stone-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all">
                 <div className="flex items-center gap-3 mb-3">
                    <span className="w-8 h-8 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center text-[12px] font-bold border border-rose-100">{idx + 1}</span>
                    <h4 className="font-serif font-bold text-charcoal-800 text-[17px]">{item.remedy}</h4>
                 </div>
                 <p className="text-stone-600 pl-11 leading-[1.8] text-[14px] font-medium">{item.instruction}</p>
              </div>
            ))}
         </div>
      )
    }
  ];

  return { initialSections, venus, moon, dasha, age };
};

export const loadLoveReportAI = async (configData: any, setSections: any) => {
  const { venus, moon, dasha, age } = configData;
  
  const runSection = async (id: string, fetchFn: () => Promise<any>) => {
    try {
      const text = await fetchFn();
      setSections((prev: any[]) => prev.map(s => s.id === id ? { ...s, interpretationText: text, isLoading: false } : s));
    } catch (err) {
      console.error(`Failed to load section ${id}`, err);
      setSections((prev: any[]) => prev.map(s => s.id === id ? { ...s, interpretationText: "Interpretation temporarily unavailable.", isLoading: false } : s));
    }
  };

  await runSection('love_nature', () => generateLoveSectionNature(venus?.rashi || 'Aries', 1, moon?.rashi || 'Taurus', 'Leo'));
  await runSection('marriage_prospects', () => generateLoveSectionMarriage('Libra', 7, venus?.rashi || 'Aries', 1, 'Aquarius'));
  await runSection('timing', () => generateLoveSectionTiming(age || 30, dasha, 'Moon', 7));
  await runSection('challenges', () => generateLoveSectionChallenges('Libra', venus?.rashi || 'Aries', 'None'));
  await runSection('remedies', () => generateLoveSectionRemedies(venus?.rashi || 'Aries', 'Venus', dasha));
};
