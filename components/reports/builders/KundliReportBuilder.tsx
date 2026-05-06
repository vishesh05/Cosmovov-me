import React from 'react';
import { Icons } from '../../Icons';
import { BirthChartAnalysis, UserProfile } from '../../../types';
import StrengthOverview from '../../StrengthOverview';
import NorthIndianChart from '../../NorthIndianChart';

import {
  generateKundliSectionHouses,
  generateKundliSectionPlanets,
  generateKundliSectionYogas,
  generateKundliSectionNavamsa,
  generateKundliSectionAshtakvarga
} from '../../../services/reportGenerator';
import { getPanchangInfo } from '../../../services/astrologyEngine';

export const initKundliReport = (analysis: BirthChartAnalysis, profile: UserProfile) => {
  const asc = analysis?.planetaryDetails?.find?.(p => p.name === 'Ascendant');
  const moon = analysis?.planetaryDetails?.find?.(p => p.name === 'Moon');
  const sun = analysis?.planetaryDetails?.find?.(p => p.name === 'Sun');
  const atmakaraka = [...(analysis?.planetaryDetails || [])]
      .filter(p => !['Ascendant', 'Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto'].includes(p.name))
      .sort((a,b) => b.degreeInRashi - a.degreeInRashi)[0]?.name || 'Sun';

  const yogas = [{ name: 'Gajakesari', planets: ['Jupiter', 'Moon'] }]; // Mocked for architecture test

  // Safely calculate Panchang
  let panchang: any = null;
  try {
     let rawDate = profile.date || '';
     if (rawDate && /^\d{1,2}[-\/]\d{1,2}[-\/]\d{4}$/.test(rawDate)) {
         const parts = rawDate.split(/[-\/]/);
         rawDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
     }
     const birthDate = new Date(`${rawDate}T${profile.time || '12:00'}:00`);
     // Provide default lat/lng for panchang calculation since UserProfile only stores city string
     panchang = getPanchangInfo(birthDate, 28.6139, 77.2090);
  } catch(e) { console.error("Panchang Error", e); }

  const initialSections = [
    {
      id: 'chart_overview',
      title: 'Chart Overview',
      visualComponent: (
         <div>
            <div className="mb-6 h-64">
               {/* Pass analysis correctly, assume this component handles layout */}
               <div className="transform scale-90 -mt-4 origin-top">
                 <NorthIndianChart analysis={analysis} animate={false} />
               </div>
            </div>
            <div className="bg-stone-50 rounded-2xl overflow-hidden text-[13px] font-medium border border-stone-100 shadow-sm mt-4">
               <div className="flex justify-between p-3.5 border-b border-stone-100">
                  <span className="text-stone-500 uppercase tracking-widest text-[10px] font-bold mt-0.5">Ascendant</span>
                  <span className="font-bold text-charcoal-700">{asc?.rashi}</span>
               </div>
               <div className="flex justify-between p-3.5 border-b border-stone-100">
                  <span className="text-stone-500 uppercase tracking-widest text-[10px] font-bold mt-0.5">Moon Sign</span>
                  <span className="font-bold text-charcoal-700">{moon?.rashi}</span>
               </div>
               <div className="flex justify-between p-3.5 border-b border-stone-100">
                  <span className="text-stone-500 uppercase tracking-widest text-[10px] font-bold mt-0.5">Sun Sign</span>
                  <span className="font-bold text-charcoal-700">{sun?.rashi}</span>
               </div>
               <div className="flex justify-between p-3.5 border-b border-stone-100">
                  <span className="text-stone-500 uppercase tracking-widest text-[10px] font-bold mt-0.5">Nakshatra</span>
                  <span className="font-bold text-charcoal-900">{moon?.nakshatra} <span className="text-stone-500 font-normal">(Pada {moon?.pada})</span></span>
               </div>
               <div className="flex justify-between p-3.5 bg-amber-50/50">
                  <span className="text-amber-700 uppercase tracking-widest text-[10px] font-bold mt-0.5 flex items-center gap-1">
                    <Icons.Star className="w-3 h-3 text-amber-500" /> Atmakaraka
                  </span>
                  <span className="font-bold text-amber-700">{atmakaraka}</span>
               </div>
            </div>
            
             {/* PANCHANG EXTENSION */}
             {panchang && (
                 <div className="mt-6 bg-white border border-stone-100 rounded-2xl p-5 shadow-sm">
                    <h4 className="text-sm font-bold text-charcoal-800 mb-4 flex items-center gap-2">
                       <Icons.Moon className="w-4 h-4 text-indigo-500" /> Birth Panchang
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                       <div>
                          <p className="text-stone-400 uppercase tracking-widest text-[9px] font-bold mb-1">Tithi (Lunar Day)</p>
                          <p className="font-bold text-charcoal-700">{panchang.tithi} ({panchang.paksha})</p>
                       </div>
                       <div>
                          <p className="text-stone-400 uppercase tracking-widest text-[9px] font-bold mb-1">Nakshatra</p>
                          <p className="font-bold text-charcoal-700">{panchang.nakshatra}</p>
                       </div>
                       <div>
                          <p className="text-stone-400 uppercase tracking-widest text-[9px] font-bold mb-1">Yoga</p>
                          <p className="font-bold text-charcoal-700">{panchang.yoga}</p>
                       </div>
                       <div>
                          <p className="text-stone-400 uppercase tracking-widest text-[9px] font-bold mb-1">Karana</p>
                          <p className="font-bold text-charcoal-700">{panchang.karana}</p>
                       </div>
                    </div>
                 </div>
             )}
         </div>
      ),
      interpretationText: null, // "Zero AI tokens" as per prompt
      isLoading: false,
      type: 'text'
    },
    {
      id: 'houses_analysis',
      title: 'House by House Analysis',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'toons',
      renderToons: (data: any[]) => (
         <div className="space-y-3">
             {data.map((item, idx) => (
               <details key={idx} className="group bg-white/5 border border-white/5 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden shadow-lg hover:shadow-xl transition-all">
                 <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors relative">
                   <div className="absolute left-0 top-0 h-full w-1 bg-gold-400 opacity-0 group-open:opacity-100 transition-opacity" />
                   <div className="flex items-center gap-4">
                     <span className="w-10 h-10 rounded-full bg-white/10 border border-white/10 text-gold-400 font-serif font-bold flex items-center justify-center flex-shrink-0 text-base shadow-sm">
                        {item.house}
                     </span>
                     <div>
                       <span className="font-serif font-bold text-ivory-50 block text-[15px] tracking-wide">{item.sign}</span>
                       <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Lord: {item.lord}</span>
                     </div>
                   </div>
                   <Icons.ChevronDown className="w-4 h-4 text-stone-400 group-open:rotate-180 transition-transform" />
                 </summary>
                 <div className="p-4 pt-0 text-[15px] font-medium text-stone-300 border-t border-white/5 bg-white/5 leading-relaxed">
                    {item.insight}
                 </div>
               </details>
            ))}
         </div>
      )
    },
    {
      id: 'planets_analysis',
      title: 'Planet by Planet Analysis',
      visualComponent: (
          <div className="mb-6 overflow-x-auto bg-white rounded-2xl border border-stone-100 shadow-sm p-4">
             <table className="w-full text-left text-sm whitespace-nowrap">
                <thead>
                   <tr className="border-b border-stone-200 text-[10px] uppercase tracking-widest text-stone-400">
                      <th className="pb-2 font-bold pl-2">Planet</th>
                      <th className="pb-2 font-bold pl-2">Sign</th>
                      <th className="pb-2 font-bold pl-2">Degree</th>
                      <th className="pb-2 font-bold pl-2">Nakshatra</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                   {(analysis?.planetaryDetails || []).map((p, i) => (
                      <tr key={i} className="hover:bg-stone-50 transition-colors">
                         <td className="py-3 pl-2 font-bold text-charcoal-700 flex items-center gap-2">
                            {p.isRetro ? <span className="text-[10px] text-amber-500 font-bold">(R)</span> : null}
                            {p.name}
                         </td>
                         <td className="py-3 pl-2 text-stone-600">{p.rashi}</td>
                         <td className="py-3 pl-2 text-stone-600 font-mono text-[12px]">{p.formatted || `${Math.floor(p.degreeInRashi)}°`}</td>
                         <td className="py-3 pl-2 text-stone-600">{p.nakshatra}</td>
                      </tr>
                   ))}
                </tbody>
             </table>
          </div>
      ),
      interpretationText: null,
      isLoading: true,
      type: 'toons',
      renderToons: (data: any[]) => (
         <div className="space-y-3">
             {data.map((item, idx) => (
               <details key={idx} className="group bg-white/5 border border-white/5 rounded-xl overflow-hidden [&_summary::-webkit-details-marker]:hidden shadow-lg">
                 <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/10 transition-colors relative">
                   <div className="flex items-center gap-4">
                     <div className="font-serif font-bold text-ivory-50 text-[15px] tracking-wide w-20">{item.planet}</div>
                     <span className="text-[10px] uppercase font-bold tracking-widest text-gold-400 bg-white/10 px-2 py-0.5 rounded-sm">{item.sign}</span>
                     <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400">House {item.house}</span>
                   </div>
                   <Icons.ChevronDown className="w-4 h-4 text-stone-400 group-open:rotate-180 transition-transform" />
                 </summary>
                 <div className="p-4 pt-0 text-[14px] text-stone-300 border-t border-white/5 bg-white/5">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 mb-2">{item.status}</p>
                    <p className="leading-[1.8] font-medium">{item.insight}</p>
                 </div>
               </details>
            ))}
         </div>
      )
    },
    {
      id: 'yogas',
      title: 'Yogas in Your Chart',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'toons',
      renderToons: (data: any[]) => (
         <div className="grid grid-cols-1 gap-4">
            {data.map((item, idx) => (
               <div key={idx} className="bg-amber-50 p-6 rounded-2xl border border-amber-100 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <Icons.Star className="absolute top-2 right-2 w-24 h-24 text-amber-500/10 rotate-12 mix-blend-multiply" />
                  <h4 className="font-serif font-bold text-amber-900 text-xl mb-1">{item.yogaName}</h4>
                  <p className="text-[10px] uppercase tracking-widest text-amber-600 mb-3 font-bold">Formed by {item.formingPlanets}</p>
                  <p className="text-[15px] font-medium text-stone-700 leading-[1.8] relative z-10">{item.meaning}</p>
               </div>
            ))}
         </div>
      )
    },
    {
      id: 'navamsa',
      title: 'Navamsa D9 Chart',
      visualComponent: (
         <div className="mb-4 bg-stone-50 p-6 rounded-2xl text-center border border-stone-100 shadow-sm relative overflow-hidden">
            <h4 className="font-serif text-charcoal-900 font-bold mb-4 tracking-wide text-lg relative z-10">D9 Placements</h4>
            <div className="absolute right-0 top-0 w-32 h-32 text-stone-300 opacity-[0.2] pointer-events-none">
              <Icons.MandalaBackground />
            </div>
            <div className="flex flex-wrap justify-center gap-3 relative z-10">
               <span className="bg-white border border-stone-200 text-charcoal-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">Asc: Leo</span>
               <span className="bg-white border border-stone-200 text-charcoal-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">Moon: Virgo</span>
               <span className="bg-white border border-stone-200 text-charcoal-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm">7th House: Aquarius</span>
            </div>
         </div>
      ),
      interpretationText: null,
      isLoading: true,
      type: 'text'
    },
    {
      id: 'ashtakvarga_summary',
      title: 'Ashtakvarga Strength',
      visualComponent: (
         <div className="-mx-4 sm:mx-0">
            {/* Embedded existing component, scale to fit */}
            <div className="transform scale-90 origin-top">
              <StrengthOverview analysis={analysis} />
            </div>
         </div>
      ),
      interpretationText: null,
      isLoading: true,
      type: 'text'
    }
  ];

  return { initialSections, analysis, yogas };
};

export const loadKundliReportAI = async (configData: any, setSections: any) => {
  const { analysis, yogas } = configData;
  
  const runSection = async (id: string, fetchFn: () => Promise<any>) => {
    try {
      const text = await fetchFn();
      setSections((prev: any[]) => prev.map(s => s.id === id ? { ...s, interpretationText: text, isLoading: false } : s));
    } catch (err) {
      console.error(`Failed to load section ${id}`, err);
      setSections((prev: any[]) => prev.map(s => s.id === id ? { ...s, interpretationText: "Interpretation temporarily unavailable.", isLoading: false } : s));
    }
  };

  const houseDataPayload = (analysis?.houses || []).map((h: any) => ({
      houseNumber: h.houseNumber, sign: h.sign, lord: 'Mars', planets: h.planets // Replace lord logic when real func added
  }));
  await runSection('houses_analysis', () => generateKundliSectionHouses(houseDataPayload));

  const planetsPayload = (analysis?.planetaryDetails || []).filter((p:any) => p.name !== 'Ascendant').map((p: any) => ({
      name: p.name, sign: p.rashi, house: 1, status: p.isRetro ? 'Retrograde' : 'Direct'
  }));
  await runSection('planets_analysis', () => generateKundliSectionPlanets(planetsPayload));
  
  await runSection('yogas', () => generateKundliSectionYogas(yogas));
  
  await runSection('navamsa', () => generateKundliSectionNavamsa('Leo', 'Aquarius', 'Virgo'));
  
  await runSection('ashtakvarga_summary', () => generateKundliSectionAshtakvarga('1st, 5th, 9th', '6th, 8th, 12th'));
};
