
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { calculateShadbala } from '../services/astrologyEngine';
import { calculateYogas } from '../services/yogaEngine';
import { BirthChartAnalysis, UserProfile, YogaResult } from '../types';

interface YogaViewProps {
    analysis: BirthChartAnalysis;
    profile: UserProfile;
    onBack: () => void;
}

const YogaView: React.FC<YogaViewProps> = ({ analysis, profile, onBack }) => {
    const [yogas, setYogas] = useState<YogaResult[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('All');
    const [expandedYoga, setExpandedYoga] = useState<string | null>(null);

    useEffect(() => {
        const shadbala = calculateShadbala(analysis, profile);
        const results = calculateYogas(analysis, shadbala);
        setYogas(results);
    }, [analysis, profile]);

    const categories = ['All', 'Raja', 'Dhana', 'Vipreet', 'Mahapurusha', 'Moon', 'Exchange'];
    const filteredYogas = activeCategory === 'All' ? yogas : yogas.filter(y => y.category === activeCategory);

    const getStrengthBadgeColor = (s: string) => {
        if (s === 'Strong') return 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-100 dark:border-green-900/30';
        if (s === 'Moderate') return 'bg-gold-50 dark:bg-gold-900/20 text-gold-700 dark:text-gold-400 border-gold-100 dark:border-gold-900/30';
        return 'bg-stone-50 dark:bg-stone-900/40 text-stone-500 dark:text-stone-400 border-stone-100 dark:border-[#33312e]';
    };

    return (
        <div className="p-6 pb-32 fade-enter-active">
            <button onClick={onBack} className="flex items-center gap-2 text-charcoal-500 dark:text-stone-400 mb-6 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
                <Icons.ChevronLeft />
                <span className="text-xs font-bold uppercase tracking-widest">Back to Tools</span>
            </button>

            <h2 className="text-2xl font-serif text-charcoal-900 dark:text-ivory-50 mb-1">Yoga & Combinations</h2>
            <p className="text-charcoal-500 dark:text-stone-400 text-xs mb-6">{yogas.length} Yogas found in your chart</p>

            <div className="w-full overflow-x-auto no-scrollbar mb-6">
                <div className="flex gap-2 w-max px-1">
                     {categories.map(cat => (
                        <button 
                            key={cat}
                            onClick={() => setActiveCategory(cat)} 
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${activeCategory === cat ? 'bg-charcoal-900 dark:bg-[#1a1917] text-gold-400 border-charcoal-900 dark:border-[#33312e] shadow-md' : 'bg-white dark:bg-[#1c1b19] text-charcoal-400 dark:text-stone-400 border-stone-200 dark:border-[#33312e] hover:border-gold-300 dark:hover:border-gold-700/50 hover:text-charcoal-600 dark:hover:text-stone-300'}`}
                        >
                            {cat}
                        </button>
                     ))}
                </div>
            </div>

            {filteredYogas.length === 0 ? (
                <div className="p-10 text-center bg-white dark:bg-[#1c1b19] rounded-3xl border border-dashed border-stone-200 dark:border-stone-700">
                    <p className="text-charcoal-400 dark:text-stone-400 text-sm">No yogas found in this category.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filteredYogas.map(yoga => {
                        const isExpanded = expandedYoga === yoga.id;
                        return (
                            <div key={yoga.id} className={`bg-white dark:bg-[#1c1b19] rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-gold-400 shadow-xl' : 'border-stone-100 dark:border-[#33312e] shadow-sm'}`}>
                                <button 
                                    onClick={() => setExpandedYoga(isExpanded ? null : yoga.id)}
                                    className="w-full p-5 text-left"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-base font-bold text-charcoal-900 dark:text-ivory-50">{yoga.name}</h3>
                                        <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border ${getStrengthBadgeColor(yoga.strength)}`}>
                                            {yoga.strength}
                                        </span>
                                    </div>
                                    <p className="text-xs text-charcoal-500 dark:text-stone-400 font-light mb-3">{yoga.description}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-1.5">
                                            {yoga.planets.map(p => (
                                                <span key={p} className="text-[9px] bg-stone-50 dark:bg-stone-900/40 border border-stone-100 dark:border-[#33312e] px-1.5 py-0.5 rounded text-charcoal-600 dark:text-stone-300 font-medium">
                                                    {p}
                                                </span>
                                            ))}
                                        </div>
                                        <div className={`transition-transform duration-300 text-stone-300 dark:text-stone-600 ${isExpanded ? 'rotate-90 text-gold-500' : ''}`}>
                                            <Icons.ChevronRight />
                                        </div>
                                    </div>
                                </button>
                                {isExpanded && (
                                    <div className="bg-stone-50/50 dark:bg-[#141413] p-5 border-t border-stone-100 dark:border-[#33312e] animate-fade-in space-y-4">
                                        <div>
                                            <h4 className="text-[9px] uppercase tracking-widest text-gold-600 dark:text-gold-400 font-bold mb-1">Formation</h4>
                                            <p className="text-xs text-charcoal-700 dark:text-stone-300 leading-relaxed bg-white dark:bg-[#1a1917] p-3 rounded-xl border border-stone-100 dark:border-[#33312e] shadow-sm">
                                                {yoga.formationReason}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <h4 className="text-[9px] uppercase tracking-widest text-gold-600 dark:text-gold-400 font-bold mb-1">Strength Analysis</h4>
                                                <p className="text-xs text-charcoal-600 dark:text-stone-300 font-light italic">"{yoga.strengthReason}"</p>
                                            </div>
                                            <div>
                                                <h4 className="text-[9px] uppercase tracking-widest text-gold-600 dark:text-gold-400 font-bold mb-1">Life Impact</h4>
                                                <div className="flex flex-wrap gap-1">
                                                    {yoga.lifeAreas.map(area => (
                                                        <span key={area} className="text-[9px] text-charcoal-600 dark:text-gold-400 bg-gold-50/50 dark:bg-gold-900/20 px-1.5 py-0.5 rounded border border-gold-100/50 dark:border-gold-900/30">
                                                            {area}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default YogaView;
