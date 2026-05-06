import React from 'react';
import { Icons } from '../../Icons';
import { BirthChartAnalysis, UserProfile } from '../../../types';
import {
  generateCareerSectionNature,
  generateCareerSectionWealth,
  generateCareerSectionBusiness,
  generateCareerSectionCurrentPeriod,
  generateCareerSectionOpportunities,
  generateCareerSectionRemedies
} from '../../../services/reportGenerator';
import { ZODIAC_SIGNS, RASHI_LORDS } from '../../../services/astrologyEngine';

export const initCareerReport = (analysis: BirthChartAnalysis, profile: UserProfile) => {
  const sun = analysis?.planetaryDetails?.find?.(p => p.name === 'Sun');
  const dasha = analysis?.dashas?.[0]?.planet || 'Sun';

  // Calculate Career Signifiers
  const ascRashi = analysis?.planetaryDetails?.find?.(p => p.name === 'Ascendant')?.rashi || 'Aries';
  const ascIdx = ZODIAC_SIGNS.indexOf(ascRashi);
  const tenthHouseSign = ZODIAC_SIGNS[(ascIdx + 9) % 12];
  const tenthLord = RASHI_LORDS[ZODIAC_SIGNS.indexOf(tenthHouseSign)];
  const tenthLordPlanet = analysis?.planetaryDetails?.find?.(p => p.name === tenthLord);

  // Amatyakaraka = planet with 2nd highest degree (excluding nodes)
  const sortedByDeg = [...(analysis?.planetaryDetails || [])]
      .filter(p => !['Ascendant', 'Rahu', 'Ketu', 'Uranus', 'Neptune', 'Pluto'].includes(p.name))
      .sort((a,b) => b.degreeInRashi - a.degreeInRashi);
  const amatyakaraka = sortedByDeg[1]?.name || 'Mercury';
  const amatyakarakaPlanet = analysis?.planetaryDetails?.find?.(p => p.name === amatyakaraka);
  
  const initialSections = [
    {
      id: 'career_signifiers',
      title: 'Career Signifiers',
      visualComponent: (
         <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 text-center shadow-sm">
                  <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-indigo-200"><Icons.Briefcase className="w-5 h-5" /></div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-1">10th House Lord</p>
                  <p className="font-bold text-charcoal-800 text-sm">{tenthLord}</p>
                  <p className="text-[10px] text-stone-500 mt-1">in {tenthLordPlanet?.rashi || 'N/A'}</p>
               </div>
               <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100 text-center shadow-sm">
                  <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-amber-200"><Icons.Star className="w-5 h-5" /></div>
                  <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold mb-1">Amatyakaraka</p>
                  <p className="font-bold text-charcoal-800 text-sm">{amatyakaraka}</p>
                  <p className="text-[10px] text-stone-500 mt-1">in {amatyakarakaPlanet?.rashi || 'N/A'}</p>
               </div>
            </div>
            <div className="bg-stone-50 rounded-xl p-3 border border-stone-100 text-center">
               <p className="text-[10px] text-stone-400 font-medium">10th House Sign: <span className="font-bold text-charcoal-700">{tenthHouseSign}</span></p>
            </div>
         </div>
      ),
      interpretationText: null,
      isLoading: false,
      type: 'text'
    },
    {
      id: 'career_nature',
      title: 'Career Path & Potential',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'toons',
      renderToons: (data: any[]) => (
         <div className="space-y-4">
            {data.map((item, idx) => (
               <div key={idx}>
                  <p className="text-[15px] font-medium text-stone-600 leading-[1.8] bg-white p-6 rounded-2xl border border-stone-100 mb-5 shadow-sm">{item.careerNature}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-3 ml-1">Favorable Fields</p>
                  <div className="flex flex-wrap gap-3">
                     {(item.careerFields || '').split(',').map((field: string, i: number) => (
                        <span key={i} className="bg-stone-50 text-charcoal-800 px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-widest border border-stone-100 shadow-sm">
                           {field.trim()}
                        </span>
                     ))}
                  </div>
               </div>
            ))}
         </div>
      )
    },
    {
      id: 'wealth',
      title: 'Wealth & Finances',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'text'
    },
    {
      id: 'business',
      title: 'Business vs Service',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'toons',
      renderToons: (data: any[]) => (
         <div className="space-y-4">
            {data.map((item, idx) => (
               <div key={idx} className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 text-center shadow-sm relative overflow-hidden">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-5 shadow-sm relative z-10"><Icons.Briefcase className="w-8 h-8" /></div>
                  <h3 className="font-serif font-bold text-2xl text-charcoal-800 mb-3 relative z-10">{item.recommendation}</h3>
                  <div className="flex justify-center items-center gap-2 mb-5 relative z-10">
                     <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1.5 rounded-md shadow-sm border border-emerald-200">Strength: {item.confidence}%</span>
                  </div>
                  <p className="text-[15px] leading-[1.8] font-medium text-stone-600 max-w-sm mx-auto relative z-10">{item.reasoning}</p>
               </div>
            ))}
         </div>
      )
    },
    {
      id: 'current_period',
      title: 'Current Professional Cycle',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'text'
    },
    {
      id: 'opportunities',
      title: 'Upcoming Opportunities',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'toons',
      renderToons: (data: any[]) => (
         <div className="space-y-3">
             {data.map((item, idx) => (
               <div key={idx} className="flex gap-4 p-5 bg-white border border-stone-100 rounded-2xl items-center shadow-sm hover:shadow-md transition-all">
                  <div className="flex-shrink-0 text-center bg-stone-50 rounded-xl p-3 min-w-[90px] border border-stone-100 shadow-sm">
                     <p className="text-xs font-bold text-charcoal-700 tracking-wide">{item.period}</p>
                  </div>
                  <div>
                     <p className="text-[10px] font-bold uppercase tracking-widest text-amber-600 mb-1">{item.theme}</p>
                     <p className="text-[14px] text-stone-600 leading-[1.6] font-medium">{item.opportunity}</p>
                  </div>
               </div>
            ))}
         </div>
      )
    },
    {
      id: 'remedies',
      title: 'Professional Remedies',
      visualComponent: null,
      interpretationText: null,
      isLoading: true,
      type: 'toons',
      renderToons: (data: any[]) => (
         <div className="space-y-4 text-[15px]">
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

  return { initialSections, sun, dasha };
};

export const loadCareerReportAI = async (configData: any, setSections: any) => {
  const { sun, dasha } = configData;
  
  const runSection = async (id: string, fetchFn: () => Promise<any>) => {
    try {
      const text = await fetchFn();
      setSections((prev: any[]) => prev.map(s => s.id === id ? { ...s, interpretationText: text, isLoading: false } : s));
    } catch (err) {
      console.error(`Failed to load section ${id}`, err);
      setSections((prev: any[]) => prev.map(s => s.id === id ? { ...s, interpretationText: "Interpretation temporarily unavailable.", isLoading: false } : s));
    }
  };

  await runSection('career_nature', () => generateCareerSectionNature('Aries', 'Mars', sun?.rashi || 'Taurus', 'Mercury'));
  await runSection('wealth', () => generateCareerSectionWealth('Taurus', 'Aquarius', 'Leo', 'Present'));
  await runSection('business', () => generateCareerSectionBusiness(4, 11, 2, 5));
  await runSection('current_period', () => generateCareerSectionCurrentPeriod(dasha, 'Jupiter', 9, 3));
  await runSection('opportunities', () => generateCareerSectionOpportunities('Mars, Rahu', 'Taurus, Gemini'));
  await runSection('remedies', () => generateCareerSectionRemedies(sun?.rashi || 'Taurus', 'Aquarius', 'Mars'));
};
