
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { BirthChartAnalysis } from '../types';

interface DashaViewProps {
    analysis: BirthChartAnalysis;
    onBack: () => void;
}

const DashaView: React.FC<DashaViewProps> = ({ analysis, onBack }) => {
    const [expandedMahadasha, setExpandedMahadasha] = useState<string | null>(null);
    const [expandedAntardasha, setExpandedAntardasha] = useState<string | null>(null);
    const now = new Date();

    useEffect(() => {
        if (!analysis.dashas) return;
        const currentMaha = analysis.dashas.find(d => d && new Date(d.startDate) <= now && new Date(d.endDate) >= now);
        if (currentMaha) {
            setExpandedMahadasha(currentMaha.planet);
            const currentAntar = currentMaha.subPeriods.find(d => d && new Date(d.startDate) <= now && new Date(d.endDate) >= now);
            if (currentAntar) {
                setExpandedAntardasha(`${currentMaha.planet}-${currentAntar.planet}`);
            }
        }
    }, [analysis.dashas]);

    const formatDate = (d: string) => {
        try { return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }); }
        catch (e) { return d; }
    };

    if (!analysis.dashas || analysis.dashas.length === 0) {
        return (
            <div className="p-10 text-center flex flex-col items-center gap-4">
                <button onClick={onBack} className="flex items-center gap-2 text-charcoal-500 mb-6 hover:text-gold-600 transition-colors self-start">
                    <Icons.ChevronLeft />
                    <span className="text-xs font-bold uppercase tracking-widest">Back to Tools</span>
                </button>
                <p className="text-charcoal-400 text-sm">No Dasha timeline available.</p>
            </div>
        );
    }

    return (
        <div className="p-6 pb-32 fade-enter-active">
            <button onClick={onBack} className="flex items-center gap-2 text-charcoal-500 mb-6 hover:text-gold-600 transition-colors">
                <Icons.ChevronLeft />
                <span className="text-xs font-bold uppercase tracking-widest">Back to Tools</span>
            </button>

            <h2 className="text-2xl font-serif text-charcoal-900 mb-2 mt-2">Vimshottari Dasha</h2>
            <p className="text-charcoal-500 text-xs mb-8">Planetary periods governing your life cycles</p>

            <div className="space-y-4">
                {analysis.dashas.map((mahadasha, mIdx) => {
                    const isMahaCurrent = new Date(mahadasha.startDate) <= now && new Date(mahadasha.endDate) >= now;
                    const isMahaExpanded = expandedMahadasha === mahadasha.planet;
                    return (
                        <div key={mIdx} className={`bg-white rounded-2xl border transition-all duration-300 ${isMahaCurrent ? 'border-gold-400 shadow-lg ring-1 ring-gold-100/50' : 'border-stone-100 shadow-sm'}`}>
                            <button onClick={() => setExpandedMahadasha(isMahaExpanded ? null : mahadasha.planet)} className="w-full p-5 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-serif text-lg font-bold transition-colors ${isMahaCurrent ? 'bg-charcoal-900 text-gold-400' : 'bg-stone-50 text-stone-400'}`}>
                                        {mahadasha.planet.substring(0, 2)}
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-bold text-charcoal-900 flex items-center gap-2">
                                            {mahadasha.planet} Mahadasha
                                            {isMahaCurrent && <span className="text-[9px] bg-gold-50 text-gold-600 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Current</span>}
                                        </div>
                                        <div className="text-xs text-charcoal-500 font-medium mt-1">
                                            {formatDate(mahadasha.startDate)} — {formatDate(mahadasha.endDate)}
                                        </div>
                                    </div>
                                </div>
                                <div className={`transition-transform duration-300 text-stone-300 ${isMahaExpanded ? 'rotate-90 text-gold-500' : ''}`}>
                                    <Icons.ChevronRight />
                                </div>
                            </button>
                            {isMahaExpanded && (
                                <div className="border-t border-stone-50 bg-stone-50/30 p-2 space-y-1 animate-fade-in">
                                    <div className="text-[10px] uppercase tracking-widest text-charcoal-400 mb-2 font-bold pl-2 pt-2">Antardashas</div>
                                    {mahadasha.subPeriods.map((antardasha, aIdx) => {
                                        const isAntarCurrent = new Date(antardasha.startDate) <= now && new Date(antardasha.endDate) >= now;
                                        const uniqueKey = `${mahadasha.planet}-${antardasha.planet}`;
                                        const isAntarExpanded = expandedAntardasha === uniqueKey;
                                        return (
                                            <div key={aIdx} className={`rounded-xl overflow-hidden transition-all ${isAntarCurrent ? 'bg-white shadow-md border border-gold-200' : 'bg-transparent border border-transparent'}`}>
                                                <button onClick={(e) => { e.stopPropagation(); setExpandedAntardasha(isAntarExpanded ? null : uniqueKey); }} className={`w-full flex justify-between items-center text-xs p-3 transition-colors ${!isAntarCurrent && 'hover:bg-white/50'}`}>
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-1.5 h-1.5 rounded-full ${isAntarCurrent ? 'bg-gold-500 animate-pulse' : 'bg-stone-300'}`}></div>
                                                        <span className={`font-bold ${isAntarCurrent ? 'text-charcoal-900' : 'text-stone-500'}`}>{antardasha.planet}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="flex flex-col text-right">
                                                            <span className={`${isAntarCurrent ? 'text-charcoal-900 font-bold' : 'text-stone-400'}`}>
                                                                {formatDate(antardasha.startDate)} - {formatDate(antardasha.endDate)}
                                                            </span>
                                                        </div>
                                                        <div className={`transition-transform duration-300 text-stone-300 ${isAntarExpanded ? 'rotate-90 text-gold-500' : ''} ${isAntarCurrent ? 'text-gold-400' : ''}`}>
                                                            <Icons.ChevronRight /> 
                                                        </div>
                                                    </div>
                                                </button>
                                                {isAntarExpanded && (
                                                    <div className="bg-white/50 pl-8 pr-2 pb-2 pt-0 space-y-1 border-t border-stone-100/50">
                                                        <div className="text-[9px] uppercase tracking-widest text-charcoal-300 mb-1 mt-2 font-bold">Pratyantardashas</div>
                                                        {antardasha.subPeriods.map((pratyantar, pIdx) => {
                                                            const isPratyantarCurrent = new Date(pratyantar.startDate) <= now && new Date(pratyantar.endDate) >= now;
                                                            return (
                                                                <div key={pIdx} className={`flex justify-between items-center text-[10px] p-2 rounded-lg ${isPratyantarCurrent ? 'bg-gold-50 text-charcoal-900 font-bold border border-gold-100' : 'text-charcoal-500'}`}>
                                                                    <span>{pratyantar.planet}</span>
                                                                    <span>Ends {formatDate(pratyantar.endDate)}</span>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default DashaView;
