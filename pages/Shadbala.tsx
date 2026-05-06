
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icons';
import { calculateShadbala } from '../services/astrologyEngine';
import { BirthChartAnalysis, UserProfile, ShadbalaResult } from '../types';

const SHADBALA_DEFINITIONS = {
  sthana: {
    label: "Positional Strength (Sthana Bala)",
    concept: "Measures the planet's stability based on its residence in a specific Sign and House.",
    high: {
      text: "Strong positional support.",
      detail: "This planet stands on firm ground. It is comfortable, welcome, and resourceful in its environment.",
      impact: "You are confident and well-supported in this area of life."
    },
    mid: {
      text: "Moderate stability.",
      detail: "The planet has a functional position but may lack special resources or deep stability.",
      impact: "Results come through steady effort rather than natural advantage."
    },
    low: {
      text: "Weak positional support.",
      detail: "The planet feels out of place or unsupported, struggling to establish a solid foundation.",
      impact: "You may feel unsettled or lack resources in areas ruled by this planet."
    }
  },
  dig: {
    label: "Directional Strength (Dig Bala)",
    concept: "Measures potency based on the planet's position relative to the cardinal directions (Angles).",
    high: {
      text: "Powerful directional force.",
      detail: "The planet is at its peak power direction. It can manifest its desires easily and effectively.",
      impact: "You can easily project your will and achieve goals related to this planet."
    },
    mid: {
      text: "Average directional force.",
      detail: "The planet has average directional force. It can act, but requires some effort.",
      impact: "Success is possible but requires conscious direction."
    },
    low: {
      text: "Directionally weak.",
      detail: "The planet is directionless or disoriented. It struggles to project its influence outwardly.",
      impact: "You may feel confused or passive in these matters."
    }
  },
  kala: {
    label: "Temporal Strength (Kala Bala)",
    concept: "Measures suitability based on the time of birth (Day/Night), lunar phase, and planetary hours.",
    high: {
      text: "Timely and opportune.",
      detail: "Born at a time that naturally favors this planet. Opportunities arise at the perfect moment.",
      impact: "Events tend to happen at the right time for you."
    },
    mid: {
      text: "Neutral timing.",
      detail: "The timing is neutral. Success depends more on effort than lucky timing.",
      impact: "Progress is steady but rarely spontaneous."
    },
    low: {
      text: "Untimely influence.",
      detail: "The time of birth does not naturally support this planet, suggesting delays or bad timing.",
      impact: "You may face delays or need to wait for the right moment."
    }
  },
  cheshta: {
    label: "Motional Strength (Cheshta Bala)",
    concept: "Measures intensity based on the planet's speed and retrograde motion.",
    high: {
      text: "Intense and active.",
      detail: "The planet is slow or retrograde, indicating intense, internalized, and deliberate energy.",
      impact: "You have a deep, internal focus and persistence in this area."
    },
    mid: {
      text: "Routine motion.",
      detail: "The planet is moving at normal speed, indicating routine and steady functioning.",
      impact: "Energy flows normally without blockage or obsession."
    },
    low: {
      text: "Fast or erratic.",
      detail: "The planet is moving fast or erratically, dispersing its energy without deep focus.",
      impact: "You may act impulsively or lack follow-through."
    }
  },
  naisargika: {
    label: "Natural Strength (Naisargika Bala)",
    concept: "A fixed value representing the planet's inherent luminosity and dominance in the solar system.",
    high: {
      text: "Naturally dominant.",
      detail: "This planet is naturally dominant and bright (like Sun or Moon), commanding attention easily.",
      impact: "This energy is a central part of your personality."
    },
    mid: {
      text: "Moderately influential.",
      detail: "This planet has moderate natural influence (like Venus or Jupiter).",
      impact: "This energy supports you but doesn't overwhelm."
    },
    low: {
      text: "Naturally subtle.",
      detail: "This planet is naturally subtle or dim (like Saturn or Mars), working in the background.",
      impact: "This energy works behind the scenes."
    }
  },
  drik: {
    label: "Aspect Strength (Drik Bala)",
    concept: "Measures the influence of 'glances' (aspects) from other planets.",
    high: {
      text: "Supported by aspects.",
      detail: "Receives strong support from benefic planets. Help arrives from others when needed.",
      impact: "You receive help and mentorship easily."
    },
    mid: {
      text: "Neutral aspects.",
      detail: "Receives a mix of support and opposition, or no major aspects.",
      impact: "You are self-reliant in this area."
    },
    low: {
      text: "Obstructed by aspects.",
      detail: "Receives obstructing glances from malefic planets. Faces external opposition or criticism.",
      impact: "You may face opposition or criticism from others."
    }
  }
};

interface ShadbalaToolProps {
    analysis: BirthChartAnalysis;
    profile: UserProfile;
    onBack: () => void;
}

const ShadbalaTool: React.FC<ShadbalaToolProps> = ({ analysis, profile, onBack }) => {
    const [results, setResults] = useState<ShadbalaResult[]>([]);
    const [expandedPlanet, setExpandedPlanet] = useState<string | null>(null);
    const [expandedComponents, setExpandedComponents] = useState<{[key: string]: string | null}>({});

    useEffect(() => {
        const res = calculateShadbala(analysis, profile);
        setResults(res.sort((a, b) => b.total - a.total));
    }, [analysis, profile]);

    const handleExpandPlanet = (planet: string) => {
        setExpandedPlanet(expandedPlanet === planet ? null : planet);
    };

    const handleExpandComponent = (planet: string, component: string) => {
        setExpandedComponents(prev => ({
            ...prev,
            [planet]: prev[planet] === component ? null : component
        }));
    };

    const getStrengthColor = (val: number, max: number = 100) => {
        const pct = (val / max) * 100;
        if (pct >= 75) return 'bg-emerald-500';
        if (pct >= 50) return 'bg-gold-500';
        return 'bg-red-400';
    };

    const getInsight = (type: keyof typeof SHADBALA_DEFINITIONS, score: number) => {
        const def = SHADBALA_DEFINITIONS[type];
        let level: 'high' | 'mid' | 'low' = 'mid';
        
        if (type === 'sthana') level = score >= 80 ? 'high' : score >= 60 ? 'mid' : 'low';
        else if (type === 'dig') level = score >= 50 ? 'high' : score >= 30 ? 'mid' : 'low';
        else if (type === 'kala') level = score >= 70 ? 'high' : score >= 50 ? 'mid' : 'low';
        else if (type === 'cheshta') level = score >= 80 ? 'high' : score >= 50 ? 'mid' : 'low';
        else if (type === 'drik') level = score >= 60 ? 'high' : score >= 40 ? 'mid' : 'low';
        else if (type === 'naisargika') level = score >= 60 ? 'high' : score >= 40 ? 'mid' : 'low';

        return {
            ...def[level],
            concept: def.concept,
            label: def.label,
            statusLevel: level
        };
    };

    const getPlanetDetails = (pName: string) => analysis.planetaryDetails.find(pd => pd.name === pName);

    return (
        <div className="p-6 pb-32 fade-enter-active">
            <button onClick={onBack} className="flex items-center gap-2 text-charcoal-500 mb-6 hover:text-gold-600 transition-colors">
                <Icons.ChevronLeft />
                <span className="text-xs font-bold uppercase tracking-widest">Back to Tools</span>
            </button>

            <h2 className="text-2xl font-serif text-charcoal-900 mb-1">Shadbala Strength</h2>
            <p className="text-charcoal-500 text-xs mb-8">Planetary Power Analysis</p>

            <div className="space-y-4">
                {results.map((item, idx) => {
                    const isExpanded = expandedPlanet === item.planet;
                    const details = getPlanetDetails(item.planet);
                    const activeComponent = expandedComponents[item.planet];
                    
                    return (
                        <div key={item.planet} className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-gold-400 shadow-xl' : 'border-stone-100 shadow-sm'}`}>
                            <button 
                                onClick={() => handleExpandPlanet(item.planet)}
                                className="w-full p-5 flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div className="text-xs font-bold text-stone-300 w-4">#{idx + 1}</div>
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-serif text-xl font-bold border transition-colors ${isExpanded ? 'bg-charcoal-900 text-gold-400 border-charcoal-900' : 'bg-stone-50 text-charcoal-600 border-stone-100'}`}>
                                        {item.planet.substring(0, 2)}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="flex justify-between items-center mb-1">
                                            <div>
                                                <span className="text-base font-bold text-charcoal-900 mr-2">{item.planet}</span>
                                            </div>
                                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${item.total >= 350 ? 'bg-green-50 text-green-700' : 'bg-stone-50 text-stone-500'}`}>
                                                {Math.round(item.total)} pts
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap gap-1.5 mb-2">
                                            {details?.dignity && details.dignity !== 'normal' && (
                                                <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded border ${details.dignity === 'exalted' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                                    {details.dignity}
                                                </span>
                                            )}
                                            {details?.isRetro && (
                                                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-50 border border-blue-100 text-blue-600">Retrograde</span>
                                            )}
                                            {details?.isCombust && (
                                                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-50 border border-orange-100 text-orange-600">Combust</span>
                                            )}
                                            {details && (
                                                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-stone-50 border border-stone-100 text-stone-500">
                                                    {details.rashi}
                                                </span>
                                            )}
                                        </div>
                                        <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                                            <div 
                                                className={`h-full rounded-full transition-all duration-1000 ${getStrengthColor(item.total, 600)}`}
                                                style={{ width: `${Math.min(100, (item.total / 600) * 100)}%` }} 
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`ml-4 text-stone-300 transition-transform ${isExpanded ? 'rotate-90 text-gold-500' : ''}`}>
                                    <Icons.ChevronRight />
                                </div>
                            </button>
                            {isExpanded && (
                                <div className="bg-stone-50/50 p-5 border-t border-stone-100 animate-fade-in">
                                    <div className="grid grid-cols-1 gap-3">
                                        {[
                                            { key: 'sthana', val: item.components.sthana },
                                            { key: 'dig', val: item.components.dig },
                                            { key: 'kala', val: item.components.kala },
                                            { key: 'cheshta', val: item.components.cheshta },
                                            { key: 'naisargika', val: item.components.naisargika },
                                            { key: 'drik', val: item.components.drik },
                                        ].map((comp) => {
                                            const insight = getInsight(comp.key as keyof typeof SHADBALA_DEFINITIONS, comp.val);
                                            const isCompExpanded = activeComponent === comp.key;
                                            return (
                                                <div 
                                                    key={comp.key} 
                                                    className={`bg-white rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${isCompExpanded ? 'border-gold-400 ring-1 ring-gold-100 shadow-md' : 'border-stone-100 shadow-sm hover:border-gold-200'}`}
                                                    onClick={() => handleExpandComponent(item.planet, comp.key)}
                                                >
                                                    <div className="p-3">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <div className="flex flex-col">
                                                                <span className={`text-[10px] uppercase tracking-widest font-bold ${isCompExpanded ? 'text-gold-600' : 'text-stone-500'}`}>
                                                                    {insight.label}
                                                                </span>
                                                            </div>
                                                            <span className="text-xs font-bold text-charcoal-800">{Math.round(comp.val)}</span>
                                                        </div>
                                                        <div className="w-full h-1 bg-stone-100 rounded-full overflow-hidden mb-2">
                                                            <div 
                                                                className={`h-full rounded-full ${getStrengthColor(comp.val, 100)}`} 
                                                                style={{ width: `${Math.min(100, comp.val)}%` }}
                                                            ></div>
                                                        </div>
                                                        <p className="text-[10px] text-charcoal-500 font-medium italic truncate">
                                                            "{insight.text}"
                                                        </p>
                                                    </div>
                                                    <div className={`bg-ivory-50 border-t border-stone-100 transition-all duration-300 ease-in-out ${isCompExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                        <div className="p-4 space-y-4">
                                                            <div>
                                                                <h4 className="text-[9px] uppercase tracking-widest text-gold-600 font-bold mb-1">Meaning</h4>
                                                                <p className="text-xs text-charcoal-600 leading-relaxed font-light">{insight.concept}</p>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-[9px] uppercase tracking-widest text-gold-600 font-bold mb-1">Why {insight.statusLevel === 'high' ? 'High' : insight.statusLevel === 'mid' ? 'Moderate' : 'Low'}?</h4>
                                                                <p className="text-xs text-charcoal-600 leading-relaxed font-light">{insight.detail}</p>
                                                            </div>
                                                            <div>
                                                                <h4 className="text-[9px] uppercase tracking-widest text-gold-600 font-bold mb-1">Life Impact</h4>
                                                                <p className="text-xs text-charcoal-600 leading-relaxed font-light italic">"{insight.impact}"</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ShadbalaTool;
