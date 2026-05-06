
import React from 'react';
import { PlanetDetails } from '../types';

interface PlanetaryPositionsProps {
  planetaryDetails: PlanetDetails[];
}

const PlanetaryPositions: React.FC<PlanetaryPositionsProps> = ({ planetaryDetails }) => {
  return (
    <>
      <h3 className="text-sm font-serif text-charcoal-900 mb-5 pl-1 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-gold-500 rounded-full"></span>
        Planetary Positions
      </h3>
      <div className="grid grid-cols-2 gap-3 mb-10">
        {planetaryDetails.map((planet, idx) => {
          const isFirstOuterPlanet = planet.isOuterPlanet && idx > 0 && !planetaryDetails[idx - 1].isOuterPlanet;
          
          return (
          <React.Fragment key={idx}>
            {isFirstOuterPlanet && (
              <div className="col-span-2 mt-4 mb-2 flex items-center gap-3">
                <div className="flex-1 h-px bg-stone-200"></div>
                <span className="text-xs font-serif text-stone-400 uppercase tracking-widest px-2">Outer Planets</span>
                <div className="flex-1 h-px bg-stone-200"></div>
              </div>
            )}
            <div className="bg-white p-3.5 rounded-2xl border border-stone-100 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                  <span className={`font-bold text-sm ${planet.isOuterPlanet ? 'text-sky-700' : 'text-charcoal-900'}`}>{planet.name}</span>
                  {planet.isRetro && <span className="text-[8px] bg-red-50 text-red-500 px-1 rounded">Rx</span>}
                  {planet.isCombust && <span className="text-[8px] bg-orange-50 text-orange-500 px-1 rounded">C</span>}
                  {planet.dignity === 'exalted' && (
                      <span className="text-[8px] bg-green-50 text-green-600 px-1 rounded font-bold">↑</span>
                  )}
                  {planet.dignity === 'debilitated' && (
                      <span className="text-[8px] bg-red-50 text-red-600 px-1 rounded font-bold">↓</span>
                  )}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-charcoal-500">{planet.rashi}</span>
                <span className="text-[10px] font-mono text-stone-400">{planet.formatted}</span>
              </div>
            </div>
          </React.Fragment>
        )})}
      </div>
    </>
  );
};

export default PlanetaryPositions;
