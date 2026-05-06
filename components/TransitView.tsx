
import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { calculateTransits, generateTransitHouseData, TransitPlanet } from '../services/transitEngine';
import NorthIndianChart from './NorthIndianChart';
import TransitInsights from './TransitInsights';
import { HouseData, PlanetDetails } from '../types';
import { getTerm } from '../services/astrologyTerminology';

interface TransitViewProps {
  natalAscendant: string;
  onBack: () => void;
}

const TransitView: React.FC<TransitViewProps> = ({ natalAscendant, onBack }) => {
  const [transitDate, setTransitDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [planets, setPlanets] = useState<TransitPlanet[]>([]);
  const [houses, setHouses] = useState<HouseData[]>([]);

  useEffect(() => {
    const dateObj = new Date(transitDate);
    const now = new Date();
    dateObj.setHours(now.getHours(), now.getMinutes());

    const results = calculateTransits(dateObj, natalAscendant);
    const houseData = generateTransitHouseData(results, natalAscendant);

    setPlanets(results);
    setHouses(houseData);
  }, [transitDate, natalAscendant]);

  const chartDetails: PlanetDetails[] = planets.map(p => ({
    name: p.name,
    longitude: p.fullDegree,
    rashi: p.sign,
    degreeInRashi: p.degree,
    formatted: p.formattedDegree,
    isRetro: p.isRetro,
    isCombust: p.isCombust,
    dignity: p.dignity === 'own' ? 'normal' : p.dignity,
    nakshatra: p.nakshatra,
    pada: p.pada,
    rashiLord: '',
    nakshatraLord: '',
    nakshatraSubLord: ''
  }));

  return (
    <div className="animate-fade-in pb-20">
      {/* minimalist Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif text-charcoal-900 tracking-tight">Gochar (Transit)</h2>
          <p className="text-[10px] text-gold-600 font-bold uppercase tracking-[0.2em] mt-1">
            Referencing {natalAscendant} {getTerm('lagna', 'vedic')}
          </p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 shadow-sm">
          <input
            type="date"
            value={transitDate}
            onChange={(e) => setTransitDate(e.target.value)}
            className="text-[10px] text-charcoal-900 font-bold outline-none bg-transparent"
          />
        </div>
      </div>

      {/* 1. Gochar Kundli */}
      <div className="w-full max-w-[340px] mx-auto mb-8">
        <NorthIndianChart houses={houses} planetDetails={chartDetails} />
      </div>

      {/* 2. Placement Insights (Local Engine Logic) */}
      <TransitInsights planets={planets} />

      {/* 3. Professional Ephemeris Table */}
      <div className="mt-12 bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
        <div className="bg-stone-50 px-5 py-4 border-b border-stone-100 flex justify-between items-center">
          <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Ephemeris Data</h3>
          <Icons.Activity className="w-4 h-4 text-gold-500" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[340px]">
            <thead>
              <tr className="bg-stone-50/30 text-[9px] text-stone-400 uppercase tracking-wider font-bold">
                <th className="px-5 py-3">Planet</th>
                <th className="px-2 py-3 text-center">St</th>
                <th className="px-2 py-3">Sign</th>
                <th className="px-2 py-3 text-right">Deg</th>
                <th className="px-2 py-3 text-center">H</th>
                <th className="px-5 py-3">{getTerm('nakshatra', 'vedic')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {planets.map((p, idx) => {
                const isFirstOuterPlanet = p.isOuterPlanet && idx > 0 && !planets[idx - 1].isOuterPlanet;
                
                return (
                  <React.Fragment key={p.name}>
                    {isFirstOuterPlanet && (
                      <tr>
                        <td colSpan={6} className="px-5 py-3">
                          <div className="flex items-center gap-3 w-full">
                            <div className="flex-1 h-px bg-stone-200"></div>
                            <span className="text-xs font-serif text-stone-400 uppercase tracking-widest px-2">Outer Planets</span>
                            <div className="flex-1 h-px bg-stone-200"></div>
                          </div>
                        </td>
                      </tr>
                    )}
                    <tr className="text-[11px] text-charcoal-800 hover:bg-gold-50/10 transition-colors">
                      <td className="px-5 py-4 font-bold flex items-center gap-2">
                        <span className={`w-1 h-1 rounded-full ${['Sun', 'Moon'].includes(p.name) ? 'bg-gold-500' : p.isOuterPlanet ? 'bg-sky-400' : 'bg-stone-300'}`}></span>
                        <span className={p.isOuterPlanet ? 'text-sky-700' : ''}>{p.name}</span>
                      </td>
                  <td className="px-2 py-4 text-center">
                    <div className="flex flex-col gap-0.5 items-center">
                      {p.isRetro && <span className="text-[8px] text-red-500 font-bold">Rx</span>}
                      {p.isCombust && <span className="text-[8px] text-orange-500 font-bold">C</span>}
                      {p.dignity === 'exalted' && <span className="text-[8px] text-green-600 font-bold">Ex</span>}
                      {p.dignity === 'debilitated' && <span className="text-[8px] text-red-600 font-bold">Db</span>}
                    </div>
                  </td>
                  <td className="px-2 py-4 font-medium text-stone-600">
                    {p.sign.substring(0, 3)}
                  </td>
                  <td className="px-2 py-4 text-right font-mono text-stone-500 text-[10px]">
                    {p.formattedDegree.split(' ')[0]}
                  </td>
                  <td className="px-2 py-4 text-center font-bold text-charcoal-900">
                    {p.house}
                  </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-[10px]">{p.nakshatra}</div>
                      <div className="text-[8px] text-stone-400">P{p.pada}</div>
                    </td>
                  </tr>
                </React.Fragment>
              )})}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TransitView;
