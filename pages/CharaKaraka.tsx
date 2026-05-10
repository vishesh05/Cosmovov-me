import React, { useState, useMemo } from 'react';
import { Icons } from '../components/Icons';
import { BirthChartAnalysis, UserProfile } from '../types';
import { CharaKarakaCalculator } from '../services/charaKarakaEngine';
import { CHARA_KARAKA_INTERPRETATIONS, getKarakaInteractions } from '../data/charaKarakaInterpretations';

interface CharaKarakaPageProps {
  analysis: BirthChartAnalysis;
  profile: UserProfile;
  onBack: () => void;
}

const formatDegree = (degree: number) => {
  const d = Math.floor(degree);
  const m = Math.floor((degree - d) * 60);
  return `${d}°${m.toString().padStart(2, '0')}'`;
};

const CharaKarakaPage: React.FC<CharaKarakaPageProps> = ({ analysis, profile, onBack }) => {
  const [is8KarakaSystem, setIs8KarakaSystem] = useState(false);
  const [infoExpanded, setInfoExpanded] = useState(false);
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});

  const karakas = useMemo(() => {
    return CharaKarakaCalculator.calculate(analysis.planetaryDetails, is8KarakaSystem);
  }, [analysis, is8KarakaSystem]);

  const atmakaraka = karakas[0];
  const amatyakaraka = karakas[1];
  const darakaraka = karakas[karakas.length - 1];

  const interactions = useMemo(() => {
    if (!atmakaraka || !amatyakaraka || !darakaraka) return [];
    return getKarakaInteractions(atmakaraka.planetName, amatyakaraka.planetName, darakaraka.planetName);
  }, [atmakaraka, amatyakaraka, darakaraka]);

  const getAbbreviation = (name: string) => {
    switch (name) {
      case 'Atmakaraka': return 'AK';
      case 'Amatyakaraka': return 'AmK';
      case 'Bhratrikaraka': return 'BK';
      case 'Matrikaraka': return 'MK';
      case 'Pitrukaraka': return 'PiK';
      case 'Putrakaraka': return 'PK';
      case 'Gnatikaraka': return 'GK';
      case 'Darakaraka': return 'DK';
      default: return name.substring(0, 2).toUpperCase();
    }
  };

  const toggleExpand = (name: string) => {
    setExpandedCards(prev => ({ ...prev, [name]: !prev[name] }));
  };

  return (
    <div className="bg-ivory-50 dark:bg-[#141413] min-h-screen font-sans fade-enter-active p-6 pb-32">
      {/* Header */}
      <button onClick={onBack} className="flex items-center gap-2 text-charcoal-500 dark:text-stone-400 mb-6 hover:text-gold-600 dark:hover:text-gold-400 transition-colors">
        <Icons.ChevronLeft className="w-4 h-4" />
        <span className="text-xs font-bold uppercase tracking-widest">Back to Tools</span>
      </button>
      <h1 className="text-2xl font-serif text-charcoal-900 dark:text-ivory-50 mb-2 mt-2">Chara Karakas</h1>
      <p className="text-xs text-charcoal-500 dark:text-stone-400 mb-8">Jaimini Movable Significators of Your Soul</p>

      <div className="space-y-6">
        {/* Info Card */}
        <div className="bg-white dark:bg-[#1c1b19] rounded-3xl border border-stone-100 dark:border-[#33312e] shadow-sm overflow-hidden flex flex-col transition-all">
          <button 
            onClick={() => setInfoExpanded(!infoExpanded)}
            className="flex items-center justify-between p-5 text-left w-full hover:bg-stone-50 dark:hover:bg-[#2a2826] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="text-gold-600 bg-gold-50 dark:bg-gold-900/20 p-2 rounded-full">
                <Icons.Activity className="w-4 h-4" />
              </div>
              <span className="font-bold text-charcoal-900 dark:text-ivory-50">What are Chara Karakas?</span>
            </div>
            <Icons.ChevronDown className={`w-5 h-5 text-gold-600 transition-transform duration-300 ${infoExpanded ? 'rotate-180' : ''}`} />
          </button>
          
          <div className={`overflow-hidden transition-all duration-300 ${infoExpanded ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'}`}>
            <div className="p-5 pt-0 text-charcoal-600 dark:text-stone-400 text-sm leading-relaxed border-t border-stone-50 dark:border-[#33312e] mt-2">
              Chara Karakas are seven special planetary roles assigned uniquely to your birth chart. Each planet takes on a role based on its exact degree, revealing the cosmic blueprint of your soul, relationships, and life purpose.
            </div>
          </div>
        </div>

        {/* Toggle Switch */}
        <div className="flex gap-2">
          <button
            onClick={() => setIs8KarakaSystem(false)}
            className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${!is8KarakaSystem 
                  ? 'bg-charcoal-900 dark:bg-[#1a1917] text-gold-400 shadow-lg border border-transparent dark:border-[#33312e]'
                  : 'bg-white dark:bg-[#1c1b19] text-charcoal-600 dark:text-stone-400 border border-stone-200 dark:border-[#33312e] hover:border-gold-300'
              }`}
          >
            7 KARAKAS
          </button>
          <button
            onClick={() => setIs8KarakaSystem(true)}
             className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${is8KarakaSystem 
                  ? 'bg-charcoal-900 dark:bg-[#1a1917] text-gold-400 shadow-lg border border-transparent dark:border-[#33312e]'
                  : 'bg-white dark:bg-[#1c1b19] text-charcoal-600 dark:text-stone-400 border border-stone-200 dark:border-[#33312e] hover:border-gold-300'
              }`}
          >
            8 KARAKAS
          </button>
        </div>

        {/* Horizontal Quick View */}
        <div className="flex overflow-x-auto gap-4 pb-6 -mx-6 px-6 no-scrollbar snap-x snap-mandatory relative scroll-smooth">
          {karakas.map((k, i) => (
            <div 
              key={k.karakaName} 
              className={`snap-start flex-shrink-0 w-24 rounded-2xl flex flex-col items-center justify-center p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-1 ${
                i === 0 
                  ? 'bg-gold-50/80 dark:bg-gold-900/20 border border-gold-200 dark:border-gold-800 shadow-md shadow-gold-100/50 dark:shadow-gold-900/10' 
                  : 'bg-white dark:bg-[#1c1b19] border border-stone-100 dark:border-[#33312e] shadow-sm'
              }`}
            >
              <div className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${i === 0 ? 'text-gold-700 dark:text-gold-400' : 'text-charcoal-400 dark:text-stone-500'}`}>
                {getAbbreviation(k.karakaName)}
              </div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mb-2 shadow-sm ${
                i === 0 ? 'bg-white dark:bg-[#1c1b19] text-gold-600 dark:text-gold-400 border border-gold-200 dark:border-gold-800' : 'bg-ivory-50 dark:bg-[#2a2826] text-charcoal-600 dark:text-stone-300 border border-stone-200 dark:border-[#33312e]'
              }`}>
                {k.planetName.substring(0, 2)}
              </div>
              <div className="text-sm font-bold text-charcoal-900 dark:text-ivory-50">{k.planetName}</div>
              <div className="text-[10px] text-charcoal-500 dark:text-stone-400 mt-1 font-mono bg-stone-50 dark:bg-stone-900/40 px-1.5 py-0.5 rounded-md">
                {formatDegree(k.signDegree)}
              </div>
            </div>
          ))}
        </div>

        {/* Atmakaraka Feature Card */}
        {atmakaraka && (
          <div className="bg-charcoal-900 text-gold-400 rounded-3xl p-6 border border-charcoal-800 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6 border-b border-charcoal-800 pb-5">
                <div>
                  <div className="text-gold-500/80 text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-500 animate-pulse"></span>
                    Soul Significator
                  </div>
                  <h2 className="text-4xl font-serif text-white mb-1 tracking-wide">{atmakaraka.planetName}</h2>
                  <div className="text-xs text-gold-300/70 font-medium tracking-wide">Atmakaraka (AK)</div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="text-2xl font-mono text-gold-300 bg-charcoal-800/50 px-3 py-1 rounded-xl border border-charcoal-700/50">
                    {formatDegree(atmakaraka.signDegree)}
                  </div>
                  <div className="text-[10px] text-stone-400 mt-2 flex items-center gap-1.5 uppercase tracking-widest font-bold">
                    <span>{atmakaraka.planetSign.substring(0,3)}</span>
                    <span className="text-charcoal-600">•</span>
                    <span>{atmakaraka.planetNakshatra.substring(0, 10)}</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-stone-300 leading-relaxed font-light">
                {CHARA_KARAKA_INTERPRETATIONS['Atmakaraka']?.[atmakaraka.planetName]}
              </div>
            </div>
          </div>
        )}

        {/* Remaining Karakas List */}
        <div>
          <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 mb-4 px-1">Life Area Significators</h3>
          <div className="space-y-2">
            {karakas.slice(1).map((k) => (
              <div key={k.karakaName} className="bg-white dark:bg-[#1c1b19] rounded-2xl border border-stone-100 dark:border-[#33312e] shadow-sm overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => toggleExpand(k.karakaName)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-stone-50 dark:hover:bg-[#2a2826] transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-ivory-50 dark:bg-[#2a2826] text-charcoal-500 dark:text-stone-400 flex items-center justify-center text-xs font-bold border border-stone-200 dark:border-[#33312e]">
                        {getAbbreviation(k.karakaName)}
                      </span>
                      <span className="text-sm font-bold text-charcoal-900 dark:text-ivory-50">{k.karakaName.replace('karaka', '')}</span>
                    </div>
                  </div>
                  
                  <div className="flex-1 flex justify-center items-center gap-2">
                    <span className="text-sm font-bold text-charcoal-800 dark:text-ivory-50">{k.planetName}</span>
                    <span className="text-[10px] text-charcoal-400 dark:text-stone-500 font-mono bg-stone-50 dark:bg-stone-900/40 px-1.5 py-0.5 rounded-md hidden sm:inline-block">
                      {formatDegree(k.signDegree)}
                    </span>
                  </div>

                  <div className="flex-1 flex justify-end">
                    <Icons.ChevronDown className={`w-5 h-5 text-stone-400 transition-transform duration-300 ${expandedCards[k.karakaName] ? 'rotate-180' : ''}`} />
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ease-in-out ${expandedCards[k.karakaName] ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="p-5 bg-ivory-50 dark:bg-[#141413] border-t border-stone-100 dark:border-[#33312e]">
                    <div className="flex justify-between items-center mb-3">
                      <div className="text-[10px] text-charcoal-500 dark:text-stone-400 uppercase tracking-widest font-bold">
                        {k.karakaName === 'Amatyakaraka' && 'Career & Mind'}
                        {k.karakaName === 'Bhratrikaraka' && 'Siblings & Courage'}
                        {k.karakaName === 'Matrikaraka' && 'Mother & Nurturing'}
                        {k.karakaName === 'Putrakaraka' && 'Children & Creativity'}
                        {k.karakaName === 'Gnatikaraka' && 'Extended Family & Service'}
                        {k.karakaName === 'Darakaraka' && 'Spouse & Partnerships'}
                        {k.karakaName === 'Pitrukaraka' && 'Father & Ancestors'}
                      </div>
                      <div className="text-[10px] text-charcoal-500 dark:text-stone-400 bg-white dark:bg-[#1c1b19] border border-stone-200 dark:border-[#33312e] px-1.5 py-0.5 rounded-md font-mono sm:hidden">
                        {formatDegree(k.signDegree)}
                      </div>
                    </div>
                    <p className="text-sm text-charcoal-700 dark:text-stone-300 leading-relaxed">
                      {CHARA_KARAKA_INTERPRETATIONS[k.karakaName]?.[k.planetName] || "Unique cosmic imprint shaping this life area. This planet's nature dictates how you experience these specific themes."}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Interactions */}
        {interactions.length > 0 && (
          <div className="bg-white dark:bg-[#1c1b19] rounded-3xl p-6 border border-stone-100 dark:border-[#33312e] shadow-sm mt-6">
            <h3 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 mb-5 flex items-center gap-2">
              <span className="text-gold-500"><Icons.Sparkles className="w-4 h-4" /></span>
              Karaka Interactions
            </h3>
            <div className="space-y-4">
              {interactions.map((interaction, i) => (
                <div key={i} className="bg-ivory-50 dark:bg-[#2a2826] p-5 rounded-2xl border border-stone-100 dark:border-[#33312e] hover:border-gold-200 dark:hover:border-gold-800 transition-colors">
                  <h4 className="text-sm font-bold text-charcoal-900 dark:text-ivory-50 mb-2">{interaction.title}</h4>
                  <p className="text-xs text-charcoal-600 dark:text-stone-300 leading-relaxed">{interaction.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CharaKarakaPage;
