import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { ChartLegend } from '../components/ChartLegend';
import NorthIndianChart from '../components/NorthIndianChart';
import PlanetaryPositions from '../components/PlanetaryPositions';
import Loader from '../components/Loader';
import { generateDetailedKundliReport } from '../services/geminiService';
import { BirthChartAnalysis, UserProfile } from '../types';
import TransitView from '../components/TransitView';

interface ChartMetadata {
    title: string;
    description: string;
    usage: string;
    activation: string;
    keyPlanets: string[];
    focus: string;
}

const CHART_INFO: Record<string, ChartMetadata> = {
    'D1': {
        title: 'Lagna (Birth Chart)',
        description: 'The foundation of your existence. It represents your physical body, temperament, and overall path in life.',
        usage: 'Physical health, self, appearance, and the initial blueprint of destiny.',
        activation: 'From the moment of birth.',
        keyPlanets: ['Sun', 'Lagna Lord'],
        focus: 'The Physical Self'
    },
    'SUN': {
        title: 'Surya Kundli (Sun Chart)',
        description: 'The chart of the soul, authority, and ego. Here, the Sun\'s sign becomes the ascendant, revealing your core identity, vitality, and how the world perceives your power.',
        usage: 'Career authority, father, government relations, soul purpose, and public image.',
        activation: 'Always active — reveals the soul\'s essence.',
        keyPlanets: ['Sun', 'Mars', 'Jupiter'],
        focus: 'Soul & Authority'
    },
    'MOON': {
        title: 'Chandra Kundli (Moon Chart)',
        description: 'The chart of the mind, emotions, and inner world. The Moon\'s sign becomes the ascendant, revealing your emotional nature, mental tendencies, and intuitive patterns.',
        usage: 'Mental health, mother, emotional intelligence, relationships, and daily mental state.',
        activation: 'Always active — the mirror of the mind.',
        keyPlanets: ['Moon', 'Venus', 'Mercury'],
        focus: 'Mind & Emotion'
    },
    'D2': {
        title: 'Hora (Wealth Chart)',
        description: 'Focuses on the accumulation of wealth, financial stability, and your character regarding resources.',
        usage: 'Money, assets, family wealth, and the dual nature of Sun/Moon energies.',
        activation: 'When you start earning or managing assets.',
        keyPlanets: ['Jupiter', 'Venus'],
        focus: 'Prosperity & Values'
    },
    'D3': {
        title: 'Drekkana (Siblings & Action)',
        description: 'Represents your siblings, your courage, initiative, and the fruits of your hard work.',
        usage: 'Relations with brothers/sisters, travel, and the ability to take risks.',
        activation: 'Youth and early career stages.',
        keyPlanets: ['Mars'],
        focus: 'Initiative'
    },
    'D4': {
        title: 'Chaturthamsha (Assets & Luck)',
        description: 'The chart of fixed assets, destiny, and general happiness in your home life.',
        usage: 'Buying property, vehicles, and measuring overall "Bhagya" or fortune.',
        activation: 'Buying a home or seeking settled happiness.',
        keyPlanets: ['Moon', 'Venus'],
        focus: 'Stability'
    },
    'D5': {
        title: 'Panchamsa (Power & Fame)',
        description: 'Indicates authority, the fruits of past-life deeds, and your creative potential.',
        usage: 'Success in politics, leadership, and recognition from society.',
        activation: 'When reaching positions of authority.',
        keyPlanets: ['Sun', 'Jupiter'],
        focus: 'Authority'
    },
    'D6': {
        title: 'Shashtamsha (Health & Hurdles)',
        description: 'Deals with internal and external enemies, debts, and health issues.',
        usage: 'Managing illness, litigation, and day-to-day obstacles.',
        activation: 'During periods of conflict or health challenges.',
        keyPlanets: ['Mars', 'Saturn'],
        focus: 'Resilience'
    },
    'D7': {
        title: 'Saptamsa (Progeny & Legacy)',
        description: 'The primary chart for children, grandchildren, and the expansion of your lineage.',
        usage: 'Begetting children, their well-being, and your legacy.',
        activation: 'Marriage and parenthood.',
        keyPlanets: ['Jupiter'],
        focus: 'Children'
    },
    'D8': {
        title: 'Ashtamsha (Longevity & Sudden Events)',
        description: 'Examines life span, transformations, and sudden ups and downs.',
        usage: 'Sudden changes, inheritance, and long-term health.',
        activation: 'Major life transitions.',
        keyPlanets: ['Saturn'],
        focus: 'Transformation'
    },
    'D9': {
        title: 'Navamsa (Marriage & Soul)',
        description: 'The most important sub-chart. It shows the real strength of planets and the quality of your marriage.',
        usage: 'Partner, marriage quality, and spiritual maturity.',
        activation: 'After the age of 30 or upon marriage.',
        keyPlanets: ['Venus', 'Jupiter'],
        focus: 'Inner Strength'
    },
    'D10': {
        title: 'Dasamsa (Career & Status)',
        description: 'The chart of professional success, social standing, and your impact on the world.',
        usage: 'Career choice, promotions, and professional recognition.',
        activation: 'During peaks of professional activity.',
        keyPlanets: ['Mercury', 'Saturn', 'Sun'],
        focus: 'Vocation'
    },
    'D11': {
        title: 'Rudramsha (Unexpected Gains)',
        description: 'Represents huge victories, unexpected profits, and victory over enemies.',
        usage: 'Major lottery wins, extreme wealth shifts, and total dominance.',
        activation: 'Unforeseen opportunities.',
        keyPlanets: ['Jupiter'],
        focus: 'Expansion'
    },
    'D12': {
        title: 'Dwadasamsa (Lineage & Parents)',
        description: 'Analyzes your connection to your parents, ancestors, and inherited traits.',
        usage: 'Parental health, genetic inheritance, and ancestral blessings.',
        activation: 'Always active, defining your root identity.',
        keyPlanets: ['Sun', 'Moon'],
        focus: 'Ancestry'
    },
    'D16': {
        title: 'Shodasamsa (Luxury & Comfort)',
        description: 'The chart of vehicles, sophisticated luxuries, and mental peace through comfort.',
        usage: 'Buying cars, luxury travel, and psychological well-being.',
        activation: 'When achieving material abundance.',
        keyPlanets: ['Venus'],
        focus: 'Comfort'
    },
    'D20': {
        title: 'Vimsamsa (Spirituality)',
        description: 'Deals with meditation, worship, and the growth of your spiritual consciousness.',
        usage: 'Spiritual initiation, devotion, and religious pursuits.',
        activation: 'During spiritual awakening or senior life stages.',
        keyPlanets: ['Jupiter', 'Ketu'],
        focus: 'Devotion'
    },
    'D24': {
        title: 'Chaturvimsamsa (Knowledge)',
        description: 'The chart of higher education, specialized learning, and deep wisdom.',
        usage: 'Academic success, research, and mastery of arts/sciences.',
        activation: 'During student years and research.',
        keyPlanets: ['Mercury', 'Jupiter'],
        focus: 'Wisdom'
    },
    'D27': {
        title: 'Bhamsa (Inner Strength)',
        description: 'Measures the subconscious strength of your mind and soul.',
        usage: 'Resilience under extreme pressure and hidden talents.',
        activation: 'In moments of deep crisis.',
        keyPlanets: ['Moon', 'Mars'],
        focus: 'Fortitude'
    },
    'D30': {
        title: 'Trimsamsa (Evil & Character)',
        description: 'Analyzes negative character traits, misfortunes, and inherent vulnerabilities.',
        usage: 'Identifying bad habits, internal struggles, and major calamities.',
        activation: 'During testing times of character.',
        keyPlanets: ['Saturn'],
        focus: 'Shadow Self'
    },
    'D40': {
        title: 'Khavedamsa (Auspiciousness)',
        description: 'Deals with the subtler results of auspicious and inauspicious deeds.',
        usage: 'Fine-tuning general results of life.',
        activation: 'Always subtly active.',
        keyPlanets: ['Jupiter'],
        focus: 'Refinement'
    },
    'D45': {
        title: 'Akshavedamsa (All Areas)',
        description: 'A higher division providing general results for all areas with extreme precision.',
        usage: 'Confirming events that are ambiguous in other charts.',
        activation: 'Lifelong precision.',
        keyPlanets: ['Lagna Lord'],
        focus: 'Precision'
    },
    'D60': {
        title: 'Shashtiamsa (Past Life)',
        description: 'The most refined chart. Many classics say it is even more important than the D1.',
        usage: 'Deep karmic analysis, past lives, and total life result confirmation.',
        activation: 'Lifelong, governing all karmic debt.',
        keyPlanets: ['All Planets'],
        focus: 'Karmic Debt'
    }
};

interface KundliViewProps {
    analysis: BirthChartAnalysis;
    profile: UserProfile;
    onBack?: () => void;
}

const KundliView: React.FC<KundliViewProps> = ({ analysis, profile, onBack }) => {
    const [viewMode, setViewMode] = useState<'NATAL' | 'TRANSIT'>('NATAL');
    const [activeChart, setActiveChart] = useState<string>('D1');
    const [downloading, setDownloading] = useState(false);
    const [showSignNumbers, setShowSignNumbers] = useState(false);

    const chartOptions = [
        { id: 'D1', label: 'D1 Lagna' },
        { id: 'D2', label: 'D2 Hora' }, { id: 'D3', label: 'D3 Drekkana' },
        { id: 'D4', label: 'D4 Chaturthamsha' }, { id: 'D5', label: 'D5 Panchamsa' }, { id: 'D6', label: 'D6 Shashtamsha' },
        { id: 'D7', label: 'D7 Saptamsa' }, { id: 'D8', label: 'D8 Ashtamsha' }, { id: 'D9', label: 'D9 Navamsa' },
        { id: 'D10', label: 'D10 Dasamsa' }, { id: 'D11', label: 'D11 Rudramsha' }, { id: 'D12', label: 'D12 Dwadasamsa' },
        { id: 'D16', label: 'D16 Shodasamsa' }, { id: 'D20', label: 'D20 Vimsamsa' }, { id: 'D24', label: 'D24 Chaturvimsamsa' },
        { id: 'D27', label: 'D27 Bhamsa' }, { id: 'D30', label: 'D30 Trimsamsa' }, { id: 'D40', label: 'D40 Khavedamsa' },
        { id: 'D45', label: 'D45 Akshavedamsa' }, { id: 'D60', label: 'D60 Shashtiamsa' },
    ];

    const handleDownloadReport = async () => {
        setDownloading(true);
        try {
            const reportText = await generateDetailedKundliReport(profile, analysis);
            const blob = new Blob([reportText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${profile.name.replace(/\s+/g, '_')}_Kundli_Report.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) { console.error(e); alert("Failed to generate report."); }
        finally { setDownloading(false); }
    };

    const info = CHART_INFO[activeChart];

    // Helper to get display-safe planet details
    const getDisplayPlanetDetails = (chartKey: string) => {
        let details = analysis.planetaryDetails;
        
        if (chartKey === 'D1') {
            const hasUranus = details.some(p => p.name === 'Uranus');
            const uranusInHouse = analysis.houses.find(h => h.planets.includes('Uranus'));
            console.log("Kundli D1 Data:", { hasUranus, uranusInHouse });
            return details;
        }
        return details.map(p => ({
            ...p,
            dignity: 'normal' as const,
            isCombust: false
        }));
    };

    return (
        <div className="p-6 pb-32 fade-enter-active">
            {onBack && (
                <button onClick={onBack} className="flex items-center gap-2 text-charcoal-500 mb-6 hover:text-gold-600 transition-colors">
                    <Icons.ChevronLeft className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase tracking-widest">Back to Tools</span>
                </button>
            )}

            {/* View Toggle */}
            <div className="flex justify-center mb-6 mt-2">
                <div className="bg-stone-100 p-1 rounded-xl flex shadow-inner">
                    <button
                        onClick={() => setViewMode('NATAL')}
                        className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'NATAL' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        Natal Chart
                    </button>
                    <button
                        onClick={() => setViewMode('TRANSIT')}
                        className={`px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'TRANSIT' ? 'bg-white text-charcoal-900 shadow-sm' : 'text-stone-400 hover:text-stone-600'}`}
                    >
                        Gochar
                    </button>
                </div>
            </div>

            {viewMode === 'TRANSIT' ? (
                <TransitView natalAscendant={analysis.ascendant} onBack={() => setViewMode('NATAL')} />
            ) : (
                <>
                    <div className="flex items-center justify-between mb-4 px-2">
                        <h2 className="text-2xl font-serif text-charcoal-900">Vedic Charts</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setShowSignNumbers(!showSignNumbers)}
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-stone-200 shadow-sm text-[10px] font-bold uppercase tracking-wider text-charcoal-600 hover:border-gold-300 hover:text-gold-600 transition-all"
                            >
                                <span className="w-4 h-4 flex items-center justify-center bg-stone-100 rounded text-[9px] font-serif">
                                    {showSignNumbers ? '12' : 'Ar'}
                                </span>
                                {showSignNumbers ? 'Show Names' : 'Show Numbers'}
                            </button>
                        </div>
                    </div>

                    <div className="w-full overflow-x-auto no-scrollbar mb-6">
                        <div className="flex gap-2 w-max px-2">
                            {chartOptions.map(opt => (
                                <button
                                    key={opt.id}
                                    onClick={() => setActiveChart(opt.id)}
                                    className={`px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${activeChart === opt.id ? 'bg-charcoal-900 text-gold-400 border-charcoal-900 shadow-md' : 'bg-white text-charcoal-400 border-stone-200 hover:border-gold-300 hover:text-charcoal-600'}`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="w-full max-w-[340px] mx-auto mb-8">
                        {activeChart === 'D1' ? (
                            <NorthIndianChart
                                houses={analysis.houses}
                                planetDetails={getDisplayPlanetDetails('D1')}
                                showSignNumbers={showSignNumbers}
                            />
                        ) : (activeChart === 'SUN' || activeChart === 'MOON') ? (
                            <NorthIndianChart
                                houses={analysis.divisionalCharts[activeChart]?.houses || analysis.houses}
                                planetDetails={getDisplayPlanetDetails(activeChart)}
                                showSignNumbers={showSignNumbers}
                            />
                        ) : (
                            <NorthIndianChart
                                houses={analysis.divisionalCharts[activeChart]?.houses || analysis.houses}
                                planetDetails={getDisplayPlanetDetails(activeChart)}
                                showSignNumbers={showSignNumbers}
                            />
                        )}
                    </div>

                    {/* Sun & Moon Chart Buttons */}
                    <div className="flex items-center justify-center gap-3 mb-3">
                        {/* Sun Chart Button */}
                        <button
                            onClick={() => setActiveChart('SUN')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm text-[10px] font-bold uppercase tracking-widest transition-all ${
                                activeChart === 'SUN'
                                    ? 'bg-charcoal-900 text-gold-400 border-charcoal-900 shadow-md'
                                    : 'bg-white text-charcoal-500 border-stone-200 hover:text-gold-600 hover:border-gold-300'
                            }`}
                        >
                            <Icons.Sun className="w-3.5 h-3.5" />
                            <span>Surya</span>
                        </button>

                        {/* Moon Chart Button */}
                        <button
                            onClick={() => setActiveChart('MOON')}
                            className={`flex items-center gap-2 px-4 py-2 rounded-full border shadow-sm text-[10px] font-bold uppercase tracking-widest transition-all ${
                                activeChart === 'MOON'
                                    ? 'bg-charcoal-900 text-gold-400 border-charcoal-900 shadow-md'
                                    : 'bg-white text-charcoal-500 border-stone-200 hover:text-gold-600 hover:border-gold-300'
                            }`}
                        >
                            <Icons.Moon className="w-3.5 h-3.5" />
                            <span>Chandra</span>
                        </button>
                    </div>

                    {/* Chart Guide Legend */}
                    <ChartLegend />

                    {/* Visual Metadata Card */}
                    <div className="bg-white rounded-3xl p-6 border border-stone-100 shadow-sm mb-10 animate-fade-in" key={activeChart}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-serif text-charcoal-900">{info.title}</h3>
                            <span className="text-[10px] bg-gold-50 text-gold-600 px-2 py-1 rounded-full font-bold uppercase tracking-widest">{info.focus}</span>
                        </div>

                        <p className="text-sm text-charcoal-800/80 leading-relaxed mb-6 italic">
                            "{info.description}"
                        </p>

                        <div className="grid grid-cols-1 gap-5">
                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-gold-500 shrink-0">
                                    <Icons.Activity />
                                </div>
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest text-charcoal-400 font-bold mb-1">Primary Usage</h4>
                                    <p className="text-xs text-charcoal-800 leading-snug">{info.usage}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-gold-500 shrink-0">
                                    <Icons.Clock />
                                </div>
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest text-charcoal-400 font-bold mb-1">Activation Period</h4>
                                    <p className="text-xs text-charcoal-800 leading-snug">{info.activation}</p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-gold-500 shrink-0">
                                    <Icons.Star />
                                </div>
                                <div>
                                    <h4 className="text-[10px] uppercase tracking-widest text-charcoal-400 font-bold mb-1">Auspicious Placements</h4>
                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                        {info.keyPlanets.map(p => (
                                            <span key={p} className="text-[9px] bg-gold-50/50 text-gold-600 px-2 py-0.5 rounded border border-gold-100/30">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {activeChart === 'D1' && (
                        <PlanetaryPositions planetaryDetails={getDisplayPlanetDetails('D1')} />
                    )}
                </>
            )}
        </div>
    );
};

export default KundliView;
