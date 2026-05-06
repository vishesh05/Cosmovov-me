import React, { useState, useMemo } from 'react';
import { Icons } from '../components/Icons';
import { BirthChartAnalysis, UserProfile } from '../types';
import { calculateAshtakvarga } from '../services/ashtakvargaEngine';
import { ZODIAC_SIGNS } from '../services/astrologyEngine';
import {
    getSAVStrength,
    getBAVStrength,
    SAV_STRENGTH_LEVELS,
    HOUSE_INTERPRETATIONS,
    GENERAL_INTERPRETATIONS
} from '../data/ashtakvargaData';

interface AshtakvargaProps {
    analysis: BirthChartAnalysis;
    profile: UserProfile;
    onBack: () => void;
}

const AshtakvargaChart: React.FC<{ values: number[]; title: string; ascendantIndex: number }> = ({ values, title, ascendantIndex }) => {
    // Render a single house cell within the SVG
    const renderHouse = (houseNum: number, x: number, y: number) => {
        // House Num is 1-based (1-12)
        // signIndex is 0-based index of the zodiac sign in that house
        const signIndex = (ascendantIndex + (houseNum - 1)) % 12;
        const value = values[signIndex];
        const strength = getSAVStrength(value);

        // Colors matching the D1 chart palette but with strength indication
        const valueColor = strength === 'excellent' ? '#16a34a' :
            strength === 'good' ? '#2563eb' :
                strength === 'moderate' ? '#ca8a04' : '#dc2626';

        return (
            <g transform={`translate(${x}, ${y})`}>
                {/* Sign Name - Top Corner */}
                <text x="0" y="-14" fontSize="5" fill="#C5A059" textAnchor="middle" fontWeight="600" letterSpacing="0.5" className="font-serif opacity-90">
                    {ZODIAC_SIGNS[signIndex].substring(0, 3)}
                </text>

                {/* Bindu Value - Center - Reduced size slightly as requested for cleaner look */}
                <text x="0" y="5" fontSize="12" fill={valueColor} fontWeight="bold" textAnchor="middle" className="font-sans">
                    {value}
                </text>
            </g>
        );
    };

    return (
        <div className="flex flex-col items-center mb-8">
            {/* Title as relative block to prevent overlap */}
            <h3 className="text-sm font-bold text-charcoal-900 mb-6 text-center px-4">{title}</h3>

            <div className="w-full max-w-[340px] mx-auto">
                <div className="w-full aspect-square relative bg-ivory-50 rounded-full border border-gold-500/20 shadow-xl shadow-gold-500/5 p-6">
                    <svg viewBox="-2 -2 204 204" className="w-full h-full">
                        {/* Chart Lines - Precise and Geometric (Same as NorthIndianChart) */}
                        <g stroke="#D4AF37" strokeWidth="0.6" fill="none" opacity="1">
                            <rect x="0" y="0" width="200" height="200" />
                            <line x1="0" y1="0" x2="200" y2="200" />
                            <line x1="200" y1="0" x2="0" y2="200" />
                            <line x1="100" y1="0" x2="200" y2="100" />
                            <line x1="200" y1="100" x2="100" y2="200" />
                            <line x1="100" y1="200" x2="0" y2="100" />
                            <line x1="0" y1="100" x2="100" y2="0" />
                        </g>

                        {/* House Content Mapping (Standard North Indian Layout) */}
                        {/* Diamond 1 (Top) = House 1 */}
                        {renderHouse(1, 100, 45)}
                        {/* Diamond 2 (Left) = House 4 */}
                        {renderHouse(4, 45, 100)}
                        {/* Diamond 3 (Bottom) = House 7 */}
                        {renderHouse(7, 100, 155)}
                        {/* Diamond 4 (Right) = House 10 */}
                        {renderHouse(10, 155, 100)}

                        {/* Triangles */}
                        {renderHouse(2, 50, 25)}
                        {renderHouse(3, 25, 50)}
                        {renderHouse(5, 25, 150)}
                        {renderHouse(6, 50, 175)}
                        {renderHouse(8, 150, 175)}
                        {renderHouse(9, 175, 150)}
                        {renderHouse(11, 175, 50)}
                        {renderHouse(12, 150, 25)}
                    </svg>
                </div>
            </div>
        </div>
    );
};

const Ashtakvarga: React.FC<AshtakvargaProps> = ({ analysis, profile, onBack }) => {
    const [activeView, setActiveView] = useState<'sav' | 'bav'>('sav');
    const [selectedPlanet, setSelectedPlanet] = useState<string>('Sun');

    const avData = useMemo(() =>
        calculateAshtakvarga(analysis.planetaryDetails, analysis.ascendant),
        [analysis]
    );

    const planets = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];

    const ascendantIndex = ZODIAC_SIGNS.indexOf(analysis.ascendant);

    // Pre-calculate house mappings relative to the user's ascendant, sorted from House 1 to 12
    const houseDataSAV = Array.from({ length: 12 }, (_, i) => {
        const houseNum = i + 1;
        const signIndex = (ascendantIndex + houseNum - 1) % 12;
        return {
            houseNum,
            signName: ZODIAC_SIGNS[signIndex],
            points: avData.sav[signIndex],
        };
    });

    const houseDataBAV = Array.from({ length: 12 }, (_, i) => {
        const houseNum = i + 1;
        const signIndex = (ascendantIndex + houseNum - 1) % 12;
        return {
            houseNum,
            signName: ZODIAC_SIGNS[signIndex],
            points: avData.bav[selectedPlanet]?.[signIndex] || 0,
        };
    });

    return (
        <div className="min-h-screen bg-ivory-50 p-6 pb-32 fade-enter-active">
            {/* Header */}
            <button onClick={onBack} className="flex items-center gap-2 text-charcoal-500 mb-6 hover:text-gold-600 transition-colors">
                <Icons.ChevronLeft className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Back to Tools</span>
            </button>
            <h1 className="text-2xl font-serif text-charcoal-900 mb-2 mt-2">Ashtakvarga</h1>
            <p className="text-xs text-charcoal-500 mb-8">Eight-fold strength analysis (Bindu system)</p>

            {/* Tabs */}
            <div className="pb-6 flex gap-2">
                    <button
                        onClick={() => setActiveView('sav')}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeView === 'sav'
                            ? 'bg-charcoal-900 text-gold-400 shadow-lg'
                            : 'bg-white text-charcoal-600 border border-stone-200 hover:border-gold-300'
                            }`}
                    >
                        Sarva Ashtakvarga
                    </button>
                    <button
                        onClick={() => setActiveView('bav')}
                        className={`flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${activeView === 'bav'
                            ? 'bg-charcoal-900 text-gold-400 shadow-lg'
                            : 'bg-white text-charcoal-600 border border-stone-200 hover:border-gold-300'
                            }`}
                    >
                        Bhinna Ashtakvarga
                    </button>
                </div>

                <div className="space-y-6">
                {activeView === 'sav' ? (
                    <>
                        {/* SAV Chart */}
                        <div className="mb-8">
                            <AshtakvargaChart
                                values={avData.sav}
                                title="Total Points (SAMUDAYA)"
                                ascendantIndex={ZODIAC_SIGNS.indexOf(analysis.ascendant)}
                            />
                        </div>

                        {/* Summary Stats */}
                        <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm">
                            <h3 className="text-sm font-bold text-charcoal-900 mb-4">Summary Statistics</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-ivory-50 rounded-xl p-3 border border-stone-100">
                                    <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Total Points</div>
                                    <div className="text-2xl font-bold text-charcoal-900">{avData.totalPoints}</div>
                                    <div className="text-xs text-charcoal-500 mt-1">
                                        {avData.totalPoints > 340 ? 'High Fortune' : avData.totalPoints > 320 ? 'Balanced' : 'Needs Remedies'}
                                    </div>
                                </div>
                                <div className="bg-ivory-50 rounded-xl p-3 border border-stone-100">
                                    <div className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Average Per House</div>
                                    <div className="text-2xl font-bold text-charcoal-900">{(avData.totalPoints / 12).toFixed(1)}</div>
                                    <div className="text-xs text-charcoal-500 mt-1">Standard: ~28 points</div>
                                </div>
                            </div>
                        </div>

                        {/* Table View */}
                        <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm overflow-x-auto">
                            <h3 className="text-sm font-bold text-charcoal-900 mb-4">House-wise Breakdown</h3>
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-stone-200">
                                        <th className="text-left py-2 font-bold text-charcoal-900">House</th>
                                        <th className="text-left py-2 font-bold text-charcoal-900">Sign</th>
                                        <th className="text-center py-2 font-bold text-charcoal-900">Points</th>
                                        <th className="text-left py-2 font-bold text-charcoal-900">Strength</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {houseDataSAV.map((data, idx) => {
                                        const strength = getSAVStrength(data.points);
                                        return (
                                            <tr key={idx} className="border-b border-stone-50 last:border-none">
                                                <td className="py-2 font-medium text-charcoal-800">{data.houseNum}</td>
                                                <td className="py-2 text-charcoal-600">{data.signName}</td>
                                                <td className="py-2 text-center font-bold text-charcoal-900">{data.points}</td>
                                                <td className="py-2">
                                                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${strength === 'excellent' ? 'bg-green-100 text-green-700' :
                                                        strength === 'good' ? 'bg-blue-100 text-blue-700' :
                                                            strength === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                                                                'bg-red-100 text-red-700'
                                                        }`}>
                                                        {SAV_STRENGTH_LEVELS[strength].label}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>

                        {/* Interpretations */}
                        <div className="bg-charcoal-900 text-gold-400 rounded-3xl p-5 border border-charcoal-800">
                            <h3 className="text-sm font-bold mb-3">Key Insights</h3>
                            <div className="space-y-3 text-xs leading-relaxed">
                                {houseDataSAV.map((data, idx) => {
                                    const strength = getSAVStrength(data.points);
                                    if (strength === 'excellent' || strength === 'weak') {
                                        return (
                                            <div key={idx} className="bg-charcoal-800/50 rounded-xl p-3">
                                                <div className="font-bold mb-1">House {data.houseNum} ({data.signName}): {data.points} points</div>
                                                <div className="text-gold-300/80">{HOUSE_INTERPRETATIONS[data.houseNum as keyof typeof HOUSE_INTERPRETATIONS]?.[strength]}</div>
                                            </div>
                                        );
                                    }
                                    return null;
                                })}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Planet Selector */}
                        <div className="grid grid-cols-4 gap-2 mb-6">
                            {planets.map(planet => (
                                <button
                                    key={planet}
                                    onClick={() => setSelectedPlanet(planet)}
                                    className={`py-3 rounded-xl text-xs font-bold transition-all ${selectedPlanet === planet
                                        ? 'bg-charcoal-900 text-gold-400 shadow-lg'
                                        : 'bg-white text-charcoal-600 border border-stone-200 hover:border-gold-300'
                                        }`}
                                >
                                    {planet}
                                </button>
                            ))}
                        </div>

                        {/* BAV Chart */}
                        <div className="mb-8">
                            <AshtakvargaChart
                                values={avData.bav[selectedPlanet]}
                                title={`${selectedPlanet} Ashtakvarga`}
                                ascendantIndex={ZODIAC_SIGNS.indexOf(analysis.ascendant)}
                            />
                        </div>

                        {/* BAV Table */}
                        <div className="bg-white rounded-3xl p-5 border border-stone-100 shadow-sm overflow-x-auto">
                            <h3 className="text-sm font-bold text-charcoal-900 mb-4">{selectedPlanet} Bindus by Sign</h3>
                            <table className="w-full text-xs">
                                <thead>
                                    <tr className="border-b border-stone-200">
                                        <th className="text-left py-2 font-bold text-charcoal-900">House</th>
                                        <th className="text-left py-2 font-bold text-charcoal-900">Sign</th>
                                        <th className="text-center py-2 font-bold text-charcoal-900">Bindus</th>
                                        <th className="text-left py-2 font-bold text-charcoal-900">Strength</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {houseDataBAV.map((data, idx) => {
                                        const strength = getBAVStrength(data.points);
                                        return (
                                            <tr key={idx} className="border-b border-stone-50 last:border-none">
                                                <td className="py-2 font-medium text-charcoal-800">{data.houseNum}</td>
                                                <td className="py-2 text-charcoal-600">{data.signName}</td>
                                                <td className="py-2 text-center font-bold text-charcoal-900">{data.points}</td>
                                                <td className="py-2 text-charcoal-600 text-[10px]">
                                                    {strength === 'excellent' ? 'Very Strong' :
                                                        strength === 'good' ? 'Strong' :
                                                            strength === 'moderate' ? 'Moderate' : 'Weak'}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Ashtakvarga;
