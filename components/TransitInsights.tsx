
import React from 'react';
import { Icons } from './Icons';
import { TransitPlanet } from '../services/transitEngine';

interface TransitInsightsProps {
  planets: TransitPlanet[];
}

const TransitInsights: React.FC<TransitInsightsProps> = ({ planets }) => {
  const getHouseMeaning = (planet: string, house: number) => {
    const meanings: Record<string, Record<number, string>> = {
      'Sun': { 1: 'Visibility & Health', 10: 'Career Peak', 4: 'Home focus' },
      'Moon': { 1: 'Emotional focus', 7: 'Partnerships', 2: 'Financial mood' },
      'Jupiter': { 1: 'Expansion of Self', 9: 'Spiritual growth', 2: 'Wealth increase' },
      'Saturn': { 12: 'Spiritual debts', 1: 'Responsibility', 8: 'Transformation' }
    };
    return meanings[planet]?.[house] || 'General influence';
  };

  const majorEvents = planets.filter(p => p.isRetro || p.dignity !== 'normal' || p.isCombust);

  return (
    <div className="space-y-4 mt-8 animate-fade-in">
      <h3 className="text-xs font-bold text-stone-400 uppercase tracking-[0.2em] pl-1">Placement Insights</h3>
      
      <div className="grid grid-cols-1 gap-3">
        {majorEvents.slice(0, 4).map(p => (
          <div key={p.name} className="bg-white p-4 rounded-2xl border border-stone-100 shadow-sm flex items-start gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-serif text-lg font-bold shrink-0 ${p.isRetro ? 'bg-red-50 text-red-500' : 'bg-gold-50 text-gold-600'}`}>
              {p.name.substring(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-sm font-bold text-charcoal-900">{p.name}</h4>
                {p.isRetro && <span className="text-[8px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Retrograde</span>}
                {p.dignity === 'exalted' && <span className="text-[8px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Exalted</span>}
              </div>
              <p className="text-xs text-charcoal-600 leading-relaxed">
                Currently in your <strong>{p.house}th House</strong>. {p.isRetro ? 'Internalized energy suggests careful planning.' : 'Direct movement supports active efforts.'} 
                Focus on: {getHouseMeaning(p.name, p.house)}.
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {majorEvents.length === 0 && (
        <div className="p-6 bg-stone-50 rounded-2xl border border-stone-100 border-dashed text-center">
          <p className="text-xs text-stone-400 italic font-medium">All planets are in stable transit configurations today.</p>
        </div>
      )}
    </div>
  );
};

export default TransitInsights;
