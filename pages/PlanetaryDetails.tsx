import React from 'react';
import { Icons } from '../components/Icons';
import { BirthChartAnalysis, UserProfile } from '../types';
import { getTerm } from '../services/astrologyTerminology';

interface PlanetaryDetailsProps {
    analysis: BirthChartAnalysis;
    profile: UserProfile;
    onBack: () => void;
}

const PlanetaryDetails: React.FC<PlanetaryDetailsProps> = ({ analysis, profile, onBack }) => {
    // Helper to get house number for a planet
    const getPlanetHouse = (planetName: string): number => {
        const house = analysis.houses.find(h => h.planets.includes(planetName));
        return house?.houseNumber || 0;
    };

    // Helper to determine friendship status
    const getFriendshipStatus = (planetName: string, signLord: string): string => {
        const FRIENDSHIP: { [key: string]: { [key: string]: string } } = {
            Sun: { Moon: 'Friend', Mars: 'Friend', Jupiter: 'Friend', Mercury: 'Neutral', Venus: 'Enemy', Saturn: 'Enemy' },
            Moon: { Sun: 'Friend', Mercury: 'Friend', Mars: 'Neutral', Jupiter: 'Neutral', Venus: 'Neutral', Saturn: 'Neutral' },
            Mars: { Sun: 'Friend', Moon: 'Friend', Jupiter: 'Friend', Venus: 'Neutral', Saturn: 'Neutral', Mercury: 'Enemy' },
            Mercury: { Sun: 'Friend', Venus: 'Friend', Mars: 'Neutral', Jupiter: 'Neutral', Saturn: 'Neutral', Moon: 'Enemy' },
            Jupiter: { Sun: 'Friend', Moon: 'Friend', Mars: 'Friend', Saturn: 'Neutral', Mercury: 'Enemy', Venus: 'Enemy' },
            Venus: { Mercury: 'Friend', Saturn: 'Friend', Mars: 'Neutral', Jupiter: 'Neutral', Sun: 'Enemy', Moon: 'Enemy' },
            Saturn: { Mercury: 'Friend', Venus: 'Friend', Jupiter: 'Neutral', Sun: 'Enemy', Moon: 'Enemy', Mars: 'Enemy' }
        };

        if (planetName === signLord) return 'Own Sign';
        return FRIENDSHIP[planetName]?.[signLord] || 'Neutral';
    };

    return (
        <div className="min-h-screen bg-ivory-50 pb-32">
            {/* Header */}
            <div className="bg-white border-b border-stone-100 sticky top-0 z-10">
                <div className="p-6">
                    <button onClick={onBack} className="flex items-center gap-2 text-charcoal-600 mb-4 hover:text-gold-600 transition-colors">
                        <Icons.ChevronLeft className="w-4 h-4" />
                        <span className="text-sm font-medium">Back to Tools</span>
                    </button>
                    <h1 className="text-2xl font-serif text-charcoal-900 mb-1">Planetary Details</h1>
                    <p className="text-xs text-charcoal-500">Comprehensive planetary position analysis</p>
                </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
                {analysis.planetaryDetails.map((planet, idx) => (
                    <div key={idx} className="bg-white rounded-3xl border border-stone-100 shadow-sm overflow-hidden">
                        {/* Planet Header */}
                        <div className="bg-gradient-to-r from-gold-50 to-ivory-50 p-5 border-b border-stone-100">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-charcoal-900 text-gold-400 flex items-center justify-center font-serif font-bold text-lg">
                                        {planet.name.substring(0, 2)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-lg text-charcoal-900">{planet.name}</h3>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 -ml-0.5">
                                            {planet.isRetro && <span className="text-[9px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-bold">RETROGRADE</span>}
                                            {planet.isCombust && <span className="text-[9px] bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full font-bold">COMBUST</span>}
                                            {planet.dignity === 'exalted' && <span className="text-[9px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">EXALTED</span>}
                                            {planet.dignity === 'debilitated' && <span className="text-[9px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">DEBILITATED</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-serif text-charcoal-900">{planet.rashi}</div>
                                    <div className="text-xs text-charcoal-500 font-mono mt-1">{planet.formatted}</div>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Information Grid */}
                        <div className="p-5 grid grid-cols-2 gap-4">
                            {/* Position */}
                            <div className="bg-ivory-50 rounded-xl p-3 border border-stone-100">
                                <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Position</div>
                                <div className="text-sm font-bold text-charcoal-900">{planet.degreeInRashi.toFixed(2)}°</div>
                                <div className="text-xs text-charcoal-500 mt-0.5">in {planet.rashi}</div>
                            </div>

                            {/* House */}
                            <div className="bg-ivory-50 rounded-xl p-3 border border-stone-100">
                                <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">House</div>
                                <div className="text-sm font-bold text-charcoal-900">House {getPlanetHouse(planet.name)}</div>
                                <div className="text-xs text-charcoal-500 mt-0.5">{analysis.houses.find(h => h.houseNumber === getPlanetHouse(planet.name))?.sign}</div>
                            </div>

                            {/* Nakshatra */}
                            <div className="bg-ivory-50 rounded-xl p-3 border border-stone-100">
                                <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">{getTerm('nakshatra', 'vedic')}</div>
                                <div className="text-sm font-bold text-charcoal-900">{planet.nakshatra}</div>
                                <div className="text-xs text-charcoal-500 mt-0.5">Pada {planet.pada}</div>
                            </div>

                            {/* Nakshatra Lord */}
                            <div className="bg-ivory-50 rounded-xl p-3 border border-stone-100">
                                <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">{getTerm('nakshatra', 'vedic')} Lord</div>
                                <div className="text-sm font-bold text-charcoal-900">{planet.nakshatraLord}</div>
                                <div className="text-xs text-charcoal-500 mt-0.5">Sub: {planet.nakshatraSubLord}</div>
                            </div>

                            {/* Sign Lord */}
                            <div className="bg-ivory-50 rounded-xl p-3 border border-stone-100">
                                <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Sign Lord</div>
                                <div className="text-sm font-bold text-charcoal-900">{planet.rashiLord}</div>
                                <div className="text-xs text-charcoal-500 mt-0.5">Ruler of {planet.rashi}</div>
                            </div>

                            {/* Friendship Status */}
                            <div className="bg-ivory-50 rounded-xl p-3 border border-stone-100">
                                <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Status</div>
                                <div className={`text-sm font-bold ${getFriendshipStatus(planet.name, planet.rashiLord) === 'Friend' ? 'text-green-600' :
                                        getFriendshipStatus(planet.name, planet.rashiLord) === 'Enemy' ? 'text-red-600' :
                                            getFriendshipStatus(planet.name, planet.rashiLord) === 'Own Sign' ? 'text-blue-600' :
                                                'text-charcoal-600'
                                    }`}>
                                    {getFriendshipStatus(planet.name, planet.rashiLord)}
                                </div>
                                <div className="text-xs text-charcoal-500 mt-0.5">
                                    {getFriendshipStatus(planet.name, planet.rashiLord) === 'Own Sign' ? 'Swakshetra' :
                                        getFriendshipStatus(planet.name, planet.rashiLord) === 'Friend' ? 'Mitra Kshetra' :
                                            getFriendshipStatus(planet.name, planet.rashiLord) === 'Enemy' ? 'Shatru Kshetra' : 'Sama Kshetra'}
                                </div>
                            </div>
                        </div>

                        {/* Dignity Summary */}
                        {(planet.dignity !== 'normal' || planet.isRetro || planet.isCombust) && (
                            <div className="px-5 pb-5">
                                <div className="bg-charcoal-900 text-gold-400 rounded-xl p-4">
                                    <div className="text-[9px] font-bold uppercase tracking-wider mb-2 opacity-70">Strength Analysis</div>
                                    <div className="text-xs leading-relaxed">
                                        {planet.dignity === 'exalted' && `${planet.name} is in its exaltation sign, providing maximum strength and auspicious results.`}
                                        {planet.dignity === 'debilitated' && `${planet.name} is in its debilitation sign, indicating challenges that require conscious effort.`}
                                        {planet.isRetro && ` Retrograde motion intensifies introspection and karmic lessons.`}
                                        {planet.isCombust && ` Combustion by the Sun may weaken expression but adds intensity.`}
                                    </div>
                                </div>
                            </div>
                        )}


                    </div>
                ))}
            </div>
        </div>
    );
};

export default PlanetaryDetails;
