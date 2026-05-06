
import React, { useState } from 'react';
import { Icons } from '../components/Icons';
import { BirthChartAnalysis, UserProfile, AppView } from '../types';
import ShadbalaTool from './Shadbala';
import YogaView from './Yoga';
import PlanetaryDetails from './PlanetaryDetails';
import Ashtakvarga from './Ashtakvarga';
import CharaKarakaPage from './CharaKaraka';

import { getTerm } from '../services/astrologyTerminology';

interface ToolsViewProps {
    analysis: BirthChartAnalysis;
    profile: UserProfile;
    onNavigate: (view: AppView) => void;
}

const ToolsView: React.FC<ToolsViewProps> = ({ analysis, profile, onNavigate }) => {
    const [activeTool, setActiveTool] = useState<string | null>(null);

    // Provide astrologyStyle to sub-components that might need it if we refactor them
    if (activeTool === 'shadbala') {
        return <ShadbalaTool analysis={analysis} profile={profile} onBack={() => setActiveTool(null)} />;
    }
    if (activeTool === 'yoga') {
        return <YogaView analysis={analysis} profile={profile} onBack={() => setActiveTool(null)} />;
    }
    if (activeTool === 'planetary') {
        return <PlanetaryDetails analysis={analysis} profile={profile} onBack={() => setActiveTool(null)} />;
    }
    if (activeTool === 'ashtakvarga') {
        return <Ashtakvarga analysis={analysis} profile={profile} onBack={() => setActiveTool(null)} />;
    }
    if (activeTool === 'charakaraka') {
        return <CharaKarakaPage analysis={analysis} profile={profile} onBack={() => setActiveTool(null)} />;
    }

    return (
        <div className="p-6 pb-32 fade-enter-active">
            <h2 className="text-2xl font-serif text-charcoal-900 mb-2 mt-2">Astrology Tools</h2>
            <p className="text-charcoal-500 text-xs mb-8">Deep dive into planetary details</p>

            <div className="grid grid-cols-1 gap-4">
                {/* Planetary Details Tool Card */}
                <button
                    onClick={() => setActiveTool('planetary')}
                    className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm text-left hover:border-gold-300 transition-colors group w-full"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gold-50 text-gold-600 flex items-center justify-center group-hover:bg-gold-100 transition-colors">
                            <Icons.Activity />
                        </div>
                        <div>
                            <h3 className="font-bold text-charcoal-900 group-hover:text-gold-600 transition-colors">Planetary Details</h3>
                            <p className="text-xs text-charcoal-500">Complete position, {getTerm('nakshatra', 'vedic').toLowerCase()} & dignity analysis</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {analysis.planetaryDetails.slice(0, 9).map((p, i) => (
                            <div key={i} className="flex items-center justify-between text-xs bg-ivory-50 rounded-lg px-2 py-1.5 border border-stone-100">
                                <div className="flex items-center gap-1">
                                    <span className="font-medium text-charcoal-800">{p.name}</span>
                                    {p.isRetro && <span className="text-[8px] text-red-500">Rx</span>}
                                </div>
                                <span className="text-[10px] text-charcoal-400 font-serif">{p.rashi.substring(0, 3)}</span>
                            </div>
                        ))}
                    </div>
                </button>

                {/* Birth Chart (Kundli) Tool Card */}
                <button
                    onClick={() => onNavigate(AppView.Kundli)}
                    className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 text-left hover:border-gold-300 transition-colors group"
                >
                    <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-gold-50 group-hover:text-gold-600 transition-colors">
                        <Icons.Compass className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-charcoal-900 group-hover:text-gold-600 transition-colors">Birth Chart ({getTerm('kundli', 'vedic')})</h3>
                        <p className="text-xs text-charcoal-500">View North & South Indian styled natal charts</p>
                    </div>
                </button>

                {/* Timeline (Dasha) Tool Card */}
                <button
                    onClick={() => onNavigate(AppView.Dashas)}
                    className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 text-left hover:border-gold-300 transition-colors group"
                >
                    <div className="w-10 h-10 rounded-full bg-stone-900 text-gold-400 flex items-center justify-center group-hover:bg-gold-50 group-hover:text-gold-600 transition-colors">
                        <Icons.History />
                    </div>
                    <div>
                        <h3 className="font-bold text-charcoal-900 group-hover:text-gold-600 transition-colors">Timeline ({getTerm('dasha', 'vedic')})</h3>
                        <p className="text-xs text-charcoal-500">Major life cycles & periods</p>
                    </div>
                </button>

                <button
                    onClick={() => setActiveTool('shadbala')}
                    className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 text-left hover:border-gold-300 transition-colors group"
                >
                    <div className="w-10 h-10 rounded-full bg-cosmic-100 text-cosmic-500 flex items-center justify-center group-hover:bg-gold-50 group-hover:text-gold-600 transition-colors">
                        <Icons.Chart />
                    </div>
                    <div>
                        <h3 className="font-bold text-charcoal-900 group-hover:text-gold-600 transition-colors">Shadbala Strength</h3>
                        <p className="text-xs text-charcoal-500">Six-fold planetary power analysis</p>
                    </div>
                </button>

                <button
                    onClick={() => setActiveTool('yoga')}
                    className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 text-left hover:border-gold-300 transition-colors group"
                >
                    <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center group-hover:bg-gold-50 group-hover:text-gold-600 transition-colors">
                        <Icons.Orbit />
                    </div>
                    <div>
                        <h3 className="font-bold text-charcoal-900 group-hover:text-gold-600 transition-colors">Yoga & Combinations</h3>
                        <p className="text-xs text-charcoal-500">Classical planetary unions</p>
                    </div>
                </button>

                <button
                    onClick={() => setActiveTool('ashtakvarga')}
                    className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 text-left hover:border-gold-300 transition-colors group"
                >
                    <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center group-hover:bg-gold-50 group-hover:text-gold-600 transition-colors">
                        <Icons.Grid className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-charcoal-900 group-hover:text-gold-600 transition-colors">Ashtakvarga</h3>
                        <p className="text-xs text-charcoal-500">Eight-fold strength (Bindu system)</p>
                    </div>
                </button>

                {/* Chara Karakas Tool Card */}
                <button
                    onClick={() => setActiveTool('charakaraka')}
                    className="bg-white p-5 rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 text-left hover:border-gold-300 transition-colors group"
                >
                    <div className="w-10 h-10 rounded-full bg-orange-50 text-gold-600 flex items-center justify-center group-hover:bg-gold-50 transition-colors">
                        <Icons.Compass className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-charcoal-900 group-hover:text-gold-600 transition-colors">Chara Karakas</h3>
                        <p className="text-xs text-charcoal-500">Jaimini Movable Significators</p>
                    </div>
                </button>

                <div className="bg-stone-50 p-5 rounded-3xl border border-stone-100 border-dashed text-center opacity-70">
                    <p className="text-xs font-bold text-charcoal-400 uppercase tracking-widest">More Tools Coming Soon</p>
                </div>
            </div>
        </div>
    );
};

export default ToolsView;
