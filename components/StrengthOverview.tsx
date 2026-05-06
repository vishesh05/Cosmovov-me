import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Icons } from './Icons';
import { BirthChartAnalysis } from '../types';
import { calculateDivisionalStrength } from '../services/chartStrengthEngine';

interface StrengthOverviewProps {
  analysis: BirthChartAnalysis;
}

const CircularProgress: React.FC<{ percentage: number; label: string; subLabel: string; size?: number; color?: string }> = ({ percentage, label, subLabel, size = 120, color = '#D4AF37' }) => {
  const radius = (size - 10) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke="#F2F0EB" strokeWidth="6" fill="transparent" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={circumference}
            style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s cubic-bezier(0.4, 0, 0.2, 1)' }}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-serif text-charcoal-900 leading-none">{percentage}%</span>
          <span className="text-[8px] font-bold text-stone-400 uppercase tracking-widest mt-1">{subLabel}</span>
        </div>
      </div>
      <p className="mt-3 text-[10px] font-bold text-charcoal-800 uppercase tracking-[0.2em]">{label}</p>
    </div>
  );
};

const StrengthOverview: React.FC<StrengthOverviewProps> = ({ analysis }) => {
  const [selectedDivisional, setSelectedDivisional] = useState('D9');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const d1Stats = useMemo(() => calculateDivisionalStrength(analysis, 'D1'), [analysis]);
  const divStats = useMemo(() => calculateDivisionalStrength(analysis, selectedDivisional), [analysis, selectedDivisional]);

  const availableCharts = [
    { id: 'D9', label: 'Navamsa (D9)' },
    { id: 'D10', label: 'Dashamsha (D10)' },
    { id: 'D2', label: 'Hora (D2)' },
    { id: 'D4', label: 'Chaturthamsha' },
    { id: 'D30', label: 'Trimshamsha' }
  ];

  return (
    <div className="animate-fade-in mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-1">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gold-50 flex items-center justify-center text-gold-600">
            <Icons.Activity className="w-3 h-3" />
          </div>
          <h3 className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em]">Celestial Potency</h3>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-white border border-stone-200 hover:border-gold-300 text-[10px] font-bold uppercase tracking-wider text-charcoal-600 rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-gold-400/20 transition-all cursor-pointer shadow-sm group"
          >
            {availableCharts.find(c => c.id === selectedDivisional)?.label}
            <Icons.ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-gold-500' : 'text-stone-400 group-hover:text-gold-400'}`} />
          </button>

          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-stone-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="py-1">
                {availableCharts.map(c => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedDivisional(c.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-3 text-[10px] uppercase tracking-wider transition-colors flex items-center justify-between ${selectedDivisional === c.id ? 'bg-gold-50/50 text-gold-600 font-bold' : 'text-charcoal-600 font-semibold hover:bg-stone-50 hover:text-gold-500'}`}
                  >
                    <span>{c.label}</span>
                    {selectedDivisional === c.id && <span className="w-1.5 h-1.5 rounded-full bg-gold-400"></span>}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Stats Card */}
      <div className="bg-white rounded-[32px] p-6 border border-stone-100 shadow-sm mb-6">
        <div className="flex justify-around items-center py-2">
          <CircularProgress percentage={d1Stats.score} label="Natal (D1)" subLabel="Vitality" />
          <div className="w-[1px] h-16 bg-stone-50"></div>
          <CircularProgress percentage={divStats.score} label={availableCharts.find(c => c.id === selectedDivisional)?.label || selectedDivisional} subLabel="Strength" color="#4F5D75" />
        </div>

        {/* Interpretation Text */}
        <div className="mt-6 text-center bg-ivory-50 rounded-xl p-3 border border-stone-100/50">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gold-600 mb-1">{divStats.label}</p>
          <p className="text-[10px] text-stone-400 leading-relaxed font-medium">{divStats.description}</p>
        </div>

        {/* Top Planets */}
        <div className="mt-6 pt-6 border-t border-stone-50">
          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-[0.2em] mb-4 text-center">Power in {availableCharts.find(c => c.id === selectedDivisional)?.label}</p>
          <div className="flex gap-2">
            {divStats.topPlanets.map((p, i) => (
              <div key={p.name} className="flex-1 min-w-0 bg-ivory-50 rounded-2xl p-2 sm:p-3 border border-stone-100 flex flex-col items-center text-center animate-fade-in">
                <div className={`w-8 h-8 shrink-0 rounded-full mb-2 flex items-center justify-center text-xs font-serif font-bold ${i === 0 ? 'bg-charcoal-900 text-gold-400' : 'bg-gold-50 text-gold-600'}`}>
                  {p.name.substring(0, 2)}
                </div>
                <div className="text-[10px] font-bold text-charcoal-900 mb-0.5 truncate w-full">{p.name}</div>
                <div className="text-[8px] text-stone-400 font-medium leading-tight break-words w-full">{p.reason}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StrengthOverview;
