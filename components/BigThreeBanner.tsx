import React from 'react';
import { Icons } from './Icons';
import { BirthChartAnalysis } from '../types';

interface BigThreeBannerProps {
  analysis: BirthChartAnalysis;
}

const BigThreeBanner: React.FC<BigThreeBannerProps> = ({ analysis }) => {
  const sunPlanet = analysis.planetaryDetails.find(p => p.name === 'Sun');
  const sunSign = sunPlanet ? sunPlanet.rashi : 'Unknown';
  const moonSign = analysis.moonSign;
  const ascendantSign = analysis.ascendant;

  return (
    <div className="mb-8 animate-fade-in group">
        <div className="bg-gradient-to-br from-charcoal-900 to-charcoal-800 text-ivory-50 rounded-[24px] p-5 border border-[#33312e] shadow-xl relative overflow-hidden transition-all duration-500 hover:border-gold-500/20">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none transform group-hover:scale-110 transition-transform duration-700">
                <Icons.Sparkles className="w-32 h-32" />
            </div>
            
            <div className="relative z-10">
                <p className="text-[10px] text-gold-400 font-bold uppercase tracking-[0.2em] mb-4">The Big Three</p>
                
                <div className="grid grid-cols-3 gap-3">
                    {/* Sun */}
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-gold-400/10 border border-gold-400/20 flex items-center justify-center text-gold-400 mb-3 shadow-inner">
                            <Icons.Sun className="w-5 h-5" />
                        </div>
                        <p className="text-[8px] uppercase tracking-widest text-[#a8a29e] mb-1 font-bold">Sun</p>
                        <p className="text-sm font-serif text-ivory-50">{sunSign}</p>
                    </div>

                    {/* Moon */}
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-stone-300/10 border border-stone-300/20 flex items-center justify-center text-stone-300 mb-3 shadow-inner">
                            <Icons.MoonStar className="w-5 h-5" />
                        </div>
                        <p className="text-[8px] uppercase tracking-widest text-[#a8a29e] mb-1 font-bold">Moon</p>
                        <p className="text-sm font-serif text-ivory-50">{moonSign}</p>
                    </div>

                    {/* Ascendant */}
                    <div className="bg-white/5 rounded-2xl p-3 border border-white/5 flex flex-col items-center justify-center text-center hover:bg-white/10 transition-colors">
                        <div className="w-10 h-10 rounded-full bg-indigo-400/10 border border-indigo-400/20 flex items-center justify-center text-indigo-400 mb-3 shadow-inner">
                            <Icons.Compass className="w-5 h-5" />
                        </div>
                        <p className="text-[8px] uppercase tracking-widest text-[#a8a29e] mb-1 font-bold">Ascendant</p>
                        <p className="text-sm font-serif text-ivory-50">{ascendantSign}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};

export default BigThreeBanner;
